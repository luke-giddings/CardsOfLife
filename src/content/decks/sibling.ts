// Decks — domain group: relationships (siblings). Split out of content/index.ts;
// assembled there. Player-facing text is by STRING ID (tables in src/i18n); typed
// `satisfies Deck[]` so a misspelled id is still a compile error.
//
// rel_bro — BROTHER (Tom): a story-driven arc. A `relBrotherArc` cursor advances
//   one beat at a time and each choice shapes two hidden axes — `relBrotherLove`
//   (your bond) and `relBrotherGrit` (his backbone) — so later beats read WHO he
//   became, not just help-good / refuse-bad. Built so far: Stage 0 (childhood
//   fillers) + Beat 1 (the school-or-work crossroads). Beats 2–6 to come.
// sibling — SISTER placeholder (activated by baby_sister): the old shared fillers,
//   now sister-only. To be rebuilt as her own `rel_sis` story arc later.
import type { Deck } from "../../engine/types.ts";

export const siblingDecks = [

    // === BROTHER — Tom ======================================================
    {
      id: "rel_bro",
      title: "deck.rel_bro.title",
      unlock: "deck.rel_bro.blurb",
      cards: [
        // --- STAGE 0: little Tom. Warm childhood fillers, only while he's small
        //     (relBrotherArc 0) and you're young (ageMax 8). Each shapes his Love
        //     (your bond) AND his Grit (his backbone) — the nuance starts here. ---
        {
          id: "rel_bro_play",
          kind: "one_time",
          conditions: { traits: { relBrotherArc: 0 }, ageMax: 8 },
          prompt: "rel_bro_play.prompt",
          options: {
            left: { label: "rel_bro_play.left", outcomes: [{ result: "rel_bro_play.left.r0", effects: { vitals: { happiness: "+" }, incTraits: { relBrotherLove: 10 } } }] },
            right: { label: "rel_bro_play.right", outcomes: [{ result: "rel_bro_play.right.r0", effects: { vitals: { spirit: "+" }, incTraits: { relBrotherLove: 4, relBrotherGrit: 6 } } }] },
          },
        },
        {
          id: "rel_bro_bully",
          kind: "one_time",
          conditions: { traits: { relBrotherArc: 0 }, ageMax: 8 },
          prompt: "rel_bro_bully.prompt",
          options: {
            left: {
              // Wade in for him. If you can handle yourself (martial arts) it's a
              // clean rescue that thrills him; otherwise you take a beating for him
              // — he's safe, but learns you'll always come running (grit down).
              label: "rel_bro_bully.left",
              outcomes: [
                { if: { traits: { knowsMartialArts: true } }, result: "rel_bro_bully.left.r0", effects: { vitals: { spirit: "+" }, incTraits: { relBrotherLove: 8, relBrotherGrit: 6 } } },
                { result: "rel_bro_bully.left.r1", effects: { vitals: { health: "-" }, incTraits: { relBrotherLove: 10, relBrotherGrit: -4 } } },
              ],
            },
            right: { label: "rel_bro_bully.right", outcomes: [{ result: "rel_bro_bully.right.r0", effects: { vitals: { spirit: "+" }, incTraits: { relBrotherGrit: 10, relBrotherLove: 2 } } }] },
          },
        },
        {
          id: "rel_bro_share",
          kind: "one_time",
          conditions: { traits: { relBrotherArc: 0 }, ageMax: 8 },
          prompt: "rel_bro_share.prompt",
          options: {
            left: { label: "rel_bro_share.left", outcomes: [{ result: "rel_bro_share.left.r0", effects: { vitals: { health: "-" }, incTraits: { relBrotherLove: 10, relBrotherGrit: -3 } } }] },
            right: { label: "rel_bro_share.right", outcomes: [{ result: "rel_bro_share.right.r0", effects: { vitals: { spirit: "+" }, incTraits: { relBrotherLove: 4, relBrotherGrit: 6 } } }] },
          },
        },

        // --- BEAT 1: Tom's crossroads (school or work). FIXED timing — a milestone
        //     that fires when he reaches the age (your age >= 8) if not already
        //     drawn. Matching your OWN path (are you a scholar now, job==studying?)
        //     deepens the bond; the opposite breeds resentment. Sets his branch:
        //     arc 1 = school, arc 2 = work (work also hardens his grit). --------
        {
          id: "rel_bro_crossroads",
          kind: "milestone",
          priority: 40,
          conditions: { traits: { relBrotherArc: 0 }, ageMin: 8 },
          prompt: "rel_bro_crossroads.prompt",
          options: {
            left: {
              label: "rel_bro_crossroads.left", // send Tom to school
              outcomes: [
                { if: { status: { job: "studying" } }, result: "rel_bro_crossroads.left.r0", effects: { vitals: { spirit: "+" }, setTraits: { relBrotherArc: 1 }, incTraits: { relBrotherLove: 12 } } },
                { result: "rel_bro_crossroads.left.r1", effects: { vitals: { spirit: "+" }, setTraits: { relBrotherArc: 1 }, incTraits: { relBrotherLove: -10 } } },
              ],
            },
            right: {
              label: "rel_bro_crossroads.right", // put Tom to work
              outcomes: [
                { if: { status: { job: "studying" } }, result: "rel_bro_crossroads.right.r0", effects: { vitals: { finances: "+" }, setTraits: { relBrotherArc: 2 }, incTraits: { relBrotherLove: -10, relBrotherGrit: 8 } } },
                { result: "rel_bro_crossroads.right.r1", effects: { vitals: { finances: "+" }, setTraits: { relBrotherArc: 2 }, incTraits: { relBrotherLove: 12, relBrotherGrit: 8 } } },
              ],
            },
          },
        },
      ],
    },

    // === SISTER — placeholder (to become rel_sis with her own story) =========
    // The old shared sibling fillers, now SISTER-ONLY: the brother has his own
    // rel_bro deck, so these only ever run for a sister (baby_sister adds this
    // deck). Kept as light filler until her story arc is built.
    {
      id: "sibling",
      title: "deck.sibling.title",
      unlock: "deck.sibling.blurb",
      cards: [
        {
          id: "sibling_play",
          kind: "one_time",
          prompt: "sibling_play.prompt",
          options: {
            left: { label: "sibling_play.left", outcomes: [{ result: "sibling_play.left.r1", effects: { vitals: { happiness: "+" }, incTraits: { relSisterLove: 8 } } }] },
            right: { label: "sibling_play.right", outcomes: [{ result: "sibling_play.right.r1", effects: { vitals: { spirit: "+" }, incTraits: { relSisterLove: -8 } } }] },
          },
        },
        {
          id: "sibling_blame",
          kind: "one_time",
          prompt: "sibling_blame.prompt",
          options: {
            left: { label: "sibling_blame.left", outcomes: [{ result: "sibling_blame.left.r1", effects: { vitals: { spirit: "+" }, incTraits: { relSisterLove: 8 } } }] },
            right: { label: "sibling_blame.right", outcomes: [{ result: "sibling_blame.right.r1", effects: { vitals: { happiness: "+" }, incTraits: { relSisterLove: -8 } } }] },
          },
        },
        {
          id: "sibling_treat",
          kind: "one_time",
          prompt: "sibling_treat.prompt",
          options: {
            left: { label: "sibling_treat.left", outcomes: [{ result: "sibling_treat.left.r1", effects: { vitals: { spirit: "+" }, incTraits: { relSisterLove: 8 } } }] },
            right: { label: "sibling_treat.right", outcomes: [{ result: "sibling_treat.right.r1", effects: { vitals: { happiness: "+" }, incTraits: { relSisterLove: -8 } } }] },
          },
        },
      ],
    },
] satisfies Deck[];
