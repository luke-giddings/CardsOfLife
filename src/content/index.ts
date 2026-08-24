import type { Content } from "../engine/types.ts";

// ---------------------------------------------------------------------------
// Content — BABY (ages 0–5) then CHILD (ages 5–17), ending at 18 for now.
//
// Vital changes use readable magnitude steps: "+" (small) / "++" (large), and
// "-" / "--" for losses. The point values live in MAGNITUDE_POINTS (types.ts),
// so balancing is one place and every move is a clearly-perceptible size.
// Baby is a tutorial + build-up and is impossible to lose (positive only).
//
// LOCALISATION: player-facing text is NOT inline here — every prompt, option
// label, outcome result, deck title/blurb and status label is a STRING ID,
// looked up per-language in src/i18n. The id fields are typed `StringId`, so a
// misspelled or missing id is a compile error. Id convention (see src/i18n):
//   <cardid>.prompt · <cardid>.<dir> (label) · <cardid>.<dir>.r<i> (result).
//
// CARD ID CONVENTION: every card id is `<deck>_<name>` (e.g. baby_vaccine,
// child_bully, edu_basicschool_exams, job_labour_machine, sibling_play).
//
// DECK NAMING: decks tied to a status are prefixed by that status's kind:
//   edu_*   education status (edu_basicschool; room for edu_grammar etc. later)
//   home_*  housing status   (home_family, home_workhouse)
//   job_*   job status       (job_labour)
// Cross-cutting decks that aren't owned by a single status keep plain names:
// baby, childhood (shared child events), sibling. A status state `addDecks` its
// deck, and changeStatus hands decks over on a status change (leaving `family`
// for `workhouse` swaps home_family out for home_workhouse automatically).
// ---------------------------------------------------------------------------

export const content = {
  start: {
    // Start low and even — babyhood is where the meters get built up (unevenly,
    // by your choices), ready for the child deck to start spending them.
    vitals: { finances: 20, happiness: 20, health: 20, spirit: 20 },
    statuses: { job: "infant", housing: "family", education: "none", lifestyle: "default" },
    decks: ["baby"],
    traits: {},
  },

  statuses: {
    job: {
      id: "job",
      states: {
        infant: { label: "status.job.infant" }, // neutral start; no drain, no employment yet
        // Victorian child labour: a few coins, at a steady cost to health,
        // and it opens the dangerous job_labour deck.
        child_labourer: { label: "status.job.child_labourer", drift: { finances: 5, health: -5 }, addDecks: ["job_labour"] },
        // Learning a trade under a master: a small stipend and no danger — the
        // best way out of the workhouse. Paired with the "apprentice" housing.
        apprentice: { label: "status.job.apprentice", drift: { finances: 5 } },
      },
    },
    housing: {
      id: "housing",
      states: {
        // Home life while living with the family (chores, the sweet shop, a
        // stray to take in). No drain — home is safe.
        family: { label: "status.housing.family", addDecks: ["home_family"] },
        // The workhouse: a grinding health/happiness drain, and its own deck of
        // bleak daily-life events (including three ways out).
        workhouse: { label: "status.housing.workhouse", drift: { health: -5, happiness: -5 }, addDecks: ["home_workhouse"] },
        // Ways out of the workhouse:
        // — bought your way into modest lodgings (safe, no drain; paid up front).
        renting: { label: "status.housing.renting" },
        // — ran away / turned out onto the streets: free, but the hardest grind
        //   of all. (Its own deck & exits are Backlog.)
        homeless: { label: "status.housing.homeless", drift: { health: -5, happiness: -5 } },
        // — taken on by a master tradesman (housed and fed; see job=apprentice).
        apprentice: { label: "status.housing.apprentice" },
      },
    },
    education: {
      id: "education",
      ordered: true,
      levels: ["none", "school"],
      states: { none: { label: "status.education.none" }, school: { label: "status.education.school", addDecks: ["edu_basicschool"] } },
    },
    lifestyle: { id: "lifestyle", states: { default: {} } },
  },

  decks: [
    // --- Baby: ages 0–5. Tutorial + build-up; impossible to lose. -----------
    {
      id: "baby",
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
            right: { label: "baby_uncle.right", outcomes: [{ result: "baby_uncle.right.r0", effects: { vitals: { finances: "+" }, setTraits: { uniFund: true } } }] },
            down: { label: "baby_uncle.down", outcomes: [{ result: "baby_uncle.down.r0", effects: { vitals: { health: "++" } } }] },
          },
        },
        {
          id: "baby_bookworm",
          kind: "one_time",
          prompt: "baby_bookworm.prompt",
          options: {
            left: { label: "baby_bookworm.left", outcomes: [{ result: "baby_bookworm.left.r0", effects: { vitals: { spirit: "+" }, setTraits: { bookish: true } } }] },
            right: { label: "baby_bookworm.right", outcomes: [{ result: "baby_bookworm.right.r0", effects: { vitals: { happiness: "++" } } }] },
          },
        },
        {
          id: "baby_sporty",
          kind: "one_time",
          prompt: "baby_sporty.prompt",
          options: {
            left: { label: "baby_sporty.left", outcomes: [{ result: "baby_sporty.left.r0", effects: { vitals: { health: "+" }, setTraits: { sporty: true } } }] },
            right: { label: "baby_sporty.right", outcomes: [{ result: "baby_sporty.right.r0", effects: { vitals: { health: "++" } } }] },
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
            left: { label: "baby_brother.left", outcomes: [{ result: "baby_brother.left.r0", effects: { vitals: { happiness: "++" }, setTraits: { hasBrother: true }, incTraits: { relBrother: 30 }, addDecks: ["sibling"] } }] },
            right: { label: "baby_brother.right", outcomes: [{ result: "baby_brother.right.r0", effects: { vitals: { spirit: "++" }, setTraits: { hasBrother: true }, incTraits: { relBrother: -15 }, addDecks: ["sibling"] } }] },
          },
        },
        {
          id: "baby_sister",
          kind: "one_time",
          prompt: "baby_sister.prompt",
          options: {
            left: { label: "baby_sister.left", outcomes: [{ result: "baby_sister.left.r0", effects: { vitals: { happiness: "++" }, setTraits: { hasSister: true }, incTraits: { relSister: 30 }, addDecks: ["sibling"] } }] },
            right: { label: "baby_sister.right", outcomes: [{ result: "baby_sister.right.r0", effects: { vitals: { spirit: "++" }, setTraits: { hasSister: true }, incTraits: { relSister: -15 }, addDecks: ["sibling"] } }] },
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
              outcomes: [{ result: "baby_schooling.left.r0", effects: { vitals: { spirit: "+" }, setStatus: { education: "school" }, addDecks: ["childhood", "home_family"], removeDecks: ["baby"] } }],
            },
            right: {
              label: "baby_schooling.right",
              outcomes: [{ result: "baby_schooling.right.r0", effects: { vitals: { finances: "+" }, setStatus: { job: "child_labourer" }, addDecks: ["childhood", "home_family"], removeDecks: ["baby"] } }],
            },
          },
        },
      ],
    },

    // --- Childhood (shared): events any child has, school or working. -------
    {
      id: "childhood",
      title: "deck.childhood.title",
      unlock: "deck.childhood.blurb",
      cards: [
        {
          id: "child_martialarts",
          kind: "one_time",
          prompt: "child_martialarts.prompt",
          options: {
            left: { label: "child_martialarts.left", outcomes: [{ result: "child_martialarts.left.r0", effects: { vitals: { spirit: "++", health: "+", finances: "-" }, setTraits: { knowsMartialArts: true } } }] },
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
                { if: { traits: { knowsMartialArts: true } }, result: "child_bully.left.r0", effects: { vitals: { spirit: "++", happiness: "+", health: "-" } } },
                { result: "child_bully.left.r1", effects: { vitals: { spirit: "+", happiness: "-", health: "--" } } },
              ],
            },
            right: { label: "child_bully.right", outcomes: [{ result: "child_bully.right.r0", effects: { vitals: { happiness: "--", spirit: "-", health: "+" } } }] },
          },
        },
        {
          id: "child_sports",
          kind: "filler",
          prompt: "child_sports.prompt",
          options: {
            left: { label: "child_sports.left", outcomes: [{ result: "child_sports.left.r0", effects: { vitals: { health: "++", spirit: "+", happiness: "-" } } }] },
            right: { label: "child_sports.right", outcomes: [{ result: "child_sports.right.r0", effects: { vitals: { happiness: "+", health: "-", spirit: "-" } } }] },
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
              label: "child_fever.left",
              outcomes: [
                { if: { traits: { vaccinated: true } }, result: "child_fever.left.r0", effects: { vitals: { health: "-" } } },
                { if: { vitals: { health: { min: 50 } } }, result: "child_fever.left.r1", effects: { vitals: { health: "--" } } },
                { result: "child_fever.left.r2", effects: { endGame: "health" } },
              ],
            },
            right: {
              label: "child_fever.right",
              outcomes: [
                { if: { vitals: { finances: { min: 30 } } }, result: "child_fever.right.r0", effects: { vitals: { finances: "--", health: "-" } } },
                { if: { vitals: { health: { min: 40 } } }, result: "child_fever.right.r1", effects: { vitals: { health: "--" } } },
                { result: "child_fever.right.r2", effects: { endGame: "health" } },
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
              label: "child_accident.left",
              outcomes: [
                { if: { traits: { sporty: true } }, result: "child_accident.left.r0", effects: { vitals: { spirit: "+" } } },
                { if: { vitals: { health: { min: 40 } } }, result: "child_accident.left.r1", effects: { vitals: { health: "--" } } },
                { result: "child_accident.left.r2", effects: { endGame: "health" } },
              ],
            },
            right: {
              label: "child_accident.right",
              outcomes: [
                { if: { vitals: { health: { min: 60 } } }, result: "child_accident.right.r0", effects: { vitals: { health: "--", happiness: "-" } } },
                { result: "child_accident.right.r1", effects: { endGame: "health" } },
              ],
            },
          },
        },
        {
          id: "child_hunger",
          kind: "one_time",
          conditions: { ageMin: 6, vitals: { finances: { max: 25 } } },
          prompt: "child_hunger.prompt",
          options: {
            left: { label: "child_hunger.left", outcomes: [{ result: "child_hunger.left.r0", effects: { vitals: { health: "-", spirit: "+" }, setStatus: { housing: "homeless" } } }] },
            right: { label: "child_hunger.right", outcomes: [{ result: "child_hunger.right.r0", effects: { vitals: { health: "+", spirit: "-" }, setStatus: { housing: "workhouse" } } }] },
          },
        },

        {
          id: "child_adult",
          kind: "milestone",
          priority: 100,
          conditions: { ageMin: 18 },
          prompt: "child_adult.prompt",
          options: {
            left: { label: "child_adult.left", outcomes: [{ result: "child_adult.left.r0", effects: { endGame: "grown_up" } }] },
            right: { label: "child_adult.right", outcomes: [{ result: "child_adult.right.r0", effects: { endGame: "grown_up" } }] },
          },
        },
      ],
    },

    // --- Home life with the family: active while housing = family. ----------
    {
      id: "home_family",
      cards: [
        {
          id: "home_family_chores",
          kind: "filler",
          prompt: "home_family_chores.prompt",
          options: {
            left: { label: "home_family_chores.left", outcomes: [{ result: "home_family_chores.left.r0", effects: { vitals: { finances: "+", spirit: "+", happiness: "-" } } }] },
            right: { label: "home_family_chores.right", outcomes: [{ result: "home_family_chores.right.r0", effects: { vitals: { happiness: "+", health: "+", finances: "-" } } }] },
          },
        },
        {
          id: "home_family_sweets",
          kind: "filler",
          prompt: "home_family_sweets.prompt",
          options: {
            left: {
              label: "home_family_sweets.left",
              outcomes: [
                { if: { traits: { sweetTooth: true } }, result: "home_family_sweets.left.r0", effects: { vitals: { happiness: "++", health: "--", finances: "-" } } },
                { result: "home_family_sweets.left.r1", effects: { vitals: { happiness: "+", health: "-", finances: "-" } } },
              ],
            },
            right: {
              label: "home_family_sweets.right",
              outcomes: [
                { if: { traits: { sweetTooth: true } }, result: "home_family_sweets.right.r0", effects: { vitals: { spirit: "++", happiness: "--", finances: "+" } } },
                { result: "home_family_sweets.right.r1", effects: { vitals: { finances: "+", spirit: "+", happiness: "-" } } },
              ],
            },
          },
        },
        {
          id: "home_family_pet",
          kind: "filler",
          prompt: "home_family_pet.prompt",
          options: {
            left: { label: "home_family_pet.left", outcomes: [{ result: "home_family_pet.left.r0", effects: { vitals: { happiness: "++", health: "+", finances: "-" } } }] },
            right: { label: "home_family_pet.right", outcomes: [{ result: "home_family_pet.right.r0", effects: { vitals: { happiness: "-", spirit: "-", finances: "+" } } }] },
          },
        },
      ],
    },

    // --- The workhouse: active while housing = workhouse. Bleak daily life on
    //     top of the drift, plus three ways out. -----------------------------
    {
      id: "home_workhouse",
      title: "deck.home_workhouse.title",
      unlock: "deck.home_workhouse.blurb",
      cards: [
        {
          id: "home_workhouse_gruel",
          kind: "filler",
          prompt: "home_workhouse_gruel.prompt",
          options: {
            left: { label: "home_workhouse_gruel.left", outcomes: [{ result: "home_workhouse_gruel.left.r0", effects: { vitals: { health: "+", happiness: "--", spirit: "+" } } }] },
            right: { label: "home_workhouse_gruel.right", outcomes: [{ result: "home_workhouse_gruel.right.r0", effects: { vitals: { health: "-", spirit: "+", happiness: "-" } } }] },
          },
        },
        {
          id: "home_workhouse_oakum",
          kind: "filler",
          prompt: "home_workhouse_oakum.prompt",
          options: {
            left: { label: "home_workhouse_oakum.left", outcomes: [{ result: "home_workhouse_oakum.left.r0", effects: { vitals: { finances: "+", health: "-" } } }] },
            right: { label: "home_workhouse_oakum.right", outcomes: [{ result: "home_workhouse_oakum.right.r0", effects: { vitals: { spirit: "++", happiness: "+", health: "--" } } }] },
          },
        },
        {
          id: "home_workhouse_friend",
          kind: "filler",
          prompt: "home_workhouse_friend.prompt",
          options: {
            left: { label: "home_workhouse_friend.left", outcomes: [{ result: "home_workhouse_friend.left.r0", effects: { vitals: { happiness: "++", spirit: "+", health: "-" } } }] },
            right: { label: "home_workhouse_friend.right", outcomes: [{ result: "home_workhouse_friend.right.r0", effects: { vitals: { health: "+", spirit: "+", happiness: "--" } } }] },
          },
        },
        {
          id: "home_workhouse_sunday",
          kind: "filler",
          prompt: "home_workhouse_sunday.prompt",
          options: {
            left: { label: "home_workhouse_sunday.left", outcomes: [{ result: "home_workhouse_sunday.left.r0", effects: { vitals: { happiness: "++", spirit: "+", health: "-" } } }] },
            right: { label: "home_workhouse_sunday.right", outcomes: [{ result: "home_workhouse_sunday.right.r0", effects: { vitals: { health: "+", happiness: "-", spirit: "-" } } }] },
          },
        },
        {
          id: "home_workhouse_matron",
          kind: "one_time",
          conditions: { ageMin: 8 },
          prompt: "home_workhouse_matron.prompt",
          options: {
            left: { label: "home_workhouse_matron.left", outcomes: [{ result: "home_workhouse_matron.left.r0", effects: { vitals: { health: "+", happiness: "+", spirit: "--" } } }] },
            right: { label: "home_workhouse_matron.right", outcomes: [{ result: "home_workhouse_matron.right.r0", effects: { vitals: { spirit: "++", health: "-", happiness: "-" } } }] },
          },
        },

        // --- Three ways out. Each changes the housing status (and the
        //     apprenticeship changes the job too), handing the workhouse deck
        //     away. `filler` so declining doesn't burn the chance. -----------
        {
          id: "home_workhouse_buyout",
          kind: "filler",
          conditions: { vitals: { finances: { min: 40 } } },
          prompt: "home_workhouse_buyout.prompt",
          options: {
            left: { label: "home_workhouse_buyout.left", outcomes: [{ result: "home_workhouse_buyout.left.r0", effects: { vitals: { finances: "--", happiness: "++", spirit: "+" }, setStatus: { housing: "renting" } } }] },
            right: { label: "home_workhouse_buyout.right", outcomes: [{ result: "home_workhouse_buyout.right.r0", effects: { vitals: { happiness: "-" } } }] },
          },
        },
        {
          id: "home_workhouse_runaway",
          kind: "filler",
          conditions: { ageMin: 7 },
          prompt: "home_workhouse_runaway.prompt",
          options: {
            left: { label: "home_workhouse_runaway.left", outcomes: [{ result: "home_workhouse_runaway.left.r0", effects: { vitals: { spirit: "++", happiness: "+", health: "-" }, setStatus: { housing: "homeless" } } }] },
            right: { label: "home_workhouse_runaway.right", outcomes: [{ result: "home_workhouse_runaway.right.r0", effects: { vitals: { spirit: "-" } } }] },
          },
        },
        {
          id: "home_workhouse_apprentice",
          kind: "filler",
          conditions: { ageMin: 10 },
          prompt: "home_workhouse_apprentice.prompt",
          options: {
            left: { label: "home_workhouse_apprentice.left", outcomes: [{ result: "home_workhouse_apprentice.left.r0", effects: { vitals: { spirit: "++", finances: "+", happiness: "+" }, setStatus: { housing: "apprentice", job: "apprentice" } } }] },
            right: { label: "home_workhouse_apprentice.right", outcomes: [{ result: "home_workhouse_apprentice.right.r0", effects: { vitals: { happiness: "-" } } }] },
          },
        },
      ],
    },

    // --- Basic school: active while education = school. ----------------------
    {
      id: "edu_basicschool",
      cards: [
        {
          id: "edu_basicschool_exams",
          kind: "one_time",
          conditions: { ageMin: 11 },
          prompt: "edu_basicschool_exams.prompt",
          options: {
            left: { label: "edu_basicschool_exams.left", outcomes: [{ result: "edu_basicschool_exams.left.r0", effects: { vitals: { spirit: "++", happiness: "-", health: "-" } } }] },
            right: { label: "edu_basicschool_exams.right", outcomes: [{ result: "edu_basicschool_exams.right.r0", effects: { vitals: { happiness: "+", health: "+", spirit: "-" } } }] },
          },
        },
        {
          id: "edu_basicschool_crush",
          kind: "one_time",
          conditions: { ageMin: 13 },
          prompt: "edu_basicschool_crush.prompt",
          options: {
            left: { label: "edu_basicschool_crush.left", outcomes: [{ result: "edu_basicschool_crush.left.r0", effects: { vitals: { happiness: "++", spirit: "+", health: "-" } } }] },
            right: { label: "edu_basicschool_crush.right", outcomes: [{ result: "edu_basicschool_crush.right.r0", effects: { vitals: { happiness: "-", spirit: "-", health: "+" } } }] },
          },
        },
        {
          id: "edu_basicschool_friend",
          kind: "filler",
          prompt: "edu_basicschool_friend.prompt",
          options: {
            left: { label: "edu_basicschool_friend.left", outcomes: [{ result: "edu_basicschool_friend.left.r0", effects: { vitals: { happiness: "++", spirit: "-" } } }] },
            right: { label: "edu_basicschool_friend.right", outcomes: [{ result: "edu_basicschool_friend.right.r0", effects: { vitals: { happiness: "-", spirit: "+" } } }] },
          },
        },
        {
          id: "edu_basicschool_prize",
          kind: "filler",
          prompt: "edu_basicschool_prize.prompt",
          options: {
            left: { label: "edu_basicschool_prize.left", outcomes: [{ result: "edu_basicschool_prize.left.r0", effects: { vitals: { spirit: "++", happiness: "+", health: "-" } } }] },
            right: { label: "edu_basicschool_prize.right", outcomes: [{ result: "edu_basicschool_prize.right.r0", effects: { vitals: { happiness: "+", health: "+", spirit: "-" } } }] },
          },
        },
      ],
    },

    // --- Child at work: hazards and events only for the labouring path. ------
    {
      id: "job_labour",
      cards: [
        {
          id: "job_labour_machine",
          kind: "one_time",
          prompt: "job_labour_machine.prompt",
          options: {
            left: {
              label: "job_labour_machine.left",
              outcomes: [
                { if: { traits: { sporty: true } }, result: "job_labour_machine.left.r0", effects: { vitals: { finances: "+", spirit: "+" } } },
                { if: { vitals: { health: { min: 40 } } }, result: "job_labour_machine.left.r1", effects: { vitals: { health: "--", finances: "+" } } },
                { result: "job_labour_machine.left.r2", effects: { endGame: "health" } },
              ],
            },
            right: { label: "job_labour_machine.right", outcomes: [{ result: "job_labour_machine.right.r0", effects: { vitals: { finances: "-", happiness: "-", health: "-" } } }] },
          },
        },
        {
          id: "job_labour_wages",
          kind: "filler",
          prompt: "job_labour_wages.prompt",
          options: {
            left: { label: "job_labour_wages.left", outcomes: [{ result: "job_labour_wages.left.r0", effects: { vitals: { finances: "+", spirit: "+", happiness: "-" } } }] },
            right: { label: "job_labour_wages.right", outcomes: [{ result: "job_labour_wages.right.r0", effects: { vitals: { happiness: "+", finances: "+", spirit: "-" } } }] },
          },
        },
      ],
    },

    // --- Sibling: unlocked by the brother/sister cards. Each option branches
    //     to whichever sibling you have (brother = r0, sister = r1). ----------
    {
      id: "sibling",
      title: "deck.sibling.title",
      unlock: "deck.sibling.blurb",
      cards: [
        {
          id: "sibling_play",
          kind: "filler",
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
          kind: "filler",
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
          kind: "filler",
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
  ],
} satisfies Content;

// `content` above keeps its literal type so authoring stays fully type-checked.
// `gameContent` is the same data widened to `Content` for the engine/UI to read.
export const gameContent: Content = content;
