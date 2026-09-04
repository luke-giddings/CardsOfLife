// ---------------------------------------------------------------------------
// Cards of Life — core domain types.
//
// This file is the "typed registry" the design doc talks about: the set of
// Vitals, Statuses and Traits is declared here, and every card's conditions and
// effects are typed against it. A card that references a misspelled trait or a
// stat that doesn't exist becomes a compile error, not a runtime surprise.
// ---------------------------------------------------------------------------

import type { StringId } from "../i18n/index.ts";

// --- Vitals: the four lethal bars (0..100). Any at 0 = game over. ------------
export type VitalKey = "finances" | "happiness" | "health" | "spirit";
export type Vitals = Record<VitalKey, number>;

export const VITAL_KEYS: VitalKey[] = ["finances", "happiness", "health", "spirit"];
export const VITAL_MIN = 0;
export const VITAL_MAX = 100;

// Vital changes are expressed in readable magnitude "steps", not raw numbers,
// so the player sees a small ("+") vs a large ("++") move rather than muddy
// in-between values. Tweak the point values here in one place; add more levels
// as balancing needs them. "+++" is a HUGE one-off swing (~4 turns of a typical
// +12 wage) — used for the criminal path's rare, random big scores, which have
// to pay for the long dry spells between them. "++++" is a life-changing sum
// (a whole vital bar) — the sale of an estate, and the like.
export type Magnitude = "---" | "--" | "-" | "+" | "++" | "+++" | "++++";
// Flat point steps for the fixed magnitudes.
export const MAGNITUDE_POINTS: Record<Exclude<Magnitude, "---">, number> = {
  "++++": 100,
  "+++": 50,
  "++": 25,
  "+": 10,
  "-": -10,
  "--": -25,
};
// Apply a magnitude to a value (unclamped). Most are flat steps; "---" is the
// PROPORTIONAL "big purchase" cost — it keeps ~a third (loses two thirds), used
// for buying housing (moving out, and the house tiers). Floored at 1 so it can
// never reach 0 from a positive value — a card gated behind a floor condition
// can't game-over.
export function applyMagnitude(value: number, mag: Magnitude): number {
  if (mag === "---") return Math.max(1, Math.round(value / 3));
  return value + MAGNITUDE_POINTS[mag];
}

// End-screen framing. The four vital endings (only Health's is "death"), plus
// named endings triggered by an effect (e.g. reaching adulthood). title/blurb
// are string ids, looked up per-locale by the UI.
export interface Ending {
  title: StringId;
  blurb: StringId;
  survived?: boolean; // true = not a game-over-by-collapse ending
}

export const ENDINGS: Record<string, Ending> = {
  finances: { title: "ending.finances.title", blurb: "ending.finances.blurb" },
  happiness: { title: "ending.happiness.title", blurb: "ending.happiness.blurb" },
  health: { title: "ending.health.title", blurb: "ending.health.blurb" },
  spirit: { title: "ending.spirit.title", blurb: "ending.spirit.blurb" },
  grown_up: { title: "ending.grown_up.title", blurb: "ending.grown_up.blurb", survived: true },
};

// --- Statuses: persistent side-states that drift Vitals and gate content. ----
export type StatusKind = "age" | "job" | "housing" | "education" | "lifestyle";
export const STATUS_KINDS: StatusKind[] = ["age", "job", "housing", "education", "lifestyle"];

// --- Traits: hidden state. Booleans, enums, counters. ------------------------
// Add a field here and it is instantly usable (and type-checked) in content.
export interface Traits {
  gender: "boy" | "girl";
  knowsMartialArts: boolean;
  vaccinated: boolean;
  // Education. `edu*` so the debug panel groups it under an Education category.
  // The university savings pot, seeded in the baby deck — a "setup for the future".
  eduUniFund: boolean;
  // Disposition counters (0..3). A baby who leans into it starts at the cap (3,
  // = "fully" the trait); otherwise you build it up +1 at a time in youth. Cards
  // that reward the trait gate on `{ min: 3 }`. (Backlog: more +1 sources so
  // youth can actually reach 3, and more results that branch on the level.)
  bookish: number;
  sporty: number;
  sweetTooth: boolean;
  sociable: boolean;
  // Sibling relationships (hidden; can go negative = rivalry). All `rel<Sibling>*`
  // so the debug panel groups them by sibling under a Relationships category:
  //   <sibling>Active = whether you have this sibling at all (set at the baby deck);
  //   <sibling>Love   = closeness with you;
  //   <sibling>Grit   = their own backbone/independence (cushion vs toughen);
  //   <sibling>Arc    = the story cursor (which beat is armed / which branch).
  // See the rel_bro deck (Tom). The sister gets Grit/Arc when her story is built.
  relBrotherActive: boolean;
  relBrotherLove: number;
  relBrotherGrit: number;
  relBrotherArc: number;
  relSisterActive: boolean;
  relSisterLove: number;
  numTimesPlayedLottery: number;
  // Work life. All `job*` so the debug panel groups them under a Jobs category.
  // Times you've switched jobs over the run (an epitaph/flavour counter).
  jobTimesChanged: number;
  // Years served in the current job. Ticked by each work-event card; a
  // promotion card gates on it and resets it to 0 on the step up.
  jobExperience: number;
  // Apprenticeship craftsmanship. Unlike `jobExperience` (time served — every
  // apprentice work card ticks it whichever way you choose), `jobSkill` only rises
  // when you APPLY YOURSELF (the "work hard" option). The qualifying trial passes
  // on skill, not health, so coasting through the years leaves you unready. Reset
  // to 0 when you (re-)enter the apprenticeship. See the job_apprentice deck.
  jobSkill: number;
  // Durable "reached the factory" marker (unlike `jobExperience`, which resets on
  // each job change). Lets the unemployed offer let a former factory worker
  // return to the factory without re-grinding, while a green worker cannot skip
  // straight there. (Stopgap: will fold into a per-path "highest tier reached"
  // cache when adult job re-entry lands.)
  jobReachedFactory: boolean;
  // Standing with your current employer (0 = model worker). Rises when you shirk
  // and each time you grovel to keep your job; a high count means the foreman
  // won't hear your pleading. Resets to 0 on any job change (a fresh reputation
  // with a new employer).
  jobStrikes: number;
  // Durable debt to the charity hospital that saved you as a small child (the
  // health rescue). Set when you take their care; the ledger comes due in young
  // adulthood, unlocking the repayment card until you clear it.
  owesCharity: boolean;
  // Durable mark of shame: you were forced to sell your home to cover debts (the
  // sell-up rescue). Recorded for the end-of-run epitaph (Backlog).
  soldUp: boolean;
}

export const DEFAULT_TRAITS: Traits = {
  gender: "boy",
  knowsMartialArts: false,
  vaccinated: false,
  eduUniFund: false,
  bookish: 0,
  sporty: 0,
  sweetTooth: false,
  sociable: false,
  relBrotherActive: false,
  relBrotherLove: 0,
  relBrotherGrit: 0,
  relBrotherArc: 0,
  relSisterActive: false,
  relSisterLove: 0,
  numTimesPlayedLottery: 0,
  jobTimesChanged: 0,
  jobExperience: 0,
  jobSkill: 0,
  jobReachedFactory: false,
  jobStrikes: 0,
  owesCharity: false,
  soldUp: false,
};

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

export interface Condition {
  ageMin?: number;
  ageMax?: number;
  vitals?: Partial<Record<VitalKey, { min?: number; max?: number }>>;
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
  setStatus?: Partial<Record<StatusKind, string>>;
  addDecks?: string[];
  removeDecks?: string[]; // ids, or a trailing wildcard like "job_*"
  setTraits?: Partial<Traits>;
  // Like setTraits, but for BURDENS (owesCharity, soldUp, …). Mechanically
  // identical — sets trait values — but semantically "a bad thing", so the UI's
  // beneficial-choice ★ does NOT fire for it (and is suppressed if the outcome
  // also changes status, e.g. selling up → renting). Keep boons in setTraits so
  // they still earn the star (vaccinated, sporty, …).
  setFlaws?: Partial<Traits>;
  incTraits?: Partial<Record<NumericTraitKey, number>>;
  endGame?: string; // ends the run with this ending id (see ENDINGS)
  // Return housing to whatever it was before you entered the master's house (see
  // GameState.housingBeforeApprentice). Used by the apprenticeship exits so the
  // job ladder never silently grants or strips housing — you go back where you
  // came from (family/renting/…). Falls back to `renting` if nothing was saved.
  restoreHousing?: boolean;
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
  priority?: number;    // milestone tie-break; higher wins (default 0)
  deck?: string;        // filled in by the deck loader
  // A safety-net card: instead of drawing normally, it fires when this vital
  // would hit 0 — the engine floors the vital and forces this card next (a
  // one-shot rescue; once played it's used up, so a second collapse is fatal).
  rescue?: VitalKey;
  // The opposite of rescue: when this vital is at its MAX and the card is
  // otherwise eligible, force it to jump the queue — so a capped resource (e.g.
  // full money with nowhere to go) always surfaces the chance to spend it. The
  // card still appears normally in the pool below the cap.
  force?: VitalKey;
}

export interface Deck {
  id: string;
  cards: Card[];
  title?: StringId;  // shown when this deck is unlocked for the first time
  unlock?: StringId; // blurb for the first-time unlock announcement
  noDrift?: boolean; // while active, status drift is suspended (unloseable grace, e.g. babyhood)
  // An "urgent" deck: while it is active, its eligible cards OWN the draw pool —
  // incidental flavour from other active decks is suppressed so you can escape
  // the state (unemployment, the workhouse) instead of drifting in it for years.
  priority?: boolean;
}

// --- Status definitions ------------------------------------------------------
export interface StatusStateDef {
  label?: StringId;                      // display name id (defaults to the key)
  drift?: Partial<Record<VitalKey, number>>;
  addDecks?: string[];                   // decks owned while in this state
  // (job states) A "between jobs" state — entering it preserves the `experience`
  // counter and the job it was earned in, so a sacking→re-hire into the SAME job
  // doesn't wipe your progress. See changeStatus.
  keepExperience?: boolean;
}

export interface StatusDef {
  id: StatusKind;
  ordered?: boolean;
  levels?: string[];                     // ordering for `atLeast`, low → high
  // When true, this kind's drift applies even during a `noDrift` grace period
  // (babyhood). Used by the `age` status so the life-stage bonus/penalty is
  // always felt — the baby stage's small all-round bonus lands even while the
  // baby deck otherwise suspends drift. Living-cost drains stay suspended.
  ignoreNoDrift?: boolean;
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
  lastCardId?: string;                // to avoid drawing the same card twice in a row
  experienceJob?: string;             // the job the current `jobExperience` was earned in (see changeStatus)
  housingBeforeApprentice?: string;   // housing to return to on leaving apprenticeship (see changeStatus / restoreHousing)
  pendingRescue?: string;             // a rescue card id to force on the next draw
  rng: number;                        // PRNG state, so resume is consistent
  over: boolean;
  endReason?: string;                 // ENDINGS id (vital key, or a named ending)
}
