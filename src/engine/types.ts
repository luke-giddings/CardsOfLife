// ---------------------------------------------------------------------------
// Cards of Life — core domain types.
//
// The engine's types, for any game. The game's own names — its vitals, status
// kinds, traits and string ids — are not declared here: a game fills in
// `Register` (Cards of Life does in content/schema.ts) and every type below is
// typed against it, so content is checked at compile time without the engine
// knowing a single name.
// ---------------------------------------------------------------------------

// Filled in by the game through declaration merging:
//   declare module "<path to>/engine/types.ts" {
//     interface Register { vital: …; statusKind: …; traits: …; stringId: … }
//   }
// Unfilled, each falls back to a plain string / record.
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Register {}
type Registered<K extends string, Fallback> = Register extends Record<K, infer T> ? T : Fallback;
export type VitalKey = Registered<"vital", string> & string;
export type StatusKind = Registered<"statusKind", string> & string;
export type Traits = Registered<"traits", Record<string, number | boolean | string>>;
export type StringId = Registered<"stringId", string> & string;

// --- Vitals: the lethal bars. Any at VITAL_MIN = game over. -----------------
export type Vitals = Record<VitalKey, number>;

export const VITAL_MIN = 0;
export const VITAL_MAX = 100;

// Vital changes are readable magnitude "steps", not raw numbers. Two families:
//  • FLAT steps — a fixed number of points: gains +/++/+++/++++ (+10/+25/+50/+100)
//    and losses -/--/--- (−10/−25/−40). The everyday vocabulary. ("+++" is a huge
//    one-off swing, ~4 turns of a typical wage — the criminal path's rare big
//    scores; "++++" is a life-changing sum, ~a whole bar — the sale of an estate.
//    "---" is the biggest flat loss — a grievous blow, e.g. a childhood hazard you
//    weren't prepared for: fatal only if the vital was already low.)
//  • PROPORTIONAL steps — a fraction of the CURRENT value, for costs that should
//    scale with what you have (buying up the housing ladder): "/" keeps a half,
//    "//" keeps a third (loses two-thirds). Written with slashes so they read as
//    "divide" and are never confused with a flat loss. (A "*" times-family is
//    reserved for a future proportional GAIN; none exists yet.) Proportional
//    results floor at 1, so a purchase gated behind a floor can't itself game-over.
// The PLAYER only ever sees +/− bars (the card preview and status chips render the
// slash tokens as minus bars); the slashes are purely an authoring convenience.
export type Magnitude = "//" | "/" | "---" | "--" | "-" | "+" | "++" | "+++" | "++++";

// Keys of Traits whose value is a number — the only ones you can `inc`.
export type NumericTraitKey = {
  [K in keyof Traits]: Traits[K] extends number ? K : never;
}[keyof Traits];

// --- Conditions --------------------------------------------------------------
export type NumberMatch = number | { min?: number; max?: number };
export type StatusMatch = string | { atLeast?: string; atMost?: string };

// Per-trait match: exact value for bool/enum, number-or-range for counters.
export type TraitConditions = {
  [K in keyof Traits]?: Traits[K] extends number ? NumberMatch : Traits[K];
};

// A per-turn TRAIT increment — drift's counterpart for counters: add `traits`
// each turn, but only in turns where `while` holds. With no `while` it ticks
// every turn its owner (a deck, or a status state) is active. Every rule's
// `while` is read against the state before ANY of the turn's ticks land, so the
// order rules are listed in never changes the result. Uses: a counter tied to a
// deck's lifetime (Tom's age from the year he is born), one that must stop once
// a story ends (a presence clock), a cooldown that counts down and stops at 0
// (`while: { min: 1 }`), a pet's age while it is kept.
export interface TickRule {
  traits: Partial<Record<NumericTraitKey, number>>;
  while?: Condition;
}

export interface Condition {
  ageMin?: number;
  ageMax?: number;
  vitals?: Partial<Record<VitalKey, { min?: number; max?: number }>>;
  // The per-turn DRIFT the current statuses add up to, matched the same way as
  // `vitals`. Where `vitals` asks what you HAVE, this asks what is coming IN (or
  // going out) each year — income, upkeep, a wasting illness — without the card
  // needing to know which statuses produce it. A new job that pays satisfies an
  // income gate the day it is written, with no gate to update.
  drift?: Partial<Record<VitalKey, { min?: number; max?: number }>>;
  status?: Partial<Record<StatusKind, StatusMatch>>;
  traits?: TraitConditions;
  // OR-gate: passes if ANY listed sub-condition holds (each is a full Condition).
  // The other clauses on this object are still AND-ed with the `any` result — so
  // `{ ageMin: 18, any: [A, B] }` means "18+ AND (A or B)". Use for "eduUniFund OR
  // savings"-style gates.
  any?: Condition[];
}

// --- Effects -----------------------------------------------------------------
export interface Effect {
  vitals?: Partial<Record<VitalKey, Magnitude>>; // "+"/"++"/"-"/"--", applied then clamped
  // A floor for THIS year: after the year's drift, the vital is raised to at
  // least this, so neither the card nor the year's drain can take it lower. A
  // safety net uses it so answering it cannot kill you by the vital it caught
  // (the net floors the vital and hands you the card NEXT turn, and that turn
  // drifts like any other). Not lethal-proofing beyond the year: the year
  // after is on you.
  floor?: Partial<Record<VitalKey, number>>;
  setStatus?: Partial<Record<StatusKind, string>>;
  addDecks?: string[];
  removeDecks?: string[]; // ids, or a trailing wildcard like "job_*"
  setTraits?: Partial<Traits>;
  // Like setTraits, but for BURDENS (flawOwesCharity, flawSoldUp, …). Mechanically
  // identical — sets trait values — but semantically "a bad thing", so the UI's
  // beneficial-choice ★ does NOT fire for it (and is suppressed if the outcome
  // also changes status, e.g. selling up → renting). Keep boons in setTraits so
  // they still earn the star (skillVaccinated, persSporty, …).
  setTraitsFlaw?: Partial<Traits>;
  incTraits?: Partial<Record<NumericTraitKey, number>>;
  // Like setTraits, but for BOOKKEEPING: sets trait values and draws NO card-face
  // mark. setTraits earns the ★ because a set trait is usually a life event
  // ("booleans tend to be big life events, counters aren't"); a clock being
  // wound, a cooldown started or a story flag closed is not one, and before this
  // existed the only way to write one without a stray ★ was to fake it with an
  // incTraits of the right size. Mechanically identical to setTraits.
  setTraitsHidden?: Partial<Traits>;
  // The card-face mark (★ / ⚠) this outcome carries, overriding the derived one.
  // Omit it and the mark is worked out from the fields written, which is right
  // most of the time.
  //
  // It has to be overridable because the derivation reads MECHANISM where the
  // mark means MEANING. It stars any `setTraits`, so latching "her story is over"
  // or winding a pet's age back to zero wore a reward star; and it burdens only a
  // status flagged `grim`, so losing your cat — `pet` moving to `none`, a state
  // nothing is wrong with, since everyone starts there — wore one too.
  //
  //   "none"     bookkeeping. Nothing is being decided; draw no mark at all.
  //   "special"  a turn in the road the derivation misses.
  //   "burden"   a loss or a lasting mark the derivation misses.
  //
  // Authored rather than computed, for the same reason `driftShown` is: the
  // engine has no way to know which writes matter, and content does.
  mark?: "none" | "special" | "burden";
  // Record a MEMORABLE life event for the end-of-run recap: pushes { age, id } to
  // state.log when this outcome fires. Use for TRANSIENT moments the final state
  // won't show (went to the workhouse, ran away, moved out, a promotion) — durable
  // facts (final job/home, vaccinated, sold up…) are read straight from end-state,
  // so they don't need a `remember`. The id is a StringId (a short past-tense line).
  remember?: StringId;
}

// --- Cards -------------------------------------------------------------------
export type Direction = "left" | "right" | "up" | "down";
export type CardKind = "one_time" | "filler" | "milestone";

// An option resolves to the first Outcome whose `if` matches (or the first
// with no `if`). The chosen outcome supplies the result text and effects.
export interface Outcome {
  if?: Condition;
  result: StringId;
  effects?: Effect;
}

export interface CardOption {
  label: StringId;
  // Resolved top-to-bottom; author the last one unconditional as the fallback.
  outcomes: Outcome[];
  // Optional per-option visibility. When present, the option (edge label + swipe)
  // only appears if this condition holds — so a card can offer a choice only in
  // certain states (e.g. "return to the factory" only once you've reached it).
  // A swipe toward a hidden option is a no-op.
  if?: Condition;
}

// Every card has left + right; up/down are optional (3–4 option cards).
export type CardOptions = { left: CardOption; right: CardOption } & Partial<
  Record<Direction, CardOption>
>;

export interface Card {
  id: string;
  kind: CardKind;
  prompt: StringId;
  options: CardOptions;
  copies?: number;      // one_time / milestone: max occurrences (default 1)
  conditions?: Condition; // eligibility on top of deck membership
  priority?: number;    // milestone AND rescue tie-break; higher wins (default 0)
  deck?: string;        // filled in by the deck loader
  // A safety-net card: instead of drawing normally, it fires when this vital
  // would hit 0 — the engine floors the vital and forces this card next (a
  // one-shot rescue; once played it's used up, so a second collapse is fatal).
  rescue?: VitalKey;
  // FORCED cards: when the card is otherwise eligible and ANY listed vital has
  // crossed its threshold, it jumps the queue (below milestones, above the pool)
  // — so a state that calls for it always surfaces it rather than waiting on the
  // draw. The card still appears normally in the pool otherwise.
  //   forceAbove: { finances: 90 }  — fires at 90 or more: a piled-up resource
  //     always surfaces the chance to spend it. Worth setting below the max:
  //     drift nibbles at the top of the bar every turn, so a card forced only
  //     at 100 sat out three years in four of the very state it answers.
  //   forceBelow: { happiness: 30, spirit: 30 } — fires at 30 or less: a low
  //     mood surfaces what would lift it.
  forceAbove?: Partial<Record<VitalKey, number>>;
  forceBelow?: Partial<Record<VitalKey, number>>;
  // Keep this card in the pool even while a `priority` deck is focusing the draw
  // — the card-sized version of a deck's `neverSuppressed`.
  //
  // A deck spares ALL of itself, which is right when every one of its beats is on
  // a clock the draw cannot pause (the siblings' windows are their siblings'
  // ages). It is wrong when a deck has one beat that is ABOUT the urgent state
  // and the rest can wait: gating a card on a priority state and leaving it
  // suppressed makes it unreachable by construction, because that state is
  // exactly when its deck is switched off.
  //
  // Sparing one card costs the escape routes a single slot in the pool; sparing
  // its deck costs them the whole deck. Prefer this.
  neverSuppressed?: boolean;
  // Rarity gate (0..1): even once its `conditions` hold, the card only enters the
  // draw pool on a fresh per-year dice roll (value < chance). Omitted = always in
  // the pool (chance 1). Pair with `one_time` for a rare once-in-a-life surprise
  // that competes in the pool the year it lands — e.g. a pet's litter, which is
  // gated to the middle of its life and only rarely turns up. The roll consumes
  // rng (threaded through the draw), so a save resumes the same sequence.
  chance?: number;
  // Draw WEIGHT: relative likelihood of being picked once in the pool (default 1).
  // A weight of 3 makes a card 3x as likely as a plain card on any given turn,
  // WITHOUT excluding the rest of the pool (unlike a `priority` deck). Use it when
  // a few essential cards would otherwise drown in incidental flavour — e.g. the
  // criminal's "score" cards, which are the whole income yet compete against a
  // dozen age/home/sibling cards. It biases the random pick only; eligibility,
  // `chance`, milestones and priority decks all resolve first, unchanged.
  weight?: number;
}

export interface Deck {
  id: string;
  cards: Card[];
  title?: StringId;  // shown when this deck is unlocked for the first time
  unlock?: StringId; // blurb for the first-time unlock announcement
  // Per-turn trait increments while this deck is active (see TickRule). Runs
  // every turn the deck is active, babyhood grace included.
  ticks?: TickRule[];
  // An "urgent" deck: while it is active, its eligible cards OWN the draw pool —
  // incidental flavour from other active decks is suppressed so you can escape
  // the state (unemployment, the workhouse) instead of drifting in it for years.
  priority?: boolean;
  // Exempt from that suppression: this deck's cards stay in the pool even while
  // an urgent deck owns it. For decks whose cards are gated on someone ELSE'S
  // age — the sibling arcs — where a few years in gaol or the workhouse can
  // otherwise close a window that never reopens, and a beat is missed for good
  // rather than merely delayed.
  neverSuppressed?: boolean;
}

// --- Status definitions ------------------------------------------------------
// How a drift reads on the status chip: a signed 1–4-symbol strength, authored
// independently of the raw drift number. Detaches the visual from the maths so
// you can tune drift values without a number nudging across a display threshold
// and silently changing how many +/− show. The convention is LADDER POSITION,
// not magnitude: each rung up a progression shows one more symbol — housing
// finances renting − / small −− / large −−− / estate −−−−; a career's wage +/++/+++
// by tier. Mirrors the card +/++/+++ vocabulary.
export type DriftShown = "+" | "++" | "+++" | "++++" | "-" | "--" | "---" | "----";

export interface StatusStateDef {
  label?: StringId;                      // display name id (defaults to the key)
  drift?: Partial<Record<VitalKey, number>>;
  // Per-turn trait increments while in this state (see TickRule). Not paused
  // by the kind's `driftWhile`.
  ticks?: TickRule[];
  // Per-vital override for how `drift` READS on the chip (see DriftShown). When a
  // vital is listed here the chip shows exactly this, ignoring the number's size
  // (the sign, too, comes from the token). Omitted vitals fall back to deriving
  // the strength from |drift| (|v| >= 16 → 3, >= 8 → 2, else 1).
  driftShown?: Partial<Record<VitalKey, DriftShown>>;
  addDecks?: string[];                   // decks owned while in this state
  // While you are in this state, these OTHER status kinds are forced to the given
  // value, and whatever you had is stashed and handed back when you leave. Gaol
  // uses it to suspend your lifestyle (nobody keeps a lavish household from a
  // cell). Content names both the kind and the value it collapses to, so the
  // engine never has to know a status VALUE — see changeStatus.
  suspends?: Partial<Record<StatusKind, string>>;
  // Traits stamped when you ENTER this state, whatever route brought you there:
  // a fresh apprenticeship starts with no craftsmanship (`jobSkill: 0`).
  enterTraits?: Partial<Traits>;
  // A state "between" values of its kind — entering it preserves the kind's
  // tenure counter (StatusDef.tenure) and the value it was earned in, so a
  // sacking and a re-hire into the SAME job doesn't wipe the count.
  keepTenure?: boolean;
  // A SETBACK: landing here is something that happens TO you, not a road you'd
  // take for its own sake — sacked, on the street, in the workhouse, in gaol.
  // Purely a display fact, and the engine never reads it: the card preview shows
  // an option that puts you here with the burden ⚠ instead of the reward ★, so a
  // bare `setStatus` demotion stops advertising itself as a promotion. Content
  // declares which states are grim rather than the UI ranking them, since only
  // the content knows that unemployed is a fall and apprentice is a start.
  grim?: boolean;
}

// When a status kind's chip appears in the top row. The rule used to be a chain
// of special cases in the UI, which meant every new status kind with an opinion
// about its own visibility added another branch. It is content's business, so
// content states it — and states it for EVERY kind, because a default would be
// the engine having a view about which statuses matter when.
//   "always"   — from birth.
//   "whenSet"  — only once the value differs from `content.start.statuses`, for a
//                kind you may never acquire at all.
//   { ageMin } — from an age. For a kind that is live and doing work long before
//                it is worth a chip.
export type StatusShow = "always" | "whenSet" | { ageMin: number };

export interface StatusDef {
  id: StatusKind;
  show: StatusShow;
  levels?: string[];                     // ordering for `atLeast`, low → high
  // A counter of time in the current value: reset to 0 when the kind changes to
  // a value other than the one it was earned in, kept through `keepTenure`
  // states (see changeStatus). Something else must tick it.
  tenure?: NumericTraitKey;
  // Traits stamped on ANY change of this kind's value, before the new state's
  // own `enterTraits` — e.g. a new employer wipes your strikes.
  enterTraits?: Partial<Traits>;
  // This kind's drift applies only in turns where the condition holds (absent:
  // always). How a grace period is written — living costs suspended through
  // babyhood, while the life stage's own bonus still lands. Must not itself use
  // a `drift` clause (it is read while the drift is being summed).
  driftWhile?: Condition;
  states: Record<string, StatusStateDef>;
}

// --- Content bundle & starting configuration ---------------------------------
export interface StartConfig {
  vitals: Vitals;
  statuses: Record<StatusKind, string>;
  decks: string[];
  traits: Traits; // every trait, at its starting value
}

export interface Content {
  // The vitals, in the order the turn walks them (drift, clamp, the game-over
  // check, which catches the first to hit the floor).
  vitals: readonly VitalKey[];
  decks: Deck[];
  statuses: Record<StatusKind, StatusDef>;
  start: StartConfig;
  // Content CONSTANTS, substituted into any player-facing card string that uses
  // {braces} — the siblings' names live here rather than being written into every
  // card, so renaming one is a single edit. Constant for the whole run (never
  // per-save), so they are NOT traits; content, not engine, so they are NOT
  // hardcoded in the UI. Deliberately content-level rather than per-deck: the
  // end-of-run epilogue names the siblings too (ui.proseBrother*) and belongs to
  // no deck, so deck-scoping would leave those unresolvable.
  vars?: Record<string, string>;
  // Where a vital caught by a safety net (Card.rescue) is set when it catches
  // you. (The net's own outcomes keep it there through the year spent
  // answering, with Effect.floor.)
  rescueFloor: number;
  // Where saves live, and their version. Raising the version drops every save
  // written before it (you get a fresh life) — deliberately not migration. When
  // to raise it is the game's call.
  save: { prefix: string; version: number };
}

// --- Runtime game state (this is what gets saved) ----------------------------
// One dated entry in the life-log (see Effect.remember), rendered on the
// end-of-run recap as the run's "milestones".
export interface LifeEvent {
  age: number;
  id: StringId;
}

export interface GameState {
  age: number;
  vitals: Vitals;
  statuses: Record<StatusKind, string>;
  traits: Traits;
  activeDecks: string[];
  usedCards: Record<string, number>; // card id -> times played
  // The filler discard pile: fillers already dealt, kept out of the draw until
  // the eligible ones are all in here and it shuffles back (see drawCard).
  // Fillers are exempt from `usedCards` — they never run out — so they need
  // their own list, and it is a list rather than a count because nothing here
  // cares HOW often one played, only whether it has.
  playedFillers: string[];
  lastCardId?: string;                // to avoid drawing the same card twice in a row
  // Per kind with a tenure counter: the value its count was earned in (changeStatus).
  tenureOf?: Partial<Record<StatusKind, string>>;
  // Status values stashed by a state that `suspends` them, handed back on leaving.
  suspendedStatuses?: Partial<Record<StatusKind, string>>;
  pendingRescue?: string;             // a rescue card id to force on the next draw
  rng: number;                        // PRNG state, so resume is consistent
  // The seed this life STARTED from. `rng` overwrites itself on every draw, so
  // without this the only record of where a life began is gone by the first
  // card. Every random thing in the engine comes from `rng`, so this seed plus
  // the swipes taken reproduces a life exactly.
  seed: number;
  over: boolean;
  endReason?: VitalKey;               // the vital that hit the floor
  log: LifeEvent[];                   // dated memorable events, for the end recap
}
