// Decks — domain group: adult. Split out of content/index.ts; assembled there.
// Player-facing text is by STRING ID (tables in src/i18n); typed
// `satisfies Deck[]` so a misspelled id is still a compile error.
import type { Deck } from "../../engine/types.ts";

export const adultDecks = [

    // --- Young adulthood (18–~25): shared life-stage deck, added at coming-of-age
    //     (child_adult), on top of your job/housing decks. Settling into your
    //     station, first freedoms and first responsibilities. Skeleton pass:
    //     recurring life-event trades; the run now continues past 18. ----------
    {
      id: "young_adult",
      title: "deck.young_adult.title",
      unlock: "deck.young_adult.blurb",
      cards: [
        {
          id: "ya_courting",
          kind: "filler",
          prompt: "ya_courting.prompt",
          options: {
            left: { label: "ya_courting.left", outcomes: [{ result: "ya_courting.left.r0", effects: { vitals: { happiness: "++", finances: "-" } } }] },
            right: { label: "ya_courting.right", outcomes: [{ result: "ya_courting.right.r0", effects: { vitals: { spirit: "+", happiness: "-" } } }] },
          },
        },
        {
          id: "ya_tavern",
          kind: "filler",
          prompt: "ya_tavern.prompt",
          options: {
            left: { label: "ya_tavern.left", outcomes: [{ result: "ya_tavern.left.r0", effects: { vitals: { happiness: "+", health: "-", finances: "-" } } }] },
            right: { label: "ya_tavern.right", outcomes: [{ result: "ya_tavern.right.r0", effects: { vitals: { health: "+", happiness: "-" } } }] },
          },
        },
        {
          id: "ya_thrift",
          kind: "filler",
          prompt: "ya_thrift.prompt",
          options: {
            left: { label: "ya_thrift.left", outcomes: [{ result: "ya_thrift.left.r0", effects: { vitals: { finances: "+", happiness: "-" } } }] },
            right: { label: "ya_thrift.right", outcomes: [{ result: "ya_thrift.right.r0", effects: { vitals: { happiness: "+", finances: "-" } } }] },
          },
        },
        {
          id: "ya_ambition",
          kind: "filler",
          prompt: "ya_ambition.prompt",
          options: {
            left: { label: "ya_ambition.left", outcomes: [{ result: "ya_ambition.left.r0", effects: { vitals: { spirit: "+", health: "-" } } }] },
            right: { label: "ya_ambition.right", outcomes: [{ result: "ya_ambition.right.r0", effects: { vitals: { happiness: "+", spirit: "-" } } }] },
          },
        },
        {
          id: "ya_faith",
          kind: "filler",
          prompt: "ya_faith.prompt",
          options: {
            left: { label: "ya_faith.left", outcomes: [{ result: "ya_faith.left.r0", effects: { vitals: { spirit: "++", happiness: "-" } } }] },
            right: { label: "ya_faith.right", outcomes: [{ result: "ya_faith.right.r0", effects: { vitals: { happiness: "+", spirit: "-" } } }] },
          },
        },
        {
          // The charity hospital's ledger, come due. Only surfaces if the
          // childhood health rescue was taken (owesCharity), and recurs (filler)
          // until you settle up: pay it off (a real dent in your purse, but the
          // debt clears and your conscience with it) or turn the collector away
          // (keep the coin, at a cost to spirit — and he'll be back next year).
          id: "ya_charity_debt",
          kind: "filler",
          conditions: { traits: { owesCharity: true } },
          prompt: "ya_charity_debt.prompt",
          options: {
            left: { label: "ya_charity_debt.left", outcomes: [{ result: "ya_charity_debt.left.r0", effects: { vitals: { finances: "--", spirit: "+" }, setTraits: { owesCharity: false } } }] },
            right: { label: "ya_charity_debt.right", outcomes: [{ result: "ya_charity_debt.right.r0", effects: { vitals: { spirit: "-", happiness: "-" } } }] },
          },
        },
      ],
    },

    // --- Lifestyle: the money→happiness sink. Added at coming-of-age (child_adult
    //     sets lifestyle = frugal), and stays active through adult life. Two
    //     cards move you between the ordered tiers; conditional outcomes do the
    //     per-tier maths, and the atMost/atLeast gates keep each card to the
    //     range where it makes sense. ----------------------------------------
    {
      id: "lifestyle",
      cards: [
        {
          // LIVE BETTER — spend more to move up a tier. Offered when you have
          // spare cash (finances >= 40) and aren't already lavish. The ongoing
          // extra drain (a higher lifestyle status) is the real cost; the card
          // itself just gives the little joy of moving up.
          id: "life_better",
          kind: "filler",
          conditions: { vitals: { finances: { min: 40 } }, status: { lifestyle: { atMost: "comfortable" } } },
          prompt: "life_better.prompt",
          options: {
            left: {
              label: "life_better.left",
              outcomes: [
                { if: { status: { lifestyle: "frugal" } }, result: "life_better.left.r0", effects: { vitals: { happiness: "+" }, setStatus: { lifestyle: "modest" } } },
                { if: { status: { lifestyle: "modest" } }, result: "life_better.left.r1", effects: { vitals: { happiness: "+" }, setStatus: { lifestyle: "comfortable" } } },
                { result: "life_better.left.r2", effects: { vitals: { happiness: "+" }, setStatus: { lifestyle: "lavish" } } },
              ],
            },
            right: { label: "life_better.right", outcomes: [{ result: "life_better.right.r0", effects: { vitals: { happiness: "-" } } }] },
          },
        },
        {
          // ECONOMIZE — cut back a tier to save money. Offered when you're SHORT
          // (finances <= 25) and living above frugal, so you can adapt to a drop
          // in income. Cutting back stings (happiness -) but eases the drain;
          // "keeping up appearances" (right) feels good now but keeps you bleeding.
          id: "life_economize",
          kind: "filler",
          conditions: { vitals: { finances: { max: 25 } }, status: { lifestyle: { atLeast: "modest" } } },
          prompt: "life_economize.prompt",
          options: {
            left: {
              label: "life_economize.left",
              outcomes: [
                { if: { status: { lifestyle: "lavish" } }, result: "life_economize.left.r0", effects: { vitals: { happiness: "-", spirit: "+" }, setStatus: { lifestyle: "comfortable" } } },
                { if: { status: { lifestyle: "comfortable" } }, result: "life_economize.left.r1", effects: { vitals: { happiness: "-", spirit: "+" }, setStatus: { lifestyle: "modest" } } },
                { result: "life_economize.left.r2", effects: { vitals: { happiness: "-", spirit: "+" }, setStatus: { lifestyle: "frugal" } } },
              ],
            },
            right: { label: "life_economize.right", outcomes: [{ result: "life_economize.right.r0", effects: { vitals: { happiness: "+" } } }] },
          },
        },
      ],
    },
] satisfies Deck[];
