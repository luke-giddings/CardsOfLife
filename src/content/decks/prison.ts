// Deck — prison. Owned by the housing=prison state (set by the arrest cards). A
// `priority` deck: while you're inside, doing your time owns the draw. Your
// SENTENCE is the `criminality` counter you built up from the crimes you pulled —
// the heavily weighted "do your time" card counts it down a year at a time and
// releases you (onto the streets, jobless) when it reaches 0. Two one-offs colour
// the stretch: a break-out (leave a wanted fugitive) and meeting a cellmate
// (BACKLOG: opens a dedicated relationship deck, still to be designed).
import type { Deck } from "../../engine/types.ts";

export const prisonDecks = [
  {
    id: "prison",
    title: "deck.prison.title",
    unlock: "deck.prison.blurb",
    priority: true,
    cards: [
      {
        // Doing your time. Weighted ×5 so it dominates the tiny priority pool and
        // the sentence actually counts down instead of stalling behind the one-offs.
        // Both swipes serve a year and knock a point off `criminality`; the LAST
        // year (criminality ≤ 1) releases you — onto the streets (homeless) and
        // jobless, with the counter cleared. Neither option dominates: endure
        // quietly (spirit −) or throw yourself into the work (happiness + but the
        // labour wears you down, health −).
        id: "prison_time",
        kind: "filler",
        weight: 5,
        prompt: "prison_time.prompt",
        options: {
          left: {
            label: "prison_time.left",
            outcomes: [
              { if: { traits: { criminality: { max: 1 } } }, result: "prison_time.release", effects: { setTraits: { criminality: 0 }, setStatus: { housing: "homeless", job: "unemployed" }, remember: "log.released" } },
              { result: "prison_time.left.r0", effects: { incTraits: { criminality: -1 }, vitals: { spirit: "-" } } },
            ],
          },
          right: {
            label: "prison_time.right",
            outcomes: [
              { if: { traits: { criminality: { max: 1 } } }, result: "prison_time.release", effects: { setTraits: { criminality: 0 }, setStatus: { housing: "homeless", job: "unemployed" }, remember: "log.released" } },
              { result: "prison_time.right.r0", effects: { incTraits: { criminality: -1 }, vitals: { happiness: "+", health: "-" } } },
            ],
          },
          // A third swipe that only appears once you're SKINT (finances <= 20):
          // prison labour for pennies. It pays "+" (+10) against gaol's -5 finances
          // drift, so taking it nets +5 and lifts you back over the gate — which
          // then hides the option again. That gives a soft FLOOR: inside you can't
          // earn any other way, so instead of bleeding to 0 (death) your money
          // oscillates in a low, non-lethal band. Still a year served, so it counts
          // down criminality like the others — and pays out on the release turn too,
          // so you don't walk out penniless for having worked your last year.
          down: {
            label: "prison_time.down",
            if: { vitals: { finances: { max: 20 } } },
            outcomes: [
              { if: { traits: { criminality: { max: 1 } } }, result: "prison_time.release", effects: { vitals: { finances: "+" }, setTraits: { criminality: 0 }, setStatus: { housing: "homeless", job: "unemployed" }, remember: "log.released" } },
              { result: "prison_time.down.r0", effects: { incTraits: { criminality: -1 }, vitals: { finances: "+" } } },
            ],
          },
        },
      },
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
          left: { label: "prison_escape.left", outcomes: [{ result: "prison_escape.left.r0", effects: { setFlaws: { flawWanted: true }, setTraits: { criminality: 0 }, setStatus: { housing: "homeless", job: "unemployed" }, vitals: { spirit: "+", health: "-" }, remember: "log.escaped" } }] },
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
