// Decks — domain group: sibling. Split out of content/index.ts; assembled there.
// Player-facing text is by STRING ID (tables in src/i18n); typed
// `satisfies Deck[]` so a misspelled id is still a compile error.
import type { Deck } from "../../engine/types.ts";

export const siblingDecks = [

    // --- Sibling: unlocked by the brother/sister cards. Each option branches
    //     to whichever sibling you have (brother = r0, sister = r1). ----------
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
            left: {
              label: "sibling_play.left",
              outcomes: [
                { if: { traits: { hasBrother: true } }, result: "sibling_play.left.r0", effects: { vitals: { happiness: "+" }, incTraits: { relBrother: 8 } } },
                { result: "sibling_play.left.r1", effects: { vitals: { happiness: "+" }, incTraits: { relSister: 8 } } },
              ],
            },
            right: {
              label: "sibling_play.right",
              outcomes: [
                { if: { traits: { hasBrother: true } }, result: "sibling_play.right.r0", effects: { vitals: { spirit: "+" }, incTraits: { relBrother: -8 } } },
                { result: "sibling_play.right.r1", effects: { vitals: { spirit: "+" }, incTraits: { relSister: -8 } } },
              ],
            },
          },
        },
        {
          id: "sibling_blame",
          kind: "one_time",
          prompt: "sibling_blame.prompt",
          options: {
            left: {
              label: "sibling_blame.left",
              outcomes: [
                { if: { traits: { hasBrother: true } }, result: "sibling_blame.left.r0", effects: { vitals: { spirit: "+" }, incTraits: { relBrother: 8 } } },
                { result: "sibling_blame.left.r1", effects: { vitals: { spirit: "+" }, incTraits: { relSister: 8 } } },
              ],
            },
            right: {
              label: "sibling_blame.right",
              outcomes: [
                { if: { traits: { hasBrother: true } }, result: "sibling_blame.right.r0", effects: { vitals: { happiness: "+" }, incTraits: { relBrother: -8 } } },
                { result: "sibling_blame.right.r1", effects: { vitals: { happiness: "+" }, incTraits: { relSister: -8 } } },
              ],
            },
          },
        },
        {
          id: "sibling_treat",
          kind: "one_time",
          prompt: "sibling_treat.prompt",
          options: {
            left: {
              label: "sibling_treat.left",
              outcomes: [
                { if: { traits: { hasBrother: true } }, result: "sibling_treat.left.r0", effects: { vitals: { spirit: "+" }, incTraits: { relBrother: 8 } } },
                { result: "sibling_treat.left.r1", effects: { vitals: { spirit: "+" }, incTraits: { relSister: 8 } } },
              ],
            },
            right: {
              label: "sibling_treat.right",
              outcomes: [
                { if: { traits: { hasBrother: true } }, result: "sibling_treat.right.r0", effects: { vitals: { happiness: "+" }, incTraits: { relBrother: -8 } } },
                { result: "sibling_treat.right.r1", effects: { vitals: { happiness: "+" }, incTraits: { relSister: -8 } } },
              ],
            },
          },
        },
      ],
    },
] satisfies Deck[];
