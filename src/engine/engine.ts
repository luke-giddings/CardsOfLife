import { meets, totalDrift } from "./conditions.ts";
import { CONTENT, currentState, deckIndex } from "./content.ts";
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
  type Direction,
  type Effect,
  type GameState,
  type NumericTraitKey,
  type Outcome,
  type StatusKind,
  type TickRule,
  type Traits,
  type VitalKey,
} from "./types.ts";

// The engine reads its content through one binding (content.ts), set once with
// setContent before anything else runs. Re-exported here so callers have one
// place to import the engine from.
export { CONTENT, allCards, cardById, setContent } from "./content.ts";
export { totalDrift } from "./conditions.ts";

// --- setup -------------------------------------------------------------------

// `seed` is used exactly as given when supplied. With none, a full-range one is
// drawn — which is what the headless sims rely on: a caller that restricted
// seeds to a small range here would quietly cap every measurement at that many
// distinct lives. Any narrowing for human convenience belongs to the caller.
export function initGame(seed?: number): GameState {
  const start = seed ?? randomSeed();
  return {
    age: 0,
    vitals: { ...CONTENT.start.vitals },
    statuses: { ...CONTENT.start.statuses },
    traits: { ...DEFAULT_TRAITS, ...(CONTENT.start.traits ?? {}) },
    activeDecks: [...CONTENT.start.decks],
    usedCards: {},
    playedFillers: [],
    rng: start,
    seed: start,
    over: false,
    log: [],
  };
}

// --- card selection ----------------------------------------------------------

function exhausted(card: Card, state: GameState): boolean {
  if (card.kind === "filler") return false; // filler is inexhaustible
  const used = state.usedCards[card.id] ?? 0;
  return used >= (card.copies ?? 1);
}

// The cards of the active decks that are not used up, in content order (which
// is what breaks every tie below, so it must not become activeDecks order).
function inPlay(state: GameState): Card[] {
  const active = new Set(state.activeDecks);
  const out: Card[] = [];
  for (const { deck, cards } of deckIndex().decks) {
    if (!active.has(deck.id)) continue;
    for (const c of cards) if (!exhausted(c, state)) out.push(c);
  }
  return out;
}

// The card that matches `pred` with the HIGHEST `priority`; ties go to the one
// earlier in content. How a due milestone is chosen, and how a safety net is.
function highestPriority(cards: Card[], pred: (c: Card) => boolean): Card | null {
  let best: Card | null = null;
  for (const card of cards) {
    if (!pred(card)) continue;
    if (!best || (card.priority ?? 0) > (best.priority ?? 0)) best = card;
  }
  return best;
}

// Focus the draw on urgent states. When any eligible card belongs to a
// `priority` deck (a state you should be escaping), restrict the pool to those
// cards, so the escape routes aren't drowned out by incidental flavour from
// other still-active decks.
function focusPool(pool: Card[]): Card[] {
  const { priority, spared } = deckIndex();
  if (priority.size === 0) return pool;
  const urgent = pool.filter((c) => !!c.deck && priority.has(c.deck));
  if (urgent.length === 0) return pool;
  // `neverSuppressed` keeps a card's place beside the urgent ones, whether it is
  // the whole deck that says so or the single card. A Set, so anything that is
  // both urgent and spared does not end up in the pool twice and draw at double
  // weight.
  return [
    ...new Set([
      ...urgent,
      ...pool.filter((c) => c.neverSuppressed || (!!c.deck && spared.has(c.deck))),
    ]),
  ];
}

// THE FILLER DISCARD PILE, for one pool. Fillers are inexhaustible (see
// `exhausted`), which left the weighted pick free to deal the same errand twice
// in three years — often with one real card sandwiched between two copies of it,
// which reads as the game having run out of things to say. So a filler that has
// played is held aside and stays out of the draw while ANY unplayed filler is
// still in the pool; when the pile is all that is left it shuffles back in.
//
// Scoped to the fillers currently IN the pool, for both the "all seen" test and
// the reshuffle: a childhood deck running dry must not also forget the
// working-life fillers you have not reached yet, nor be kept out of its own
// reshuffle by them. With no fillers in the pool every step below is a no-op and
// `choices` comes back as the pool itself.
//
// ONE rule with two readers: `drawCard` takes `choices` and the (possibly
// reshuffled) `played`, and `eligibleDraw` takes `held`, so the debug panel dims
// exactly the cards the next draw cannot deal.
function fillerPile(
  pool: Card[],
  played: string[],
): { choices: Card[]; held: Card[]; played: string[] } {
  const here = new Set(pool.filter((c) => c.kind === "filler").map((c) => c.id));
  // This pool's share of the pile, in play order — the order is the whole reason
  // `playedFillers` is a list and not a set of ids or a count.
  const mine = played.filter((id) => here.has(id));
  let kept = played;
  if (here.size > 0 && mine.length === here.size) {
    // All seen, so shuffle them back in — MINUS the one dealt most recently,
    // which would otherwise be free to come straight back round, the very thing
    // the pile exists to stop. `lastCardId` does not cover this: a milestone or
    // a forced card landing in between would leave the repeat one card away
    // rather than adjacent, which is the sandwich itself.
    const last = mine[mine.length - 1];
    kept = played.filter((id) => !here.has(id) || id === last);
  }
  const stale = new Set(kept.filter((id) => here.has(id)));
  const choices = pool.filter((c) => !stale.has(c.id));
  // A pool down to its LAST filler has nothing else to offer, so it plays again
  // and nothing is held.
  return choices.length > 0
    ? { choices, held: pool.filter((c) => stale.has(c.id)), played: kept }
    : { choices: pool, held: [], played: kept };
}

// Draw the next card: a pending rescue, else a due milestone, else a forced
// card, else a weighted random pick from the eligible pool. Returns null when
// nothing is eligible (the caller then passes a "quiet year").
export function drawCard(state: GameState): { card: Card | null; state: GameState } {
  // A pending safety-net rescue jumps the queue (bypassing eligibility). Two
  // vitals can be caught in the same year, so they queue and come one a turn.
  const [next, ...rest] = state.pendingRescues ?? [];
  if (next) {
    const rescue = deckIndex().byId.get(next);
    const after = { ...state, pendingRescues: rest.length ? rest : undefined };
    if (rescue) return { card: rescue, state: { ...after, lastCardId: rescue.id } };
  }

  // One pass over the cards in play: each card's conditions are read once.
  const live = inPlay(state).filter((c) => meets(c.conditions, state));

  const milestone = highestPriority(live, (c) => c.kind === "milestone");
  if (milestone) return { card: milestone, state: { ...state, lastCardId: milestone.id } };

  // A "force" card jumps the queue when its vital is high enough and the card is
  // otherwise eligible, so a piled-up resource always surfaces its spend
  // opportunity instead of relying on the random draw. The bar is the vital's
  // MAX unless the card names a lower one (`force.at`). Ranks below milestones,
  // above the random pool. Skipped if it was the immediately-previous card, so
  // declining it doesn't lock you into the same card every year.
  const forced = live.find(
    (c) =>
      c.force !== undefined &&
      c.id !== state.lastCardId &&
      state.vitals[c.force.vital] >= (c.force.at ?? VITAL_MAX),
  );
  if (forced) return { card: forced, state: { ...state, lastCardId: forced.id } };

  // Rescue cards are never drawn normally — only via the pending-rescue path. A
  // `chance` card must also pass a fresh per-year dice roll to enter the pool (a
  // rare event — see Card.chance); the rolls consume rng, threaded through to the
  // final pick below and persisted even when nothing is drawn, so a save resumes
  // the same sequence.
  let rng = state.rng;
  const eligible: Card[] = [];
  for (const c of live) {
    if (c.kind === "milestone" || c.rescue) continue;
    if (c.chance !== undefined) {
      const r = nextRandom(rng);
      rng = r.state;
      if (r.value >= c.chance) continue;
    }
    eligible.push(c);
  }
  if (eligible.length === 0) return { card: null, state: { ...state, rng } };

  // Hold back the fillers already dealt (see fillerPile).
  const pile = fillerPile(focusPool(eligible), state.playedFillers);
  let choices = pile.choices;

  // Avoid repeating the immediately-previous card when there's a choice. Still
  // needed after a reshuffle, which makes the filler you just played fresh again.
  if (choices.length > 1 && state.lastCardId) {
    const filtered = choices.filter((c) => c.id !== state.lastCardId);
    if (filtered.length > 0) choices = filtered;
  }

  // Weighted random pick: a card's `weight` (default 1) scales its share of the
  // draw. One rng value is consumed whatever the weights, so the sequence stays
  // deterministic. With all weights 1 this is a plain uniform pick.
  const roll = nextRandom(rng);
  const totalWeight = choices.reduce((s, c) => s + (c.weight ?? 1), 0);
  let cursor = roll.value * totalWeight;
  let pick = choices[choices.length - 1];
  for (const c of choices) {
    cursor -= c.weight ?? 1;
    if (cursor < 0) { pick = c; break; }
  }
  return { card: pick, state: { ...state, rng: roll.state, lastCardId: pick.id, playedFillers: pile.played } };
}

// Debug helper: the milestone that would fire, the random pool, the cards that
// are in an active deck but gated out (conditions not yet met, or pushed out by
// a priority deck), and the fillers the discard pile is holding back — which
// are IN the pool but cannot be drawn.
export function eligibleDraw(
  state: GameState,
): { milestone: Card | null; pool: Card[]; gated: Card[]; held: Card[] } {
  const inDeck = inPlay(state).filter((c) => !c.rescue);
  const ok = new Set(inDeck.filter((c) => meets(c.conditions, state)));
  const milestone = highestPriority(inDeck, (c) => c.kind === "milestone" && ok.has(c));
  // Mirror drawCard: while an urgent (priority) deck is active it owns the pool.
  const pool = focusPool(inDeck.filter((c) => c.kind !== "milestone" && ok.has(c)));
  const inPool = new Set(pool);
  const gated = inDeck.filter((c) => c !== milestone && (!ok.has(c) || !inPool.has(c)));
  // The same rule the draw will apply, reshuffle and all.
  const { held } = fillerPile(pool, state.playedFillers);
  return { milestone, pool, gated, held };
}

// --- outcome resolution ------------------------------------------------------

export function resolveOutcome(option: CardOption, state: GameState): Outcome {
  for (const outcome of option.outcomes) {
    if (meets(outcome.if, state)) return outcome;
  }
  // Fallback: the last outcome (content should end with an unconditional one).
  return option.outcomes[option.outcomes.length - 1];
}

// --- applying effects --------------------------------------------------------

export function clampVital(n: number): number {
  return Math.max(VITAL_MIN, Math.min(VITAL_MAX, n));
}

function matchesDeck(deckId: string, pattern: string): boolean {
  if (pattern.endsWith("*")) return deckId.startsWith(pattern.slice(0, -1));
  return deckId === pattern;
}

function addTraits(traits: Traits, deltas: Partial<Record<NumericTraitKey, number>>): void {
  for (const [k, v] of Object.entries(deltas)) {
    const key = k as NumericTraitKey;
    traits[key] = traits[key] + (v ?? 0);
  }
}

// Changing a status hands over the decks it owns: remove the outgoing state's
// decks, add the incoming state's decks. This is how "get fired" drops the
// whole job deck without the card having to spell it out.
function changeStatus(state: GameState, kind: StatusKind, value: string): void {
  const previous = state.statuses[kind];
  const states = CONTENT.statuses[kind]?.states;
  const oldState = states?.[previous];
  const newState = states?.[value];
  let decks = state.activeDecks;
  for (const d of oldState?.addDecks ?? []) decks = decks.filter((x) => x !== d);
  for (const d of newState?.addDecks ?? []) if (!decks.includes(d)) decks = [...decks, d];
  state.activeDecks = decks;
  // Setting the value a status already has only re-asserts its decks (one a
  // card removed comes back); nothing below fires without a real change.
  if (value === previous) return;
  state.statuses[kind] = value;
  // `jobExperience` is time-in-the-current-job, tagged with the job it was earned
  // in (state.experienceJob). On a job change:
  //  - entering a `keepExperience` state preserves both the counter and its tag,
  //    so a sacking doesn't wipe your progress;
  //  - otherwise reset only when the new job differs from the tagged one, so a
  //    re-hire into the SAME job keeps its experience, while a promotion or a
  //    move to a different career starts the counter fresh.
  if (kind === "job" && !newState?.keepExperience) {
    if (state.experienceJob !== value) {
      state.traits.jobExperience = 0;
      state.experienceJob = value;
    }
  }
  // Standing with your employer is per-job: a new employer means a fresh start,
  // so any job change (including into unemployment) wipes the strike count.
  if (kind === "job") state.traits.jobStrikes = 0;
  // Traits a state stamps on entry (StatusStateDef.enterTraits).
  if (newState?.enterTraits) Object.assign(state.traits, newState.enterTraits);
  // A state may SUSPEND other status kinds while you are in it (see
  // StatusStateDef.suspends): entering stashes what you had and forces the
  // declared value, leaving hands it straight back. Recursion is safe — a state
  // never suspends its own kind.
  for (const k of Object.keys(oldState?.suspends ?? {}) as StatusKind[]) {
    const stashed = state.suspendedStatuses?.[k];
    if (stashed === undefined) continue;
    delete state.suspendedStatuses![k];
    changeStatus(state, k, stashed);
  }
  for (const [k, forced] of Object.entries(newState?.suspends ?? {}) as [StatusKind, string][]) {
    (state.suspendedStatuses ??= {})[k] = state.statuses[k];
    changeStatus(state, k, forced);
  }
}

export function applyEffect(state: GameState, effect: Effect): void {
  if (effect.setStatus) {
    const sets = Object.entries(effect.setStatus) as [StatusKind, string][];
    for (const [k, v] of sets) changeStatus(state, k, v);
    // A status this effect sets DIRECTLY wins over one handed back by a
    // suspension ending in the same effect: "streets, and out of your
    // apprenticeship" must not land you back in the family home the
    // apprenticeship had stashed. A kind still suspended stays as forced.
    for (const [k, v] of sets) {
      if (state.statuses[k] !== v && !(k in (state.suspendedStatuses ?? {}))) changeStatus(state, k, v);
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
  // Three setters with one effect on state; they differ only in the mark the UI
  // derives for the card face (setTraitsFlaw wears ⚠, setTraitsHidden none).
  if (effect.setTraits) Object.assign(state.traits, effect.setTraits);
  if (effect.setTraitsFlaw) Object.assign(state.traits, effect.setTraitsFlaw);
  if (effect.setTraitsHidden) Object.assign(state.traits, effect.setTraitsHidden);
  if (effect.incTraits) addTraits(state.traits, effect.incTraits);
  if (effect.vitals) {
    for (const [k, mag] of Object.entries(effect.vitals)) {
      const key = k as VitalKey;
      // Apply RAW (unclamped) — the turn's single clamp happens after drift too
      // (see clampVitals). Clamping here would cap a card's gain to 100 before a
      // negative drift eats into it, which made every force-at-max spend card
      // impossible to reach.
      state.vitals[key] = applyMagnitude(state.vitals[key], mag as Magnitude);
    }
  }
  if (effect.remember) {
    // Stamp the memory at the CURRENT age — applyEffect runs before the turn's
    // age+1, so state.age is the age shown on the card being answered.
    state.log.push({ age: state.age, id: effect.remember });
  }
  // (No out-of-band "end the game" effect: death is always a vital hitting 0,
  // handled uniformly by checkGameOver + the rescue nets. A card that should be
  // fatal deals a heavy loss to a vital instead.)
}

function applyDrift(state: GameState): void {
  const drift = totalDrift(state);
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

// Per-turn TRAIT increments (see TickRule) from the active status states and
// the active decks. Every rule's condition is read against the state BEFORE any
// of this turn's ticks land, so the order rules are listed in can never change
// the result.
function applyTick(state: GameState): void {
  const rules: TickRule[] = [];
  for (const kind of Object.keys(state.statuses) as StatusKind[]) {
    rules.push(...(currentState(state, kind)?.ticks ?? []));
  }
  for (const { deck } of deckIndex().decks) {
    if (state.activeDecks.includes(deck.id)) rules.push(...(deck.ticks ?? []));
  }
  const due = rules.filter((r) => meets(r.while, state));
  for (const r of due) addTraits(state.traits, r.traits);
}

const RESCUE_FLOOR = 1; // where a rescued vital lands (destitute, but alive)

// A one-shot safety-net card for a vital: `rescue === vital`, not yet used,
// in an active deck, and whose `conditions` hold (so a rescue can be gated —
// e.g. the charity hospital only catches young children). When several nets
// could catch you, the one with the HIGHEST `priority` does, exactly as a due
// milestone is chosen; content order breaks ties. (Rescue cards are never drawn
// normally — see drawCard.)
export function findRescue(state: GameState, key: VitalKey): Card | null {
  return highestPriority(inPlay(state), (c) => c.rescue === key && meets(c.conditions, state));
}

function checkGameOver(state: GameState): void {
  for (const key of VITAL_KEYS) {
    if (state.vitals[key] > VITAL_MIN) continue;
    const rescue = findRescue(state, key);
    if (rescue) {
      // Caught by the safety net: floor the vital and queue the rescue card.
      // A net already queued (its vital still waiting its turn, and drained
      // again meanwhile) catches it again rather than queueing twice: it is not
      // spent until it is answered.
      state.vitals[key] = RESCUE_FLOOR;
      const queue = (state.pendingRescues ??= []);
      if (!queue.includes(rescue.id)) queue.push(rescue.id);
      continue;
    }
    state.over = true;
    state.endReason = key;
    return;
  }
}

// --- the turn ----------------------------------------------------------------

// A working copy of the state for one turn. Every nested field of GameState is
// one level deep (records and arrays of plain values or never-mutated entries),
// so copying each top-level field is a full copy at a fraction of the cost of
// structuredClone, which the simulations pay on every turn.
function cloneState(prev: GameState): GameState {
  const out = { ...prev } as Record<string, unknown>;
  for (const [k, v] of Object.entries(out)) {
    if (Array.isArray(v)) out[k] = [...v];
    else if (v && typeof v === "object") out[k] = { ...v };
  }
  return out as unknown as GameState;
}

// The part of a year every turn shares, played card or not: age a year, drift,
// tick the counters, clamp. The game-over check follows it.
function endYear(state: GameState): void {
  state.age += 1;
  applyDrift(state);
  applyTick(state);
  clampVitals(state);
}

// Resolve a swipe: pick the outcome, apply its effects, age a year, drift, then
// check for game over. Returns a fresh state plus the result text to show.
export function chooseDirection(
  prev: GameState,
  card: Card,
  dir: Direction,
): { state: GameState; result: string } {
  const option = card.options[dir];
  // A missing option, or one hidden by its `if`, is a no-op (defensive — the UI
  // already refuses to swipe toward a hidden option).
  if (!option || !meets(option.if, prev)) return { state: prev, result: "" };

  const state = cloneState(prev);
  const outcome = resolveOutcome(option, state);
  if (outcome.effects) applyEffect(state, outcome.effects);

  if (card.kind !== "filler") {
    state.usedCards[card.id] = (state.usedCards[card.id] ?? 0) + 1;
  } else {
    // Fillers are never used up, so they are not counted — the discard pile only
    // records WHICH have played, in play order, and drawCard reads its tail to
    // decide which one stays out after a reshuffle. Recorded here, beside
    // usedCards, so that "has played" means the same thing however the card
    // arrived: a filler forced by a capped vital counts exactly as one dealt
    // from the pool.
    state.playedFillers = [...state.playedFillers.filter((id) => id !== card.id), card.id];
  }

  endYear(state);
  // ANSWERING A SAFETY NET MUST NOT KILL YOU BY THE VITAL IT CAUGHT. The net
  // floors the vital and hands you the card NEXT turn, and that turn drifts like
  // any other — so every point of drain still on you was charged against a bar
  // holding RESCUE_FLOOR. A child caught by the hunger card with a dog at
  // `finances: -3` went out of the family home, kept the dog, and died on the
  // spot with the net already spent: 1 − 3, and no second net.
  //
  // So the rescued vital is floored again here. That is one year of grace — the
  // year you spend answering — which is the whole of what a net promises: not
  // that you will live, but that you get a turn to act. The year after is on you,
  // and the card is one-shot, so this cannot repeat.
  if (card.rescue) {
    state.vitals[card.rescue] = Math.max(state.vitals[card.rescue], RESCUE_FLOOR);
  }
  checkGameOver(state);
  return { state, result: outcome.result };
}

// A year with nothing eligible to draw — still ages and drifts.
export function quietYear(prev: GameState): { state: GameState; result: string } {
  const state = cloneState(prev);
  endYear(state);
  checkGameOver(state);
  return { state, result: "A quiet, uneventful year passes." };
}
