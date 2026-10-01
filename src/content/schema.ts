// ---------------------------------------------------------------------------
// Cards of Life — the game's SCHEMA: the names of its vitals and statuses, every
// trait with its default, and the endings. The engine knows none of these: it
// declares an empty `Register` (engine/types.ts) and this file fills it in, so
// every engine type (VitalKey, StatusKind, Traits, StringId) becomes this
// game's, and a card that names a misspelled trait or a stat that doesn't
// exist is still a compile error, not a runtime surprise.
// ---------------------------------------------------------------------------

import type { StringId } from "../i18n/index.ts";

// --- Vitals: the four lethal bars (0..100). Any at 0 = game over. ------------
export const VITAL_KEYS = ["finances", "happiness", "health", "spirit"] as const;
export type VitalKey = (typeof VITAL_KEYS)[number];

// --- Statuses: persistent side-states that drift Vitals and gate content. ----
export const STATUS_KINDS = ["age", "job", "housing", "education", "lifestyle", "pet", "family"] as const;
export type StatusKind = (typeof STATUS_KINDS)[number];

// --- Traits: hidden state. Booleans, enums, counters. ------------------------
// Add a field here and it is instantly usable (and type-checked) in content.
export interface Traits {
  // "unborn" until the birth card picks one, so choosing either is a change (and earns its mark).
  gender: "unborn" | "boy" | "girl";
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
  // Years enrolled at the school you are AT — zeroed on entry and ticked by the
  // schooling status, so a leaver can fire after N years of school rather than
  // at an age. Needed once grown men could enrol: an age gate would graduate a
  // thirty-year-old undergraduate the year after he went up.
  eduYearsEnrolled: number;
  // Personality / disposition. `pers*` so the debug panel groups them under a
  // Personality category. PLAIN BOOLEANS: you are the sort of person who does
  // this, or you are not. (A level would need a stream of sources to climb and a
  // way for the player to see where they stood on it, and there is neither; a
  // boolean has one card that makes you it, and that card wears a ★.)
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
  relBrotherAge: number;     // his age, ticked up each year by the rel_bro deck (Deck.ticks)
  // How PRESENT you've been in his life: 0 = close at hand, rising = drifting apart.
  // The rel_bro deck ticks it UP every year (you drift just by living your own life);
  // every Tom card you engage pulls it back DOWN (you showed up). Distinct from love:
  // you can be close-hearted yet absent (drifted), or ever-present yet rivalrous.
  relBrotherDistance: number;
  relBrotherSchooled: boolean;  // his crossroads branch: true = you sent him to school, false = to work
  relBrotherReckoned: boolean;  // the adult "reckoning" beat has happened (its two housing variants can't both fire)
  relBrotherStoryDone: boolean; // his arc has concluded (finale or estrangement) — the deck goes dormant
  // Years before his next beat may be dealt. Each beat past childhood sets it
  // (setTraitsHidden) and rel_bro's `ticks` counts it down, stopping at 0. Milestones
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
  relSisterStoryDone: boolean;  // arc concluded (finale or estrangement) — stops her deck's clocks
  relSisterCooldown: number;    // as relBrotherCooldown, for her beats
  // Where her life landed. Read by the epilogue; set by the audition (school road)
  // or the dressmaker (work road).
  relSisterCalling: "none" | "ballerina" | "chorus" | "seamstress";
  // Work life. All `job*` so the debug panel groups them under a Jobs category.
  // Times you've switched jobs over the run (an epitaph/flavour counter).
  jobTimesChanged: number;
  // Years served in the current job: the job kind's `tenure` counter. Ticked by
  // each work-event card; a promotion card gates on it and resets it to 0 on the
  // step up.
  jobExperience: number;
  // Years out of work in the CURRENT stretch of it — ticked by the unemployed
  // status, as gaol ticks its own years, and zeroed by that status's
  // `enterTraits` each time a new stretch begins. Cards about a long spell
  // should also gate on `job: "unemployed"`, so they are dealt DURING it —
  // reachable despite the `priority` focus via card-level `neverSuppressed`.
  jobYearsIdle: number;
  // Apprenticeship craftsmanship. Unlike `jobExperience` (time served — every
  // apprentice work card ticks it whichever way you choose), `jobSkill` only rises
  // when you APPLY YOURSELF (the "work hard" option). The qualifying trial passes
  // on skill, not health, so coasting through the years leaves you unready. Reset
  // to 0 when you (re-)enter the apprenticeship. See the job_apprentice deck.
  jobSkill: number;
  // The highest rung reached on each honest ladder: 1 = its entry rung, 2 the
  // next, 3 its top. Stamped by each job state's `enterTraits`, so every route
  // into a job records it. The out-of-work offer reads the ladder that matches
  // your EDUCATION and returns you to your rung on it — a sacked gang-master
  // goes back as a gang-master, not a factory hand. One counter per ladder so
  // a rung earned on one cannot leak onto another when your education changes
  // (a gang-master who gains his letters is a shop assistant, not a merchant).
  // The trade ladder needs none: its rung IS your education (journeyman/master).
  // Crime is deliberately not a ladder here.
  jobRungLabour: number;
  jobRungShop: number;
  jobRungClerk: number;
  jobRungMedic: number;
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
  // won't hear your pleading. Reset to 0 on any job change by the job kind's
  // `enterTraits` (a fresh reputation with a new employer).
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
  relLillyCooldown: number; // as relBrotherCooldown, for her beats (drift, lost and idle exempt)
  // Pets. `pet*` so the debug panel groups them under a Pets category. There are
  // two pets (one at a time): a cat (a HAPPINESS companion) and a dog (a SPIRIT
  // companion), each with its own age/love pair. `pet<X>Age` ticks up each year
  // the pet is kept (its status's `ticks`); `pet<X>Love` is moved by its cards.
  petCatAge: number;
  petCatLove: number;
  petDogAge: number;
  petDogLove: number;
}

export const DEFAULT_TRAITS: Traits = {
  gender: "unborn",
  skillMartialArts: false,
  skillVaccinated: false,
  eduUniFund: false,
  eduWasUndergraduate: false,
  eduStudy: 0,
  eduYearsEnrolled: 0,
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
  jobRungLabour: 0,
  jobRungShop: 0,
  jobRungClerk: 0,
  jobRungMedic: 0,
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
  relLillyCooldown: 0,
  petCatAge: 0,
  petCatLove: 0,
  petDogAge: 0,
  petDogLove: 0,
};

// End-screen framing: one ending per vital, for the one that hit 0 (only
// Health's is "death"). title/blurb are string ids, looked up per-locale by the UI.
export interface Ending {
  title: StringId;
  blurb: StringId;
}

export const ENDINGS: Record<VitalKey, Ending> = {
  finances: { title: "ending.finances.title", blurb: "ending.finances.blurb" },
  happiness: { title: "ending.happiness.title", blurb: "ending.happiness.blurb" },
  health: { title: "ending.health.title", blurb: "ending.health.blurb" },
  spirit: { title: "ending.spirit.title", blurb: "ending.spirit.blurb" },
};

// Inside the block below, names resolve in the ENGINE's scope (where VitalKey
// etc. are the registered types themselves), so the game's are passed by alias.
type GameVital = VitalKey;
type GameStatusKind = StatusKind;
type GameTraits = Traits;
type GameStringId = StringId;
declare module "../engine/types.ts" {
  interface Register {
    vital: GameVital;
    statusKind: GameStatusKind;
    traits: GameTraits;
    stringId: GameStringId;
  }
}
