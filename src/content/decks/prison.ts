// Deck — prison. Owned by the housing=prison state (set by the arrest cards). A
// `priority` deck: while you're inside, doing your time owns the draw. Your
// SENTENCE is the `jobCriminality` counter you built up from the crimes you pulled —
// the heavily weighted "do your time" card counts it down a year at a time and
// releases you (onto the streets, jobless) when it reaches 0. Two one-offs colour
// the stretch: a break-out (leave a wanted fugitive) and meeting a cellmate
// (BACKLOG: opens a dedicated relationship deck, still to be designed).
import type { CardOptions, Deck } from "../../engine/types.ts";

// The three swipes of a year served, shared by BOTH copies of the card below.
//   left  endure quietly — costs spirit
//   right throw yourself into the work — happiness up, health down
//   down  prison labour, only when skint (finances <= 20): pays "+" (+10) against
//         gaol's -5 finances drift. Netting +5 lifts you back over the gate, which
//         hides the option again — a soft FLOOR, not an income, so inside (where
//         you can't earn any other way) money oscillates in a low, non-lethal band
//         instead of bleeding to 0.
// Every swipe serves the year (jobCriminality -1). On the LAST year (jobCriminality <= 1)
// each instead releases you to the streets with the counter cleared; the labour
// swipe still pays out then, so you don't walk free penniless for having worked it.
// The release turn counts as a year inside too: applyEffect moves you out BEFORE
// applyTick runs, so the prison state's `tick` misses the very year you walk free
// in. Without this a 1-year sentence would record 0 years served and the epilogue
// would never mention gaol at all.
const RELEASE = {
  setTraits: { jobCriminality: 0 },
  incTraits: { flawYearsInGaol: 1 },
  setStatus: { housing: "homeless", job: "unemployed" },
  remember: "log.released",
} as const;

const doTimeOptions: CardOptions = {
  left: {
    label: "prison_time.left",
    outcomes: [
      { if: { traits: { jobCriminality: { max: 1 } } }, result: "prison_time.release", effects: { ...RELEASE } },
      { result: "prison_time.left.r0", effects: { incTraits: { jobCriminality: -1 }, vitals: { spirit: "-" } } },
    ],
  },
  right: {
    label: "prison_time.right",
    outcomes: [
      { if: { traits: { jobCriminality: { max: 1 } } }, result: "prison_time.release", effects: { ...RELEASE } },
      { result: "prison_time.right.r0", effects: { incTraits: { jobCriminality: -1 }, vitals: { happiness: "+", health: "-" } } },
    ],
  },
  down: {
    label: "prison_time.down",
    if: { vitals: { finances: { max: 20 } } },
    outcomes: [
      { if: { traits: { jobCriminality: { max: 1 } } }, result: "prison_time.release", effects: { ...RELEASE, vitals: { finances: "+" } } },
      { result: "prison_time.down.r0", effects: { incTraits: { jobCriminality: -1 }, vitals: { finances: "+" } } },
    ],
  },
};

export const prisonDecks = [
  {
    id: "prison",
    title: "deck.prison.title",
    unlock: "deck.prison.blurb",
    priority: true,
    cards: [
      // Doing your time — TWO IDENTICAL COPIES, both weight 5, sharing one options
      // body and one set of strings. The duplicate is load-bearing, not sloppiness:
      // the draw's "never the same card twice in a row" rule filters by card id, so
      // with a single copy the year after every year served was GUARANTEED to be one
      // of the two one-offs (they were the only cards left in the pool) — the ×5
      // weight was bypassed entirely on alternate turns and the break-out fired
      // almost immediately. With a second copy, time-serving can follow
      // time-serving: after one is drawn the other still holds 5/7 of the pool.
      { id: "prison_time", kind: "filler", weight: 5, prompt: "prison_time.prompt", options: doTimeOptions },
      { id: "prison_time_again", kind: "filler", weight: 5, prompt: "prison_time.prompt", options: doTimeOptions },
      {
        // The break-out: a one-shot chance over the wall. Freedom now and the
        // remaining sentence wiped, but you leave a WANTED man (flawWanted —
        // BACKLOG: use it for harder honest work / a re-arrest risk / the epitaph).
        // Declining is FREE: you're already in gaol and already paying for it
        // (prison drift + the year this card costs you) — turning down a risk you
        // never had to take shouldn't be punished on top.
        id: "prison_escape",
        kind: "one_time",
        prompt: "prison_escape.prompt",
        options: {
          left: { label: "prison_escape.left", outcomes: [{ result: "prison_escape.left.r0", effects: { setFlaws: { flawWanted: true }, setTraits: { jobCriminality: 0 }, incTraits: { flawYearsInGaol: 1 }, setStatus: { housing: "homeless", job: "unemployed" }, vitals: { spirit: "+", health: "-" }, remember: "log.escaped" } }] },
          right: { label: "prison_escape.right", outcomes: [{ result: "prison_escape.right.r0" }] },
        },
      },
      {
        // Meet your cellmate — a one-shot fork. BACKLOG: befriending should open a
        // dedicated cellmate RELATIONSHIP deck (still to be designed — see the
        // addDecks note below). For now it's a real choice with immediate stakes:
        // strike up a friendship (comfort inside) or keep to yourself (lonelier).
        id: "prison_cellmate",
        kind: "one_time",
        prompt: "prison_cellmate.prompt",
        options: {
          // BACKLOG: add `addDecks: ["rel_cellmate"]` (and seed a love trait) once
          // the cellmate relationship deck exists.
          left: { label: "prison_cellmate.left", outcomes: [{ result: "prison_cellmate.left.r0", effects: { vitals: { happiness: "+", spirit: "+" }, remember: "log.cellmate" } }] },
          right: { label: "prison_cellmate.right", outcomes: [{ result: "prison_cellmate.right.r0", effects: { vitals: { spirit: "-" } } }] },
        },
      },
    ],
  },
] satisfies Deck[];
