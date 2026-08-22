// ---------------------------------------------------------------------------
// Cards of Life — core domain types.
//
// This file is the "typed registry" the design doc talks about: the set of
// Vitals, Statuses and Traits is declared here, and every card's conditions and
// effects are typed against it. A card that references a misspelled trait or a
// stat that doesn't exist becomes a compile error, not a runtime surprise.
// ---------------------------------------------------------------------------

// --- Vitals: the four lethal bars (0..100). Any at 0 = game over. ------------
export type VitalKey = "finances" | "happiness" | "health" | "spirit";
export type Vitals = Record<VitalKey, number>;

export const VITAL_KEYS: VitalKey[] = ["finances", "happiness", "health", "spirit"];
export const VITAL_MIN = 0;
export const VITAL_MAX = 100;

// End-screen framing. The four vital endings (only Health's is "death"), plus
// named endings triggered by an effect (e.g. reaching adulthood).
export interface Ending {
  title: string;
  blurb: string;
  survived?: boolean; // true = not a game-over-by-collapse ending
}

export const ENDINGS: Record<string, Ending> = {
  finances: { title: "Bankrupt", blurb: "The money ran out, and with it your options." },
  happiness: { title: "Despair", blurb: "The joy drained away until there was none left to find." },
  health: { title: "Death", blurb: "Your body gave out. A life reached its end." },
  spirit: { title: "Emptiness", blurb: "The spark went out. You were still here, but not really." },
  grown_up: { title: "All Grown Up", blurb: "Childhood is behind you. The rest of your story is still to be written…", survived: true },
};

// --- Statuses: persistent side-states that drift Vitals and gate content. ----
export type StatusKind = "job" | "housing" | "education" | "lifestyle";
export const STATUS_KINDS: StatusKind[] = ["job", "housing", "education", "lifestyle"];

// --- Traits: hidden state. Booleans, enums, counters. ------------------------
// Add a field here and it is instantly usable (and type-checked) in content.
export interface Traits {
  gender: "boy" | "girl";
  knowsMartialArts: boolean;
  vaccinated: boolean;
  numTimesChangedJob: number;
  numTimesPlayedLottery: number;
}

export const DEFAULT_TRAITS: Traits = {
  gender: "boy",
  knowsMartialArts: false,
  vaccinated: false,
  numTimesChangedJob: 0,
  numTimesPlayedLottery: 0,
};

// Keys of Traits whose value is a number — the only ones you can `inc`.
export type NumericTraitKey = {
  [K in keyof Traits]: Traits[K] extends number ? K : never;
}[keyof Traits];

// --- Conditions --------------------------------------------------------------
export type NumberMatch = number | { min?: number; max?: number };
export type StatusMatch = string | { atLeast: string };

// Per-trait match: exact value for bool/enum, number-or-range for counters.
export type TraitConditions = {
  [K in keyof Traits]?: Traits[K] extends number ? NumberMatch : Traits[K];
};

export interface Condition {
  ageMin?: number;
  ageMax?: number;
  vitals?: Partial<Record<VitalKey, { min?: number; max?: number }>>;
  status?: Partial<Record<StatusKind, StatusMatch>>;
  traits?: TraitConditions;
}

// --- Effects -----------------------------------------------------------------
export interface Effect {
  vitals?: Partial<Record<VitalKey, number>>; // deltas, applied then clamped
  setStatus?: Partial<Record<StatusKind, string>>;
  addDecks?: string[];
  removeDecks?: string[]; // ids, or a trailing wildcard like "job_*"
  setTraits?: Partial<Traits>;
  incTraits?: Partial<Record<NumericTraitKey, number>>;
  endGame?: string; // ends the run with this ending id (see ENDINGS)
}

// --- Cards -------------------------------------------------------------------
export type Direction = "left" | "right" | "up" | "down";
export type CardKind = "one_time" | "filler" | "milestone";

// An option resolves to the first Outcome whose `if` matches (or the first
// with no `if`). The chosen outcome supplies the result text and effects.
export interface Outcome {
  if?: Condition;
  result: string;
  effects?: Effect;
}

export interface CardOption {
  label: string;
  // Resolved top-to-bottom; author the last one unconditional as the fallback.
  outcomes: Outcome[];
}

// Every card has left + right; up/down are optional (3–4 option cards).
export type CardOptions = { left: CardOption; right: CardOption } & Partial<
  Record<Direction, CardOption>
>;

export interface Card {
  id: string;
  kind: CardKind;
  prompt: string;
  options: CardOptions;
  copies?: number;      // one_time / milestone: max occurrences (default 1)
  conditions?: Condition; // eligibility on top of deck membership
  priority?: number;    // milestone tie-break; higher wins (default 0)
  deck?: string;        // filled in by the deck loader
}

export interface Deck {
  id: string;
  cards: Card[];
}

// --- Status definitions ------------------------------------------------------
export interface StatusStateDef {
  label?: string;                        // display name (defaults to the key)
  drift?: Partial<Record<VitalKey, number>>;
  addDecks?: string[];                   // decks owned while in this state
}

export interface StatusDef {
  id: StatusKind;
  ordered?: boolean;
  levels?: string[];                     // ordering for `atLeast`, low → high
  states: Record<string, StatusStateDef>;
}

// --- Content bundle & starting configuration ---------------------------------
export interface StartConfig {
  vitals: Vitals;
  statuses: Record<StatusKind, string>;
  decks: string[];
  traits?: Partial<Traits>;
}

export interface Content {
  decks: Deck[];
  statuses: Record<StatusKind, StatusDef>;
  start: StartConfig;
}

// --- Runtime game state (this is what gets saved) ----------------------------
export interface GameState {
  age: number;
  vitals: Vitals;
  statuses: Record<StatusKind, string>;
  traits: Traits;
  activeDecks: string[];
  usedCards: Record<string, number>; // card id -> times played
  rng: number;                        // PRNG state, so resume is consistent
  over: boolean;
  endReason?: string;                 // ENDINGS id (vital key, or a named ending)
  history: string[];                  // brief log for the end-of-run summary
}
