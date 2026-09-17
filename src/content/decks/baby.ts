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
          // Teaches that choices move the bars, and teaches the up-swipe.
          id: "baby_firststeps",
          kind: "milestone",
          priority: 90,
          conditions: { ageMin: 1, ageMax: 1 },
          prompt: "baby_firststeps.prompt",
          options: {
            left: { label: "baby_firststeps.left", outcomes: [{ result: "baby_firststeps.left.r0", effects: { vitals: { happiness: "++" } } }] },
            right: { label: "baby_firststeps.right", outcomes: [{ result: "baby_firststeps.right.r0", effects: { vitals: { spirit: "++" } } }] },
            up: { label: "baby_firststeps.up", outcomes: [{ result: "baby_firststeps.up.r0", effects: { vitals: { health: "++" } } }] },
          },
        },

        // --- ages 2–4: one_time "setups" (you'll see ~3 of these per run) ---
        {
          id: "baby_uncle",
          kind: "one_time",
          prompt: "baby_uncle.prompt",
          options: {
            left: { label: "baby_uncle.left", outcomes: [{ result: "baby_uncle.left.r0", effects: { vitals: { happiness: "++" } } }] },
            right: { label: "baby_uncle.right", outcomes: [{ result: "baby_uncle.right.r0", effects: { setTraits: { eduUniFund: true } } }] },
            up: { label: "baby_uncle.up", outcomes: [{ result: "baby_uncle.up.r0", effects: { vitals: { health: "++" } } }] },
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
            left: { label: "baby_disposition.left", outcomes: [{ result: "baby_disposition.left.r0", effects: { vitals: { health: "+" }, setTraits: { persSporty: 3 } } }] },
            right: { label: "baby_disposition.right", outcomes: [{ result: "baby_disposition.right.r0", effects: { vitals: { spirit: "+" }, setTraits: { persBookish: 3 } } }] },
            up: { label: "baby_disposition.up", outcomes: [{ result: "baby_disposition.up.r0", effects: { vitals: { health: "++", happiness: "++", spirit: "+" } } }] },
          },
        },
        {
          id: "baby_grandma",
          kind: "one_time",
          prompt: "baby_grandma.prompt",
          options: {
            // setFlaws, not setTraits: a sweet tooth is a lifelong liability, not a
            // boon, so the card shows the burden mark rather than the reward star.
            // The pudding is the ONLY "++" on this card, and the flaw is what pays
            // for it. The other two forgo the spoiling, so each takes the same
            // happiness dip and gains its own smaller thing — otherwise banking the
            // money was a bigger visible prize than the flaw, with nothing to pay.
            left: { label: "baby_grandma.left", outcomes: [{ result: "baby_grandma.left.r0", effects: { vitals: { happiness: "++" }, setFlaws: { flawSweetTooth: true } } }] },
            right: { label: "baby_grandma.right", outcomes: [{ result: "baby_grandma.right.r0", effects: { vitals: { health: "+", happiness: "-" } } }] },
            up: { label: "baby_grandma.up", outcomes: [{ result: "baby_grandma.up.r0", effects: { vitals: { finances: "+", happiness: "-" } } }] },
          },
        },
        {
          id: "baby_vaccine",
          kind: "one_time",
          prompt: "baby_vaccine.prompt",
          options: {
            left: { label: "baby_vaccine.left", outcomes: [{ result: "baby_vaccine.left.r0", effects: { vitals: { health: "+" }, setTraits: { skillVaccinated: true } } }] },
            right: { label: "baby_vaccine.right", outcomes: [{ result: "baby_vaccine.right.r0", effects: { vitals: { spirit: "++" } } }] },
          },
        },
        {
          id: "baby_nursery",
          kind: "one_time",
          prompt: "baby_nursery.prompt",
          options: {
            left: { label: "baby_nursery.left", outcomes: [{ result: "baby_nursery.left.r0", effects: { vitals: { spirit: "+" }, setTraits: { persSociable: true }, incTraits: { socialWarmth: 4 } } }] },
            right: { label: "baby_nursery.right", outcomes: [{ result: "baby_nursery.right.r0", effects: { vitals: { health: "+" } } }] },
          },
        },
        {
          // Also the moment `family` leaves `infant`: from here you are a person
          // who could meet someone, which is what puts the fam_single deck in
          // play. The chip stays hidden until 18 (see the status's `show`) —
          // the deck is doing its work long before it is worth saying out loud.
          id: "baby_schooling",
          kind: "milestone",
          priority: 20,
          conditions: { ageMin: 5 },
          prompt: "baby_schooling.prompt",
          options: {
            left: {
              label: "baby_schooling.left",
              outcomes: [{ result: "baby_schooling.left.r0", effects: { vitals: { spirit: "+" }, setStatus: { age: "child", job: "studying", family: "single" }, addDecks: ["age_childhood", "home_family"], removeDecks: ["age_baby"] } }],
            },
            right: {
              label: "baby_schooling.right",
              outcomes: [{ result: "baby_schooling.right.r0", effects: { vitals: { finances: "+" }, setStatus: { age: "child", job: "child_labourer", family: "single" }, addDecks: ["age_childhood", "home_family"], removeDecks: ["age_baby"] } }],
            },
          },
        },
      ],
    },
] satisfies Deck[];
