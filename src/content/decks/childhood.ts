// Decks — domain group: childhood. Split out of content/index.ts; assembled there.
// Player-facing text is by STRING ID (tables in src/i18n); typed
// `satisfies Deck[]` so a misspelled id is still a compile error.
import type { Deck } from "../../engine/types.ts";

export const childhoodDecks = [

    // --- Childhood (shared): events any child has, school or working. -------
    {
      id: "age_childhood",
      title: "deck.childhood.title",
      unlock: "deck.childhood.blurb",
      cards: [
        {
          id: "child_martialarts",
          kind: "one_time",
          prompt: "child_martialarts.prompt",
          options: {
            left: { label: "child_martialarts.left", outcomes: [{ result: "child_martialarts.left.r0", effects: { vitals: { spirit: "++", health: "+", finances: "-" }, setTraits: { skillMartialArts: true } } }] },
            right: { label: "child_martialarts.right", outcomes: [{ result: "child_martialarts.right.r0", effects: { vitals: { happiness: "+", finances: "+", spirit: "-" } } }] },
          },
        },
        {
          id: "child_bully",
          kind: "one_time",
          conditions: { ageMin: 7 },
          prompt: "child_bully.prompt",
          options: {
            left: {
              label: "child_bully.left",
              outcomes: [
                { if: { traits: { skillMartialArts: true } }, result: "child_bully.left.r0", effects: { vitals: { spirit: "++", happiness: "+", health: "-" } } },
                { result: "child_bully.left.r1", effects: { vitals: { spirit: "+", happiness: "-", health: "--" } } },
              ],
            },
            right: { label: "child_bully.right", outcomes: [{ result: "child_bully.right.r0", effects: { vitals: { happiness: "--", spirit: "-", health: "+" } } }] },
          },
        },
        {
          id: "child_sports",
          kind: "one_time",
          prompt: "child_sports.prompt",
          options: {
            // Going all-out also builds the sporty counter (+1) -- the first
            // youth source toward re-earning what a sporty baby got for free.
            // (Backlog: more +1 sources so youth can actually reach the cap.)
            left: { label: "child_sports.left", outcomes: [{ result: "child_sports.left.r0", effects: { vitals: { health: "++", spirit: "+", happiness: "-" }, incTraits: { persSporty: 1 } } }] },
            right: { label: "child_sports.right", outcomes: [{ result: "child_sports.right.r0", effects: { vitals: { happiness: "+", spirit: "+", health: "-" } } }] },
          },
        },
        // --- Hazards: childhood was deadly. Survival is earned through your
        //     earlier choices (vaccinated, sporty, health kept up, savings). ---
        {
          id: "child_fever",
          kind: "one_time",
          conditions: { ageMin: 6 },
          prompt: "child_fever.prompt",
          options: {
            left: {
              // Fight it through: immune if vaccinated (a scratch); otherwise the
              // fever deals a grievous "---" blow — you pull through only if your
              // health was high enough, else it takes you (netted for a child).
              label: "child_fever.left",
              outcomes: [
                { if: { traits: { skillVaccinated: true } }, result: "child_fever.left.r0", effects: { vitals: { health: "-" } } },
                { result: "child_fever.left.r1", effects: { vitals: { health: "---" } } },
              ],
            },
            right: {
              // Send for the doctor: affordable care (finances >= 30) sees you
              // through; otherwise you go without and the fever deals the grievous
              // "---" blow.
              label: "child_fever.right",
              outcomes: [
                { if: { vitals: { finances: { min: 30 } } }, result: "child_fever.right.r0", effects: { vitals: { finances: "--", health: "-" } } },
                { result: "child_fever.right.r1", effects: { vitals: { health: "---" } } },
              ],
            },
          },
        },
        {
          id: "child_accident",
          kind: "one_time",
          conditions: { ageMin: 5 },
          prompt: "child_accident.prompt",
          options: {
            left: {
              // Leap clear: a clean escape if you're agile (sporty); otherwise the
              // cart deals a grievous "---" blow (−40) — you live only if your
              // health was high, else it's fatal (netted for a child). High
              // risk/reward: brilliant if sporty, deadly if not.
              label: "child_accident.left",
              outcomes: [
                { if: { traits: { persSporty: { min: 3 } } }, result: "child_accident.left.r0", effects: { vitals: { spirit: "+" } } },
                { result: "child_accident.left.r1", effects: { vitals: { health: "---" } } },
              ],
            },
            right: {
              // Throw yourself aside: no clean escape, but a smaller "--" blow (−25)
              // than the leap — survivable from a lower health floor, the safer call
              // when you're not agile (still fatal if you were already frail).
              label: "child_accident.right",
              outcomes: [
                { result: "child_accident.right.r0", effects: { vitals: { health: "--", happiness: "-" } } },
              ],
            },
          },
        },
        {
          // The finances safety net: not drawn normally — it fires (once) the
          // moment you would go bankrupt, catching you before a game-over. The
          // workhouse is the safe landing (no money drain, its own exits); the
          // streets are the free-but-harsh alternative.
          id: "child_hunger",
          kind: "one_time",
          rescue: "finances",
          prompt: "child_hunger.prompt",
          options: {
            // Onto the streets: destitute means your old life ends too. Drop to
            // `unemployed` (not just homeless) so a costly occupation — university
            // tuition especially — stops draining finances the instant the rescue
            // floors you to 1 (which would kill you again next turn, with the
            // one-shot net already spent). Also hands over the job_unemployed deck
            // as your way forward. Housing homeless keeps the streets harsh.
            left: { label: "child_hunger.left", outcomes: [{ result: "child_hunger.left.r0", effects: { vitals: { health: "-", spirit: "+" }, setStatus: { housing: "homeless", job: "unemployed" }, remember: "log.streets" } }] },
            right: { label: "child_hunger.right", outcomes: [{ result: "child_hunger.right.r0", effects: { vitals: { health: "+", spirit: "-" }, setStatus: { housing: "workhouse", job: "pauper" }, remember: "log.workhouse" } }] },
          },
        },
        {
          // The health safety net for children (age <= 13, i.e. up until the
          // move-out card unlocks at 14 and adult life proper begins): the twin
          // of child_hunger. It fires (once) when a child would otherwise die of
          // ill health — a charity hospital takes them in. The rescue floors
          // health to 1; the ward mends you further (health ++) whatever you do,
          // and you ALWAYS leave owing them (flawOwesCharity — you used the net; the
          // debt falls due in young adulthood). The three options differ only in
          // what small extra you take from the stay (spirit / happiness / a few
          // coins). Gated to age <= 13 (findRescue honours conditions), so from
          // 14 on you face ill-health mortality without the net.
          id: "child_charity_hospital",
          kind: "one_time",
          rescue: "health",
          conditions: { ageMax: 13 },
          prompt: "child_charity_hospital.prompt",
          options: {
            left: { label: "child_charity_hospital.left", outcomes: [{ result: "child_charity_hospital.left.r0", effects: { vitals: { health: "++", spirit: "+" }, setFlaws: { flawOwesCharity: true } } }] },
            right: { label: "child_charity_hospital.right", outcomes: [{ result: "child_charity_hospital.right.r0", effects: { vitals: { health: "++", happiness: "+" }, setFlaws: { flawOwesCharity: true } } }] },
            down: { label: "child_charity_hospital.down", outcomes: [{ result: "child_charity_hospital.down.r0", effects: { vitals: { health: "++", finances: "+" }, setFlaws: { flawOwesCharity: true } } }] },
          },
        },

        {
          // Coming of age (18): no longer an ending — it hands childhood off for
          // the young_adult stage deck and carries you into adult life. Both
          // choices transition; they differ only in the mood you carry forward.
          id: "child_adult",
          kind: "milestone",
          priority: 100,
          conditions: { ageMin: 18 },
          prompt: "child_adult.prompt",
          options: {
            left: { label: "child_adult.left", outcomes: [{ result: "child_adult.left.r0", effects: { vitals: { spirit: "+", happiness: "+" }, setStatus: { age: "young_adult", lifestyle: "frugal" }, removeDecks: ["age_childhood"], addDecks: ["age_young_adult", "lifestyle"] } }] },
            right: { label: "child_adult.right", outcomes: [{ result: "child_adult.right.r0", effects: { vitals: { health: "+", finances: "+" }, setStatus: { age: "young_adult", lifestyle: "frugal" }, removeDecks: ["age_childhood"], addDecks: ["age_young_adult", "lifestyle"] } }] },
          },
        },
      ],
    },
] satisfies Deck[];
