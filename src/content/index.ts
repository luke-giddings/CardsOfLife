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
// DECK NAMING: status-driven decks are prefixed by their life-area:
//   edu_*   the school path  (edu_basicschool — activated by job=studying;
//           room for edu_grammar etc. later)
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
    statuses: { job: "infant", housing: "family", education: "illiterate", lifestyle: "default" },
    decks: ["baby"],
    traits: {},
  },

  statuses: {
    job: {
      id: "job",
      states: {
        infant: { label: "status.job.infant" }, // neutral start; no drain, no employment yet
        // While at school your "occupation" is studying: no wages and a grind on
        // the spirit. (The money side lives on the housing status — living with
        // family costs money; the labourer's wage offsets it, the pupil's
        // doesn't.) Owns the school-events deck; education records the level.
        studying: { label: "status.job.studying", drift: { spirit: -5 }, addDecks: ["edu_basicschool"] },
        // Left school / lost a job, no work: a grim state with a heavy happiness/
        // spirit drain — you want out fast. Opens the job-offer deck.
        unemployed: { label: "status.job.unemployed", drift: { happiness: -5, spirit: -5 }, addDecks: ["job_unemployed"], keepExperience: true },

        // === FOUR CAREER PATHS ==========================================
        // Progression is by an `experience` counter (ticked by work cards); a
        // promotion card fires at a threshold. Which path you can climb is
        // separated by the `education` credential (see the education status).

        // --- UNSKILLED (no credential; grinds health; caps at tier 2) -----
        // Dangerous child labour → factory hand → gang-master. Decent money
        // early, a hard ceiling. Never a dead-end: the lucky-break apprenticeship
        // crosses you onto the skilled ladder.
        child_labourer: { label: "status.job.child_labourer", drift: { finances: 10, health: -5 }, addDecks: ["job_labour"] },
        factory: { label: "status.job.factory", drift: { finances: 13, health: -5 }, addDecks: ["job_factory"] },
        gang_master: { label: "status.job.gang_master", drift: { finances: 15, health: -5 }, addDecks: ["job_gangmaster"] },

        // --- SKILLED (credential: journeyman → master; safe; high ceiling) -
        // Apprentice is a low-stipend, TIME-LIMITED indenture entered by a
        // lucky break; completing it grants the `journeyman` education
        // credential and the journeyman job. Failing it → unemployed.
        // Apprentice keeps a low stipend (+5) but is HOUSED FREE (apprentice
        // housing, no rent), so it still nets +5 — the dues-paying phase whose
        // real reward is the journeyman/master pay to come.
        apprentice: { label: "status.job.apprentice", drift: { finances: 5 }, addDecks: ["job_apprentice"] },
        journeyman: { label: "status.job.journeyman", drift: { finances: 18 }, addDecks: ["job_journeyman"] },
        master: { label: "status.job.master", drift: { finances: 28 }, addDecks: ["job_master"] },

        // --- EDUCATED (credential: basic/grammar/university; safe; top pay) -
        // Shophand → clerk → solicitor. Entry needs basic schooling; the higher
        // rungs want grammar/university (future schooling content), so for now
        // the path tops out at clerk in normal play.
        shophand: { label: "status.job.shophand", drift: { finances: 12 }, addDecks: ["job_shop"] },
        clerk: { label: "status.job.clerk", drift: { finances: 16, happiness: -5 }, addDecks: ["job_clerk"] },
        solicitor: { label: "status.job.solicitor", drift: { finances: 20, happiness: -5, spirit: -5 }, addDecks: ["job_solicitor"] },

        // --- CRIMINAL (no credential; earn-now via big scores; arrest risk) -
        // Pickpocket has NO wage (0 drift) — money & experience come only from
        // "score" cards. Burglar and fence add a small wage on top of the scores.
        pickpocket: { label: "status.job.pickpocket", addDecks: ["job_criminal"] },
        burglar: { label: "status.job.burglar", drift: { finances: 5, spirit: -5 }, addDecks: ["job_burglar"] },
        fence: { label: "status.job.fence", drift: { finances: 10, spirit: -5 }, addDecks: ["job_fence"] },
      },
    },
    housing: {
      id: "housing",
      states: {
        // Home life while living with the family. Costs money — your keep /
        // your share of the household — which the labourer's wage offsets but
        // the pupil's doesn't. (Suspended in babyhood by the baby deck's
        // noDrift.) Owns the home-life deck.
        family: { label: "status.housing.family", drift: { finances: -5 }, addDecks: ["home_family"] },
        // The workhouse: a grinding health/happiness drain, and its own deck of
        // bleak daily-life events (including three ways out).
        workhouse: { label: "status.housing.workhouse", drift: { health: -5, happiness: -5 }, addDecks: ["home_workhouse"] },
        // A place of your own (from the workhouse buyout, or moving out of the
        // family home): rent to pay every year, but your own space and better
        // conditions restore some health — the childhood preview of the adult
        // "better house → health" ladder. Rent (−10) is set to swallow the base
        // child-labour wage (+10), so a labourer renting nets ~0 money: you get
        // the health recovery, not continued free savings — you only get ahead
        // again on a better wage (promotion/apprenticeship) or the renting deck's
        // income cards (a lodger, etc.). Owns the home_renting deck.
        renting: { label: "status.housing.renting", drift: { finances: -10, health: 5 }, addDecks: ["home_renting"] },
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
      // The credential that separates the four career paths. Only the ACADEMIC
      // ladder is ordered (for `atLeast` gating of the educated path). The TRADE
      // credentials (journeyman, master) are deliberately NOT in `levels`: they
      // gate the skilled path by EXACT match, and because they are off the
      // ordered list a tradesman correctly fails any academic `atLeast` test
      // (and vice versa). You hold one credential at a time — trade OR academic.
      levels: ["illiterate", "basic", "grammar", "university"],
      states: {
        // Academic (educated path): earned at school; higher tiers (grammar,
        // university) are future schooling content.
        illiterate: { label: "status.education.illiterate" },
        basic: { label: "status.education.basic" },
        grammar: { label: "status.education.grammar" },
        university: { label: "status.education.university" },
        // Trade (skilled path): journeyman is earned by completing the
        // apprenticeship; master by rising to the top of the trade.
        journeyman: { label: "status.education.journeyman" },
        master: { label: "status.education.master" },
      },
    },
    lifestyle: { id: "lifestyle", states: { default: {} } },
  },

  decks: [
    // --- Baby: ages 0–5. Tutorial + build-up; impossible to lose. noDrift
    //     suspends status drift (e.g. family living costs) through babyhood. --
    {
      id: "baby",
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
            right: { label: "baby_uncle.right", outcomes: [{ result: "baby_uncle.right.r0", effects: { vitals: { finances: "+" }, setTraits: { uniFund: true } } }] },
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
              outcomes: [{ result: "baby_schooling.left.r0", effects: { vitals: { spirit: "+" }, setStatus: { job: "studying" }, addDecks: ["childhood", "home_family"], removeDecks: ["baby"] } }],
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
          kind: "one_time",
          prompt: "child_sports.prompt",
          options: {
            // Going all-out also builds the sporty counter (+1) -- the first
            // youth source toward re-earning what a sporty baby got for free.
            // (Backlog: more +1 sources so youth can actually reach the cap.)
            left: { label: "child_sports.left", outcomes: [{ result: "child_sports.left.r0", effects: { vitals: { health: "++", spirit: "+", happiness: "-" }, incTraits: { sporty: 1 } } }] },
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
              label: "child_fever.left",
              outcomes: [
                { if: { traits: { vaccinated: true } }, result: "child_fever.left.r0", effects: { vitals: { health: "-" } } },
                { if: { vitals: { health: { min: 30 } } }, result: "child_fever.left.r1", effects: { vitals: { health: "--" } } },
                { result: "child_fever.left.r2", effects: { endGame: "health" } },
              ],
            },
            right: {
              label: "child_fever.right",
              outcomes: [
                { if: { vitals: { finances: { min: 30 } } }, result: "child_fever.right.r0", effects: { vitals: { finances: "--", health: "-" } } },
                { if: { vitals: { health: { min: 30 } } }, result: "child_fever.right.r1", effects: { vitals: { health: "--" } } },
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
                { if: { traits: { sporty: { min: 3 } } }, result: "child_accident.left.r0", effects: { vitals: { spirit: "+" } } },
                { if: { vitals: { health: { min: 40 } } }, result: "child_accident.left.r1", effects: { vitals: { health: "--" } } },
                { result: "child_accident.left.r2", effects: { endGame: "health" } },
              ],
            },
            right: {
              // A clumsier, toughness-based dodge: survives from a lower health
              // floor than the leap, but always costs you — the safer call when
              // you're not sporty, while the leap stays best for the agile.
              label: "child_accident.right",
              outcomes: [
                { if: { vitals: { health: { min: 30 } } }, result: "child_accident.right.r0", effects: { vitals: { health: "-", happiness: "-" } } },
                { result: "child_accident.right.r1", effects: { endGame: "health" } },
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
            left: { label: "child_hunger.left", outcomes: [{ result: "child_hunger.left.r0", effects: { vitals: { health: "-", spirit: "+" }, setStatus: { housing: "homeless" } } }] },
            right: { label: "child_hunger.right", outcomes: [{ result: "child_hunger.right.r0", effects: { vitals: { health: "+", spirit: "-" }, setStatus: { housing: "workhouse" } } }] },
          },
        },
        {
          // The health safety net for the very young (age < 10): the twin of
          // child_hunger. It fires (once) when a small child would otherwise die
          // of ill health — a charity hospital takes them in. The rescue floors
          // health to 1; accepting their ward bumps it further (++), but the
          // ledger remembers (owesCharity) and the debt falls due in young
          // adulthood. Refusing keeps you free of debt but barely mended. Gated
          // to age <= 9 (findRescue honours conditions), so an older child who
          // burns out gets no such mercy.
          id: "child_charity_hospital",
          kind: "one_time",
          rescue: "health",
          conditions: { ageMax: 9 },
          prompt: "child_charity_hospital.prompt",
          options: {
            left: { label: "child_charity_hospital.left", outcomes: [{ result: "child_charity_hospital.left.r0", effects: { vitals: { health: "++", spirit: "+" }, setTraits: { owesCharity: true } } }] },
            right: { label: "child_charity_hospital.right", outcomes: [{ result: "child_charity_hospital.right.r0", effects: { vitals: { health: "+", spirit: "+" } } }] },
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
            left: { label: "child_adult.left", outcomes: [{ result: "child_adult.left.r0", effects: { vitals: { spirit: "+", happiness: "+" }, removeDecks: ["childhood"], addDecks: ["young_adult"] } }] },
            right: { label: "child_adult.right", outcomes: [{ result: "child_adult.right.r0", effects: { vitals: { health: "+", finances: "+" }, removeDecks: ["childhood"], addDecks: ["young_adult"] } }] },
          },
        },
      ],
    },

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

    // --- Home life with the family: active while housing = family. ----------
    {
      id: "home_family",
      cards: [
        {
          id: "home_family_chores",
          kind: "one_time",
          prompt: "home_family_chores.prompt",
          options: {
            left: { label: "home_family_chores.left", outcomes: [{ result: "home_family_chores.left.r0", effects: { vitals: { finances: "++", spirit: "+", happiness: "-" } } }] },
            right: { label: "home_family_chores.right", outcomes: [{ result: "home_family_chores.right.r0", effects: { vitals: { happiness: "+", health: "+", finances: "-" } } }] },
          },
        },
        {
          id: "home_family_sweets",
          kind: "one_time",
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
          kind: "one_time",
          prompt: "home_family_pet.prompt",
          options: {
            left: { label: "home_family_pet.left", outcomes: [{ result: "home_family_pet.left.r0", effects: { vitals: { happiness: "++", health: "+", finances: "-" } } }] },
            right: { label: "home_family_pet.right", outcomes: [{ result: "home_family_pet.right.r0", effects: { vitals: { finances: "+", spirit: "+", happiness: "-" } } }] },
          },
        },
        {
          id: "home_family_market",
          kind: "one_time",
          prompt: "home_family_market.prompt",
          options: {
            left: { label: "home_family_market.left", outcomes: [{ result: "home_family_market.left.r0", effects: { vitals: { finances: "+", spirit: "+", happiness: "-" } } }] },
            right: { label: "home_family_market.right", outcomes: [{ result: "home_family_market.right.r0", effects: { vitals: { happiness: "+", health: "+", finances: "-" } } }] },
          },
        },
        {
          id: "home_family_fair",
          kind: "one_time",
          prompt: "home_family_fair.prompt",
          options: {
            left: { label: "home_family_fair.left", outcomes: [{ result: "home_family_fair.left.r0", effects: { vitals: { happiness: "++", finances: "-", health: "-" } } }] },
            right: { label: "home_family_fair.right", outcomes: [{ result: "home_family_fair.right.r0", effects: { vitals: { finances: "+", spirit: "+", happiness: "-" } } }] },
          },
        },
        {
          id: "home_family_church",
          kind: "one_time",
          prompt: "home_family_church.prompt",
          options: {
            left: { label: "home_family_church.left", outcomes: [{ result: "home_family_church.left.r0", effects: { vitals: { spirit: "++", happiness: "-" } } }] },
            right: { label: "home_family_church.right", outcomes: [{ result: "home_family_church.right.r0", effects: { vitals: { happiness: "+", spirit: "-" } } }] },
          },
        },
        {
          id: "home_family_relative",
          kind: "one_time",
          prompt: "home_family_relative.prompt",
          options: {
            left: { label: "home_family_relative.left", outcomes: [{ result: "home_family_relative.left.r0", effects: { vitals: { finances: "+", spirit: "-" } } }] },
            right: { label: "home_family_relative.right", outcomes: [{ result: "home_family_relative.right.r0", effects: { vitals: { spirit: "+", happiness: "+", finances: "-" } } }] },
          },
        },
        {
          id: "home_family_scrump",
          kind: "one_time",
          prompt: "home_family_scrump.prompt",
          options: {
            left: { label: "home_family_scrump.left", outcomes: [{ result: "home_family_scrump.left.r0", effects: { vitals: { happiness: "++", finances: "+", health: "-" } } }] },
            right: { label: "home_family_scrump.right", outcomes: [{ result: "home_family_scrump.right.r0", effects: { vitals: { spirit: "++", happiness: "-", health: "+" } } }] },
          },
        },
        {
          // A well-off older child can strike out on their own: a big up-front
          // cost, then housing=renting (its own rent/spirit drift), which hands
          // the home_family deck away. `filler` so the offer recurs while you
          // can afford it.
          id: "home_family_moveout",
          kind: "filler",
          // Forced when money maxes out (so full coffers always surface the
          // chance to spend), and available in the pool from finances >= 50.
          force: "finances",
          conditions: { ageMin: 14, vitals: { finances: { min: 50 } } },
          prompt: "home_family_moveout.prompt",
          options: {
            left: { label: "home_family_moveout.left", outcomes: [{ result: "home_family_moveout.left.r0", effects: { vitals: { finances: "---", happiness: "+", spirit: "+" }, setStatus: { housing: "renting" } } }] },
            right: { label: "home_family_moveout.right", outcomes: [{ result: "home_family_moveout.right.r0", effects: { vitals: { happiness: "-" } } }] },
          },
        },
      ],
    },

    // --- A place of your own: active while housing = renting. Flat life on top
    //     of the rent/spirit drift — a lodger for income, the landlord, doing
    //     the place up, neighbours. (First pass / mock-up.) ------------------
    {
      id: "home_renting",
      title: "deck.home_renting.title",
      unlock: "deck.home_renting.blurb",
      cards: [
        {
          id: "home_renting_lodger",
          kind: "one_time",
          prompt: "home_renting_lodger.prompt",
          options: {
            left: { label: "home_renting_lodger.left", outcomes: [{ result: "home_renting_lodger.left.r0", effects: { vitals: { finances: "++", happiness: "-", spirit: "-" } } }] },
            right: { label: "home_renting_lodger.right", outcomes: [{ result: "home_renting_lodger.right.r0", effects: { vitals: { spirit: "++", happiness: "+", finances: "-" } } }] },
          },
        },
        {
          id: "home_renting_landlord",
          kind: "one_time",
          prompt: "home_renting_landlord.prompt",
          options: {
            left: { label: "home_renting_landlord.left", outcomes: [{ result: "home_renting_landlord.left.r0", effects: { vitals: { finances: "--", spirit: "+" } } }] },
            right: { label: "home_renting_landlord.right", outcomes: [{ result: "home_renting_landlord.right.r0", effects: { vitals: { finances: "+", happiness: "-", health: "-" } } }] },
          },
        },
        {
          id: "home_renting_furnish",
          kind: "one_time",
          prompt: "home_renting_furnish.prompt",
          options: {
            left: { label: "home_renting_furnish.left", outcomes: [{ result: "home_renting_furnish.left.r0", effects: { vitals: { happiness: "++", spirit: "+", finances: "-" } } }] },
            right: { label: "home_renting_furnish.right", outcomes: [{ result: "home_renting_furnish.right.r0", effects: { vitals: { finances: "+", happiness: "-", health: "-" } } }] },
          },
        },
        {
          id: "home_renting_neighbour",
          kind: "one_time",
          prompt: "home_renting_neighbour.prompt",
          options: {
            left: { label: "home_renting_neighbour.left", outcomes: [{ result: "home_renting_neighbour.left.r0", effects: { vitals: { happiness: "++", spirit: "+", finances: "-" } } }] },
            right: { label: "home_renting_neighbour.right", outcomes: [{ result: "home_renting_neighbour.right.r0", effects: { vitals: { finances: "+", health: "+", happiness: "-" } } }] },
          },
        },
        {
          id: "home_renting_quiet",
          kind: "one_time",
          prompt: "home_renting_quiet.prompt",
          options: {
            left: { label: "home_renting_quiet.left", outcomes: [{ result: "home_renting_quiet.left.r0", effects: { vitals: { health: "++", spirit: "+", happiness: "-" } } }] },
            right: { label: "home_renting_quiet.right", outcomes: [{ result: "home_renting_quiet.right.r0", effects: { vitals: { happiness: "++", finances: "-", health: "-" } } }] },
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
      // Urgent: the workhouse grind + its three exits own the draw, so you can
      // get out rather than drifting there while childhood flavour draws.
      priority: true,
      cards: [
        {
          id: "home_workhouse_gruel",
          kind: "one_time",
          prompt: "home_workhouse_gruel.prompt",
          options: {
            left: { label: "home_workhouse_gruel.left", outcomes: [{ result: "home_workhouse_gruel.left.r0", effects: { vitals: { health: "+", happiness: "--", spirit: "+" } } }] },
            right: { label: "home_workhouse_gruel.right", outcomes: [{ result: "home_workhouse_gruel.right.r0", effects: { vitals: { health: "-", spirit: "+", happiness: "-" } } }] },
          },
        },
        {
          id: "home_workhouse_oakum",
          kind: "one_time",
          prompt: "home_workhouse_oakum.prompt",
          options: {
            left: { label: "home_workhouse_oakum.left", outcomes: [{ result: "home_workhouse_oakum.left.r0", effects: { vitals: { finances: "+", health: "-" } } }] },
            right: { label: "home_workhouse_oakum.right", outcomes: [{ result: "home_workhouse_oakum.right.r0", effects: { vitals: { spirit: "++", happiness: "+", health: "--" } } }] },
          },
        },
        {
          id: "home_workhouse_friend",
          kind: "one_time",
          prompt: "home_workhouse_friend.prompt",
          options: {
            left: { label: "home_workhouse_friend.left", outcomes: [{ result: "home_workhouse_friend.left.r0", effects: { vitals: { happiness: "++", spirit: "+", health: "-" } } }] },
            right: { label: "home_workhouse_friend.right", outcomes: [{ result: "home_workhouse_friend.right.r0", effects: { vitals: { health: "+", spirit: "+", happiness: "--" } } }] },
          },
        },
        {
          id: "home_workhouse_sunday",
          kind: "one_time",
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
            left: {
              // Studying hard earns the credential (education -> school) — you
              // know your stuff, even if you leave school early afterwards. (The
              // leaver card is the fallback for those who did neither this nor
              // the prize.) A bookish child finds it a pleasure, not a grind.
              label: "edu_basicschool_exams.left",
              outcomes: [
                { if: { traits: { bookish: { min: 3 } } }, result: "edu_basicschool_exams.left.r0", effects: { vitals: { spirit: "++", happiness: "+", health: "-" }, setStatus: { education: "basic" } } },
                { result: "edu_basicschool_exams.left.r1", effects: { vitals: { spirit: "++", happiness: "-", health: "-" }, setStatus: { education: "basic" } } },
              ],
            },
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
            right: { label: "edu_basicschool_crush.right", outcomes: [{ result: "edu_basicschool_crush.right.r0", effects: { vitals: { happiness: "-", spirit: "+", health: "+" } } }] },
          },
        },
        {
          id: "edu_basicschool_friend",
          kind: "one_time",
          prompt: "edu_basicschool_friend.prompt",
          options: {
            left: { label: "edu_basicschool_friend.left", outcomes: [{ result: "edu_basicschool_friend.left.r0", effects: { vitals: { happiness: "++", spirit: "-" } } }] },
            right: { label: "edu_basicschool_friend.right", outcomes: [{ result: "edu_basicschool_friend.right.r0", effects: { vitals: { happiness: "-", spirit: "+" } } }] },
          },
        },
        {
          id: "edu_basicschool_prize",
          kind: "one_time",
          prompt: "edu_basicschool_prize.prompt",
          options: {
            left: {
              // Winning the prize also earns the credential. A bookish child has
              // already half-read the syllabus for fun — an easy win.
              label: "edu_basicschool_prize.left",
              outcomes: [
                { if: { traits: { bookish: { min: 3 } } }, result: "edu_basicschool_prize.left.r0", effects: { vitals: { spirit: "++", happiness: "+" }, setStatus: { education: "basic" } } },
                { result: "edu_basicschool_prize.left.r1", effects: { vitals: { spirit: "++", happiness: "+", health: "-" }, setStatus: { education: "basic" } } },
              ],
            },
            right: { label: "edu_basicschool_prize.right", outcomes: [{ result: "edu_basicschool_prize.right.r0", effects: { vitals: { happiness: "+", health: "+", spirit: "-" } } }] },
          },
        },
        {
          // A money route for the school path (no wages otherwise), so the
          // family living cost is survivable while studying.
          id: "edu_basicschool_errands",
          kind: "filler",
          prompt: "edu_basicschool_errands.prompt",
          options: {
            left: { label: "edu_basicschool_errands.left", outcomes: [{ result: "edu_basicschool_errands.left.r0", effects: { vitals: { finances: "++", health: "-", happiness: "-" } } }] },
            right: { label: "edu_basicschool_errands.right", outcomes: [{ result: "edu_basicschool_errands.right.r0", effects: { vitals: { spirit: "+", health: "+", finances: "-" } } }] },
          },
        },
        {
          // End of basic school. BOTH choices earn the credential (education ->
          // school); only reaching this counts, so dropping out earlier (for
          // work / the workhouse) leaves you "Illiterate". Then either continue
          // studying, or leave to look for work (job -> unemployed).
          id: "edu_basicschool_leaver",
          kind: "milestone",
          priority: 60,
          conditions: { ageMin: 14 },
          prompt: "edu_basicschool_leaver.prompt",
          options: {
            left: { label: "edu_basicschool_leaver.left", outcomes: [{ result: "edu_basicschool_leaver.left.r0", effects: { vitals: { spirit: "+" }, setStatus: { education: "basic" } } }] },
            right: { label: "edu_basicschool_leaver.right", outcomes: [{ result: "edu_basicschool_leaver.right.r0", effects: { vitals: { spirit: "+" }, setStatus: { education: "basic", job: "unemployed" } } }] },
          },
        },
      ],
    },

    // --- Unemployed: active while job = unemployed. A grim state you want out
    //     of fast (heavy happiness/spirit drift). Mostly painful one_time cards
    //     (the deck shrinks toward the exits), plus recurring (filler) job
    //     offers — honest work, or the criminal life. -------------------------
    {
      id: "job_unemployed",
      title: "deck.job_unemployed.title",
      unlock: "deck.job_unemployed.blurb",
      // Urgent: while jobless, the job-hunt/hardship cards own the draw so you
      // aren't stuck for years drawing incidental childhood/home flavour.
      priority: true,
      cards: [
        {
          // Honest work. The shop counter needs your letters and figures
          // (education >= school); the factory floor takes anyone.
          id: "job_unemployed_offer",
          kind: "filler",
          prompt: "job_unemployed_offer.prompt",
          options: {
            left: {
              // Lettered → the shop counter (educated path). Unlettered → no
              // wasted swipe: it's back to casual child-labour (job=child_labourer)
              // — the loom-deck floor, which also keeps the lucky-break
              // apprenticeship in reach. shophand stays literacy-gated. Contrast
              // the right option, which is the steadier factory (no apprentice
              // route). So for the illiterate this is a real choice: the grim
              // floor with a shot at a trade, or the safer mill dead-end.
              label: "job_unemployed_offer.left",
              outcomes: [
                { if: { status: { education: { atLeast: "basic" } } }, result: "job_unemployed_offer.left.r0", effects: { vitals: { spirit: "+" }, setStatus: { job: "shophand" } } },
                { result: "job_unemployed_offer.left.r1", effects: { vitals: { finances: "+" }, setStatus: { job: "child_labourer" } } },
              ],
            },
            // Return to the factory — but only if you've *been* there (the
            // durable `reachedFactory` marker, earned via the child-labour →
            // factory promotion). So a green worker can't use unemployment to
            // skip the years of graft, while a fired factory hand can pick their
            // career back up without re-grinding. Hidden entirely otherwise (no
            // dead/duplicate option), via per-option `if`.
            right: { label: "job_unemployed_offer.right", if: { traits: { reachedFactory: true } }, outcomes: [{ result: "job_unemployed_offer.right.r0", effects: { vitals: { finances: "+" }, setStatus: { job: "factory" } } }] },
            down: { label: "job_unemployed_offer.down", outcomes: [{ result: "job_unemployed_offer.down.r0", effects: { vitals: { spirit: "-" } } }] },
          },
        },
        {
          // A second chance at schooling — but only while you're still young
          // enough (ageMax). Enrolling → job=studying (its edu_basicschool deck),
          // the way onto the EDUCATED path for a child who went to work first.
          id: "job_unemployed_school",
          kind: "filler",
          conditions: { ageMax: 11 },
          prompt: "job_unemployed_school.prompt",
          options: {
            left: { label: "job_unemployed_school.left", outcomes: [{ result: "job_unemployed_school.left.r0", effects: { vitals: { spirit: "+" }, setStatus: { job: "studying" } } }] },
            right: { label: "job_unemployed_school.right", outcomes: [{ result: "job_unemployed_school.right.r0", effects: { vitals: { happiness: "-" } } }] },
          },
        },
        {
          // The criminal offer (Oliver Twist): quick money, at a price.
          id: "job_unemployed_fagin",
          kind: "filler",
          prompt: "job_unemployed_fagin.prompt",
          options: {
            left: { label: "job_unemployed_fagin.left", outcomes: [{ result: "job_unemployed_fagin.left.r0", effects: { vitals: { finances: "+", spirit: "-" }, setStatus: { job: "pickpocket" } } }] },
            right: { label: "job_unemployed_fagin.right", outcomes: [{ result: "job_unemployed_fagin.right.r0", effects: { vitals: { spirit: "+", happiness: "-" } } }] },
          },
        },
        {
          // Painful: pawn your good clothes for a little cash.
          id: "job_unemployed_pawn",
          kind: "one_time",
          prompt: "job_unemployed_pawn.prompt",
          options: {
            left: { label: "job_unemployed_pawn.left", outcomes: [{ result: "job_unemployed_pawn.left.r0", effects: { vitals: { finances: "+", spirit: "-", happiness: "-" } } }] },
            right: { label: "job_unemployed_pawn.right", outcomes: [{ result: "job_unemployed_pawn.right.r0", effects: { vitals: { spirit: "+", health: "-", happiness: "-" } } }] },
          },
        },
        {
          // Painful: the family's patience wears thin.
          id: "job_unemployed_family",
          kind: "one_time",
          prompt: "job_unemployed_family.prompt",
          options: {
            left: { label: "job_unemployed_family.left", outcomes: [{ result: "job_unemployed_family.left.r0", effects: { vitals: { spirit: "-", happiness: "-" } } }] },
            right: { label: "job_unemployed_family.right", outcomes: [{ result: "job_unemployed_family.right.r0", effects: { vitals: { happiness: "--", health: "-", spirit: "+" } } }] },
          },
        },
        {
          // Painful: the long, empty, hopeless days.
          id: "job_unemployed_despair",
          kind: "one_time",
          prompt: "job_unemployed_despair.prompt",
          options: {
            left: { label: "job_unemployed_despair.left", outcomes: [{ result: "job_unemployed_despair.left.r0", effects: { vitals: { spirit: "+", health: "-" } } }] },
            right: { label: "job_unemployed_despair.right", outcomes: [{ result: "job_unemployed_despair.right.r0", effects: { vitals: { happiness: "-", spirit: "-", health: "+" } } }] },
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
              // Working the machine is a shift like any other — it ticks
              // experience (except the outcome where it kills you).
              label: "job_labour_machine.left",
              outcomes: [
                { if: { traits: { sporty: { min: 3 } } }, result: "job_labour_machine.left.r0", effects: { vitals: { finances: "+", spirit: "+" }, incTraits: { experience: 1 } } },
                { if: { vitals: { health: { min: 40 } } }, result: "job_labour_machine.left.r1", effects: { vitals: { health: "--", finances: "+" }, incTraits: { experience: 1 } } },
                { result: "job_labour_machine.left.r2", effects: { endGame: "health" } },
              ],
            },
            right: { label: "job_labour_machine.right", outcomes: [{ result: "job_labour_machine.right.r0", effects: { vitals: { finances: "-", happiness: "-", health: "-" }, incTraits: { experience: 1, jobStrikes: 1 } } }] },
          },
        },
        {
          // Payday. Ticks experience toward the step up to a proper factory job.
          id: "job_labour_wages",
          kind: "filler",
          prompt: "job_labour_wages.prompt",
          options: {
            left: { label: "job_labour_wages.left", outcomes: [{ result: "job_labour_wages.left.r0", effects: { vitals: { finances: "++", spirit: "+", happiness: "-" }, incTraits: { experience: 1 } } }] },
            right: { label: "job_labour_wages.right", outcomes: [{ result: "job_labour_wages.right.r0", effects: { vitals: { happiness: "+", finances: "++", spirit: "-" }, incTraits: { experience: 1 } } }] },
          },
        },
        {
          // Extra work events (one_time): each gives a one-off experience tick
          // toward the factory step and thins the early pool away from the sack,
          // then bows out once played — wages remains the recurring earner.
          id: "job_labour_toil",
          kind: "one_time",
          prompt: "job_labour_toil.prompt",
          options: {
            left: { label: "job_labour_toil.left", outcomes: [{ result: "job_labour_toil.left.r0", effects: { vitals: { finances: "+", health: "-" }, incTraits: { experience: 1 } } }] },
            right: { label: "job_labour_toil.right", outcomes: [{ result: "job_labour_toil.right.r0", effects: { vitals: { spirit: "+", finances: "-" }, incTraits: { experience: 1 } } }] },
          },
        },
        {
          id: "job_labour_errand",
          kind: "one_time",
          prompt: "job_labour_errand.prompt",
          options: {
            left: { label: "job_labour_errand.left", outcomes: [{ result: "job_labour_errand.left.r0", effects: { vitals: { finances: "+", happiness: "-" }, incTraits: { experience: 1 } } }] },
            right: { label: "job_labour_errand.right", outcomes: [{ result: "job_labour_errand.right.r0", effects: { vitals: { happiness: "+", finances: "-" }, incTraits: { experience: 1, jobStrikes: 1 } } }] },
          },
        },
        {
          // The ordinary escape up the UNSKILLED ladder: a steady factory job.
          // Experience-gated (higher than other tier-1 steps because the
          // unskilled path has fewer rungs, so each is a longer haul — a
          // reasonable run only just reaches the factory by ~18).
          id: "job_labour_factory",
          kind: "filler",
          conditions: { traits: { experience: { min: 4 } } },
          prompt: "job_labour_factory.prompt",
          options: {
            left: { label: "job_labour_factory.left", outcomes: [{ result: "job_labour_factory.left.r0", effects: { vitals: { finances: "+" }, setStatus: { job: "factory" }, setTraits: { reachedFactory: true } } }] },
            right: { label: "job_labour_factory.right", outcomes: [{ result: "job_labour_factory.right.r0", effects: { vitals: { happiness: "+" } } }] },
          },
        },
        {
          // The LUCKY BREAK: a master offers to take you on as an apprentice —
          // the crossover from the capped unskilled floor onto the high-ceiling
          // SKILLED ladder. A MILESTONE, so it fires as soon as you qualify
          // (kept your health & spirit up as a labourer past age 13) rather than
          // waiting on a lucky random draw — earned, then guaranteed. Fires once
          // (consumed on either choice): accept → apprentice, or miss your break.
          // The crossover from the capped unskilled floor onto the high-ceiling
          // SKILLED ladder. No longer a health check (health is what labour
          // DRAINS, so gating the escape on it made it unreachable). Instead the
          // apprenticeship is EARNED with the two stats a labourer can actually
          // build through choices — spirit (grit) or happiness (favour) — via
          // two cards. Each is a `filler` that enters the random pool once its
          // stat is high (>= 70) and is `force`d when the stat maxes (100), so
          // it is a growing chance that becomes a certainty, not a blind lucky
          // draw. Age-gated to 13 (force honours conditions), and consumed on
          // either choice: accept -> apprentice, or take the coin and stay put.
          id: "job_labour_apprenticeship_grit",
          kind: "filler",
          force: "spirit",
          // Age-capped at 18: apprentices were bound as minors, and the copy
          // ("the luckiest break of your YOUNG life") only rings true for the
          // young. Past coming-of-age the unskilled adult escapes via the
          // factory step + the wage->house recovery instead, not this.
          conditions: { ageMin: 13, ageMax: 18, vitals: { spirit: { min: 70 } } },
          prompt: "job_labour_apprenticeship.prompt",
          options: {
            left: { label: "job_labour_apprenticeship.left", outcomes: [{ result: "job_labour_apprenticeship.left.r0", effects: { vitals: { spirit: "+", happiness: "+" }, setStatus: { job: "apprentice", housing: "apprentice" } } }] },
            right: { label: "job_labour_apprenticeship.right", outcomes: [{ result: "job_labour_apprenticeship.right.r0", effects: { vitals: { finances: "+", spirit: "-" } } }] },
          },
        },
        {
          // The favour route: a well-liked, cheerful lad the master warms to.
          // Same shape on happiness.
          id: "job_labour_apprenticeship_favour",
          kind: "filler",
          force: "happiness",
          conditions: { ageMin: 13, ageMax: 18, vitals: { happiness: { min: 70 } } },
          prompt: "job_labour_apprenticeship_favour.prompt",
          options: {
            left: { label: "job_labour_apprenticeship_favour.left", outcomes: [{ result: "job_labour_apprenticeship_favour.left.r0", effects: { vitals: { spirit: "+", happiness: "+" }, setStatus: { job: "apprentice", housing: "apprentice" } } }] },
            right: { label: "job_labour_apprenticeship_favour.right", outcomes: [{ result: "job_labour_apprenticeship_favour.right.r0", effects: { vitals: { finances: "+", happiness: "-" } } }] },
          },
        },
        {
          // Job loss → back to unemployed (both left/right accept it). But a
          // worker in decent standing can `down`-swipe to BEG the foreman and
          // keep the job — a humbling save (spirit/happiness cost) that itself
          // adds a strike, so the goodwill runs out: once you've shirked or
          // grovelled enough (jobStrikes > 1) the beg option is hidden and the
          // sacking sticks. Strikes reset when you do change jobs.
          id: "job_labour_sacked",
          kind: "filler",
          prompt: "job_labour_sacked.prompt",
          options: {
            left: { label: "job_labour_sacked.left", outcomes: [{ result: "job_labour_sacked.left.r0", effects: { vitals: { finances: "+" }, setStatus: { job: "unemployed" } } }] },
            right: { label: "job_labour_sacked.right", outcomes: [{ result: "job_labour_sacked.right.r0", effects: { vitals: { spirit: "+", happiness: "-" }, setStatus: { job: "unemployed" } } }] },
            down: { label: "job_labour_sacked.down", if: { traits: { jobStrikes: { max: 1 } } }, outcomes: [{ result: "job_labour_sacked.down.r0", effects: { vitals: { spirit: "-", happiness: "-" }, incTraits: { jobStrikes: 1 } } }] },
          },
        },
      ],
    },

    // --- Job decks (post-school jobs). Each is mostly a job-loss event for now
    //     (→ unemployed); real progression/events are Backlog per the design. --
    {
      id: "job_shop",
      cards: [
        {
          // A day behind the counter. Flavour + a tick of experience toward
          // promotion; the choice trades a little of one vital for another.
          id: "job_shop_day",
          kind: "filler",
          prompt: "job_shop_day.prompt",
          options: {
            left: { label: "job_shop_day.left", outcomes: [{ result: "job_shop_day.left.r0", effects: { vitals: { finances: "+", spirit: "-" }, incTraits: { experience: 1 } } }] },
            right: { label: "job_shop_day.right", outcomes: [{ result: "job_shop_day.right.r0", effects: { vitals: { happiness: "+" }, incTraits: { experience: 1 } } }] },
          },
        },
        {
          // Promotion to clerk. Eligible once you have served your time
          // (experience >= 3). Accept → clerk (reset experience for the next
          // rung); decline → keep your place, a small knock to the spirit.
          id: "job_shop_promote",
          kind: "filler",
          conditions: { traits: { experience: { min: 3 } } },
          prompt: "job_shop_promote.prompt",
          options: {
            left: { label: "job_shop_promote.left", outcomes: [{ result: "job_shop_promote.left.r0", effects: { vitals: { spirit: "+" }, setStatus: { job: "clerk" } } }] },
            right: { label: "job_shop_promote.right", outcomes: [{ result: "job_shop_promote.right.r0", effects: { vitals: { spirit: "-" } } }] },
          },
        },
        {
          id: "job_shop_sacked",
          kind: "filler",
          prompt: "job_shop_sacked.prompt",
          options: {
            left: { label: "job_shop_sacked.left", outcomes: [{ result: "job_shop_sacked.left.r0", effects: { vitals: { spirit: "+" }, setStatus: { job: "unemployed" } } }] },
            right: { label: "job_shop_sacked.right", outcomes: [{ result: "job_shop_sacked.right.r0", effects: { vitals: { spirit: "-", happiness: "-" }, setStatus: { job: "unemployed" } } }] },
          },
        },
      ],
    },
    {
      id: "job_factory",
      cards: [
        {
          // A shift on the floor. Ticks experience; push hard for pay at a cost
          // to health, or pace yourself and keep your strength.
          id: "job_factory_day",
          kind: "filler",
          prompt: "job_factory_day.prompt",
          options: {
            left: { label: "job_factory_day.left", outcomes: [{ result: "job_factory_day.left.r0", effects: { vitals: { finances: "+", health: "-" }, incTraits: { experience: 1 } } }] },
            right: { label: "job_factory_day.right", outcomes: [{ result: "job_factory_day.right.r0", effects: { vitals: { health: "+" }, incTraits: { experience: 1 } } }] },
          },
        },
        {
          // Promotion to gang-master (the UNSKILLED ceiling — no tier 3) once
          // experienced enough (>= 3).
          id: "job_factory_promote",
          kind: "filler",
          conditions: { traits: { experience: { min: 3 } } },
          prompt: "job_factory_promote.prompt",
          options: {
            left: { label: "job_factory_promote.left", outcomes: [{ result: "job_factory_promote.left.r0", effects: { vitals: { finances: "+" }, setStatus: { job: "gang_master" } } }] },
            right: { label: "job_factory_promote.right", outcomes: [{ result: "job_factory_promote.right.r0", effects: { vitals: { happiness: "+" } } }] },
          },
        },
        {
          id: "job_factory_sacked",
          kind: "filler",
          prompt: "job_factory_sacked.prompt",
          options: {
            left: { label: "job_factory_sacked.left", outcomes: [{ result: "job_factory_sacked.left.r0", effects: { vitals: { health: "-" }, setStatus: { job: "unemployed" } } }] },
            right: { label: "job_factory_sacked.right", outcomes: [{ result: "job_factory_sacked.right.r0", effects: { vitals: { spirit: "+", happiness: "-" }, setStatus: { job: "unemployed" } } }] },
          },
        },
      ],
    },
    {
      id: "job_apprentice",
      cards: [
        {
          // Learning the trade at the bench. Low stipend; ticks experience
          // toward qualifying. A real trade-off: GRAFT (spirit + health cost)
          // learns the trade twice as fast (experience +2), or take it STEADY
          // (happiness +) at the ordinary pace (+1). Neither dominates -- rush
          // the qualification through your body, or enjoy the craft the slow way.
          id: "job_apprentice_day",
          kind: "filler",
          prompt: "job_apprentice_day.prompt",
          options: {
            left: { label: "job_apprentice_day.left", outcomes: [{ result: "job_apprentice_day.left.r0", effects: { vitals: { spirit: "-", health: "-" }, incTraits: { experience: 2 } } }] },
            right: { label: "job_apprentice_day.right", outcomes: [{ result: "job_apprentice_day.right.r0", effects: { vitals: { happiness: "+" }, incTraits: { experience: 1 } } }] },
          },
        },
        // One-shot bench jobs: each is a GUARANTEED tick of experience toward the
        // trial (both options +1), so reaching the qualifying threshold isn't
        // hostage to the day-vs-sack coin flip. They also thin the early pool
        // away from `_end`, then bow out once played -- the same pattern the
        // labour deck uses (toil/errand/machine).
        {
          id: "job_apprentice_errand",
          kind: "one_time",
          prompt: "job_apprentice_errand.prompt",
          options: {
            left: { label: "job_apprentice_errand.left", outcomes: [{ result: "job_apprentice_errand.left.r0", effects: { vitals: { health: "-" }, incTraits: { experience: 1 } } }] },
            right: { label: "job_apprentice_errand.right", outcomes: [{ result: "job_apprentice_errand.right.r0", effects: { vitals: { happiness: "+", finances: "-" }, incTraits: { experience: 1 } } }] },
          },
        },
        {
          id: "job_apprentice_tools",
          kind: "one_time",
          prompt: "job_apprentice_tools.prompt",
          options: {
            left: { label: "job_apprentice_tools.left", outcomes: [{ result: "job_apprentice_tools.left.r0", effects: { vitals: { spirit: "+", health: "-" }, incTraits: { experience: 1 } } }] },
            right: { label: "job_apprentice_tools.right", outcomes: [{ result: "job_apprentice_tools.right.r0", effects: { vitals: { happiness: "+" }, incTraits: { experience: 1 } } }] },
          },
        },
        {
          id: "job_apprentice_market",
          kind: "one_time",
          prompt: "job_apprentice_market.prompt",
          options: {
            left: { label: "job_apprentice_market.left", outcomes: [{ result: "job_apprentice_market.left.r0", effects: { vitals: { finances: "+", happiness: "-" }, incTraits: { experience: 1 } } }] },
            right: { label: "job_apprentice_market.right", outcomes: [{ result: "job_apprentice_market.right.r0", effects: { vitals: { spirit: "+", finances: "-" }, incTraits: { experience: 1 } } }] },
          },
        },
        {
          // TIME-LIMIT: the indenture is up (experience >= 4). A MILESTONE, so it
          // jumps the queue and forces a resolution — you can't apprentice
          // forever. Sit the trial (left): PASS if you kept your health up
          // through the graft → journeyman job + `journeyman` credential
          // (experience reset for the climb to master); FAIL if run-down → back
          // to unemployed, no credential. Or walk away (right) → unemployed.
          id: "job_apprentice_qualify",
          kind: "milestone",
          priority: 50,
          // Repeatable: you may serve more than one apprenticeship in a life
          // (e.g. after a first one fails), and each must reach its own trial.
          copies: 99,
          conditions: { traits: { experience: { min: 4 } } },
          prompt: "job_apprentice_qualify.prompt",
          // Leaving the master's roof (pass or fail) returns you to whatever
          // housing you had BEFORE the apprenticeship (`restoreHousing`) — the
          // job ladder never silently grants or strips a home. You climb the
          // housing ladder separately, on its own cards.
          options: {
            left: {
              label: "job_apprentice_qualify.left",
              outcomes: [
                { if: { vitals: { health: { min: 35 } } }, result: "job_apprentice_qualify.left.r0", effects: { vitals: { spirit: "++", happiness: "+" }, setStatus: { job: "journeyman", education: "journeyman" }, restoreHousing: true } },
                { result: "job_apprentice_qualify.left.r1", effects: { vitals: { spirit: "--", happiness: "-" }, setStatus: { job: "unemployed" }, restoreHousing: true } },
              ],
            },
            right: { label: "job_apprentice_qualify.right", outcomes: [{ result: "job_apprentice_qualify.right.r0", effects: { vitals: { happiness: "-" }, setStatus: { job: "unemployed" }, restoreHousing: true } }] },
          },
        },
        {
          // The master's workshop closes before you qualify. Not a dead end any
          // more: `down` = seek another master to take over your indenture, so a
          // closure needn't cost you the trade (like begging to keep a job). It
          // keeps you an apprentice AND your experience, at a real cost (finances
          // + happiness -- the upheaval and lost time). Otherwise leave: with
          // PRIDE (spirit) and no coin, or press the ailing master for the
          // indenture's worth (MONEY, but a bitter parting).
          id: "job_apprentice_end",
          kind: "filler",
          options: {
            left: { label: "job_apprentice_end.left", outcomes: [{ result: "job_apprentice_end.left.r0", effects: { vitals: { spirit: "+" }, setStatus: { job: "unemployed" }, restoreHousing: true } }] },
            right: { label: "job_apprentice_end.right", outcomes: [{ result: "job_apprentice_end.right.r0", effects: { vitals: { finances: "+", happiness: "-" }, setStatus: { job: "unemployed" }, restoreHousing: true } }] },
            down: { label: "job_apprentice_end.down", outcomes: [{ result: "job_apprentice_end.down.r0", effects: { vitals: { finances: "-", happiness: "-" } } }] },
          },
          prompt: "job_apprentice_end.prompt",
        },
      ],
    },
    {
      id: "job_criminal",
      cards: [
        {
          // A SCORE card. Pulling the job is the only way to earn (there is no
          // wage) and the only thing that grants experience: a big one-off haul
          // (finances "++") at a cost to the spirit. Backing off gains nothing
          // but a clear conscience — and the rent still bites.
          id: "job_criminal_job",
          kind: "filler",
          prompt: "job_criminal_job.prompt",
          options: {
            left: { label: "job_criminal_job.left", outcomes: [{ result: "job_criminal_job.left.r0", effects: { vitals: { finances: "++", spirit: "-" }, incTraits: { experience: 1 } } }] },
            right: { label: "job_criminal_job.right", outcomes: [{ result: "job_criminal_job.right.r0", effects: { vitals: { spirit: "+" } } }] },
          },
        },
        {
          // A second SCORE — a riskier, richer mark. Big haul + experience, a
          // heavier spirit cost; walking away leaves you empty-handed but calm.
          id: "job_criminal_score",
          kind: "filler",
          prompt: "job_criminal_score.prompt",
          options: {
            left: { label: "job_criminal_score.left", outcomes: [{ result: "job_criminal_score.left.r0", effects: { vitals: { finances: "++", spirit: "--" }, incTraits: { experience: 1 } } }] },
            right: { label: "job_criminal_score.right", outcomes: [{ result: "job_criminal_score.right.r0", effects: { vitals: { spirit: "+", happiness: "-" } } }] },
          },
        },
        {
          // Promotion to burglar once experienced enough (>= 3): the big time.
          id: "job_criminal_promote",
          kind: "filler",
          conditions: { traits: { experience: { min: 3 } } },
          prompt: "job_criminal_promote.prompt",
          options: {
            left: { label: "job_criminal_promote.left", outcomes: [{ result: "job_criminal_promote.left.r0", effects: { vitals: { finances: "+" }, setStatus: { job: "burglar" } } }] },
            right: { label: "job_criminal_promote.right", outcomes: [{ result: "job_criminal_promote.right.r0", effects: { vitals: { spirit: "+", finances: "-" } } }] },
          },
        },
        {
          // Arrest is rougher than an honest sacking (a real prison status is
          // Backlog); for now it dumps you back to unemployed with a penalty.
          id: "job_criminal_nicked",
          kind: "filler",
          prompt: "job_criminal_nicked.prompt",
          options: {
            left: { label: "job_criminal_nicked.left", outcomes: [{ result: "job_criminal_nicked.left.r0", effects: { vitals: { finances: "--", health: "-" }, setStatus: { job: "unemployed" } } }] },
            right: { label: "job_criminal_nicked.right", outcomes: [{ result: "job_criminal_nicked.right.r0", effects: { vitals: { health: "-", happiness: "-", spirit: "-" }, setStatus: { job: "unemployed" } } }] },
          },
        },
      ],
    },

    // === UPPER-TIER JOB DECKS ============================================
    // Each has a work-event card (ticks experience) and a job-loss card
    // (→ unemployed); climbable tiers add a promotion card.

    // --- Educated: clerk (tier 2). Promotion to solicitor needs GRAMMAR
    //     schooling (future content), so in normal play this is the ceiling. ---
    {
      id: "job_clerk",
      cards: [
        {
          id: "job_clerk_day",
          kind: "filler",
          prompt: "job_clerk_day.prompt",
          options: {
            left: { label: "job_clerk_day.left", outcomes: [{ result: "job_clerk_day.left.r0", effects: { vitals: { finances: "+", happiness: "-" }, incTraits: { experience: 1 } } }] },
            right: { label: "job_clerk_day.right", outcomes: [{ result: "job_clerk_day.right.r0", effects: { vitals: { spirit: "+" }, incTraits: { experience: 1 } } }] },
          },
        },
        {
          // Promotion to solicitor: needs both experience AND grammar-school
          // education (an academic `atLeast` gate). Dormant until grammar/
          // university schooling exists — the educated path's high ceiling.
          id: "job_clerk_promote",
          kind: "filler",
          conditions: { traits: { experience: { min: 3 } }, status: { education: { atLeast: "grammar" } } },
          prompt: "job_clerk_promote.prompt",
          options: {
            left: { label: "job_clerk_promote.left", outcomes: [{ result: "job_clerk_promote.left.r0", effects: { vitals: { spirit: "+" }, setStatus: { job: "solicitor" } } }] },
            right: { label: "job_clerk_promote.right", outcomes: [{ result: "job_clerk_promote.right.r0", effects: { vitals: { spirit: "-" } } }] },
          },
        },
        {
          id: "job_clerk_sacked",
          kind: "filler",
          prompt: "job_clerk_sacked.prompt",
          options: {
            left: { label: "job_clerk_sacked.left", outcomes: [{ result: "job_clerk_sacked.left.r0", effects: { vitals: { spirit: "+" }, setStatus: { job: "unemployed" } } }] },
            right: { label: "job_clerk_sacked.right", outcomes: [{ result: "job_clerk_sacked.right.r0", effects: { vitals: { spirit: "-", happiness: "-" }, setStatus: { job: "unemployed" } } }] },
          },
        },
      ],
    },
    {
      id: "job_solicitor",
      cards: [
        {
          id: "job_solicitor_day",
          kind: "filler",
          prompt: "job_solicitor_day.prompt",
          options: {
            left: { label: "job_solicitor_day.left", outcomes: [{ result: "job_solicitor_day.left.r0", effects: { vitals: { finances: "++", happiness: "-" }, incTraits: { experience: 1 } } }] },
            right: { label: "job_solicitor_day.right", outcomes: [{ result: "job_solicitor_day.right.r0", effects: { vitals: { spirit: "+" }, incTraits: { experience: 1 } } }] },
          },
        },
        {
          id: "job_solicitor_ruin",
          kind: "filler",
          prompt: "job_solicitor_ruin.prompt",
          options: {
            left: { label: "job_solicitor_ruin.left", outcomes: [{ result: "job_solicitor_ruin.left.r0", effects: { vitals: { spirit: "+" }, setStatus: { job: "unemployed" } } }] },
            right: { label: "job_solicitor_ruin.right", outcomes: [{ result: "job_solicitor_ruin.right.r0", effects: { vitals: { happiness: "--", spirit: "-" }, setStatus: { job: "unemployed" } } }] },
          },
        },
      ],
    },

    // --- Unskilled ceiling: gang-master (tier 2, no promotion). --------------
    {
      id: "job_gangmaster",
      cards: [
        {
          id: "job_gangmaster_day",
          kind: "filler",
          prompt: "job_gangmaster_day.prompt",
          options: {
            left: { label: "job_gangmaster_day.left", outcomes: [{ result: "job_gangmaster_day.left.r0", effects: { vitals: { finances: "+", health: "-" }, incTraits: { experience: 1 } } }] },
            right: { label: "job_gangmaster_day.right", outcomes: [{ result: "job_gangmaster_day.right.r0", effects: { vitals: { spirit: "+" }, incTraits: { experience: 1 } } }] },
          },
        },
        {
          id: "job_gangmaster_sacked",
          kind: "filler",
          prompt: "job_gangmaster_sacked.prompt",
          options: {
            left: { label: "job_gangmaster_sacked.left", outcomes: [{ result: "job_gangmaster_sacked.left.r0", effects: { vitals: { spirit: "+" }, setStatus: { job: "unemployed" } } }] },
            right: { label: "job_gangmaster_sacked.right", outcomes: [{ result: "job_gangmaster_sacked.right.r0", effects: { vitals: { health: "-", happiness: "-" }, setStatus: { job: "unemployed" } } }] },
          },
        },
      ],
    },

    // --- Skilled: journeyman (tier 2) → master (tier 3). --------------------
    {
      id: "job_journeyman",
      cards: [
        {
          id: "job_journeyman_day",
          kind: "filler",
          prompt: "job_journeyman_day.prompt",
          options: {
            left: { label: "job_journeyman_day.left", outcomes: [{ result: "job_journeyman_day.left.r0", effects: { vitals: { finances: "+", health: "-" }, incTraits: { experience: 1 } } }] },
            right: { label: "job_journeyman_day.right", outcomes: [{ result: "job_journeyman_day.right.r0", effects: { vitals: { spirit: "+" }, incTraits: { experience: 1 } } }] },
          },
        },
        {
          // Promotion to master (skilled tier 3): experience-gated; also records
          // the `master` trade credential.
          id: "job_journeyman_promote",
          kind: "filler",
          conditions: { traits: { experience: { min: 4 } } },
          prompt: "job_journeyman_promote.prompt",
          options: {
            left: { label: "job_journeyman_promote.left", outcomes: [{ result: "job_journeyman_promote.left.r0", effects: { vitals: { spirit: "++", finances: "+" }, setStatus: { job: "master", education: "master" } } }] },
            right: { label: "job_journeyman_promote.right", outcomes: [{ result: "job_journeyman_promote.right.r0", effects: { vitals: { spirit: "-" } } }] },
          },
        },
        {
          id: "job_journeyman_sacked",
          kind: "filler",
          prompt: "job_journeyman_sacked.prompt",
          options: {
            left: { label: "job_journeyman_sacked.left", outcomes: [{ result: "job_journeyman_sacked.left.r0", effects: { vitals: { spirit: "+" }, setStatus: { job: "unemployed" } } }] },
            right: { label: "job_journeyman_sacked.right", outcomes: [{ result: "job_journeyman_sacked.right.r0", effects: { vitals: { health: "-", happiness: "-" }, setStatus: { job: "unemployed" } } }] },
          },
        },
      ],
    },
    {
      id: "job_master",
      cards: [
        {
          id: "job_master_day",
          kind: "filler",
          prompt: "job_master_day.prompt",
          options: {
            left: { label: "job_master_day.left", outcomes: [{ result: "job_master_day.left.r0", effects: { vitals: { finances: "++", health: "-" }, incTraits: { experience: 1 } } }] },
            right: { label: "job_master_day.right", outcomes: [{ result: "job_master_day.right.r0", effects: { vitals: { spirit: "+", happiness: "+" }, incTraits: { experience: 1 } } }] },
          },
        },
        {
          id: "job_master_ruin",
          kind: "filler",
          prompt: "job_master_ruin.prompt",
          options: {
            left: { label: "job_master_ruin.left", outcomes: [{ result: "job_master_ruin.left.r0", effects: { vitals: { spirit: "+" }, setStatus: { job: "unemployed" } } }] },
            right: { label: "job_master_ruin.right", outcomes: [{ result: "job_master_ruin.right.r0", effects: { vitals: { happiness: "--", health: "-" }, setStatus: { job: "unemployed" } } }] },
          },
        },
      ],
    },

    // --- Criminal: burglar (tier 2, small wage + scores) → fence (tier 3). ---
    {
      id: "job_burglar",
      cards: [
        {
          id: "job_burglar_job",
          kind: "filler",
          prompt: "job_burglar_job.prompt",
          options: {
            left: { label: "job_burglar_job.left", outcomes: [{ result: "job_burglar_job.left.r0", effects: { vitals: { finances: "++", spirit: "-" }, incTraits: { experience: 1 } } }] },
            right: { label: "job_burglar_job.right", outcomes: [{ result: "job_burglar_job.right.r0", effects: { vitals: { happiness: "+", finances: "-" }, incTraits: { experience: 1 } } }] },
          },
        },
        {
          // Promotion to fence (criminal tier 3): run the trade rather than the
          // risk. Experience-gated.
          id: "job_burglar_promote",
          kind: "filler",
          conditions: { traits: { experience: { min: 3 } } },
          prompt: "job_burglar_promote.prompt",
          options: {
            left: { label: "job_burglar_promote.left", outcomes: [{ result: "job_burglar_promote.left.r0", effects: { vitals: { finances: "+", spirit: "-" }, setStatus: { job: "fence" } } }] },
            right: { label: "job_burglar_promote.right", outcomes: [{ result: "job_burglar_promote.right.r0", effects: { vitals: { spirit: "+" } } }] },
          },
        },
        {
          // Caught on a job: worse than a pickpocket's nicking (a real prison
          // status is Backlog) — dumped back to unemployed, badly shaken.
          id: "job_burglar_nicked",
          kind: "filler",
          prompt: "job_burglar_nicked.prompt",
          options: {
            left: { label: "job_burglar_nicked.left", outcomes: [{ result: "job_burglar_nicked.left.r0", effects: { vitals: { finances: "--", health: "--" }, setStatus: { job: "unemployed" } } }] },
            right: { label: "job_burglar_nicked.right", outcomes: [{ result: "job_burglar_nicked.right.r0", effects: { vitals: { health: "-", spirit: "--", happiness: "-" }, setStatus: { job: "unemployed" } } }] },
          },
        },
      ],
    },
    {
      id: "job_fence",
      cards: [
        {
          // The fence deals in others' loot: a big score at a spirit cost, or
          // lie low. Small wage from the status drift on top.
          id: "job_fence_deal",
          kind: "filler",
          prompt: "job_fence_deal.prompt",
          options: {
            left: { label: "job_fence_deal.left", outcomes: [{ result: "job_fence_deal.left.r0", effects: { vitals: { finances: "++", spirit: "-" }, incTraits: { experience: 1 } } }] },
            right: { label: "job_fence_deal.right", outcomes: [{ result: "job_fence_deal.right.r0", effects: { vitals: { spirit: "+" } } }] },
          },
        },
        {
          // A raid on the receiving-house: the law finally comes for the fence.
          id: "job_fence_raid",
          kind: "filler",
          prompt: "job_fence_raid.prompt",
          options: {
            left: { label: "job_fence_raid.left", outcomes: [{ result: "job_fence_raid.left.r0", effects: { vitals: { finances: "--", health: "-" }, setStatus: { job: "unemployed" } } }] },
            right: { label: "job_fence_raid.right", outcomes: [{ result: "job_fence_raid.right.r0", effects: { vitals: { spirit: "--", happiness: "-" }, setStatus: { job: "unemployed" } } }] },
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
  ],
} satisfies Content;

// `content` above keeps its literal type so authoring stays fully type-checked.
// `gameContent` is the same data widened to `Content` for the engine/UI to read.
export const gameContent: Content = content;
