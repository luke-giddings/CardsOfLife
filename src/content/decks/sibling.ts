// Decks — domain group: relationships (siblings). Split out of content/index.ts;
// assembled there. Player-facing text is by STRING ID (tables in src/i18n); typed
// `satisfies Deck[]` so a misspelled id is still a compile error.
//
// rel_bro — BROTHER (Tom): a story-driven arc with NO fixed cursor. His beats fire
//   in WINDOWS of his own life (relBrotherAge, ticked by the deck), drawn organically
//   — so which beats you catch, and when, varies run to run, and a missed beat bends
//   the story rather than ending it. Three axes carry it: LOVE (bond warmth, from your
//   choices), GRIT (his backbone, from your choices), and DISTANCE (how present you've
//   been — the deck ticks it UP each year and every Tom card you engage pulls it DOWN).
//   Later beats read love AND distance, so "you drifted apart" is a distinct outcome
//   from "you fell out". relBrotherStoryDone ends the arc (finale, or estrangement if
//   love curdles); relBrotherReckoned de-dupes the adult reckoning's two housing forms.
// sibling — SISTER placeholder (activated by baby_sister): the old shared fillers,
//   now sister-only. To be rebuilt as her own `rel_sis` story arc later.
import type { Deck } from "../../engine/types.ts";

export const siblingDecks = [

    // === BROTHER — Tom ======================================================
    {
      id: "rel_bro",
      title: "deck.rel_bro.title",
      unlock: "deck.rel_bro.blurb",
      // Tom ages a year at a time from the year he's born (this deck is added by
      // baby_brother and never removed), and DRIFTS a year at a time too: distance
      // climbs unless you show up. Every card below pulls distance back down.
      tick: { relBrotherAge: 1, relBrotherDistance: 1 },
      cards: [
        // --- STAGE 0: little Tom. Warm childhood fillers while he's small (under 5,
        //     before his own school-or-work crossroads). Each shapes his Love (your
        //     bond) AND his Grit (his backbone), and — like every Tom card — pulls
        //     DISTANCE down (you were there). ---
        {
          id: "rel_bro_play",
          kind: "one_time",
          conditions: { traits: { relBrotherStoryDone: false, relBrotherAge: { max: 4 } } },
          prompt: "rel_bro_play.prompt",
          options: {
            left: { label: "rel_bro_play.left", outcomes: [{ result: "rel_bro_play.left.r0", effects: { vitals: { happiness: "+" }, incTraits: { relBrotherLove: 10, relBrotherDistance: -6 } } }] },
            right: { label: "rel_bro_play.right", outcomes: [{ result: "rel_bro_play.right.r0", effects: { vitals: { spirit: "+" }, incTraits: { relBrotherLove: 4, relBrotherGrit: 6, relBrotherDistance: -6 } } }] },
            // The COLD third option. The two above are both kinds of caring (take him
            // along, or make him stand on his own feet); without a genuinely unkind
            // swipe the childhood beats could only ever push love UP, so a player
            // deliberately shutting Tom out had no way to express it and the
            // estrangement ending was unreachable. Note distance is NOT pulled down
            // here: you did not show up at all, you avoided him.
            down: { label: "rel_bro_play.down", outcomes: [{ result: "rel_bro_play.down.r0", effects: { vitals: { spirit: "+" }, incTraits: { relBrotherLove: -10 } } }] },
          },
        },
        {
          id: "rel_bro_bully",
          kind: "one_time",
          conditions: { traits: { relBrotherStoryDone: false, relBrotherAge: { max: 4 } } },
          prompt: "rel_bro_bully.prompt",
          options: {
            left: {
              // Wade in for him. If you can handle yourself (martial arts) it's a
              // clean rescue that thrills him; otherwise you take a beating for him
              // — he's safe, but learns you'll always come running (grit down).
              label: "rel_bro_bully.left",
              outcomes: [
                { if: { traits: { skillMartialArts: true } }, result: "rel_bro_bully.left.r0", effects: { vitals: { spirit: "+" }, incTraits: { relBrotherLove: 8, relBrotherGrit: 6, relBrotherDistance: -6 } } },
                { result: "rel_bro_bully.left.r1", effects: { vitals: { health: "-" }, incTraits: { relBrotherLove: 10, relBrotherGrit: -4, relBrotherDistance: -6 } } },
              ],
            },
            right: { label: "rel_bro_bully.right", outcomes: [{ result: "rel_bro_bully.right.r0", effects: { vitals: { spirit: "+" }, incTraits: { relBrotherGrit: 10, relBrotherLove: 2, relBrotherDistance: -6 } } }] },
            // Cold: you were THERE and did nothing. The deepest cut of the three, and
            // the only gain is the beating you did not take. Grit still rises — he
            // learns nobody is coming — but bitterly.
            down: { label: "rel_bro_bully.down", outcomes: [{ result: "rel_bro_bully.down.r0", effects: { vitals: { happiness: "-" }, incTraits: { relBrotherLove: -12, relBrotherGrit: 4, relBrotherDistance: -6 } } }] },
          },
        },
        {
          id: "rel_bro_share",
          kind: "one_time",
          conditions: { traits: { relBrotherStoryDone: false, relBrotherAge: { max: 4 } } },
          prompt: "rel_bro_share.prompt",
          options: {
            left: { label: "rel_bro_share.left", outcomes: [{ result: "rel_bro_share.left.r0", effects: { vitals: { health: "-" }, incTraits: { relBrotherLove: 10, relBrotherGrit: -3, relBrotherDistance: -6 } } }] },
            right: { label: "rel_bro_share.right", outcomes: [{ result: "rel_bro_share.right.r0", effects: { vitals: { spirit: "+" }, incTraits: { relBrotherLove: 4, relBrotherGrit: 6, relBrotherDistance: -6 } } }] },
            // Cold, and genuinely tempting: unlike the other two this one PAYS you —
            // a fed, warm night — so it is a real trade of the bond for your own skin
            // rather than a pure cruelty button.
            down: { label: "rel_bro_share.down", outcomes: [{ result: "rel_bro_share.down.r0", effects: { vitals: { health: "+" }, incTraits: { relBrotherLove: -12, relBrotherGrit: 4, relBrotherDistance: -6 } } }] },
          },
        },

        // --- BEAT 1: Tom's crossroads (school or work), a milestone at his age 5 —
        //     the same fork you faced. Matching your OWN path (are you a scholar now,
        //     job==studying?) deepens the bond; the opposite breeds resentment. Sets
        //     relBrotherSchooled (his branch), read by later beats. --------
        {
          id: "rel_bro_crossroads",
          kind: "milestone",
          priority: 40,
          conditions: { traits: { relBrotherStoryDone: false, relBrotherAge: { min: 5 } } },
          prompt: "rel_bro_crossroads.prompt",
          options: {
            left: {
              label: "rel_bro_crossroads.left", // send Tom to school
              outcomes: [
                { if: { status: { job: "studying" } }, result: "rel_bro_crossroads.left.r0", effects: { vitals: { spirit: "+" }, setTraits: { relBrotherSchooled: true }, incTraits: { relBrotherLove: 12, relBrotherDistance: -10 } } },
                { result: "rel_bro_crossroads.left.r1", effects: { vitals: { spirit: "+" }, setTraits: { relBrotherSchooled: true }, incTraits: { relBrotherLove: -5, relBrotherDistance: -10 } } },
              ],
            },
            right: {
              label: "rel_bro_crossroads.right", // put Tom to work
              outcomes: [
                { if: { status: { job: "studying" } }, result: "rel_bro_crossroads.right.r0", effects: { vitals: { finances: "+" }, setTraits: { relBrotherSchooled: false }, incTraits: { relBrotherLove: -5, relBrotherGrit: 8, relBrotherDistance: -10 } } },
                { result: "rel_bro_crossroads.right.r1", effects: { vitals: { finances: "+" }, setTraits: { relBrotherSchooled: false }, incTraits: { relBrotherLove: 12, relBrotherGrit: 8, relBrotherDistance: -10 } } },
              ],
            },
          },
        },

        // Beats 2–6: each lives in a WINDOW of Tom's life (non-overlapping, so they
        // fall in order by his age), drawn organically — you'll catch some and miss
        // others, differently each run. No cursor: a missed beat just means distance
        // kept climbing, so the beats you DO see (and the finale) read colder. Every
        // beat pulls distance down (you showed up). relBrotherStoryDone gates them all
        // off once the arc concludes; relBrotherReckoned de-dupes the reckoning below.

        // --- BEAT 2: a rift in his adolescence (Tom 10–17). DISTANCE-branched: the
        //     same choice lands warmer if you've been present (r0) and colder if
        //     you've drifted (r1, distance >= 2). Step in for him (he leans — Grit
        //     down, Love up) or let him sort it (Grit up, Love dips — and a drifted
        //     "let him sort it" reads as abandonment).
        {
          id: "rel_bro_rift",
          kind: "one_time",
          conditions: { traits: { relBrotherStoryDone: false, relBrotherAge: { min: 10, max: 17 } } },
          prompt: "rel_bro_rift.prompt",
          options: {
            left: {
              label: "rel_bro_rift.left",
              outcomes: [
                { if: { traits: { relBrotherDistance: { min: 2 } } }, result: "rel_bro_rift.left.r1", effects: { vitals: { finances: "-" }, incTraits: { relBrotherLove: 6, relBrotherGrit: -2, relBrotherDistance: -10 } } },
                { result: "rel_bro_rift.left.r0", effects: { vitals: { happiness: "-" }, incTraits: { relBrotherLove: 12, relBrotherGrit: -4, relBrotherDistance: -10 } } },
              ],
            },
            right: {
              label: "rel_bro_rift.right",
              outcomes: [
                { if: { traits: { relBrotherDistance: { min: 2 } } }, result: "rel_bro_rift.right.r1", effects: { vitals: { spirit: "+" }, incTraits: { relBrotherGrit: 6, relBrotherLove: -12, relBrotherDistance: -10 } } },
                { result: "rel_bro_rift.right.r0", effects: { vitals: { spirit: "+" }, incTraits: { relBrotherGrit: 10, relBrotherLove: -6, relBrotherDistance: -10 } } },
              ],
            },
          },
        },

        // --- BEAT 3: Tom makes his way (his coming of age, Tom 18–26). Back him (Love
        //     up) — a leg-up for a gritty brother, a crutch for a soft one — or let
        //     him find his feet (Grit up), where the gritty thrive and the soft resent.
        {
          id: "rel_bro_way",
          kind: "one_time",
          conditions: { traits: { relBrotherStoryDone: false, relBrotherAge: { min: 18, max: 26 } } },
          prompt: "rel_bro_way.prompt",
          options: {
            left: {
              label: "rel_bro_way.left",
              outcomes: [
                { if: { traits: { relBrotherGrit: { min: 8 } } }, result: "rel_bro_way.left.r0", effects: { vitals: { finances: "-" }, incTraits: { relBrotherLove: 10, relBrotherGrit: 4, relBrotherDistance: -10 } } },
                { result: "rel_bro_way.left.r1", effects: { vitals: { finances: "-" }, incTraits: { relBrotherLove: 10, relBrotherGrit: -4, relBrotherDistance: -10 } } },
              ],
            },
            right: {
              label: "rel_bro_way.right",
              outcomes: [
                { if: { traits: { relBrotherGrit: { min: 8 } } }, result: "rel_bro_way.right.r0", effects: { vitals: { spirit: "+" }, incTraits: { relBrotherGrit: 8, relBrotherLove: 4, relBrotherDistance: -10 } } },
                { result: "rel_bro_way.right.r1", effects: { vitals: { spirit: "-" }, incTraits: { relBrotherGrit: 4, relBrotherLove: -8, relBrotherDistance: -10 } } },
              ],
            },
          },
        },

        // --- BEAT 4a: THE RECKONING (his adulthood, Tom 27–42), when YOU'RE housed.
        //     Tom's in real trouble. Take him in (a heavy cost) or turn him away.
        //     Reads his grit. Sets relBrotherReckoned so the destitute form (4b) can't
        //     also fire. (Destitute-you variant is rel_bro_repay below.)
        {
          id: "rel_bro_crisis",
          kind: "one_time",
          conditions: { traits: { relBrotherStoryDone: false, relBrotherReckoned: false, relBrotherAge: { min: 27, max: 42 } }, any: [{ status: { housing: "family" } }, { status: { housing: "apprentice" } }, { status: { housing: "renting" } }, { status: { housing: "owned_small" } }, { status: { housing: "owned_large" } }, { status: { housing: "owned_estate" } }] },
          prompt: "rel_bro_crisis.prompt",
          options: {
            left: {
              label: "rel_bro_crisis.left",
              outcomes: [
                { if: { traits: { relBrotherGrit: { min: 8 } } }, result: "rel_bro_crisis.left.r0", effects: { vitals: { finances: "--", happiness: "-" }, setTraits: { relBrotherReckoned: true }, incTraits: { relBrotherLove: 15, relBrotherGrit: 4, relBrotherDistance: -10 } } },
                { result: "rel_bro_crisis.left.r1", effects: { vitals: { finances: "--", happiness: "-" }, setTraits: { relBrotherReckoned: true }, incTraits: { relBrotherLove: 12, relBrotherGrit: -6, relBrotherDistance: -10 } } },
              ],
            },
            right: {
              label: "rel_bro_crisis.right",
              outcomes: [
                { if: { traits: { relBrotherGrit: { min: 8 } } }, result: "rel_bro_crisis.right.r0", effects: { vitals: { spirit: "-" }, setTraits: { relBrotherReckoned: true }, incTraits: { relBrotherLove: -6, relBrotherGrit: 6, relBrotherDistance: -10 } } },
                { result: "rel_bro_crisis.right.r1", effects: { vitals: { spirit: "--" }, setTraits: { relBrotherReckoned: true }, incTraits: { relBrotherLove: -15, relBrotherGrit: -6, relBrotherDistance: -10 } } },
              ],
            },
          },
        },

        // --- BEAT 4b: THE RECKONING, reversed — when YOU'RE destitute (workhouse /
        //     the streets), a well-loved Tom comes for YOU. Accept his help (strong
        //     bond → off the streets; weak → he looks away) or be too proud. Sets
        //     relBrotherReckoned so the housed form (4a) can't also fire.
        {
          id: "rel_bro_repay",
          kind: "one_time",
          conditions: { traits: { relBrotherStoryDone: false, relBrotherReckoned: false, relBrotherAge: { min: 27, max: 42 } }, any: [{ status: { housing: "workhouse" } }, { status: { housing: "homeless" } }] },
          prompt: "rel_bro_repay.prompt",
          options: {
            left: {
              label: "rel_bro_repay.left",
              outcomes: [
                { if: { traits: { relBrotherLove: { min: 20 } } }, result: "rel_bro_repay.left.r0", effects: { vitals: { finances: "++", happiness: "+" }, setStatus: { housing: "renting", job: "unemployed" }, setTraits: { relBrotherReckoned: true }, incTraits: { relBrotherLove: 6, relBrotherDistance: -10 } } },
                { result: "rel_bro_repay.left.r1", effects: { vitals: { happiness: "-" }, setTraits: { relBrotherReckoned: true }, incTraits: { relBrotherLove: -4, relBrotherDistance: -10 } } },
              ],
            },
            right: { label: "rel_bro_repay.right", outcomes: [{ result: "rel_bro_repay.right.r0", effects: { vitals: { spirit: "+" }, setTraits: { relBrotherReckoned: true }, incTraits: { relBrotherGrit: 4, relBrotherDistance: -10 } } }] },
          },
        },

        // --- BEAT 5: his settled years (Tom 43–58). DISTANCE-branched: drawing close
        //     is easy warmth if you've stayed present (r0) or a tentative reunion
        //     after years apart if you've drifted (r1, distance >= 18); keeping to
        //     your own affairs drifts a little when close (r0) but widens to a gulf
        //     when already distant (r1).
        {
          id: "rel_bro_settled",
          kind: "one_time",
          conditions: { traits: { relBrotherStoryDone: false, relBrotherAge: { min: 43, max: 58 } } },
          prompt: "rel_bro_settled.prompt",
          options: {
            left: {
              label: "rel_bro_settled.left",
              outcomes: [
                { if: { traits: { relBrotherDistance: { min: 18 } } }, result: "rel_bro_settled.left.r1", effects: { vitals: { happiness: "+" }, incTraits: { relBrotherLove: 8, relBrotherDistance: -10 } } },
                { result: "rel_bro_settled.left.r0", effects: { vitals: { happiness: "+" }, incTraits: { relBrotherLove: 10, relBrotherDistance: -10 } } },
              ],
            },
            right: {
              label: "rel_bro_settled.right",
              outcomes: [
                { if: { traits: { relBrotherDistance: { min: 18 } } }, result: "rel_bro_settled.right.r1", effects: { vitals: { finances: "+" }, incTraits: { relBrotherLove: -8, relBrotherDistance: -5 } } },
                { result: "rel_bro_settled.right.r0", effects: { vitals: { finances: "+" }, incTraits: { relBrotherLove: -4, relBrotherDistance: -5 } } },
              ],
            },
          },
        },

        // --- BEAT 6: TOM'S FATE (his old age, 59+). The finale — read off the life
        //     you built, LOVE × DISTANCE. Being at his side: close-and-loved is a
        //     whole life shared to the last (r0); loved-but-drifted is a reunion
        //     edged with regret for the lost years (r1, distance > 24); lukewarm is
        //     dutiful (r2); a bitter bond is cold even now (r3). Terminal: sets
        //     relBrotherStoryDone (the deck goes dormant).
        {
          id: "rel_bro_fate",
          kind: "one_time",
          conditions: { traits: { relBrotherStoryDone: false, relBrotherAge: { min: 59 } } },
          prompt: "rel_bro_fate.prompt",
          options: {
            left: {
              label: "rel_bro_fate.left", // be at his side
              outcomes: [
                { if: { traits: { relBrotherLove: { min: 25 }, relBrotherDistance: { max: 24 } } }, result: "rel_bro_fate.left.r0", effects: { vitals: { happiness: "++", spirit: "+" }, setTraits: { relBrotherStoryDone: true } } },
                { if: { traits: { relBrotherLove: { min: 25 } } }, result: "rel_bro_fate.left.r1", effects: { vitals: { happiness: "+", spirit: "+" }, setTraits: { relBrotherStoryDone: true } } },
                { if: { traits: { relBrotherLove: { min: 0 } } }, result: "rel_bro_fate.left.r2", effects: { vitals: { happiness: "+" }, setTraits: { relBrotherStoryDone: true } } },
                { result: "rel_bro_fate.left.r3", effects: { vitals: { happiness: "-", spirit: "-" }, setTraits: { relBrotherStoryDone: true } } },
              ],
            },
            right: {
              label: "rel_bro_fate.right", // make your peace from afar
              outcomes: [
                { if: { traits: { relBrotherLove: { min: 25 } } }, result: "rel_bro_fate.right.r0", effects: { vitals: { spirit: "+" }, setTraits: { relBrotherStoryDone: true } } },
                { if: { traits: { relBrotherLove: { min: 0 } } }, result: "rel_bro_fate.right.r1", effects: { vitals: { spirit: "+" }, setTraits: { relBrotherStoryDone: true } } },
                { result: "rel_bro_fate.right.r2", effects: { vitals: { spirit: "--" }, setTraits: { relBrotherStoryDone: true } } },
              ],
            },
          },
        },

        // --- ESTRANGEMENT: the bond curdles past mending. A milestone that fires
        //     whenever love collapses (love <= -25), from school-age on — driven by
        //     your OWN cold choices, never by unlucky draws. Ends the arc coldly
        //     (sets relBrotherStoryDone). Priority above the crossroads so a truly
        //     broken bond takes precedence. Let it lie, or spend to half-mend it —
        //     either way the story is over.
        {
          id: "rel_bro_estranged",
          kind: "milestone",
          priority: 60,
          // Losing Tom must be something you DO, never something that happens to you.
          // Two guards. (1) The love bar sits below what the two early cold answers can
          // reach between them — the baby cold-shoulder (-15) plus a crossroads
          // mismatch (-5) bottoms out at -20 — so those two can never estrange him,
          // however the draws fall. Reaching -30 needs at least one more deliberate
          // rebuff (the `down` swipes on play/bully/share). (2) Tom must be 12, so it
          // lands as a considered break, not a childhood accident.
          // Measured over full lives: always choosing the coldest option reaches this
          // 31% of the time, a random player 3%, always choosing the kindest 0%.
          // (Those cold swipes were added FOR this. Without them the three childhood
          // beats could only push love UP, so NO threshold satisfying (1) was
          // reachable — at -25 a deliberately cold player saw this just 6% of the
          // time. Lowering the number alone trades a rare ending for an unfair one;
          // the deck needed real ways to push him away.)
          conditions: { traits: { relBrotherStoryDone: false, relBrotherLove: { max: -30 }, relBrotherAge: { min: 12 } } },
          prompt: "rel_bro_estranged.prompt",
          options: {
            left: { label: "rel_bro_estranged.left", outcomes: [{ result: "rel_bro_estranged.left.r0", effects: { vitals: { spirit: "-" }, setTraits: { relBrotherStoryDone: true } } }] },
            // Reaching for him does NOT end the story — that was backwards. It costs
            // real coin and pride and buys back a big chunk of love, pulling you off
            // the estrangement threshold so the remaining beats (rift, reckoning,
            // fate) can still play out. The card is a milestone, so it is consumed
            // either way and will not nag you again.
            right: { label: "rel_bro_estranged.right", outcomes: [{ result: "rel_bro_estranged.right.r0", effects: { vitals: { finances: "-", spirit: "-" }, incTraits: { relBrotherLove: 30 } } }] },
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
