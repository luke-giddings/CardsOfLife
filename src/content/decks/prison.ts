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
        },
      },
      {
        // The break-out: a one-shot chance over the wall. Freedom now and the
        // remaining sentence wiped, but you leave a WANTED man (flawWanted —
        // BACKLOG: use it for harder honest work / a re-arrest risk / the epitaph).
        // Declining costs a bruising and you stay to serve your time.
        id: "prison_escape",
        kind: "one_time",
        prompt: "prison_escape.prompt",
        options: {
          left: { label: "prison_escape.left", outcomes: [{ result: "prison_escape.left.r0", effects: { setFlaws: { flawWanted: true }, setTraits: { criminality: 0 }, setStatus: { housing: "homeless", job: "unemployed" }, vitals: { spirit: "+", health: "-" }, remember: "log.escaped" } }] },
          right: { label: "prison_escape.right", outcomes: [{ result: "prison_escape.right.r0", effects: { vitals: { health: "-", happiness: "-" } } }] },
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
