// Decks — domain group: jobs. Split out of content/index.ts; assembled there.
// Player-facing text is by STRING ID (tables in src/i18n); typed
// `satisfies Deck[]` so a misspelled id is still a compile error.
import type { Deck } from "../../engine/types.ts";

export const jobDecks = [

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
              // Resume the career your CREDENTIAL fits — each education level
              // re-enters its own ladder at the bottom rung: university → junior
              // physician (medicine), grammar → clerk (clerkly/law), basic → shop
              // assistant (commerce). Unlettered → no wasted swipe: back to casual
              // child-labour (the loom-deck floor, which keeps the lucky-break
              // apprenticeship in reach). Outcomes resolve top-to-bottom, so the
              // highest credential wins. Contrast the right option (the steadier
              // factory), so the illiterate still get a real choice.
              label: "job_unemployed_offer.left",
              outcomes: [
                { if: { status: { education: { atLeast: "university" } } }, result: "job_unemployed_offer.left.r2", effects: { vitals: { spirit: "+" }, setStatus: { job: "physician_junior" } } },
                { if: { status: { education: { atLeast: "grammar" } } }, result: "job_unemployed_offer.left.r3", effects: { vitals: { spirit: "+" }, setStatus: { job: "clerk" } } },
                { if: { status: { education: { atLeast: "basic" } } }, result: "job_unemployed_offer.left.r0", effects: { vitals: { spirit: "+" }, setStatus: { job: "shophand" } } },
                { result: "job_unemployed_offer.left.r1", effects: { vitals: { finances: "+" }, setStatus: { job: "child_labourer" } } },
              ],
            },
            // Return to the factory — but only if you've *been* there (the
            // durable `jobReachedFactory` marker, earned via the child-labour →
            // factory promotion). So a green worker can't use unemployment to
            // skip the years of graft, while a fired factory hand can pick their
            // career back up without re-grinding. Hidden entirely otherwise (no
            // dead/duplicate option), via per-option `if`.
            right: { label: "job_unemployed_offer.right", if: { traits: { jobReachedFactory: true } }, outcomes: [{ result: "job_unemployed_offer.right.r0", effects: { vitals: { finances: "+" }, setStatus: { job: "factory" } } }] },
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
            // A real trade: schooling is the future (spirit + the education path,
            // ★) but a hard, penniless road now (happiness −); keeping on the job
            // hunt scrapes a little casual coin now (finances +) but no letters.
            left: { label: "job_unemployed_school.left", outcomes: [{ result: "job_unemployed_school.left.r0", effects: { vitals: { spirit: "+", happiness: "-" }, setStatus: { job: "studying" } } }] },
            right: { label: "job_unemployed_school.right", outcomes: [{ result: "job_unemployed_school.right.r0", effects: { vitals: { finances: "+" } } }] },
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
                { if: { traits: { sporty: { min: 3 } } }, result: "job_labour_machine.left.r0", effects: { vitals: { finances: "+", spirit: "+" }, incTraits: { jobExperience: 1 } } },
                { if: { vitals: { health: { min: 40 } } }, result: "job_labour_machine.left.r1", effects: { vitals: { health: "--", finances: "+" }, incTraits: { jobExperience: 1 } } },
                { result: "job_labour_machine.left.r2", effects: { endGame: "health" } },
              ],
            },
            right: { label: "job_labour_machine.right", outcomes: [{ result: "job_labour_machine.right.r0", effects: { vitals: { finances: "-", happiness: "-", health: "-" }, incTraits: { jobExperience: 1, jobStrikes: 1 } } }] },
          },
        },
        {
          // Payday. Ticks experience toward the step up to a proper factory job.
          id: "job_labour_wages",
          kind: "filler",
          prompt: "job_labour_wages.prompt",
          options: {
            left: { label: "job_labour_wages.left", outcomes: [{ result: "job_labour_wages.left.r0", effects: { vitals: { finances: "++", spirit: "+", happiness: "-" }, incTraits: { jobExperience: 1 } } }] },
            right: { label: "job_labour_wages.right", outcomes: [{ result: "job_labour_wages.right.r0", effects: { vitals: { happiness: "+", finances: "++", spirit: "-" }, incTraits: { jobExperience: 1 } } }] },
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
            left: { label: "job_labour_toil.left", outcomes: [{ result: "job_labour_toil.left.r0", effects: { vitals: { finances: "+", health: "-" }, incTraits: { jobExperience: 1 } } }] },
            right: { label: "job_labour_toil.right", outcomes: [{ result: "job_labour_toil.right.r0", effects: { vitals: { spirit: "+", finances: "-" }, incTraits: { jobExperience: 1 } } }] },
          },
        },
        {
          id: "job_labour_errand",
          kind: "one_time",
          prompt: "job_labour_errand.prompt",
          options: {
            left: { label: "job_labour_errand.left", outcomes: [{ result: "job_labour_errand.left.r0", effects: { vitals: { finances: "+", happiness: "-" }, incTraits: { jobExperience: 1 } } }] },
            right: { label: "job_labour_errand.right", outcomes: [{ result: "job_labour_errand.right.r0", effects: { vitals: { happiness: "+", finances: "-" }, incTraits: { jobExperience: 1, jobStrikes: 1 } } }] },
          },
        },
        {
          // The ordinary escape up the UNSKILLED ladder: a steady factory job.
          // Experience-gated (higher than other tier-1 steps because the
          // unskilled path has fewer rungs, so each is a longer haul — a
          // reasonable run only just reaches the factory by ~18).
          id: "job_labour_factory",
          kind: "filler",
          conditions: { traits: { jobExperience: { min: 4 } } },
          prompt: "job_labour_factory.prompt",
          options: {
            left: { label: "job_labour_factory.left", outcomes: [{ result: "job_labour_factory.left.r0", effects: { vitals: { finances: "+" }, setStatus: { job: "factory" }, setTraits: { jobReachedFactory: true } } }] },
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
            left: { label: "job_shop_day.left", outcomes: [{ result: "job_shop_day.left.r0", effects: { vitals: { finances: "+", spirit: "-" }, incTraits: { jobExperience: 1 } } }] },
            right: { label: "job_shop_day.right", outcomes: [{ result: "job_shop_day.right.r0", effects: { vitals: { happiness: "+" }, incTraits: { jobExperience: 1 } } }] },
          },
        },
        {
          // COMMERCE ladder rung: shop assistant → shopkeeper (your own shop).
          // Eligible once you've served your time (experience >= 3). Accept →
          // shopkeeper (experience resets for the next rung); decline → stay put.
          id: "job_shop_promote",
          kind: "filler",
          conditions: { traits: { jobExperience: { min: 3 } } },
          prompt: "job_shop_promote.prompt",
          options: {
            left: { label: "job_shop_promote.left", outcomes: [{ result: "job_shop_promote.left.r0", effects: { vitals: { spirit: "+" }, setStatus: { job: "shopkeeper" } } }] },
            right: { label: "job_shop_promote.right", outcomes: [{ result: "job_shop_promote.right.r0", effects: { vitals: { spirit: "-" } } }] },
          },
        },
        {
          id: "job_shop_sacked",
          kind: "filler",
          prompt: "job_shop_sacked.prompt",
          options: {
            left: { label: "job_shop_sacked.left", outcomes: [{ result: "job_shop_sacked.left.r0", effects: { vitals: { spirit: "+" }, setStatus: { job: "unemployed" } } }] },
            right: { label: "job_shop_sacked.right", outcomes: [{ result: "job_shop_sacked.right.r0", effects: { vitals: { finances: "+", happiness: "-" }, setStatus: { job: "unemployed" } } }] },
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
            left: { label: "job_factory_day.left", outcomes: [{ result: "job_factory_day.left.r0", effects: { vitals: { finances: "+", health: "-" }, incTraits: { jobExperience: 1 } } }] },
            right: { label: "job_factory_day.right", outcomes: [{ result: "job_factory_day.right.r0", effects: { vitals: { health: "+" }, incTraits: { jobExperience: 1 } } }] },
          },
        },
        {
          // Promotion to gang-master (the UNSKILLED ceiling — no tier 3) once
          // experienced enough (>= 3).
          id: "job_factory_promote",
          kind: "filler",
          conditions: { traits: { jobExperience: { min: 3 } } },
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
            // Both lead to unemployment (the works are shut); the choice is how
            // you take it. Straight to the next mill: you keep earning (finances +)
            // but drag your worn body round (health −). Curse the owners: a
            // cathartic day (happiness +) but a day not spent earning (finances −).
            left: { label: "job_factory_sacked.left", outcomes: [{ result: "job_factory_sacked.left.r0", effects: { vitals: { finances: "+", health: "-" }, setStatus: { job: "unemployed" } } }] },
            right: { label: "job_factory_sacked.right", outcomes: [{ result: "job_factory_sacked.right.r0", effects: { vitals: { happiness: "+", finances: "-" }, setStatus: { job: "unemployed" } } }] },
          },
        },
      ],
    },
    {
      id: "job_apprentice",
      cards: [
        // THE COURSE: five one-shot bench tasks. Each ticks a year of `experience`
        // (time served) whichever way you choose; only the WORK-HARD (left) option
        // also earns +1 `skill` — the craftsmanship the trial is judged on. You
        // must work hard on 3 of the 5 to reach the passing standard (skill >= 3).
        // Neither option dominates — graft the craft (a cost now, skill for the
        // trial), or coast (a small comfort, but you learn nothing).
        {
          id: "job_apprentice_day",
          kind: "one_time",
          prompt: "job_apprentice_day.prompt",
          options: {
            left: { label: "job_apprentice_day.left", outcomes: [{ result: "job_apprentice_day.left.r0", effects: { vitals: { spirit: "-", health: "-" }, incTraits: { jobExperience: 1, jobSkill: 1 } } }] },
            right: { label: "job_apprentice_day.right", outcomes: [{ result: "job_apprentice_day.right.r0", effects: { vitals: { happiness: "+" }, incTraits: { jobExperience: 1 } } }] },
          },
        },
        {
          id: "job_apprentice_errand",
          kind: "one_time",
          prompt: "job_apprentice_errand.prompt",
          options: {
            left: { label: "job_apprentice_errand.left", outcomes: [{ result: "job_apprentice_errand.left.r0", effects: { vitals: { health: "-" }, incTraits: { jobExperience: 1, jobSkill: 1 } } }] },
            right: { label: "job_apprentice_errand.right", outcomes: [{ result: "job_apprentice_errand.right.r0", effects: { vitals: { happiness: "+", finances: "-" }, incTraits: { jobExperience: 1 } } }] },
          },
        },
        {
          id: "job_apprentice_tools",
          kind: "one_time",
          prompt: "job_apprentice_tools.prompt",
          options: {
            left: { label: "job_apprentice_tools.left", outcomes: [{ result: "job_apprentice_tools.left.r0", effects: { vitals: { spirit: "+", health: "-" }, incTraits: { jobExperience: 1, jobSkill: 1 } } }] },
            right: { label: "job_apprentice_tools.right", outcomes: [{ result: "job_apprentice_tools.right.r0", effects: { vitals: { happiness: "+" }, incTraits: { jobExperience: 1 } } }] },
          },
        },
        {
          id: "job_apprentice_market",
          kind: "one_time",
          prompt: "job_apprentice_market.prompt",
          options: {
            left: { label: "job_apprentice_market.left", outcomes: [{ result: "job_apprentice_market.left.r0", effects: { vitals: { finances: "+", happiness: "-" }, incTraits: { jobExperience: 1, jobSkill: 1 } } }] },
            right: { label: "job_apprentice_market.right", outcomes: [{ result: "job_apprentice_market.right.r0", effects: { vitals: { spirit: "+", finances: "-" }, incTraits: { jobExperience: 1 } } }] },
          },
        },
        {
          id: "job_apprentice_lesson",
          kind: "one_time",
          prompt: "job_apprentice_lesson.prompt",
          options: {
            left: { label: "job_apprentice_lesson.left", outcomes: [{ result: "job_apprentice_lesson.left.r0", effects: { vitals: { spirit: "+", happiness: "-" }, incTraits: { jobExperience: 1, jobSkill: 1 } } }] },
            right: { label: "job_apprentice_lesson.right", outcomes: [{ result: "job_apprentice_lesson.right.r0", effects: { vitals: { happiness: "+" }, incTraits: { jobExperience: 1 } } }] },
          },
        },
        {
          // THE TRIAL. A plain (filler) card that unlocks at experience >= 3 and
          // then sits in the draw pool — no milestone forcing needed: the five
          // bench cards are one-shots, so as they deplete the trial is what's left
          // to draw, and it comes round on its own. Judged on SKILL, not health:
          // work hard on 3 of the five bench tasks (skill >= 3) and your piece passes.
          //   left  Sit the trial → PASS (skill >= 3) → journeyman job +
          //         `journeyman` credential; else FAIL → unemployed, no credential.
          //   right Give up the trade → unemployed, milder than a botched trial.
          //   down  Beg for more time → shown only while bench cards remain
          //         (experience < 5) AND you're not yet up to standard (skill <= 2).
          //         A no-op decline: you stay an apprentice and the trial simply
          //         comes round again another year, once you've done more work.
          // Sitting or giving up changes your job, which removes this deck — so the
          // trial only ever comes back if you beg.
          id: "job_apprentice_qualify",
          kind: "filler",
          conditions: { traits: { jobExperience: { min: 3 } } },
          prompt: "job_apprentice_qualify.prompt",
          // Leaving the master's roof (pass or fail) returns you to whatever
          // housing you had BEFORE the apprenticeship (`restoreHousing`) — the
          // job ladder never silently grants or strips a home. You climb the
          // housing ladder separately, on its own cards.
          options: {
            left: {
              label: "job_apprentice_qualify.left",
              outcomes: [
                { if: { traits: { jobSkill: { min: 3 } } }, result: "job_apprentice_qualify.left.r0", effects: { vitals: { spirit: "++", happiness: "+" }, setStatus: { job: "journeyman", education: "journeyman" }, restoreHousing: true } },
                { result: "job_apprentice_qualify.left.r1", effects: { vitals: { spirit: "--", happiness: "-" }, setStatus: { job: "unemployed" }, restoreHousing: true } },
              ],
            },
            right: { label: "job_apprentice_qualify.right", outcomes: [{ result: "job_apprentice_qualify.right.r0", effects: { vitals: { happiness: "-" }, setStatus: { job: "unemployed" }, restoreHousing: true } }] },
            down: { label: "job_apprentice_qualify.down", if: { traits: { jobExperience: { max: 4 }, jobSkill: { max: 2 } } }, outcomes: [{ result: "job_apprentice_qualify.down.r0" }] },
          },
        },
        {
          // The master's workshop closes before you qualify. A ONE-SHOT (it can
          // happen at most once), and it grants NO experience or skill — it's
          // misfortune, not training. `down` = seek another master to take over
          // your indenture (stay apprentice, keep your progress) at a cost; else
          // leave with PRIDE (spirit) and no coin, or press the ailing master for
          // the indenture's worth (MONEY, but a bitter parting).
          id: "job_apprentice_end",
          kind: "one_time",
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
          // wage) and the only thing that grants experience: a HUGE one-off haul
          // (finances "+++" = ~4 turns of a normal wage) at a cost to the spirit,
          // sized so the rare, random scores actually pay for the dry spells
          // between them. Backing off gains nothing but a clear conscience.
          id: "job_criminal_job",
          kind: "filler",
          prompt: "job_criminal_job.prompt",
          options: {
            left: { label: "job_criminal_job.left", outcomes: [{ result: "job_criminal_job.left.r0", effects: { vitals: { finances: "+++", spirit: "-" }, incTraits: { jobExperience: 1 } } }] },
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
            left: { label: "job_criminal_score.left", outcomes: [{ result: "job_criminal_score.left.r0", effects: { vitals: { finances: "+++", spirit: "--" }, incTraits: { jobExperience: 1 } } }] },
            right: { label: "job_criminal_score.right", outcomes: [{ result: "job_criminal_score.right.r0", effects: { vitals: { spirit: "+", happiness: "-" } } }] },
          },
        },
        {
          // Promotion to burglar once experienced enough (>= 3): the big time.
          id: "job_criminal_promote",
          kind: "filler",
          conditions: { traits: { jobExperience: { min: 3 } } },
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

    // --- CLERKLY/LAW ladder (grammar): clerk → chief clerk → solicitor. You
    //     enter as a clerk on leaving grammar school; promotions climb within. ---
    {
      id: "job_clerk",
      cards: [
        {
          id: "job_clerk_day",
          kind: "filler",
          prompt: "job_clerk_day.prompt",
          options: {
            left: { label: "job_clerk_day.left", outcomes: [{ result: "job_clerk_day.left.r0", effects: { vitals: { finances: "+", happiness: "-" }, incTraits: { jobExperience: 1 } } }] },
            right: { label: "job_clerk_day.right", outcomes: [{ result: "job_clerk_day.right.r0", effects: { vitals: { spirit: "+" }, incTraits: { jobExperience: 1 } } }] },
          },
        },
        {
          // Promotion to chief clerk (experience >= 3). You're already on the
          // grammar ladder (that's how you became a clerk), so no extra gate.
          id: "job_clerk_promote",
          kind: "filler",
          conditions: { traits: { jobExperience: { min: 3 } } },
          prompt: "job_clerk_promote.prompt",
          options: {
            left: { label: "job_clerk_promote.left", outcomes: [{ result: "job_clerk_promote.left.r0", effects: { vitals: { spirit: "+" }, setStatus: { job: "chief_clerk" } } }] },
            right: { label: "job_clerk_promote.right", outcomes: [{ result: "job_clerk_promote.right.r0", effects: { vitals: { spirit: "-" } } }] },
          },
        },
        {
          id: "job_clerk_sacked",
          kind: "filler",
          prompt: "job_clerk_sacked.prompt",
          options: {
            left: { label: "job_clerk_sacked.left", outcomes: [{ result: "job_clerk_sacked.left.r0", effects: { vitals: { spirit: "+" }, setStatus: { job: "unemployed" } } }] },
            right: { label: "job_clerk_sacked.right", outcomes: [{ result: "job_clerk_sacked.right.r0", effects: { vitals: { finances: "+", happiness: "-" }, setStatus: { job: "unemployed" } } }] },
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
            left: { label: "job_solicitor_day.left", outcomes: [{ result: "job_solicitor_day.left.r0", effects: { vitals: { finances: "++", happiness: "-" }, incTraits: { jobExperience: 1 } } }] },
            right: { label: "job_solicitor_day.right", outcomes: [{ result: "job_solicitor_day.right.r0", effects: { vitals: { spirit: "+" }, incTraits: { jobExperience: 1 } } }] },
          },
        },
        {
          id: "job_solicitor_ruin",
          kind: "filler",
          prompt: "job_solicitor_ruin.prompt",
          options: {
            left: { label: "job_solicitor_ruin.left", outcomes: [{ result: "job_solicitor_ruin.left.r0", effects: { vitals: { spirit: "+" }, setStatus: { job: "unemployed" } } }] },
            right: { label: "job_solicitor_ruin.right", outcomes: [{ result: "job_solicitor_ruin.right.r0", effects: { vitals: { finances: "+", happiness: "-" }, setStatus: { job: "unemployed" } } }] },
          },
        },
      ],
    },

    // === COMMERCE ladder (basic): shopkeeper (mid) → merchant (top) ==========
    {
      id: "job_shopkeeper",
      cards: [
        {
          id: "job_shopkeeper_day",
          kind: "filler",
          prompt: "job_shopkeeper_day.prompt",
          options: {
            left: { label: "job_shopkeeper_day.left", outcomes: [{ result: "job_shopkeeper_day.left.r0", effects: { vitals: { finances: "+", health: "-" }, incTraits: { jobExperience: 1 } } }] },
            right: { label: "job_shopkeeper_day.right", outcomes: [{ result: "job_shopkeeper_day.right.r0", effects: { vitals: { happiness: "+" }, incTraits: { jobExperience: 1 } } }] },
          },
        },
        {
          id: "job_shopkeeper_promote",
          kind: "filler",
          conditions: { traits: { jobExperience: { min: 3 } } },
          prompt: "job_shopkeeper_promote.prompt",
          options: {
            left: { label: "job_shopkeeper_promote.left", outcomes: [{ result: "job_shopkeeper_promote.left.r0", effects: { vitals: { spirit: "+" }, setStatus: { job: "merchant" } } }] },
            right: { label: "job_shopkeeper_promote.right", outcomes: [{ result: "job_shopkeeper_promote.right.r0", effects: { vitals: { spirit: "-" } } }] },
          },
        },
      ],
    },
    {
      id: "job_merchant",
      cards: [
        {
          id: "job_merchant_day",
          kind: "filler",
          prompt: "job_merchant_day.prompt",
          options: {
            left: { label: "job_merchant_day.left", outcomes: [{ result: "job_merchant_day.left.r0", effects: { vitals: { finances: "++", spirit: "-" }, incTraits: { jobExperience: 1 } } }] },
            right: { label: "job_merchant_day.right", outcomes: [{ result: "job_merchant_day.right.r0", effects: { vitals: { finances: "+" }, incTraits: { jobExperience: 1 } } }] },
          },
        },
        {
          id: "job_merchant_ruin",
          kind: "filler",
          prompt: "job_merchant_ruin.prompt",
          options: {
            left: { label: "job_merchant_ruin.left", outcomes: [{ result: "job_merchant_ruin.left.r0", effects: { vitals: { spirit: "+" }, setStatus: { job: "unemployed" } } }] },
            right: { label: "job_merchant_ruin.right", outcomes: [{ result: "job_merchant_ruin.right.r0", effects: { vitals: { finances: "+", happiness: "-" }, setStatus: { job: "unemployed" } } }] },
          },
        },
      ],
    },

    // === CLERKLY/LAW ladder (grammar): chief clerk (mid) → solicitor (top) ===
    {
      id: "job_chief_clerk",
      cards: [
        {
          id: "job_chief_clerk_day",
          kind: "filler",
          prompt: "job_chief_clerk_day.prompt",
          options: {
            left: { label: "job_chief_clerk_day.left", outcomes: [{ result: "job_chief_clerk_day.left.r0", effects: { vitals: { finances: "+", happiness: "-" }, incTraits: { jobExperience: 1 } } }] },
            right: { label: "job_chief_clerk_day.right", outcomes: [{ result: "job_chief_clerk_day.right.r0", effects: { vitals: { spirit: "+" }, incTraits: { jobExperience: 1 } } }] },
          },
        },
        {
          id: "job_chief_clerk_promote",
          kind: "filler",
          conditions: { traits: { jobExperience: { min: 3 } } },
          prompt: "job_chief_clerk_promote.prompt",
          options: {
            left: { label: "job_chief_clerk_promote.left", outcomes: [{ result: "job_chief_clerk_promote.left.r0", effects: { vitals: { spirit: "+" }, setStatus: { job: "solicitor" } } }] },
            right: { label: "job_chief_clerk_promote.right", outcomes: [{ result: "job_chief_clerk_promote.right.r0", effects: { vitals: { spirit: "-" } } }] },
          },
        },
      ],
    },

    // === MEDICINE ladder (university): junior physician → physician → consulting =
    {
      id: "job_physician_junior",
      cards: [
        {
          id: "job_physician_junior_day",
          kind: "filler",
          prompt: "job_physician_junior_day.prompt",
          options: {
            left: { label: "job_physician_junior_day.left", outcomes: [{ result: "job_physician_junior_day.left.r0", effects: { vitals: { finances: "+", health: "-" }, incTraits: { jobExperience: 1 } } }] },
            right: { label: "job_physician_junior_day.right", outcomes: [{ result: "job_physician_junior_day.right.r0", effects: { vitals: { spirit: "+", happiness: "-" }, incTraits: { jobExperience: 1 } } }] },
          },
        },
        {
          id: "job_physician_junior_promote",
          kind: "filler",
          conditions: { traits: { jobExperience: { min: 3 } } },
          prompt: "job_physician_junior_promote.prompt",
          options: {
            left: { label: "job_physician_junior_promote.left", outcomes: [{ result: "job_physician_junior_promote.left.r0", effects: { vitals: { spirit: "+" }, setStatus: { job: "physician" } } }] },
            right: { label: "job_physician_junior_promote.right", outcomes: [{ result: "job_physician_junior_promote.right.r0", effects: { vitals: { spirit: "-" } } }] },
          },
        },
      ],
    },
    {
      id: "job_physician",
      cards: [
        {
          id: "job_physician_day",
          kind: "filler",
          prompt: "job_physician_day.prompt",
          options: {
            left: { label: "job_physician_day.left", outcomes: [{ result: "job_physician_day.left.r0", effects: { vitals: { finances: "++", health: "-" }, incTraits: { jobExperience: 1 } } }] },
            right: { label: "job_physician_day.right", outcomes: [{ result: "job_physician_day.right.r0", effects: { vitals: { spirit: "+", happiness: "+" }, incTraits: { jobExperience: 1 } } }] },
          },
        },
        {
          id: "job_physician_promote",
          kind: "filler",
          conditions: { traits: { jobExperience: { min: 3 } } },
          prompt: "job_physician_promote.prompt",
          options: {
            left: { label: "job_physician_promote.left", outcomes: [{ result: "job_physician_promote.left.r0", effects: { vitals: { spirit: "+" }, setStatus: { job: "physician_eminent" } } }] },
            right: { label: "job_physician_promote.right", outcomes: [{ result: "job_physician_promote.right.r0", effects: { vitals: { spirit: "-" } } }] },
          },
        },
      ],
    },
    {
      id: "job_physician_eminent",
      cards: [
        {
          id: "job_physician_eminent_day",
          kind: "filler",
          prompt: "job_physician_eminent_day.prompt",
          options: {
            left: { label: "job_physician_eminent_day.left", outcomes: [{ result: "job_physician_eminent_day.left.r0", effects: { vitals: { finances: "++", spirit: "-" }, incTraits: { jobExperience: 1 } } }] },
            right: { label: "job_physician_eminent_day.right", outcomes: [{ result: "job_physician_eminent_day.right.r0", effects: { vitals: { happiness: "+", finances: "+" }, incTraits: { jobExperience: 1 } } }] },
          },
        },
        {
          id: "job_physician_eminent_ruin",
          kind: "filler",
          prompt: "job_physician_eminent_ruin.prompt",
          options: {
            left: { label: "job_physician_eminent_ruin.left", outcomes: [{ result: "job_physician_eminent_ruin.left.r0", effects: { vitals: { spirit: "+" }, setStatus: { job: "unemployed" } } }] },
            right: { label: "job_physician_eminent_ruin.right", outcomes: [{ result: "job_physician_eminent_ruin.right.r0", effects: { vitals: { finances: "+", happiness: "-" }, setStatus: { job: "unemployed" } } }] },
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
            left: { label: "job_gangmaster_day.left", outcomes: [{ result: "job_gangmaster_day.left.r0", effects: { vitals: { finances: "+", health: "-" }, incTraits: { jobExperience: 1 } } }] },
            right: { label: "job_gangmaster_day.right", outcomes: [{ result: "job_gangmaster_day.right.r0", effects: { vitals: { spirit: "+" }, incTraits: { jobExperience: 1 } } }] },
          },
        },
        {
          id: "job_gangmaster_sacked",
          kind: "filler",
          prompt: "job_gangmaster_sacked.prompt",
          options: {
            left: { label: "job_gangmaster_sacked.left", outcomes: [{ result: "job_gangmaster_sacked.left.r0", effects: { vitals: { spirit: "+" }, setStatus: { job: "unemployed" } } }] },
            right: { label: "job_gangmaster_sacked.right", outcomes: [{ result: "job_gangmaster_sacked.right.r0", effects: { vitals: { finances: "+", happiness: "-" }, setStatus: { job: "unemployed" } } }] },
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
            left: { label: "job_journeyman_day.left", outcomes: [{ result: "job_journeyman_day.left.r0", effects: { vitals: { finances: "+", health: "-" }, incTraits: { jobExperience: 1 } } }] },
            right: { label: "job_journeyman_day.right", outcomes: [{ result: "job_journeyman_day.right.r0", effects: { vitals: { spirit: "+" }, incTraits: { jobExperience: 1 } } }] },
          },
        },
        {
          // Promotion to master (skilled tier 3): experience-gated; also records
          // the `master` trade credential.
          id: "job_journeyman_promote",
          kind: "filler",
          conditions: { traits: { jobExperience: { min: 4 } } },
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
            right: { label: "job_journeyman_sacked.right", outcomes: [{ result: "job_journeyman_sacked.right.r0", effects: { vitals: { finances: "+", happiness: "-" }, setStatus: { job: "unemployed" } } }] },
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
            left: { label: "job_master_day.left", outcomes: [{ result: "job_master_day.left.r0", effects: { vitals: { finances: "++", health: "-" }, incTraits: { jobExperience: 1 } } }] },
            right: { label: "job_master_day.right", outcomes: [{ result: "job_master_day.right.r0", effects: { vitals: { spirit: "+", happiness: "+" }, incTraits: { jobExperience: 1 } } }] },
          },
        },
        {
          id: "job_master_ruin",
          kind: "filler",
          prompt: "job_master_ruin.prompt",
          options: {
            left: { label: "job_master_ruin.left", outcomes: [{ result: "job_master_ruin.left.r0", effects: { vitals: { spirit: "+" }, setStatus: { job: "unemployed" } } }] },
            right: { label: "job_master_ruin.right", outcomes: [{ result: "job_master_ruin.right.r0", effects: { vitals: { finances: "+", happiness: "-" }, setStatus: { job: "unemployed" } } }] },
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
            left: { label: "job_burglar_job.left", outcomes: [{ result: "job_burglar_job.left.r0", effects: { vitals: { finances: "+++", spirit: "-" }, incTraits: { jobExperience: 1 } } }] },
            right: { label: "job_burglar_job.right", outcomes: [{ result: "job_burglar_job.right.r0", effects: { vitals: { happiness: "+", finances: "-" }, incTraits: { jobExperience: 1 } } }] },
          },
        },
        {
          // Promotion to fence (criminal tier 3): run the trade rather than the
          // risk. Experience-gated.
          id: "job_burglar_promote",
          kind: "filler",
          conditions: { traits: { jobExperience: { min: 3 } } },
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
            left: { label: "job_fence_deal.left", outcomes: [{ result: "job_fence_deal.left.r0", effects: { vitals: { finances: "+++", spirit: "-" }, incTraits: { jobExperience: 1 } } }] },
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
] satisfies Deck[];
