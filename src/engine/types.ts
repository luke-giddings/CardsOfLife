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
// Flat point steps ("/" and "//" are proportional — handled in applyMagnitude).
export const MAGNITUDE_POINTS: Record<Exclude<Magnitude, "/" | "//">, number> = {
  "++++": 100,
  "+++": 50,
  "++": 25,
  "+": 10,
  "-": -10,
  "--": -25,
  "---": -40,
};
// Apply a magnitude to a value (unclamped). Flat steps add their points; the
// proportional slashes keep a fraction of the current value, floored at 1 so they
// can never reach 0 from a positive value.
export function applyMagnitude(value: number, mag: Magnitude): number {
  if (mag === "//") return Math.max(1, Math.round(value / 3)); // keep a third
  if (mag === "/") return Math.max(1, Math.round(value / 2));  // keep a half
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
export type StatusKind = "age" | "job" | "housing" | "education" | "lifestyle" | "pet";
export const STATUS_KINDS: StatusKind[] = ["age", "job", "housing", "education", "lifestyle", "pet"];

// --- Traits: hidden state. Booleans, enums, counters. ------------------------
// Add a field here and it is instantly usable (and type-checked) in content.
export interface Traits {
  gender: "boy" | "girl";
  // Learned abilities / protections. `skill*` so the debug panel groups them
  // under a Skills category. (Distinct from `jobSkill`, which is apprenticeship
  // craftsmanship under the Jobs category.) `skillVaccinated` = smallpox immunity
  // bought in the baby deck; it helps you survive the childhood fever hazard.
  skillMartialArts: boolean;
  skillVaccinated: boolean;
  // Education. `edu*` so the debug panel groups it under an Education category.
  // The university savings pot, seeded in the baby deck — a "setup for the future".
  eduUniFund: boolean;
  // Set once you've taken up a place at university (spending the fund or your
  // savings). Distinguishes a former undergraduate — who can RETURN to finish,
  // e.g. off the streets — from a fresh grammar-leaver who never went.
  eduWasUndergraduate: boolean;
  // Personality / disposition. `pers*` so the debug panel groups them under a
  // Personality category. The counters (0..3): a baby who leans into it starts
  // at the cap (3, = "fully" the trait); otherwise you build it up +1 at a time
  // in youth. Cards that reward the trait gate on `{ min: 3 }`. (Backlog: more +1
  // sources so youth can actually reach 3, and more results that branch on level.)
  persBookish: number;
  persSporty: number;
  persSweetTooth: boolean;
  persSociable: boolean;
  // Sibling relationships (hidden; can go negative = rivalry). All `rel<Sibling>*`
  // so the debug panel groups them by sibling under a Relationships category.
  // Tom's arc (rel_bro deck) has NO fixed cursor: his beats fire in windows of HIS
  // life (relBrotherAge), drawn organically, so which you catch varies run to run.
  // Two independent axes carry the relationship — LOVE (the warmth of the bond,
  // shaped by the QUALITY of your choices) and DISTANCE (how PRESENT you've been,
  // which climbs by itself and only falls when you show up) — and later beats read
  // both, so a missed beat bends the story (you drifted) instead of ending it.
  relBrotherActive: boolean; // whether you have a brother at all (set at the baby deck)
  relBrotherLove: number;    // bond quality: warm (+) ↔ bitter (−), shaped by your choices
  relBrotherGrit: number;    // his backbone/independence, shaped by your choices
  relBrotherAge: number;     // his age, ticked up each year by the rel_bro deck (Deck.tick)
  // How PRESENT you've been in his life: 0 = close at hand, rising = drifting apart.
  // The rel_bro deck ticks it UP every year (you drift just by living your own life);
  // every Tom card you engage pulls it back DOWN (you showed up). Distinct from love:
  // you can be close-hearted yet absent (drifted), or ever-present yet rivalrous.
  relBrotherDistance: number;
  relBrotherSchooled: boolean;  // his crossroads branch: true = you sent him to school, false = to work
  relBrotherReckoned: boolean;  // the adult "reckoning" beat has happened (its two housing variants can't both fire)
  relBrotherStoryDone: boolean; // his arc has concluded (finale or estrangement) — the deck goes dormant
  relSisterActive: boolean;
  relSisterLove: number;
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
  // Once you renounce the life of crime (the "give up" swipe on a score card),
  // this latches true and the criminal offer (job_unemployed_fagin) never appears
  // again — a one-way door out of the underworld.
  jobRenouncedCrime: boolean;
  // Accumulated "heat": +1 each crime you pull (the score cards). When you're
  // caught and gaoled it becomes your SENTENCE LENGTH — the prison deck's "do your
  // time" card decrements it a year at a time, and you walk free when it hits 0.
  // So the more you profited from crime, the longer the reckoning. Reset on
  // release. Lives loose in the debug panel (not a job-only stat).
  criminality: number;
  // Standing with your current employer (0 = model worker). Rises when you shirk
  // and each time you grovel to keep your job; a high count means the foreman
  // won't hear your pleading. Resets to 0 on any job change (a fresh reputation
  // with a new employer).
  jobStrikes: number;
  // Durable debt to the charity hospital that saved you as a small child (the
  // health rescue). Set when you take their care; the ledger comes due in young
  // adulthood, unlocking the repayment card until you clear it.
  flawOwesCharity: boolean;
  // Durable mark of shame: you were forced to sell your home to cover debts (the
  // sell-up rescue). Recorded for the end-of-run epitaph (Backlog).
  flawSoldUp: boolean;
  // You broke out of prison rather than serving your time — a fugitive. Latched by
  // the prison escape card. BACKLOG: use in other checks (harder to land honest
  // work, a chance of re-arrest, a grimmer epitaph). Unused for now beyond being set.
  flawWanted: boolean;
  // Pets. `pet*` so the debug panel groups them under a Pets category. There are
  // two pets (one at a time): a cat (a HAPPINESS companion) and a dog (a SPIRIT
  // companion), each with its own age/love pair. `pet<X>Age` ticks up each year
  // you keep that pet (via the pet status state's `tick`); the pet deck's passing
  // milestone fires when it reaches old age. `pet<X>Love` is how well you treat
  // it — neglect drives it down until the animal runs off (the runaway milestone,
  // which removes the pet before old age so a mistreated one never reaches passing).
  petCatAge: number;
  petCatLove: number;
  petDogAge: number;
  petDogLove: number;
}

export const DEFAULT_TRAITS: Traits = {
  gender: "boy",
  skillMartialArts: false,
  skillVaccinated: false,
  eduUniFund: false,
  eduWasUndergraduate: false,
  persBookish: 0,
  persSporty: 0,
  persSweetTooth: false,
  persSociable: false,
  relBrotherActive: false,
  relBrotherLove: 0,
  relBrotherGrit: 0,
  relBrotherAge: 0,
  relBrotherDistance: 0,
  relBrotherSchooled: false,
  relBrotherReckoned: false,
  relBrotherStoryDone: false,
  relSisterActive: false,
  relSisterLove: 0,
  jobTimesChanged: 0,
  jobExperience: 0,
  jobSkill: 0,
  jobReachedFactory: false,
  jobRenouncedCrime: false,
  criminality: 0,
  jobStrikes: 0,
  flawOwesCharity: false,
  flawSoldUp: false,
  flawWanted: false,
  petCatAge: 0,
  petCatLove: 0,
  petDogAge: 0,
  petDogLove: 0,
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
  // Like setTraits, but for BURDENS (flawOwesCharity, flawSoldUp, …). Mechanically
  // identical — sets trait values — but semantically "a bad thing", so the UI's
  // beneficial-choice ★ does NOT fire for it (and is suppressed if the outcome
  // also changes status, e.g. selling up → renting). Keep boons in setTraits so
  // they still earn the star (skillVaccinated, persSporty, …).
  setFlaws?: Partial<Traits>;
  incTraits?: Partial<Record<NumericTraitKey, number>>;
  // Record a MEMORABLE life event for the end-of-run recap: pushes { age, id } to
  // state.log when this outcome fires. Use for TRANSIENT moments the final state
  // won't show (went to the workhouse, ran away, moved out, a promotion) — durable
  // facts (final job/home, vaccinated, sold up…) are read straight from end-state,
  // so they don't need a `remember`. The id is a StringId (a short past-tense line).
  remember?: StringId;
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
  noDrift?: boolean; // while active, status drift is suspended (unloseable grace, e.g. babyhood)
  // Per-turn TRAIT increments while this deck is active — the deck-level counterpart
  // of StatusStateDef.tick (see applyTick). Use to age something tied to a deck's
  // lifetime rather than a status: the rel_bro deck ticks `relBrotherAge` from the
  // year Tom is born (the deck is added then and never removed) so his beats can
  // fire at his age. Runs every turn the deck is active, babyhood grace included.
  tick?: Partial<Record<NumericTraitKey, number>>;
  // An "urgent" deck: while it is active, its eligible cards OWN the draw pool —
  // incidental flavour from other active decks is suppressed so you can escape
  // the state (unemployment, the workhouse) instead of drifting in it for years.
  priority?: boolean;
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
  // Per-turn TRAIT increments while in this state — drift's counterpart for
  // counters (parallels `drift` for vitals, applied the same turns). Used to age
  // a pet toward the end of its life (pet=cat ticks `petCatAge`), so a lifespan
  // milestone can fire ~N years on. Runs even during the babyhood `noDrift`
  // grace period (a pet isn't around then anyway).
  tick?: Partial<Record<NumericTraitKey, number>>;
  // Per-vital override for how `drift` READS on the chip (see DriftShown). When a
  // vital is listed here the chip shows exactly this, ignoring the number's size
  // (the sign, too, comes from the token). Omitted vitals fall back to deriving
  // the strength from |drift| (|v| >= 16 → 3, >= 8 → 2, else 1).
  driftShown?: Partial<Record<VitalKey, DriftShown>>;
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
  lastCardId?: string;                // to avoid drawing the same card twice in a row
  experienceJob?: string;             // the job the current `jobExperience` was earned in (see changeStatus)
  housingBeforeApprentice?: string;   // housing to return to on leaving apprenticeship (see changeStatus / restoreHousing)
  lifestyleBeforePrison?: string;     // lifestyle to return to on release from gaol (see changeStatus)
  pendingRescue?: string;             // a rescue card id to force on the next draw
  rng: number;                        // PRNG state, so resume is consistent
  over: boolean;
  endReason?: string;                 // ENDINGS id (vital key, or a named ending)
  log: LifeEvent[];                   // dated memorable events, for the end recap
}
