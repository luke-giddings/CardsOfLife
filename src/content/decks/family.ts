// Decks — domain group: home life (the `family` status). Split out of
// content/index.ts; assembled there. Player-facing text is by STRING ID (tables
// in src/i18n); typed `satisfies Deck[]` so a misspelled id is still a compile
// error.
//
// fam_single — your life as someone unattached, from the school/work choice
//   until you are spoken for. Two jobs. It is where `socialWarmth` is earned:
//   the small, ordinary business of being around other people. And it is where
//   the INTRO cards live — one per person you might come to know — each of
//   which SPENDS that warmth. Nothing caps how many people a life can have:
//   the cap is how much warmth a life can bank, so it falls out of the economy
//   rather than out of a rule.
//
// The warmth on these cards is deliberately small. They are not the only source
// (options on cards across the other decks feed it too), because a currency fed
// by one deck is only as reachable as that deck — which is how the sibling beats
// came to be seen in a fifth of lives.
import type { Deck } from "../../engine/types.ts";

export const familyDecks = [

    {
      id: "fam_single",
      cards: [
        {
          // Children in the yard, and whether you are one of them. The earliest
          // warmth in the game, and the cheapest: it costs you nothing but the
          // afternoon.
          id: "fam_single_yard",
          kind: "one_time",
          conditions: { ageMax: 13 },
          prompt: "fam_single_yard.prompt",
          options: {
            left: { label: "fam_single_yard.left", outcomes: [{ result: "fam_single_yard.left.r0", effects: { vitals: { happiness: "+", health: "-" }, incTraits: { socialWarmth: 2 } } }] },
            right: { label: "fam_single_yard.right", outcomes: [{ result: "fam_single_yard.right.r0", effects: { vitals: { spirit: "+", happiness: "-" } } }] },
          },
        },
        {
          // A favour asked, at a bad moment. The sociable find it easy; everyone
          // else pays for it in time they did not have.
          id: "fam_single_favour",
          kind: "one_time",
          prompt: "fam_single_favour.prompt",
          options: {
            left: {
              label: "fam_single_favour.left",
              outcomes: [
                { if: { traits: { persSociable: true } }, result: "fam_single_favour.left.r0", effects: { vitals: { happiness: "+" }, incTraits: { socialWarmth: 3 } } },
                { result: "fam_single_favour.left.r1", effects: { vitals: { happiness: "+", spirit: "-" }, incTraits: { socialWarmth: 2 } } },
              ],
            },
            right: { label: "fam_single_favour.right", outcomes: [{ result: "fam_single_favour.right.r0", effects: { vitals: { spirit: "+", happiness: "-" } } }] },
          },
        },
        {
          // A penny hop. The first card here that costs money, and the richest
          // source of warmth — being sociable is not free once you are grown.
          id: "fam_single_dance",
          kind: "filler",
          conditions: { ageMin: 14 },
          prompt: "fam_single_dance.prompt",
          options: {
            left: {
              label: "fam_single_dance.left",
              outcomes: [
                { if: { traits: { persSociable: true } }, result: "fam_single_dance.left.r0", effects: { vitals: { happiness: "++", finances: "-" }, incTraits: { socialWarmth: 4 } } },
                { result: "fam_single_dance.left.r1", effects: { vitals: { happiness: "+", finances: "-" }, incTraits: { socialWarmth: 2 } } },
              ],
            },
            right: { label: "fam_single_dance.right", outcomes: [{ result: "fam_single_dance.right.r0", effects: { vitals: { finances: "+", happiness: "-" } } }] },
          },
        },
        {
          // The other side of the ledger: what being unattached costs, once
          // everyone your age is not. A trade, not a punishment — the evenings
          // are your own, and that is worth something.
          id: "fam_single_alone",
          kind: "filler",
          conditions: { ageMin: 24 },
          prompt: "fam_single_alone.prompt",
          options: {
            left: { label: "fam_single_alone.left", outcomes: [{ result: "fam_single_alone.left.r0", effects: { vitals: { spirit: "+", happiness: "-" } } }] },
            right: { label: "fam_single_alone.right", outcomes: [{ result: "fam_single_alone.right.r0", effects: { vitals: { happiness: "+", finances: "-" }, incTraits: { socialWarmth: 2 } } }] },
          },
        },
      ],
    },

] satisfies Deck[];
