// Deck — LILLY (rel_lilly), the first of the love-interest decks. Opened by
// `fam_single_lilly`, which spends socialWarmth to make a friend of her.
//
// THE SHAPE, which the later person-decks copy. Three counters, and the second
// one is the point:
//   relLillyWarmth   how much SHE cares. Built by showing up, and by choosing
//                    her over the easier thing. Every card moves it.
//   relLillyArdour   how hard YOU push it past friendship. Moved by one card
//                    only — the one where you say it out loud.
//   relLillyDistance the presence clock, as the siblings use it: +1 every year
//                    the deck ticks, zeroed by any card where you actually see
//                    her. Left to run, it fetches the drift card and then the
//                    ending where she marries somebody else.
//
// Four outcomes out of two axes, and the bottom right is why the deck exists:
//
//   |               | low ardour       | high ardour                     |
//   | high warmth   | a friend for life| the marriage                    |
//   | low warmth    | you drifted      | you pushed, and it is spoiled   |
//
// So the friend-zone is a RISK THE PLAYER TAKES, not a state they are assigned.
//
// HER TEMPERAMENT: a workaholic. She is at her books or at her bench whenever
// you call, which is the trade on nearly every card — her time is expensive.
// Two things move her more than anything else. She has no patience at all for a
// life going nowhere, so being out of work is a card that comes back round for
// as long as you are; and she wants a door of your own with your key in it,
// which is the one place she will put her shoulder behind you rather than ask
// something of you.
//
// SIZING: every ordinary card carries `chance`, the existing per-year re-roll,
// so a live person-deck contributes roughly a card and a half to a pool of ~9
// in young adulthood rather than sitting in it wholesale. A miss is re-rolled
// next year rather than lost, which is the failure mode that hollowed out the
// sibling decks' late beats. The three cards that END something carry `weight`
// instead: once their gate is met the moment should land, not be re-rolled.
import type { Deck } from "../../engine/types.ts";

export const lillyDecks = [
  {
    id: "rel_lilly",
    title: "deck.rel_lilly.title",
    unlock: "deck.rel_lilly.blurb",
    // The presence clock. Frozen once her story concludes, as the siblings' is:
    // otherwise a long and happy marriage slowly drifts away from the person you
    // married.
    tick: { relLillyDistance: 1 },
    tickWhile: { traits: { relLillyStoryDone: false } },
    cards: [
      // === WHO SHE IS ====================================================
      {
        // The card that says what she is, so every later trade reads. You call,
        // and she does not look up.
        id: "rel_lilly_books",
        weight: 3,
        kind: "one_time",
        conditions: { traits: { relLillyStoryDone: false } },
        prompt: "rel_lilly_books.prompt",
        options: {
          left: { label: "rel_lilly_books.left", outcomes: [{ result: "rel_lilly_books.left.r0", effects: { vitals: { happiness: "-", spirit: "+" }, incTraits: { relLillyWarmth: 12, relLillyDistance: -6 } } }] },
          right: { label: "rel_lilly_books.right", outcomes: [{ result: "rel_lilly_books.right.r0", effects: { vitals: { happiness: "++" }, incTraits: { relLillyWarmth: -4, relLillyDistance: -6 } } }] },
        },
      },
      {
        // The ordinary beat, and the only repeating one that is purely about
        // showing up. It is what keeps the clock at zero in a quiet decade.
        id: "rel_lilly_walk",
        weight: 3,
        kind: "filler",
        conditions: { traits: { relLillyStoryDone: false } },
        prompt: "rel_lilly_walk.prompt",
        options: {
          left: { label: "rel_lilly_walk.left", outcomes: [{ result: "rel_lilly_walk.left.r0", effects: { vitals: { happiness: "+", finances: "-" }, incTraits: { relLillyWarmth: 6, relLillyDistance: -6 } } }] },
          right: { label: "rel_lilly_walk.right", outcomes: [{ result: "rel_lilly_walk.right.r0", effects: { vitals: { spirit: "+", happiness: "-" } } }] },
        },
      },

      // === WHAT SHE ASKS OF YOU ==========================================
      {
        // "Upset with you if you are unemployed for ages" — and ages is the
        // mechanic, not the text. It reads `jobYearsIdle`, the years the
        // unemployed status has ticked — three years of it, at any point in your
        // life, and she has something to say. One-shot: the counter only grows,
        // so a repeating card would scold you every few years for one bad decade
        // twenty years behind you.
        //
        // It cannot be gated on the status itself: `job_unemployed` is a
        // `priority` deck, so while you are out of work the draw is focused onto
        // the escape routes and her deck is not in the pool at all. The card
        // that judges a bad spell has to be dealt after it, which is also when
        // it stings most.
        id: "rel_lilly_idle",
        weight: 3,
        kind: "one_time",
        conditions: { traits: { relLillyStoryDone: false, jobYearsIdle: { min: 3 } } },
        prompt: "rel_lilly_idle.prompt",
        options: {
          left: { label: "rel_lilly_idle.left", outcomes: [{ result: "rel_lilly_idle.left.r0", effects: { vitals: { happiness: "-", spirit: "+" }, incTraits: { relLillyWarmth: 2, relLillyDistance: -6 } } }] },
          right: { label: "rel_lilly_idle.right", outcomes: [{ result: "rel_lilly_idle.right.r0", effects: { vitals: { happiness: "+", spirit: "-" }, incTraits: { relLillyWarmth: -8, relLillyDistance: -6 } } }] },
        },
      },
      {
        // The one card where she pushes rather than asks, and the reason she is
        // worth having about: a door of your own is the game's biggest untaken
        // health source (only ~6% of lives ever own one, and drift is what kills
        // you). Gated on still being under your family's roof and on her caring
        // enough to nag, so it is a reward for the warmth rather than a handout.
        id: "rel_lilly_saving",
        weight: 3,
        kind: "filler",
        conditions: { ageMin: 14, status: { housing: "family" }, traits: { relLillyStoryDone: false, relLillyWarmth: { min: 12 } } },
        prompt: "rel_lilly_saving.prompt",
        options: {
          left: { label: "rel_lilly_saving.left", outcomes: [{ result: "rel_lilly_saving.left.r0", effects: { vitals: { finances: "++", happiness: "-" }, incTraits: { relLillyWarmth: 8, relLillyDistance: -6 } } }] },
          right: { label: "rel_lilly_saving.right", outcomes: [{ result: "rel_lilly_saving.right.r0", effects: { vitals: { happiness: "+", finances: "-" }, incTraits: { relLillyWarmth: -4, relLillyDistance: -6 } } }] },
        },
      },
      {
        // And the payoff, once you have the key. The largest single lump of
        // warmth in the deck — she asked for one thing and you did it.
        id: "rel_lilly_ownplace",
        weight: 3,
        kind: "one_time",
        conditions: {
          traits: { relLillyStoryDone: false },
          any: [
            { status: { housing: "renting" } },
            { status: { housing: "owned_small" } },
            { status: { housing: "owned_large" } },
            { status: { housing: "owned_estate" } },
          ],
        },
        prompt: "rel_lilly_ownplace.prompt",
        options: {
          left: { label: "rel_lilly_ownplace.left", outcomes: [{ result: "rel_lilly_ownplace.left.r0", effects: { vitals: { happiness: "++", finances: "-" }, incTraits: { relLillyWarmth: 14, relLillyDistance: -6 } } }] },
          right: { label: "rel_lilly_ownplace.right", outcomes: [{ result: "rel_lilly_ownplace.right.r0", effects: { vitals: { finances: "+", happiness: "-" } } }] },
        },
      },

      // === THE CLOCK =====================================================
      {
        // Left alone, a friendship goes quiet. This is the card that lets you
        // pay to keep it — and the card you decline when you have decided you
        // will not.
        id: "rel_lilly_drift",
        weight: 3,
        kind: "filler",
        conditions: { traits: { relLillyStoryDone: false, relLillyDistance: { min: 5 } } },
        prompt: "rel_lilly_drift.prompt",
        options: {
          left: { label: "rel_lilly_drift.left", outcomes: [{ result: "rel_lilly_drift.left.r0", effects: { vitals: { happiness: "+", finances: "-" }, incTraits: { relLillyWarmth: 6, relLillyDistance: -6 } } }] },
          right: { label: "rel_lilly_drift.right", outcomes: [{ result: "rel_lilly_drift.right.r0", effects: { vitals: { spirit: "+", happiness: "-" }, incTraits: { relLillyWarmth: -8 } } }] },
        },
      },

      // === THE GAMBLE ====================================================
      {
        // The ardour axis, and the only card that moves it. Say it and you are
        // committed either way: if she was already yours it is the best moment
        // in the deck, and if she was not you have spent the friendship to find
        // out. Age-gated where the intro is not — this is the dating card.
        id: "rel_lilly_more",
        weight: 3,
        kind: "one_time",
        conditions: { ageMin: 16, traits: { relLillyStoryDone: false, relLillyWarmth: { min: 18 } } },
        prompt: "rel_lilly_more.prompt",
        options: {
          left: {
            label: "rel_lilly_more.left",
            outcomes: [
              // Said it, and she was already yours — and if you are both old
              // enough, that IS walking out together: the status moves here
              // rather than waiting for another card. Measured, a life is too
              // short to spend four separate draws getting from a friend to a
              // wife, and this is the beat where the drama actually is.
              { if: { ageMin: 18, status: { family: "single" }, traits: { relLillyWarmth: { min: 25 } } }, result: "rel_lilly_more.left.r0", effects: { vitals: { happiness: "+++" }, setStatus: { family: "courting" }, incTraits: { relLillyWarmth: 12, relLillyArdour: 10, relLillyDistance: -6 }, remember: "log.courting" } },
              // Said it too young for the parish to have a word for it. The
              // ardour is banked; `rel_lilly_courting` picks it up at eighteen.
              { if: { traits: { relLillyWarmth: { min: 25 } } }, result: "rel_lilly_more.left.r0", effects: { vitals: { happiness: "+++" }, incTraits: { relLillyWarmth: 12, relLillyArdour: 10, relLillyDistance: -6 } } },
              { result: "rel_lilly_more.left.r1", effects: { vitals: { happiness: "--", spirit: "-" }, incTraits: { relLillyWarmth: -25, relLillyArdour: 10, relLillyDistance: -6 } } },
            ],
          },
          right: { label: "rel_lilly_more.right", outcomes: [{ result: "rel_lilly_more.right.r0", effects: { vitals: { spirit: "+", happiness: "-" }, incTraits: { relLillyWarmth: 4, relLillyDistance: -6 } } }] },
        },
      },

      // === THE ENDINGS ===================================================
      // Weighted rather than chanced: once the gate is met the moment should
      // land this year, not be re-rolled until the draw remembers.
      {
        // Walking out together — the `family` status leaves `single`, which hands
        // `fam_single` back and with it every other intro. Being spoken for is a
        // door closing, and that is the point of it being a status.
        id: "rel_lilly_courting",
        kind: "one_time",
        weight: 3,
        conditions: { ageMin: 18, status: { family: "single" }, traits: { relLillyStoryDone: false, relLillyArdour: { min: 10 }, relLillyWarmth: { min: 25 } } },
        prompt: "rel_lilly_courting.prompt",
        options: {
          left: { label: "rel_lilly_courting.left", outcomes: [{ result: "rel_lilly_courting.left.r0", effects: { vitals: { happiness: "++" }, setStatus: { family: "courting" }, incTraits: { relLillyWarmth: 8, relLillyDistance: -6 }, remember: "log.courting" } }] },
          right: { label: "rel_lilly_courting.right", outcomes: [{ result: "rel_lilly_courting.right.r0", effects: { vitals: { spirit: "+", happiness: "-" }, incTraits: { relLillyWarmth: 2, relLillyArdour: -10, relLillyDistance: -6 } } }] },
        },
      },
      {
        // The marriage. `relLillyStoryDone` freezes the presence clock: married
        // life is its own deck and does not exist yet, and until it does a long
        // one should not quietly drift apart for want of cards.
        id: "rel_lilly_propose",
        kind: "one_time",
        weight: 8,
        conditions: { status: { family: "courting" }, traits: { relLillyStoryDone: false, relLillyWarmth: { min: 30 } } },
        prompt: "rel_lilly_propose.prompt",
        options: {
          left: { label: "rel_lilly_propose.left", outcomes: [{ result: "rel_lilly_propose.left.r0", effects: { vitals: { happiness: "+++", finances: "--" }, setStatus: { family: "married" }, setTraits: { relLillyStoryDone: true }, remember: "log.married" } }] },
          right: { label: "rel_lilly_propose.right", outcomes: [{ result: "rel_lilly_propose.right.r0", effects: { vitals: { finances: "+", happiness: "-" }, incTraits: { relLillyWarmth: -10, relLillyDistance: -6 } } }] },
        },
      },
      {
        // The other ending, and the commoner one: you let it run down. Neither
        // swipe wears a mark: by the time this card is dealt nothing is being
        // decided, so a ★ would be a reward for a loss and a ⚠ would be a warning
        // about something already lost. Both
        // swipes close the story — by the time this card is drawn the decision
        // was made years ago, a year at a time. What is left is how you take it.
        id: "rel_lilly_lost",
        kind: "one_time",
        weight: 3,
        conditions: { traits: { relLillyStoryDone: false, relLillyDistance: { min: 10 }, relLillyWarmth: { max: 14 } } },
        prompt: "rel_lilly_lost.prompt",
        options: {
          left: { label: "rel_lilly_lost.left", outcomes: [{ result: "rel_lilly_lost.left.r0", effects: { vitals: { spirit: "+", happiness: "--" }, mark: "none", setTraits: { relLillyStoryDone: true, relLillyActive: false }, removeDecks: ["rel_lilly"], remember: "log.lillylost" } }] },
          right: { label: "rel_lilly_lost.right", outcomes: [{ result: "rel_lilly_lost.right.r0", effects: { vitals: { happiness: "-", spirit: "-" }, mark: "none", setTraits: { relLillyStoryDone: true, relLillyActive: false }, removeDecks: ["rel_lilly"], remember: "log.lillylost" } }] },
        },
      },
    ],
  },
] satisfies Deck[];
