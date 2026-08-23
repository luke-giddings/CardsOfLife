import { meets } from "./conditions.ts";
import { nextRandom, randomSeed } from "./rng.ts";
import {
  DEFAULT_TRAITS,
  VITAL_MAX,
  VITAL_MIN,
  VITAL_KEYS,
  type Card,
  type CardOption,
  type Content,
  type Direction,
  type Effect,
  type GameState,
  type Outcome,
  type StatusKind,
  type Vitals,
  type VitalKey,
} from "./types.ts";

// --- setup -------------------------------------------------------------------

export function initGame(content: Content): GameState {
  // Gender starts at the default and is chosen on the birth card.
  return {
    age: 0,
    vitals: { ...content.start.vitals },
    statuses: { ...content.start.statuses },
    traits: { ...DEFAULT_TRAITS, ...(content.start.traits ?? {}) },
    activeDecks: [...content.start.decks],
    usedCards: {},
    rng: randomSeed(),
    over: false,
  };
}

// --- card selection ----------------------------------------------------------

function allCards(content: Content): Card[] {
  const out: Card[] = [];
  for (const deck of content.decks) {
    for (const card of deck.cards) out.push({ ...card, deck: deck.id });
  }
  return out;
}

function exhausted(card: Card, state: GameState): boolean {
  if (card.kind === "filler") return false; // filler is inexhaustible
  const used = state.usedCards[card.id] ?? 0;
  return used >= (card.copies ?? 1);
}

function isEligible(card: Card, state: GameState, content: Content): boolean {
  if (!card.deck || !state.activeDecks.includes(card.deck)) return false;
  if (exhausted(card, state)) return false;
  return meets(card.conditions, state, content);
}

// A milestone whose conditions are met is "due" and jumps the queue.
function dueMilestone(cards: Card[], state: GameState, content: Content): Card | null {
  let best: Card | null = null;
  for (const card of cards) {
    if (card.kind !== "milestone") continue;
    if (!isEligible(card, state, content)) continue;
    if (!best || (card.priority ?? 0) > (best.priority ?? 0)) best = card;
  }
  return best;
}

// Draw the next card: a due milestone if there is one, otherwise a random
// eligible non-milestone card. Returns null when nothing is eligible (the
// caller then passes a "quiet year").
export function drawCard(
  state: GameState,
): { card: Card | null; state: GameState } {
  const content = CONTENT;
  const cards = allCards(content);

  const milestone = dueMilestone(cards, state, content);
  if (milestone) return { card: milestone, state };

  const pool = cards.filter(
    (c) => c.kind !== "milestone" && isEligible(c, state, content),
  );
  if (pool.length === 0) return { card: null, state };

  const roll = nextRandom(state.rng);
  const pick = pool[Math.floor(roll.value * pool.length)];
  return { card: pick, state: { ...state, rng: roll.state } };
}

// Debug helper: the milestone that would fire, the random pool, and the cards
// that are in an active deck but gated out (conditions not yet met).
export function eligibleDraw(
  state: GameState,
): { milestone: Card | null; pool: Card[]; gated: Card[] } {
  const content = CONTENT;
  const cards = allCards(content);
  const inDeck = cards.filter(
    (c) => !!c.deck && state.activeDecks.includes(c.deck) && !exhausted(c, state),
  );
  const milestone = dueMilestone(cards, state, content);
  const pool = inDeck.filter(
    (c) => c.kind !== "milestone" && meets(c.conditions, state, content),
  );
  const gated = inDeck.filter(
    (c) => c !== milestone && !meets(c.conditions, state, content),
  );
  return { milestone, pool, gated };
}

// --- outcome resolution ------------------------------------------------------

export function resolveOutcome(
  option: CardOption,
  state: GameState,
  content: Content,
): Outcome {
  for (const outcome of option.outcomes) {
    if (meets(outcome.if, state, content)) return outcome;
  }
  // Fallback: the last outcome (content should end with an unconditional one).
  return option.outcomes[option.outcomes.length - 1];
}

// --- applying effects --------------------------------------------------------

function clampVital(n: number): number {
  return Math.max(VITAL_MIN, Math.min(VITAL_MAX, n));
}

function matchesDeck(deckId: string, pattern: string): boolean {
  if (pattern.endsWith("*")) return deckId.startsWith(pattern.slice(0, -1));
  return deckId === pattern;
}

// Changing a status hands over the decks it owns: remove the outgoing state's
// decks, add the incoming state's decks. This is how "get fired" drops the
// whole job deck without the card having to spell it out.
function changeStatus(
  state: GameState,
  kind: StatusKind,
  value: string,
  content: Content,
): void {
  const def = content.statuses[kind];
  const oldState = def?.states[state.statuses[kind]];
  const newState = def?.states[value];
  let decks = state.activeDecks;
  for (const d of oldState?.addDecks ?? []) decks = decks.filter((x) => x !== d);
  for (const d of newState?.addDecks ?? []) if (!decks.includes(d)) decks = [...decks, d];
  state.activeDecks = decks;
  state.statuses[kind] = value;
}

function applyEffect(state: GameState, effect: Effect, content: Content): void {
  if (effect.setStatus) {
    for (const [k, v] of Object.entries(effect.setStatus)) {
      changeStatus(state, k as StatusKind, v, content);
    }
  }
  if (effect.addDecks) {
    for (const d of effect.addDecks) {
      if (!state.activeDecks.includes(d)) state.activeDecks.push(d);
    }
  }
  if (effect.removeDecks) {
    for (const pattern of effect.removeDecks) {
      state.activeDecks = state.activeDecks.filter((d) => !matchesDeck(d, pattern));
    }
  }
  if (effect.setTraits) {
    Object.assign(state.traits, effect.setTraits);
  }
  if (effect.incTraits) {
    for (const [k, delta] of Object.entries(effect.incTraits)) {
      const key = k as keyof typeof state.traits;
      (state.traits[key] as number) = (state.traits[key] as number) + (delta ?? 0);
    }
  }
  if (effect.vitals) {
    for (const [k, delta] of Object.entries(effect.vitals)) {
      const key = k as VitalKey;
      state.vitals[key] = clampVital(state.vitals[key] + (delta ?? 0));
    }
  }
  if (effect.endGame) {
    state.over = true;
    state.endReason = effect.endGame;
  }
}

// Sum of every active status state's per-turn drift.
export function totalDrift(state: GameState, content: Content): Partial<Vitals> {
  const drift: Partial<Vitals> = {};
  for (const kind of Object.keys(state.statuses) as StatusKind[]) {
    const def = content.statuses[kind];
    const st = def?.states[state.statuses[kind]];
    if (!st?.drift) continue;
    for (const [k, v] of Object.entries(st.drift)) {
      const key = k as VitalKey;
      drift[key] = (drift[key] ?? 0) + (v ?? 0);
    }
  }
  return drift;
}

function applyDrift(state: GameState, content: Content): void {
  const drift = totalDrift(state, content);
  for (const key of VITAL_KEYS) {
    if (drift[key]) state.vitals[key] = clampVital(state.vitals[key] + drift[key]!);
  }
}

function checkGameOver(state: GameState): void {
  for (const key of VITAL_KEYS) {
    if (state.vitals[key] <= VITAL_MIN) {
      state.over = true;
      state.endReason = key;
      return;
    }
  }
}

// --- the turn ----------------------------------------------------------------

// Resolve a swipe: pick the outcome, apply its effects, age a year, drift, then
// check for game over. Returns a fresh state plus the result text to show.
export function chooseDirection(
  prev: GameState,
  card: Card,
  dir: Direction,
): { state: GameState; result: string } {
  const content = CONTENT;
  const option = card.options[dir];
  if (!option) return { state: prev, result: "" };

  const state = structuredClone(prev);
  const outcome = resolveOutcome(option, state, content);
  if (outcome.effects) applyEffect(state, outcome.effects, content);

  if (card.kind !== "filler") {
    state.usedCards[card.id] = (state.usedCards[card.id] ?? 0) + 1;
  }

  state.age += 1;
  applyDrift(state, content);
  checkGameOver(state);
  return { state, result: outcome.result };
}

// A year with nothing eligible to draw — still ages and drifts.
export function quietYear(prev: GameState): { state: GameState; result: string } {
  const state = structuredClone(prev);
  state.age += 1;
  applyDrift(state, CONTENT);
  checkGameOver(state);
  return { state, result: "A quiet, uneventful year passes." };
}

// The engine reads content through this single binding, set once at startup.
export let CONTENT: Content;
export function setContent(content: Content): void {
  CONTENT = content;
}
