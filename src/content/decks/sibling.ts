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

        // Beats 2–6: one story card armed at a time (gated on relBrotherArc) with a
        // relaxed ageMin, so each surfaces organically once Tom reaches that life
        // stage. They read the two axes — Love (your bond) and Grit (his backbone,
        // shaped by your earlier choices) — so outcomes turn on WHO he became, not
        // a flat help-good/refuse-bad. Arc is the cursor: 1/2 (post-crossroads) →
        // 3 → 4 → 5 → 6 → 7 (done, deck goes dormant).

        // --- BEAT 2: a rift or a bond in adolescence (~12+). Cover for him (you
        //     pay a little; he leans — Grit down, Love up) or make him own it (Grit
        //     up, Love dips). Under the FAMILY roof it's direct and bigger; once
        //     you've moved out it's a cooler, second-hand affair.
        {
          id: "rel_bro_rift",
          kind: "one_time",
          conditions: { traits: { relBrotherArc: { min: 1, max: 2 } }, ageMin: 12 },
          prompt: "rel_bro_rift.prompt",
          options: {
            left: {
              label: "rel_bro_rift.left",
              outcomes: [
                { if: { status: { housing: "family" } }, result: "rel_bro_rift.left.r0", effects: { vitals: { happiness: "-" }, setTraits: { relBrotherArc: 3 }, incTraits: { relBrotherLove: 12, relBrotherGrit: -4 } } },
                { result: "rel_bro_rift.left.r1", effects: { vitals: { finances: "-" }, setTraits: { relBrotherArc: 3 }, incTraits: { relBrotherLove: 8, relBrotherGrit: -2 } } },
              ],
            },
            right: { label: "rel_bro_rift.right", outcomes: [{ result: "rel_bro_rift.right.r0", effects: { vitals: { spirit: "+" }, setTraits: { relBrotherArc: 3 }, incTraits: { relBrotherGrit: 10, relBrotherLove: -8 } } }] },
          },
        },

        // --- BEAT 3: Tom makes his way (~17+). Back him (a cost to you, Love up) —
        //     which lands as a leg-up for a gritty brother or a crutch for a soft
        //     one — or let him find his feet (Grit up), where the gritty thrive and
        //     the soft flounder and resent it.
        {
          id: "rel_bro_way",
          kind: "one_time",
          conditions: { traits: { relBrotherArc: 3 }, ageMin: 17 },
          prompt: "rel_bro_way.prompt",
          options: {
            left: {
              label: "rel_bro_way.left",
              outcomes: [
                { if: { traits: { relBrotherGrit: { min: 8 } } }, result: "rel_bro_way.left.r0", effects: { vitals: { finances: "-" }, setTraits: { relBrotherArc: 4 }, incTraits: { relBrotherLove: 10, relBrotherGrit: 4 } } },
                { result: "rel_bro_way.left.r1", effects: { vitals: { finances: "-" }, setTraits: { relBrotherArc: 4 }, incTraits: { relBrotherLove: 10, relBrotherGrit: -4 } } },
              ],
            },
            right: {
              label: "rel_bro_way.right",
              outcomes: [
                { if: { traits: { relBrotherGrit: { min: 8 } } }, result: "rel_bro_way.right.r0", effects: { vitals: { spirit: "+" }, setTraits: { relBrotherArc: 4 }, incTraits: { relBrotherGrit: 8, relBrotherLove: 4 } } },
                { result: "rel_bro_way.right.r1", effects: { vitals: { spirit: "-" }, setTraits: { relBrotherArc: 4 }, incTraits: { relBrotherGrit: 4, relBrotherLove: -8 } } },
              ],
            },
          },
        },

        // --- BEAT 4a: THE RECKONING (~25+), when YOU'RE housed. Tom's in real
        //     trouble. Take him in (a heavy cost) → a leg-up that raises a gritty
        //     brother, or catches a soft one who then leans for good. Turn him away
        //     → a gritty brother is stung but claws back (and later thaws); a soft
        //     one sinks. (The destitute-you variant is rel_bro_repay below.)
        {
          id: "rel_bro_crisis",
          kind: "one_time",
          conditions: { traits: { relBrotherArc: 4 }, ageMin: 25, any: [{ status: { housing: "family" } }, { status: { housing: "apprentice" } }, { status: { housing: "renting" } }, { status: { housing: "owned_small" } }, { status: { housing: "owned_large" } }, { status: { housing: "owned_estate" } }] },
          prompt: "rel_bro_crisis.prompt",
          options: {
            left: {
              label: "rel_bro_crisis.left",
              outcomes: [
                { if: { traits: { relBrotherGrit: { min: 8 } } }, result: "rel_bro_crisis.left.r0", effects: { vitals: { finances: "--", happiness: "-" }, setTraits: { relBrotherArc: 5 }, incTraits: { relBrotherLove: 15, relBrotherGrit: 4 } } },
                { result: "rel_bro_crisis.left.r1", effects: { vitals: { finances: "--", happiness: "-" }, setTraits: { relBrotherArc: 5 }, incTraits: { relBrotherLove: 12, relBrotherGrit: -6 } } },
              ],
            },
            right: {
              label: "rel_bro_crisis.right",
              outcomes: [
                { if: { traits: { relBrotherGrit: { min: 8 } } }, result: "rel_bro_crisis.right.r0", effects: { vitals: { spirit: "-" }, setTraits: { relBrotherArc: 5 }, incTraits: { relBrotherLove: -6, relBrotherGrit: 6 } } },
                { result: "rel_bro_crisis.right.r1", effects: { vitals: { spirit: "--" }, setTraits: { relBrotherArc: 5 }, incTraits: { relBrotherLove: -15, relBrotherGrit: -6 } } },
              ],
            },
          },
        },

        // --- BEAT 4b: THE RECKONING, reversed — when YOU'RE destitute (workhouse
        //     / the streets), a well-loved Tom comes for YOU. Accept his help: if
        //     the bond is strong (Love >= 20) he pulls you off the streets (→
        //     renting, a job to seek) — a rare grace; if it's weak he looks away.
        //     Or be too proud to lean on him (Grit for you, but you stay down).
        {
          id: "rel_bro_repay",
          kind: "one_time",
          conditions: { traits: { relBrotherArc: 4 }, ageMin: 25, any: [{ status: { housing: "workhouse" } }, { status: { housing: "homeless" } }] },
          prompt: "rel_bro_repay.prompt",
          options: {
            left: {
              label: "rel_bro_repay.left",
              outcomes: [
                { if: { traits: { relBrotherLove: { min: 20 } } }, result: "rel_bro_repay.left.r0", effects: { vitals: { finances: "++", happiness: "+" }, setStatus: { housing: "renting", job: "unemployed" }, setTraits: { relBrotherArc: 5 }, incTraits: { relBrotherLove: 6 } } },
                { result: "rel_bro_repay.left.r1", effects: { vitals: { happiness: "-" }, setTraits: { relBrotherArc: 5 }, incTraits: { relBrotherLove: -4 } } },
              ],
            },
            right: { label: "rel_bro_repay.right", outcomes: [{ result: "rel_bro_repay.right.r0", effects: { vitals: { spirit: "+" }, setTraits: { relBrotherArc: 5 }, incTraits: { relBrotherGrit: 4 } } }] },
          },
        },

        // --- BEAT 5: the settled years (~35+). Draw close (Sunday dinners, his
        //     children underfoot — Love up, happiness) or keep to your own affairs
        //     (mind your purse — Love drifts).
        {
          id: "rel_bro_settled",
          kind: "one_time",
          conditions: { traits: { relBrotherArc: 5 }, ageMin: 35 },
          prompt: "rel_bro_settled.prompt",
          options: {
            left: { label: "rel_bro_settled.left", outcomes: [{ result: "rel_bro_settled.left.r0", effects: { vitals: { happiness: "+" }, setTraits: { relBrotherArc: 6 }, incTraits: { relBrotherLove: 10 } } }] },
            right: { label: "rel_bro_settled.right", outcomes: [{ result: "rel_bro_settled.right.r0", effects: { vitals: { finances: "+" }, setTraits: { relBrotherArc: 6 }, incTraits: { relBrotherLove: -4 } } }] },
          },
        },

        // --- BEAT 6: TOM'S FATE (~55+). The finale — how his life closes is read
        //     off the two axes you built over a lifetime (Love, and his Grit). Your
        //     choice is only whether to be at his side or make your peace from
        //     afar; the outcome is his. Terminal (arc → 7): the deck goes dormant.
        {
          id: "rel_bro_fate",
          kind: "one_time",
          conditions: { traits: { relBrotherArc: 6 }, ageMin: 55 },
          prompt: "rel_bro_fate.prompt",
          options: {
            left: {
              label: "rel_bro_fate.left", // be at his side
              outcomes: [
                { if: { traits: { relBrotherLove: { min: 30 }, relBrotherGrit: { min: 8 } } }, result: "rel_bro_fate.left.r0", effects: { vitals: { happiness: "++", spirit: "+" }, setTraits: { relBrotherArc: 7 } } },
                { if: { traits: { relBrotherLove: { min: 30 } } }, result: "rel_bro_fate.left.r1", effects: { vitals: { happiness: "+", spirit: "+" }, setTraits: { relBrotherArc: 7 } } },
                { if: { traits: { relBrotherLove: { min: 0 } } }, result: "rel_bro_fate.left.r2", effects: { vitals: { happiness: "+" }, setTraits: { relBrotherArc: 7 } } },
                { result: "rel_bro_fate.left.r3", effects: { vitals: { happiness: "-", spirit: "-" }, setTraits: { relBrotherArc: 7 } } },
              ],
            },
            right: {
              label: "rel_bro_fate.right", // make your peace from afar
              outcomes: [
                { if: { traits: { relBrotherLove: { min: 0 }, relBrotherGrit: { min: 8 } } }, result: "rel_bro_fate.right.r0", effects: { vitals: { spirit: "+" }, setTraits: { relBrotherArc: 7 } } },
                { if: { traits: { relBrotherLove: { min: 0 } } }, result: "rel_bro_fate.right.r1", effects: { vitals: { spirit: "+" }, setTraits: { relBrotherArc: 7 } } },
                { result: "rel_bro_fate.right.r2", effects: { vitals: { spirit: "--" }, setTraits: { relBrotherArc: 7 } } },
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
