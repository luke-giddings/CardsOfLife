// Decks — domain group: baby. Split out of content/index.ts; assembled there.
// Player-facing text is by STRING ID (tables in src/i18n); typed
// `satisfies Deck[]` so a misspelled id is still a compile error.
import type { Deck } from "../../engine/types.ts";

export const babyDecks = [
    // --- Baby: ages 0–5. Tutorial + build-up; impossible to lose. noDrift
    //     suspends status drift (e.g. family living costs) through babyhood. --
    {
      id: "age_baby",
      noDrift: true,
      cards: [
        {
          id: "baby_birth",
          kind: "milestone",
          priority: 100,
          conditions: { ageMin: 0, ageMax: 0 },
          prompt: "baby_birth.prompt",
          options: {
            left: { label: "baby_birth.left", outcomes: [{ result: "baby_birth.left.r0", effects: { setTraits: { gender: "boy" } } }] },
            right: { label: "baby_birth.right", outcomes: [{ result: "baby_birth.right.r0", effects: { setTraits: { gender: "girl" } } }] },
          },
        },
        {
          // Teaches that choices move the bars, and teaches the down-swipe.
          id: "baby_firststeps",
          kind: "milestone",
          priority: 90,
          conditions: { ageMin: 1, ageMax: 1 },
          prompt: "baby_firststeps.prompt",
          options: {
            left: { label: "baby_firststeps.left", outcomes: [{ result: "baby_firststeps.left.r0", effects: { vitals: { happiness: "++" } } }] },
            right: { label: "baby_firststeps.right", outcomes: [{ result: "baby_firststeps.right.r0", effects: { vitals: { spirit: "++" } } }] },
            down: { label: "baby_firststeps.down", outcomes: [{ result: "baby_firststeps.down.r0", effects: { vitals: { health: "++" } } }] },
          },
        },

        // --- ages 2–4: one_time "setups" (you'll see ~3 of these per run) ---
        {
          id: "baby_uncle",
          kind: "one_time",
          prompt: "baby_uncle.prompt",
          options: {
            left: { label: "baby_uncle.left", outcomes: [{ result: "baby_uncle.left.r0", effects: { vitals: { happiness: "++" } } }] },
            right: { label: "baby_uncle.right", outcomes: [{ result: "baby_uncle.right.r0", effects: { vitals: { finances: "+" }, setTraits: { eduUniFund: true } } }] },
            down: { label: "baby_uncle.down", outcomes: [{ result: "baby_uncle.down.r0", effects: { vitals: { health: "++" } } }] },
          },
        },
        {
          // The child's disposition: one guaranteed fork instead of two lucky
          // draws. Lean physical (sporty) or bookish -- each sets its 0..3
          // disposition counter straight to the cap (3, "fully" that trait) --
          // or choose NEITHER trait for a big all-round vitals boost. Sporty
          // helps survive labour (the loom), bookish helps the school path.
          id: "baby_disposition",
          kind: "one_time",
          prompt: "baby_disposition.prompt",
          options: {
            left: { label: "baby_disposition.left", outcomes: [{ result: "baby_disposition.left.r0", effects: { vitals: { health: "+" }, setTraits: { sporty: 3 } } }] },
            right: { label: "baby_disposition.right", outcomes: [{ result: "baby_disposition.right.r0", effects: { vitals: { spirit: "+" }, setTraits: { bookish: 3 } } }] },
            down: { label: "baby_disposition.down", outcomes: [{ result: "baby_disposition.down.r0", effects: { vitals: { health: "++", happiness: "++", spirit: "+" } } }] },
          },
        },
        {
          id: "baby_grandma",
          kind: "one_time",
          prompt: "baby_grandma.prompt",
          options: {
            left: { label: "baby_grandma.left", outcomes: [{ result: "baby_grandma.left.r0", effects: { vitals: { happiness: "++" }, setTraits: { sweetTooth: true } } }] },
            right: { label: "baby_grandma.right", outcomes: [{ result: "baby_grandma.right.r0", effects: { vitals: { health: "+" } } }] },
            down: { label: "baby_grandma.down", outcomes: [{ result: "baby_grandma.down.r0", effects: { vitals: { finances: "++" } } }] },
          },
        },
        {
          id: "baby_vaccine",
          kind: "one_time",
          prompt: "baby_vaccine.prompt",
          options: {
            left: { label: "baby_vaccine.left", outcomes: [{ result: "baby_vaccine.left.r0", effects: { vitals: { health: "+" }, setTraits: { vaccinated: true } } }] },
            right: { label: "baby_vaccine.right", outcomes: [{ result: "baby_vaccine.right.r0", effects: { vitals: { spirit: "++" } } }] },
          },
        },
        {
          id: "baby_nursery",
          kind: "one_time",
          prompt: "baby_nursery.prompt",
          options: {
            left: { label: "baby_nursery.left", outcomes: [{ result: "baby_nursery.left.r0", effects: { vitals: { spirit: "+" }, setTraits: { sociable: true } } }] },
            right: { label: "baby_nursery.right", outcomes: [{ result: "baby_nursery.right.r0", effects: { vitals: { health: "+" } } }] },
          },
        },
        {
          id: "baby_brother",
          kind: "one_time",
          prompt: "baby_brother.prompt",
          options: {
            left: { label: "baby_brother.left", outcomes: [{ result: "baby_brother.left.r0", effects: { vitals: { happiness: "++" }, setTraits: { relBrotherActive: true }, incTraits: { relBrotherLove: 30 }, addDecks: ["rel_bro"] } }] },
            right: { label: "baby_brother.right", outcomes: [{ result: "baby_brother.right.r0", effects: { vitals: { spirit: "++" }, setTraits: { relBrotherActive: true }, incTraits: { relBrotherLove: -15 }, addDecks: ["rel_bro"] } }] },
          },
        },
        {
          id: "baby_sister",
          kind: "one_time",
          prompt: "baby_sister.prompt",
          options: {
            left: { label: "baby_sister.left", outcomes: [{ result: "baby_sister.left.r0", effects: { vitals: { happiness: "++" }, setTraits: { relSisterActive: true }, incTraits: { relSisterLove: 30 }, addDecks: ["sibling"] } }] },
            right: { label: "baby_sister.right", outcomes: [{ result: "baby_sister.right.r0", effects: { vitals: { spirit: "++" }, setTraits: { relSisterActive: true }, incTraits: { relSisterLove: -15 }, addDecks: ["sibling"] } }] },
          },
        },

        {
          id: "baby_schooling",
          kind: "milestone",
          priority: 20,
          conditions: { ageMin: 5 },
          prompt: "baby_schooling.prompt",
          options: {
            left: {
              label: "baby_schooling.left",
              outcomes: [{ result: "baby_schooling.left.r0", effects: { vitals: { spirit: "+" }, setStatus: { age: "child", job: "studying" }, addDecks: ["age_childhood", "home_family"], removeDecks: ["age_baby"] } }],
            },
            right: {
              label: "baby_schooling.right",
              outcomes: [{ result: "baby_schooling.right.r0", effects: { vitals: { finances: "+" }, setStatus: { age: "child", job: "child_labourer" }, addDecks: ["age_childhood", "home_family"], removeDecks: ["age_baby"] } }],
            },
          },
        },
      ],
    },
] satisfies Deck[];
