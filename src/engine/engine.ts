import { meets } from "./conditions.ts";
import { nextRandom, randomSeed } from "./rng.ts";
import {
  DEFAULT_TRAITS,
  applyMagnitude,
  VITAL_MAX,
  VITAL_MIN,
  VITAL_KEYS,
  type Card,
  type Magnitude,
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
    log: [],
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

// Focus the draw on urgent states. When any eligible card belongs to a
// `priority` deck (a state you should be escaping — unemployment, the workhouse),
// restrict the pool to those cards, so the escape routes aren't drowned out by
// incidental flavour from other still-active decks (e.g. childhood/home life).
function focusPool(pool: Card[], content: Content): Card[] {
  const priority = new Set(content.decks.filter((d) => d.priority).map((d) => d.id));
  if (priority.size === 0) return pool;
  const urgent = pool.filter((c) => !!c.deck && priority.has(c.deck));
  return urgent.length > 0 ? urgent : pool;
}

// Draw the next card: a due milestone if there is one, otherwise a random
// eligible non-milestone card. Returns null when nothing is eligible (the
// caller then passes a "quiet year").
export function drawCard(
  state: GameState,
): { card: Card | null; state: GameState } {
  const content = CONTENT;
  const cards = allCards(content);

  // A pending safety-net rescue jumps the queue (bypassing eligibility).
  if (state.pendingRescue) {
    const rescue = cards.find((c) => c.id === state.pendingRescue);
    if (rescue) {
      return { card: rescue, state: { ...state, pendingRescue: undefined, lastCardId: rescue.id } };
    }
  }

  const milestone = dueMilestone(cards, state, content);
  if (milestone) return { card: milestone, state: { ...state, lastCardId: milestone.id } };

  // A "force at max" card jumps the queue when its vital is capped and the card
  // is otherwise eligible, so a maxed-out resource always surfaces its spend
  // opportunity (e.g. move out once you're rich) instead of relying on the
  // random draw. Ranks below milestones, above the random pool. Skipped if it
  // was the immediately-previous card, so declining it doesn't lock you into
  // the same card every year while you stay capped — normal cards interleave.
  const forced = cards.find(
    (c) =>
      c.force !== undefined &&
      c.id !== state.lastCardId &&
      state.vitals[c.force] >= VITAL_MAX &&
      isEligible(c, state, content),
  );
  if (forced) return { card: forced, state: { ...state, lastCardId: forced.id } };

  // Rescue cards are never drawn normally — only via the pending-rescue path. A
  // `chance` card must also pass a fresh per-year dice roll to enter the pool (a
  // rare event — see Card.chance); the rolls consume rng, threaded through to the
  // final pick below and persisted even when nothing is drawn, so a save resumes
  // the same sequence.
  let rng = state.rng;
  const eligible: Card[] = [];
  for (const c of cards) {
    if (c.kind === "milestone" || c.rescue || !isEligible(c, state, content)) continue;
    if (c.chance !== undefined) {
      const r = nextRandom(rng);
      rng = r.state;
      if (r.value >= c.chance) continue;
    }
    eligible.push(c);
  }
  if (eligible.length === 0) return { card: null, state: { ...state, rng } };
  const pool = focusPool(eligible, content);

  // Avoid repeating the immediately-previous card when there's a choice.
  let choices = pool;
  if (pool.length > 1 && state.lastCardId) {
    const filtered = pool.filter((c) => c.id !== state.lastCardId);
    if (filtered.length > 0) choices = filtered;
  }

  // Weighted random pick: a card's `weight` (default 1) scales its share of the
  // draw, so a few essential cards can surface often without excluding the rest
  // of the pool. One rng value is consumed whatever the weights, so the sequence
  // stays deterministic. With all weights 1 this is a plain uniform pick.
  const roll = nextRandom(rng);
  const totalWeight = choices.reduce((s, c) => s + (c.weight ?? 1), 0);
  let cursor = roll.value * totalWeight;
  let pick = choices[choices.length - 1];
  for (const c of choices) {
    cursor -= c.weight ?? 1;
    if (cursor < 0) { pick = c; break; }
  }
  return { card: pick, state: { ...state, rng: roll.state, lastCardId: pick.id } };
}

// Debug helper: the milestone that would fire, the random pool, and the cards
// that are in an active deck but gated out (conditions not yet met).
export function eligibleDraw(
  state: GameState,
): { milestone: Card | null; pool: Card[]; gated: Card[] } {
  const content = CONTENT;
  const cards = allCards(content);
  const inDeck = cards.filter(
    (c) => !!c.deck && !c.rescue && state.activeDecks.includes(c.deck) && !exhausted(c, state),
  );
  const milestone = dueMilestone(cards, state, content);
  const eligible = inDeck.filter(
    (c) => c.kind !== "milestone" && meets(c.conditions, state, content),
  );
  // Mirror drawCard: while an urgent (priority) deck is active it owns the pool.
  const pool = focusPool(eligible, content);
  const gated = inDeck.filter(
    (c) => c !== milestone && (!meets(c.conditions, state, content) || !pool.includes(c)),
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
  const previous = state.statuses[kind];
  const oldState = def?.states[previous];
  const newState = def?.states[value];
  let decks = state.activeDecks;
  for (const d of oldState?.addDecks ?? []) decks = decks.filter((x) => x !== d);
  for (const d of newState?.addDecks ?? []) if (!decks.includes(d)) decks = [...decks, d];
  state.activeDecks = decks;
  state.statuses[kind] = value;
  // `jobExperience` is time-in-the-current-job, tagged with the job it was earned
  // in (state.experienceJob). On a job change:
  //  - entering a `keepExperience` state (unemployed — "between jobs") preserves
  //    both the counter and its tag, so a sacking doesn't wipe your progress;
  //  - otherwise reset only when the new job differs from the tagged one, so a
  //    re-hire into the SAME job keeps its experience, while a promotion or a
  //    move to a different career starts the counter fresh.
  // This is the single place jobExperience resets — content never does it.
  if (kind === "job" && value !== previous && !newState?.keepExperience) {
    if (state.experienceJob !== value) {
      state.traits.jobExperience = 0;
      state.experienceJob = value;
    }
  }
  // Standing with your employer is per-job: a new employer means a fresh start,
  // so any job change (including into unemployment) wipes the strike count.
  if (kind === "job" && value !== previous) state.traits.jobStrikes = 0;
  // Moving INTO the master's house remembers where you lived before, so leaving
  // the apprenticeship (restoreHousing) returns you there rather than silently
  // granting/stripping a rented place. (Only the first move in records it, so a
  // no-op re-set of "apprentice" doesn't overwrite the origin.)
  if (kind === "housing" && value === "apprentice" && previous !== "apprentice") {
    state.housingBeforeApprentice = previous;
  }
  // A fresh apprenticeship starts with no craftsmanship — `jobSkill` is built up
  // from scratch by working hard at the bench (see the job_apprentice deck).
  if (kind === "job" && value === "apprentice" && previous !== "apprentice") {
    state.traits.jobSkill = 0;
  }
  // A state may SUSPEND other status kinds while you are in it (see
  // StatusStateDef.suspends): entering stashes what you had and forces the
  // declared value, leaving hands it straight back. Content names the kinds and
  // values, so no status VALUE is hardcoded here. Recursion is safe — a state
  // never suspends its own kind.
  if (value !== previous) {
    for (const k of Object.keys(oldState?.suspends ?? {}) as StatusKind[]) {
      const stashed = state.suspendedStatuses?.[k];
      if (stashed === undefined) continue;
      delete state.suspendedStatuses![k];
      changeStatus(state, k, stashed, content);
    }
    for (const [k, forced] of Object.entries(newState?.suspends ?? {}) as [StatusKind, string][]) {
      (state.suspendedStatuses ??= {})[k] = state.statuses[k];
      changeStatus(state, k, forced, content);
    }
  }
}

export function applyEffect(state: GameState, effect: Effect, content: Content): void {
  if (effect.setStatus) {
    for (const [k, v] of Object.entries(effect.setStatus)) {
      changeStatus(state, k as StatusKind, v, content);
    }
  }
  if (effect.restoreHousing) {
    changeStatus(state, "housing", state.housingBeforeApprentice ?? "renting", content);
    state.housingBeforeApprentice = undefined;
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
  if (effect.setFlaws) {
    Object.assign(state.traits, effect.setFlaws); // same as setTraits; the star logic treats it differently
  }
  if (effect.incTraits) {
    for (const [k, delta] of Object.entries(effect.incTraits)) {
      const key = k as keyof typeof state.traits;
      (state.traits[key] as number) = (state.traits[key] as number) + (delta ?? 0);
    }
  }
  if (effect.vitals) {
    for (const [k, mag] of Object.entries(effect.vitals)) {
      const key = k as VitalKey;
      // Apply RAW (unclamped) — the turn's single clamp happens after drift too
      // (see clampVitals). Clamping here would cap a card's gain to 100 before a
      // negative drift eats into it, which made every force-at-max spend card
      // (move out / buy a house at a full purse) impossible to reach.
      state.vitals[key] = applyMagnitude(state.vitals[key], mag as Magnitude);
    }
  }
  if (effect.remember) {
    // Stamp the memory at the CURRENT age — applyEffect runs before the turn's
    // age+1, so state.age is the age shown on the card being answered.
    (state.log ??= []).push({ age: state.age, id: effect.remember });
  }
  // (No out-of-band "end the game" effect: death is always a vital hitting 0,
  // handled uniformly by checkGameOver + the rescue nets. A card that should be
  // fatal deals the "----" mortal blow to a vital instead — see applyMagnitude.)
}

// Sum of every active status state's per-turn drift.
export function totalDrift(state: GameState, content: Content): Partial<Vitals> {
  // While a `noDrift` deck is active (babyhood — the unloseable grace period),
  // status drift is suspended, so living costs etc. don't bite before the game
  // proper begins — EXCEPT kinds flagged `ignoreNoDrift` (the age status), whose
  // life-stage drift is always felt (so the baby-stage bonus lands in babyhood).
  // Keeps totalDrift the single source of truth for the UI's drain preview too.
  const noDrift = content.decks.some((d) => d.noDrift && state.activeDecks.includes(d.id));
  const drift: Partial<Vitals> = {};
  for (const kind of Object.keys(state.statuses) as StatusKind[]) {
    const def = content.statuses[kind];
    if (noDrift && !def?.ignoreNoDrift) continue;
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
    if (drift[key]) state.vitals[key] = state.vitals[key] + drift[key]!; // raw; clamped once at end of turn
  }
}

// Clamp every vital into range. Runs ONCE per turn, after BOTH the card's effects
// and the status drift have been summed onto the raw value. This is what lets a
// card's gain and the turn's drift net out before the cap/floor bite: a full-purse
// card can end the turn at 100 (so a force-at-max spend fires next turn) instead of
// being capped mid-turn and then knocked below 100 by rent; symmetrically, a mortal
// blow isn't floored to 0 and then quietly undone by positive drift.
function clampVitals(state: GameState): void {
  for (const key of VITAL_KEYS) state.vitals[key] = clampVital(state.vitals[key]);
}

// Per-turn TRAIT increments from active status states (StatusStateDef.tick) AND
// active decks (Deck.tick). Drift's counterpart for counters — e.g. a cat ages
// `petCatAge` a year at a time (status), and Tom ages `relBrotherAge` a year at a
// time while the rel_bro deck is active (deck).
function applyTick(state: GameState, content: Content): void {
  const add = (tick: Partial<Record<string, number>>): void => {
    for (const [k, v] of Object.entries(tick)) {
      const key = k as keyof typeof state.traits;
      (state.traits[key] as number) = (state.traits[key] as number) + (v ?? 0);
    }
  };
  for (const kind of Object.keys(state.statuses) as StatusKind[]) {
    const st = content.statuses[kind]?.states[state.statuses[kind]];
    if (st?.tick) add(st.tick);
  }
  for (const deck of content.decks) {
    if (deck.tick && state.activeDecks.includes(deck.id)) add(deck.tick);
  }
}

const RESCUE_FLOOR = 1; // where a rescued vital lands (destitute, but alive)

// A one-shot safety-net card for a vital: `rescue === vital`, not yet used,
// in an active deck, and whose `conditions` hold (so a rescue can be gated —
// e.g. the charity hospital only catches young children). Mirrors how `force`
// already checks eligibility. (Rescue cards are never drawn normally — see
// drawCard.)
export function findRescue(state: GameState, content: Content, key: VitalKey): Card | null {
  for (const card of allCards(content)) {
    if (card.rescue !== key) continue;
    if (exhausted(card, state)) continue;
    if (!card.deck || !state.activeDecks.includes(card.deck)) continue;
    if (!meets(card.conditions, state, content)) continue;
    return card;
  }
  return null;
}

function checkGameOver(state: GameState, content: Content): void {
  for (const key of VITAL_KEYS) {
    if (state.vitals[key] > VITAL_MIN) continue;
    const rescue = findRescue(state, content, key);
    if (rescue) {
      // Caught by the safety net: floor the vital and force the rescue card.
      state.vitals[key] = RESCUE_FLOOR;
      state.pendingRescue = rescue.id;
      continue;
    }
    state.over = true;
    state.endReason = key;
    return;
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
  // A missing option, or one hidden by its `if`, is a no-op (defensive — the UI
  // already refuses to swipe toward a hidden option).
  if (!option || !meets(option.if, prev, content)) return { state: prev, result: "" };

  const state = structuredClone(prev);
  const outcome = resolveOutcome(option, state, content);
  if (outcome.effects) applyEffect(state, outcome.effects, content);

  if (card.kind !== "filler") {
    state.usedCards[card.id] = (state.usedCards[card.id] ?? 0) + 1;
  }

  state.age += 1;
  applyDrift(state, content);
  applyTick(state, content);
  clampVitals(state);
  checkGameOver(state, content);
  return { state, result: outcome.result };
}

// A year with nothing eligible to draw — still ages and drifts.
export function quietYear(prev: GameState): { state: GameState; result: string } {
  const state = structuredClone(prev);
  state.age += 1;
  applyDrift(state, CONTENT);
  applyTick(state, CONTENT);
  clampVitals(state);
  checkGameOver(state, CONTENT);
  return { state, result: "A quiet, uneventful year passes." };
}

// The engine reads content through this single binding, set once at startup.
export let CONTENT: Content;
export function setContent(content: Content): void {
  CONTENT = content;
}
