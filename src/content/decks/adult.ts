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
      id: "age_young_adult",
      title: "deck.young_adult.title",
      unlock: "deck.young_adult.blurb",
      cards: [
        {
          id: "ya_courting",
          kind: "one_time",
          prompt: "ya_courting.prompt",
          options: {
            left: { label: "ya_courting.left", outcomes: [{ result: "ya_courting.left.r0", effects: { vitals: { happiness: "++", finances: "-" } } }] },
            right: { label: "ya_courting.right", outcomes: [{ result: "ya_courting.right.r0", effects: { vitals: { spirit: "+", happiness: "-" } } }] },
          },
        },
        {
          id: "ya_tavern",
          kind: "one_time",
          prompt: "ya_tavern.prompt",
          options: {
            left: { label: "ya_tavern.left", outcomes: [{ result: "ya_tavern.left.r0", effects: { vitals: { happiness: "+", health: "-", finances: "-" } } }] },
            right: { label: "ya_tavern.right", outcomes: [{ result: "ya_tavern.right.r0", effects: { vitals: { health: "+", happiness: "-" } } }] },
          },
        },
        {
          id: "ya_thrift",
          kind: "one_time",
          prompt: "ya_thrift.prompt",
          options: {
            left: { label: "ya_thrift.left", outcomes: [{ result: "ya_thrift.left.r0", effects: { vitals: { finances: "+", happiness: "-" } } }] },
            right: { label: "ya_thrift.right", outcomes: [{ result: "ya_thrift.right.r0", effects: { vitals: { happiness: "+", finances: "-" } } }] },
          },
        },
        {
          id: "ya_ambition",
          kind: "one_time",
          prompt: "ya_ambition.prompt",
          options: {
            left: { label: "ya_ambition.left", outcomes: [{ result: "ya_ambition.left.r0", effects: { vitals: { spirit: "+", health: "-" } } }] },
            right: { label: "ya_ambition.right", outcomes: [{ result: "ya_ambition.right.r0", effects: { vitals: { happiness: "+", spirit: "-" } } }] },
          },
        },
        {
          id: "ya_faith",
          kind: "one_time",
          prompt: "ya_faith.prompt",
          options: {
            left: { label: "ya_faith.left", outcomes: [{ result: "ya_faith.left.r0", effects: { vitals: { spirit: "++", happiness: "-" } } }] },
            right: { label: "ya_faith.right", outcomes: [{ result: "ya_faith.right.r0", effects: { vitals: { happiness: "+", spirit: "-" } } }] },
          },
        },
        {
          // The charity hospital's ledger, come due. Only surfaces if the
          // childhood health rescue was taken (flawOwesCharity), and recurs (filler)
          // until you settle up: pay it off (a real dent in your purse, but the
          // debt clears and your conscience with it) or turn the collector away
          // (keep the coin, at a cost to spirit — and he'll be back next year).
          id: "ya_charity_debt",
          kind: "filler",
          conditions: { traits: { flawOwesCharity: true } },
          prompt: "ya_charity_debt.prompt",
          options: {
            left: { label: "ya_charity_debt.left", outcomes: [{ result: "ya_charity_debt.left.r0", effects: { vitals: { finances: "--", spirit: "+" }, setTraits: { flawOwesCharity: false } } }] },
            right: { label: "ya_charity_debt.right", outcomes: [{ result: "ya_charity_debt.right.r0", effects: { vitals: { spirit: "-", happiness: "-" } } }] },
          },
        },
        {
          // Into full adulthood (25): the young_adult stage hands off to the
          // adult life-event deck. The age status flips to `adult`, whose small
          // health drift is the first quiet tax of the years — you feel your body
          // begin to cost you. Both choices transition; they differ only in mood.
          id: "ya_adult",
          kind: "milestone",
          priority: 100,
          conditions: { ageMin: 25 },
          prompt: "ya_adult.prompt",
          options: {
            // A milestone into adulthood — neither option should sting. Contentment
            // (happiness + spirit) vs throwing yourself at the earning (a bigger
            // finances boost); different rewards, no penalty either way.
            left: { label: "ya_adult.left", outcomes: [{ result: "ya_adult.left.r0", effects: { vitals: { spirit: "+", happiness: "+" }, setStatus: { age: "adult" }, removeDecks: ["age_young_adult"], addDecks: ["age_adult"] } }] },
            right: { label: "ya_adult.right", outcomes: [{ result: "ya_adult.right.r0", effects: { vitals: { finances: "++" }, setStatus: { age: "adult" }, removeDecks: ["age_young_adult"], addDecks: ["age_adult"] } }] },
          },
        },
      ],
    },

    // --- Adulthood (25–~50): the settled, working-and-providing middle years,
    //     added when young_adult hands off (ya_adult). Skeleton pass mirroring
    //     young_adult: a few recurring life-event trades, plus the milestone into
    //     old age. The age status carries a small passive health drain here. ----
    {
      id: "age_adult",
      title: "deck.adult.title",
      unlock: "deck.adult.blurb",
      cards: [
        {
          id: "adult_family",
          kind: "filler",
          prompt: "adult_family.prompt",
          options: {
            left: { label: "adult_family.left", outcomes: [{ result: "adult_family.left.r0", effects: { vitals: { happiness: "++", finances: "-" } } }] },
            right: { label: "adult_family.right", outcomes: [{ result: "adult_family.right.r0", effects: { vitals: { finances: "+", happiness: "-" } } }] },
          },
        },
        {
          id: "adult_duty",
          kind: "filler",
          prompt: "adult_duty.prompt",
          options: {
            left: { label: "adult_duty.left", outcomes: [{ result: "adult_duty.left.r0", effects: { vitals: { spirit: "+", health: "-" } } }] },
            right: { label: "adult_duty.right", outcomes: [{ result: "adult_duty.right.r0", effects: { vitals: { happiness: "+", spirit: "-" } } }] },
          },
        },
        {
          id: "adult_toil",
          kind: "filler",
          prompt: "adult_toil.prompt",
          options: {
            left: { label: "adult_toil.left", outcomes: [{ result: "adult_toil.left.r0", effects: { vitals: { finances: "+", health: "-" } } }] },
            right: { label: "adult_toil.right", outcomes: [{ result: "adult_toil.right.r0", effects: { vitals: { health: "+", finances: "-" } } }] },
          },
        },
        {
          // Into old age (50): the age status flips to `old_age`, whose heavier
          // health drift is the steepening decline of the final years, and the
          // adult deck hands off to the old-age deck. Both choices transition;
          // they differ only in mood.
          id: "adult_oldage",
          kind: "milestone",
          priority: 100,
          conditions: { ageMin: 50 },
          prompt: "adult_oldage.prompt",
          options: {
            left: { label: "adult_oldage.left", outcomes: [{ result: "adult_oldage.left.r0", effects: { vitals: { spirit: "+", happiness: "+" }, setStatus: { age: "old_age" }, removeDecks: ["age_adult"], addDecks: ["age_old_age"] } }] },
            right: { label: "adult_oldage.right", outcomes: [{ result: "adult_oldage.right.r0", effects: { vitals: { finances: "+", spirit: "-" }, setStatus: { age: "old_age" }, removeDecks: ["age_adult"], addDecks: ["age_old_age"] } }] },
          },
        },
      ],
    },

    // --- Old age (50+): the last stage, added when adulthood hands off
    //     (adult_oldage). Stub pass: a few reflective life-event trades. The age
    //     status carries the heavy passive health decline of the years; there is
    //     no further stage — the run ends when a vital gives out. ---------------
    {
      id: "age_old_age",
      title: "deck.old_age.title",
      unlock: "deck.old_age.blurb",
      cards: [
        {
          id: "old_rest",
          kind: "filler",
          prompt: "old_rest.prompt",
          options: {
            left: { label: "old_rest.left", outcomes: [{ result: "old_rest.left.r0", effects: { vitals: { health: "+", finances: "-" } } }] },
            right: { label: "old_rest.right", outcomes: [{ result: "old_rest.right.r0", effects: { vitals: { spirit: "+", health: "-" } } }] },
          },
        },
        {
          id: "old_legacy",
          kind: "filler",
          prompt: "old_legacy.prompt",
          options: {
            left: { label: "old_legacy.left", outcomes: [{ result: "old_legacy.left.r0", effects: { vitals: { spirit: "++", finances: "-" } } }] },
            right: { label: "old_legacy.right", outcomes: [{ result: "old_legacy.right.r0", effects: { vitals: { happiness: "+", spirit: "-" } } }] },
          },
        },
        {
          id: "old_grandchildren",
          kind: "filler",
          prompt: "old_grandchildren.prompt",
          options: {
            left: { label: "old_grandchildren.left", outcomes: [{ result: "old_grandchildren.left.r0", effects: { vitals: { happiness: "++", health: "-" } } }] },
            right: { label: "old_grandchildren.right", outcomes: [{ result: "old_grandchildren.right.r0", effects: { vitals: { health: "+", happiness: "-" } } }] },
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
                { if: { status: { lifestyle: { atMost: "frugal" } } }, result: "life_better.left.r0", effects: { vitals: { happiness: "+" }, setStatus: { lifestyle: "modest" } } },
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
