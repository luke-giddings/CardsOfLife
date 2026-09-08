// Decks — domain group: adult. Split out of content/index.ts; assembled there.
// Player-facing text is by STRING ID (tables in src/i18n); typed
// `satisfies Deck[]` so a misspelled id is still a compile error.
import type { CardOptions, Deck } from "../../engine/types.ts";

// The three pet-shop cards (young adult / adult / old age) offer the SAME choice —
// a cat (a HAPPINESS companion), a dog (a SPIRIT companion), or walk away — and
// differ only in their prompt text, so they share this one option block to stay in
// lockstep. Each card is one_time and gated pet=none (one pet at a time); the two
// pets seed love 3 (a chosen, well-bonded animal) and reset their age clock.
// Card definitions are never mutated, so sharing the object by reference is safe.
const petshopOptions: CardOptions = {
  left: { label: "petshop.cat", outcomes: [{ result: "petshop.cat.r0", effects: { vitals: { finances: "-", happiness: "+" }, setStatus: { pet: "cat" }, setTraits: { petCatLove: 3, petCatAge: 0 } } }] },
  right: { label: "petshop.dog", outcomes: [{ result: "petshop.dog.r0", effects: { vitals: { finances: "-", spirit: "+" }, setStatus: { pet: "dog" }, setTraits: { petDogLove: 3, petDogAge: 0 } } }] },
  down: { label: "petshop.none", outcomes: [{ result: "petshop.none.r0" }] },
};

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
          // The pet-seller's stall — a chance to take on a cat or a dog (or
          // neither) in young adulthood. Shared 3-option block; gated pet=none.
          id: "youngadult_petshop",
          kind: "one_time",
          conditions: { status: { pet: "none" } },
          prompt: "youngadult_petshop.prompt",
          options: petshopOptions,
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
          kind: "one_time",
          prompt: "adult_family.prompt",
          options: {
            left: { label: "adult_family.left", outcomes: [{ result: "adult_family.left.r0", effects: { vitals: { happiness: "++", finances: "-" } } }] },
            right: { label: "adult_family.right", outcomes: [{ result: "adult_family.right.r0", effects: { vitals: { finances: "+", happiness: "-" } } }] },
          },
        },
        {
          id: "adult_duty",
          kind: "one_time",
          prompt: "adult_duty.prompt",
          options: {
            left: { label: "adult_duty.left", outcomes: [{ result: "adult_duty.left.r0", effects: { vitals: { spirit: "+", health: "-" } } }] },
            right: { label: "adult_duty.right", outcomes: [{ result: "adult_duty.right.r0", effects: { vitals: { happiness: "+", spirit: "-" } } }] },
          },
        },
        {
          // Non-work life event (work belongs on the job decks): an old friend
          // in need. A money-vs-conscience trade — help and feel the better for
          // it, or keep your coin and let it gnaw.
          id: "adult_friend",
          kind: "one_time",
          prompt: "adult_friend.prompt",
          options: {
            left: { label: "adult_friend.left", outcomes: [{ result: "adult_friend.left.r0", effects: { vitals: { finances: "-", spirit: "+", happiness: "+" } } }] },
            right: { label: "adult_friend.right", outcomes: [{ result: "adult_friend.right.r0", effects: { vitals: { finances: "+", spirit: "-" } } }] },
          },
        },
        {
          // A bout of ill health — the adult years' quiet tax made a card. Pay the
          // doctor (money for a surer recovery) or trust it passes (save the coin,
          // risk your health).
          id: "adult_ail",
          kind: "one_time",
          prompt: "adult_ail.prompt",
          options: {
            left: { label: "adult_ail.left", outcomes: [{ result: "adult_ail.left.r0", effects: { vitals: { finances: "-", health: "+" } } }] },
            right: { label: "adult_ail.right", outcomes: [{ result: "adult_ail.right.r0", effects: { vitals: { health: "-", spirit: "+" } } }] },
          },
        },
        {
          // A supper with the town's better sort — spend to be seen (happiness) or
          // keep a quiet, thrifty night in (spirit, a little coin saved).
          id: "adult_society",
          kind: "one_time",
          prompt: "adult_society.prompt",
          options: {
            left: { label: "adult_society.left", outcomes: [{ result: "adult_society.left.r0", effects: { vitals: { finances: "-", happiness: "+" } } }] },
            right: { label: "adult_society.right", outcomes: [{ result: "adult_society.right.r0", effects: { vitals: { happiness: "-", spirit: "+" } } }] },
          },
        },
        {
          // A match is proposed. Marry and set up a household (joy, but a wedding
          // and a home cost) — or keep your independence and your coin.
          id: "adult_wed",
          kind: "one_time",
          prompt: "adult_wed.prompt",
          options: {
            left: { label: "adult_wed.left", outcomes: [{ result: "adult_wed.left.r0", effects: { vitals: { happiness: "++", finances: "-" } } }] },
            right: { label: "adult_wed.right", outcomes: [{ result: "adult_wed.right.r0", effects: { vitals: { spirit: "+", happiness: "-" } } }] },
          },
        },
        {
          // Little ones about the house. Dote on them (joy, but hungry mouths and
          // sleepless nights) or raise them hard and set them to earning.
          id: "adult_children",
          kind: "one_time",
          prompt: "adult_children.prompt",
          options: {
            left: { label: "adult_children.left", outcomes: [{ result: "adult_children.left.r0", effects: { vitals: { happiness: "++", finances: "-", health: "-" } } }] },
            right: { label: "adult_children.right", outcomes: [{ result: "adult_children.right.r0", effects: { vitals: { finances: "+", happiness: "-" } } }] },
          },
        },
        {
          // The gin-shop's warm glow after a hard day. Drown your cares (a night's
          // cheer, at a cost to purse and body) or walk on by (sober pride).
          id: "adult_drink",
          kind: "one_time",
          prompt: "adult_drink.prompt",
          options: {
            left: { label: "adult_drink.left", outcomes: [{ result: "adult_drink.left.r0", effects: { vitals: { happiness: "+", health: "-", finances: "-" } } }] },
            right: { label: "adult_drink.right", outcomes: [{ result: "adult_drink.right.r0", effects: { vitals: { spirit: "+", happiness: "-" } } }] },
          },
        },
        {
          // The chapel asks more of you — time, devotion, a tithe. Give yourself to
          // it (spirit, for the coin in the plate) or keep your Sundays your own.
          id: "adult_chapel",
          kind: "one_time",
          prompt: "adult_chapel.prompt",
          options: {
            left: { label: "adult_chapel.left", outcomes: [{ result: "adult_chapel.left.r0", effects: { vitals: { spirit: "++", finances: "-" } } }] },
            right: { label: "adult_chapel.right", outcomes: [{ result: "adult_chapel.right.r0", effects: { vitals: { happiness: "+", spirit: "-" } } }] },
          },
        },
        {
          // A bitter quarrel with a neighbour. Swallow your pride and make peace
          // (a happier street, a bruised ego) or win the feud (satisfaction, at a
          // cost to your peace and your nerves).
          id: "adult_quarrel",
          kind: "one_time",
          prompt: "adult_quarrel.prompt",
          options: {
            left: { label: "adult_quarrel.left", outcomes: [{ result: "adult_quarrel.left.r0", effects: { vitals: { happiness: "+", spirit: "-" } } }] },
            right: { label: "adult_quarrel.right", outcomes: [{ result: "adult_quarrel.right.r0", effects: { vitals: { spirit: "+", happiness: "-", health: "-" } } }] },
          },
        },
        {
          // A modest legacy from a distant relation. Keep it all to yourself
          // (a fatter purse, a meaner heart) or share it round the family (less
          // coin, a warmer house).
          id: "adult_legacy_windfall",
          kind: "one_time",
          prompt: "adult_legacy_windfall.prompt",
          options: {
            left: { label: "adult_legacy_windfall.left", outcomes: [{ result: "adult_legacy_windfall.left.r0", effects: { vitals: { finances: "++", happiness: "-" } } }] },
            right: { label: "adult_legacy_windfall.right", outcomes: [{ result: "adult_legacy_windfall.right.r0", effects: { vitals: { finances: "+", happiness: "++" } } }] },
          },
        },
        {
          // The pet shop again in the settled middle years — for those who never
          // took the childhood stray or a young-adult pet (or whose animal has
          // since gone). Cat, dog, or walk on. Shared 3-option block; gated pet=none.
          id: "adult_petshop",
          kind: "one_time",
          conditions: { status: { pet: "none" } },
          prompt: "adult_petshop.prompt",
          options: petshopOptions,
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
          kind: "one_time",
          prompt: "old_rest.prompt",
          options: {
            left: { label: "old_rest.left", outcomes: [{ result: "old_rest.left.r0", effects: { vitals: { health: "+", finances: "-" } } }] },
            right: { label: "old_rest.right", outcomes: [{ result: "old_rest.right.r0", effects: { vitals: { spirit: "+", health: "-" } } }] },
          },
        },
        {
          id: "old_legacy",
          kind: "one_time",
          prompt: "old_legacy.prompt",
          options: {
            left: { label: "old_legacy.left", outcomes: [{ result: "old_legacy.left.r0", effects: { vitals: { spirit: "++", finances: "-" } } }] },
            right: { label: "old_legacy.right", outcomes: [{ result: "old_legacy.right.r0", effects: { vitals: { happiness: "+", spirit: "-" } } }] },
          },
        },
        {
          id: "old_grandchildren",
          kind: "one_time",
          prompt: "old_grandchildren.prompt",
          options: {
            left: { label: "old_grandchildren.left", outcomes: [{ result: "old_grandchildren.left.r0", effects: { vitals: { happiness: "++", health: "-" } } }] },
            right: { label: "old_grandchildren.right", outcomes: [{ result: "old_grandchildren.right.r0", effects: { vitals: { health: "+", happiness: "-" } } }] },
          },
        },
        {
          // Setting your affairs in order — the will. Divide it fairly among your
          // kin (a clear conscience) or keep a tight grip on every penny to the last.
          id: "old_will",
          kind: "one_time",
          prompt: "old_will.prompt",
          options: {
            left: { label: "old_will.left", outcomes: [{ result: "old_will.left.r0", effects: { vitals: { spirit: "+", happiness: "+" } } }] },
            right: { label: "old_will.right", outcomes: [{ result: "old_will.right.r0", effects: { vitals: { finances: "+", spirit: "-" } } }] },
          },
        },
        {
          // The young gather to hear the old days. Spin them grand tales (a joy, if
          // a tiring one) or let yourself dwell on the roads not taken.
          id: "old_tales",
          kind: "one_time",
          prompt: "old_tales.prompt",
          options: {
            left: { label: "old_tales.left", outcomes: [{ result: "old_tales.left.r0", effects: { vitals: { happiness: "++", health: "-" } } }] },
            right: { label: "old_tales.right", outcomes: [{ result: "old_tales.right.r0", effects: { vitals: { spirit: "+", happiness: "-" } } }] },
          },
        },
        {
          // The cold settles in your chest each winter now. Take to your bed, warm
          // and idle (kinder on the body, harder on the spirit) or keep going.
          id: "old_ailment",
          kind: "one_time",
          prompt: "old_ailment.prompt",
          options: {
            left: { label: "old_ailment.left", outcomes: [{ result: "old_ailment.left.r0", effects: { vitals: { health: "+", spirit: "-" } } }] },
            right: { label: "old_ailment.right", outcomes: [{ result: "old_ailment.right.r0", effects: { vitals: { spirit: "+", health: "-" } } }] },
          },
        },
        {
          // Thoughts turn to the hereafter. Make your peace with it (a settled
          // soul, a soberer heart) or refuse to dwell — live for what days are left.
          id: "old_peace",
          kind: "one_time",
          prompt: "old_peace.prompt",
          options: {
            left: { label: "old_peace.left", outcomes: [{ result: "old_peace.left.r0", effects: { vitals: { spirit: "++", happiness: "-" } } }] },
            right: { label: "old_peace.right", outcomes: [{ result: "old_peace.right.r0", effects: { vitals: { happiness: "++", spirit: "-" } } }] },
          },
        },
        {
          // A last chance to leave a mark — endow a kindness, a bequest to the
          // parish. Give generously (a lighter soul, a lighter purse) or keep it
          // all for your heirs.
          id: "old_charity",
          kind: "one_time",
          prompt: "old_charity.prompt",
          options: {
            left: { label: "old_charity.left", outcomes: [{ result: "old_charity.left.r0", effects: { vitals: { spirit: "++", finances: "-" } } }] },
            right: { label: "old_charity.right", outcomes: [{ result: "old_charity.right.r0", effects: { vitals: { finances: "+", spirit: "-" } } }] },
          },
        },
        {
          // A companion for the quiet last years — the house feels emptier now. Cat,
          // dog, or neither. Shared 3-option block; gated pet=none.
          id: "oldage_petshop",
          kind: "one_time",
          conditions: { status: { pet: "none" } },
          prompt: "oldage_petshop.prompt",
          options: petshopOptions,
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
