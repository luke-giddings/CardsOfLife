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
export type StatusKind = "age" | "job" | "housing" | "education" | "lifestyle" | "pet" | "family";
export const STATUS_KINDS: StatusKind[] = ["age", "job", "housing", "education", "lifestyle", "pet", "family"];

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
  // How hard you have applied yourself at the school you are AT. The exact twin
  // of `jobSkill` at the bench: it rises only when you choose the work over the
  // easier thing, the leaver card reads it to decide whether you may go up, and
  // each schooling state stamps it back to 0 on entry (`enterTraits`), so every
  // tier is its own test and a hard-won board school does not carry a lazy
  // grammar school. `persBookish` earns MORE from the same choice rather than
  // lowering the bar — the bookish child is quicker, not excused.
  eduStudy: number;
  // Personality / disposition. `pers*` so the debug panel groups them under a
  // Personality category. PLAIN BOOLEANS: you are the sort of person who does
  // this, or you are not.
  //
  // Two of them were 0..3 counters, capped and gated at `{ min: 3 }`, on the idea
  // that a baby who leaned into it started at the cap and everyone else built up
  // to it. Nothing ever built up to it. `persBookish` had ONE writer, which set it
  // straight to 3, so the threshold was decoration on a boolean. `persSporty` had
  // a second writer worth +1, which could not reach 3 from 0 however it fell:
  // measured over 6,000 lives it ended on 0 or 1 and never on 3, and the football
  // card's +1 failed to carry anyone across the gate 1,399 times out of 1,399.
  //
  // A level would need a stream of sources to climb and a way for the player to
  // see where they stood on it, and there is neither. A boolean has one card that
  // makes you it, and that card wears a ★, which is the whole of what a threshold
  // crossing was trying to say.
  persBookish: boolean;
  persSporty: boolean;
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
  // Years before his next beat may be dealt. Each beat past childhood sets it
  // (setTraitsQuiet) and rel_bro's `ticks` counts it down, stopping at 0. Milestones
  // and his childhood beats neither wait for it nor start it.
  relBrotherCooldown: number;
  // Sarah's arc (rel_sis deck) mirrors Tom's SHAPE — love + distance, beats in
  // windows of her own life, a crossroads, a weighted finale, an estrangement —
  // but inverts his second axis. Tom's `grit` is his backbone, and it grows when
  // you make him STAND ALONE; her `promise` is how far her gift has been
  // nurtured, and it only grows when you STEP IN and spend on her. He hardens by
  // your absence; she rises by your presence.
  relSisterActive: boolean;
  relSisterLove: number;     // bond quality: warm (+) ↔ bitter (−)
  relSisterAge: number;      // her age, ticked each year by the rel_sis deck
  relSisterDistance: number; // how PRESENT you've been (climbs alone, falls when you show up)
  // Her gift, and how far it has been paid for: dancing lessons, ribbon slippers,
  // a front-row seat at the recital. Never rises on its own — the audition reads
  // it, and it decides whether she rises to the stage or settles for the chorus.
  relSisterPromise: number;
  relSisterSchooled: boolean;   // her crossroads branch: true = school, false = the needle
  relSisterStoryDone: boolean;  // arc concluded (finale or estrangement) — freezes the tick
  relSisterCooldown: number;    // as relBrotherCooldown, for her beats
  // Where her life landed. Read by the epilogue; set by the audition (school road)
  // or the dressmaker (work road).
  relSisterCalling: "none" | "ballerina" | "chorus" | "seamstress";
  // Work life. All `job*` so the debug panel groups them under a Jobs category.
  // Times you've switched jobs over the run (an epitaph/flavour counter).
  jobTimesChanged: number;
  // Years served in the current job. Ticked by each work-event card; a
  // promotion card gates on it and resets it to 0 on the step up.
  jobExperience: number;
  // Years out of work in the CURRENT stretch of it — ticked by the unemployed
  // status, as gaol ticks its own years. Cards that care about a long spell of
  // idleness (rather than about being idle this minute) read this and zero it,
  // so each stretch is worth one such card. It exists because `job_unemployed`
  // is a `priority` deck: while you are in that state the draw is focused onto
  // the escape routes, so a card about being out of work can never be dealt
  // WHILE you are out of work. It has to be dealt afterwards, about the years.
  jobYearsIdle: number;
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
  jobCriminality: number;
  // Total years spent behind bars, across EVERY sentence — ticked by the
  // housing=prison state, so it counts escape/cellmate years too, not just the
  // ones the "do your time" card resolved. Read by the end-of-run epilogue.
  flawYearsInGaol: number;
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
  // A lifelong weakness for sugar, latched in babyhood by grandma's second
  // helpings. It doesn't drain anything by itself — it AMPLIFIES the cards where
  // sugar is on offer, in both directions: indulging is sweeter and dearer (in
  // money and teeth), and going without costs more happiness while hardening you.
  // Read by home_family_sweets, _market, _fair, ya_thrift and old_grandchildren,
  // so it bites from childhood to the last chapter.
  flawSweetTooth: boolean;
  // Pets. `pet*` so the debug panel groups them under a Pets category. There are
  // two pets (one at a time): a cat (a HAPPINESS companion) and a dog (a SPIRIT
  // companion), each with its own age/love pair. `pet<X>Age` ticks up each year
  // --- Making people, and what you make of them --------------------------
  // The social CURRENCY. Earned a couple of points at a time from options on
  // cards most lives already draw, and SPENT when you take someone up on their
  // acquaintance (the intro cards in fam_single). Nothing caps how many people
  // you can have: the cap is how much of this a life can bank, so a warm and
  // sociable one affords two or three and a cold one affords nobody.
  socialWarmth: number;
  // Lilly (rel_lilly). Two axes, and the second is the point. WARMTH is how much
  // SHE cares for you, built by showing up and by choosing her over something.
  // ARDOUR is how hard YOU push it past friendship. The pair gives four outcomes
  // rather than a switch: warm and unpushed is a friend for life, warm and pushed
  // is the marriage, cold and unpushed is a drift — and cold and PUSHED is the
  // one worth having, where you reached for more than was there and spoiled what
  // you had. DISTANCE is the presence clock the sibling decks use: it climbs by
  // itself and only falls when you turn up.
  relLillyActive: boolean;
  relLillyWarmth: number;
  relLillyArdour: number;
  relLillyDistance: number;
  // Where you met her, branched off your status the year the intro fires. Read
  // by her own cards for flavour and by the epilogue. NOT a door: the intro is
  // reachable wherever you are, and this only records which wherever it was.
  relLillyMet: "none" | "school" | "university" | "work" | "street";
  relLillyStoryDone: boolean;
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
  eduStudy: 0,
  persBookish: false,
  persSporty: false,
  persSociable: false,
  relBrotherActive: false,
  relBrotherLove: 0,
  relBrotherGrit: 0,
  relBrotherAge: 0,
  relBrotherDistance: 0,
  relBrotherSchooled: false,
  relBrotherReckoned: false,
  relBrotherStoryDone: false,
  relBrotherCooldown: 0,
  relSisterActive: false,
  relSisterLove: 0,
  relSisterAge: 0,
  relSisterDistance: 0,
  relSisterPromise: 0,
  relSisterSchooled: false,
  relSisterStoryDone: false,
  relSisterCooldown: 0,
  relSisterCalling: "none",
  jobTimesChanged: 0,
  jobExperience: 0,
  jobYearsIdle: 0,
  jobSkill: 0,
  jobReachedFactory: false,
  jobRenouncedCrime: false,
  jobCriminality: 0,
  flawYearsInGaol: 0,
  jobStrikes: 0,
  flawOwesCharity: false,
  flawSoldUp: false,
  flawWanted: false,
  flawSweetTooth: false,
  socialWarmth: 0,
  relLillyActive: false,
  relLillyWarmth: 0,
  relLillyArdour: 0,
  relLillyDistance: 0,
  relLillyMet: "none",
  relLillyStoryDone: false,
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

// One conditional tick: add `traits` each turn, but only in turns where `while`
// holds (evaluated before the tick). With no `while` it is an ordinary tick.
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
  // Like setTraits, but for BOOKKEEPING: sets trait values and draws NO card-face
  // mark. setTraits earns the ★ because a set trait is usually a life event
  // ("booleans tend to be big life events, counters aren't"); a clock being
  // wound, a cooldown started or a story flag closed is not one, and before this
  // existed the only way to write one without a stray ★ was to fake it with an
  // incTraits of the right size. Mechanically identical to setTraits.
  setTraitsQuiet?: Partial<Traits>;
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
  // The opposite of rescue: when this vital is HIGH ENOUGH and the card is
  // otherwise eligible, force it to jump the queue — so a piled-up resource (e.g.
  // money with nowhere to go) always surfaces the chance to spend it. The card
  // still appears normally in the pool below the threshold.
  //
  // `at` defaults to the vital's MAX, and is worth lowering when the cap is hard
  // to actually touch: a life can sit in the nineties for years, because drift
  // nibbles at the top of the bar every turn, so a card forced only at 100 sat
  // out three years in four of the very state it exists to answer. One field
  // rather than two, so a threshold with no vital to measure cannot be written.
  force?: { vital: VitalKey; at?: number };
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
  noDrift?: boolean; // while active, status drift is suspended (unloseable grace, e.g. babyhood)
  // Per-turn TRAIT increments while this deck is active — the deck-level counterpart
  // of StatusStateDef.tick (see applyTick). Use to age something tied to a deck's
  // lifetime rather than a status: the rel_bro deck ticks `relBrotherAge` from the
  // year Tom is born (the deck is added then and never removed) so his beats can
  // fire at his age. Runs every turn the deck is active, babyhood grace included.
  tick?: Partial<Record<NumericTraitKey, number>>;
  // Gate on `tick`: while this condition FAILS the deck's tick is suspended (the
  // deck itself stays active). For a counter that only means something while a
  // story is live — the sibling deck's `relBrotherDistance` measures how present
  // you have been, so it must stop climbing once his arc has concluded and there
  // is nothing left to show up for, or a long life drifts away from him no matter
  // how devoted you were.
  tickWhile?: Condition;
  // Tick rules that each carry their OWN condition, for counters that must stop
  // somewhere `tick` + `tickWhile` cannot express — `tickWhile` gates the WHOLE
  // deck's `tick`, so it cannot hold one counter at zero while another keeps
  // running. The canonical use is a cooldown: count down by 1 while the counter
  // is at least 1, so it stops at 0 instead of going negative and swallowing the
  // next time it is wound. Independent of `tick`/`tickWhile`; the deck must be
  // active. See TickRule.
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
  // Per-turn TRAIT increments while in this state — drift's counterpart for
  // counters (parallels `drift` for vitals, applied the same turns). Used to age
  // a pet toward the end of its life (pet=cat ticks `petCatAge`), so a lifespan
  // milestone can fire ~N years on. Runs even during the babyhood `noDrift`
  // grace period (a pet isn't around then anyway).
  tick?: Partial<Record<NumericTraitKey, number>>;
  // As Deck.ticks: tick rules with their own conditions, while this state holds.
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
  // Traits stamped when you ENTER this state. The declarative counterpart of
  // `keepExperience`: a fresh apprenticeship starts with no craftsmanship
  // (`jobSkill: 0`), whatever route brought you to the bench.
  enterTraits?: Partial<Traits>;
  // (job states) A "between jobs" state — entering it preserves the `experience`
  // counter and the job it was earned in, so a sacking→re-hire into the SAME job
  // doesn't wipe your progress. See changeStatus.
  keepExperience?: boolean;
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
  // Content CONSTANTS, substituted into any player-facing card string that uses
  // {braces} — the siblings' names live here rather than being written into every
  // card, so renaming one is a single edit. Constant for the whole run (never
  // per-save), so they are NOT traits; content, not engine, so they are NOT
  // hardcoded in the UI. Deliberately content-level rather than per-deck: the
  // end-of-run epilogue names the siblings too (ui.proseBrother*) and belongs to
  // no deck, so deck-scoping would leave those unresolvable.
  vars?: Record<string, string>;
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
  experienceJob?: string;             // the job the current `jobExperience` was earned in (see changeStatus)
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
  endReason?: string;                 // ENDINGS id (vital key, or a named ending)
  log: LifeEvent[];                   // dated memorable events, for the end recap
}
