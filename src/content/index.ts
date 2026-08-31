import type { Content } from "../engine/types.ts";
import {
  babyDecks,
  childhoodDecks,
  adultDecks,
  homeDecks,
  educationDecks,
  jobDecks,
  siblingDecks,
} from "./decks/index.ts";

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
//
// FILE LAYOUT: this file holds `start` + `statuses` + the final assembly. The
// decks themselves live in `./decks/<domain>.ts` (baby · childhood · adult ·
// home · education · jobs · sibling), each `satisfies Deck[]`, spread into the
// `decks` array below. All player text stays central in src/i18n.
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
        // Fee-paying academia above the free board school: the grind on the
        // spirit continues AND tuition bites the purse (−5/yr) — the "invest
        // early, poor now" cost of the educated path — with no wage. Each owns
        // its events deck. (uniFund/savings gate entry to university; see the
        // grammar leaver.) Income cards inside the decks let you offset the fees.
        grammar_school: { label: "status.job.grammar_school", drift: { spirit: -5, finances: -5 }, addDecks: ["edu_grammar"] },
        university: { label: "status.job.university", drift: { spirit: -5, finances: -5 }, addDecks: ["edu_university"] },
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
        // Owned homes: the adult housing ladder above renting. Each is BOUGHT
        // (offered when finances >= 75, cost "---" = keep ~1/3) and gives a
        // permanent, rising vital bonus (health, then spirit, then happiness).
        // Upkeep SCALES UP with the tier and crosses ABOVE the −10 rent for the
        // larger homes, so a bigger house needs a bigger wage to sustain: a
        // steady worker can keep a small house, but a grand estate is a money pit
        // only a top income (solicitor/master) can run — overreach and the drain
        // pulls you toward the sell-up rescue. Each owns a deck that hosts the
        // offer of the NEXT tier up ("rebuild to 75, spend down, rebuild").
        owned_small: { label: "status.housing.owned_small", drift: { finances: -10, health: 7, spirit: 3 }, addDecks: ["home_owned_small"] },
        owned_large: { label: "status.housing.owned_large", drift: { finances: -12, health: 9, spirit: 5, happiness: 2 }, addDecks: ["home_owned_large"] },
        owned_estate: { label: "status.housing.owned_estate", drift: { finances: -18, health: 11, spirit: 7, happiness: 4 }, addDecks: ["home_owned_estate"] },
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
    // How you live — the money→happiness SINK and the treadmill's lever.
    // Unlocked at coming-of-age (child_adult sets it to `frugal`); before that
    // it's the neutral `default` (no drift, hidden). Ordered so the up/down
    // lifestyle cards can gate on atLeast/atMost. Frugal is a HAPPINESS DRAIN on
    // purpose — living cheap isn't the safe long life; you must spend up to your
    // means. Higher tiers buy happiness with money AND (at the top) health/spirit
    // — a lavish life genuinely wears you out.
    lifestyle: {
      id: "lifestyle",
      ordered: true,
      levels: ["frugal", "modest", "comfortable", "lavish"],
      states: {
        default: {},
        frugal: { label: "status.lifestyle.frugal", drift: { happiness: -4 } },
        modest: { label: "status.lifestyle.modest", drift: { finances: -3, happiness: 2 } },
        comfortable: { label: "status.lifestyle.comfortable", drift: { finances: -8, happiness: 5, health: -1 } },
        lavish: { label: "status.lifestyle.lavish", drift: { finances: -15, happiness: 9, health: -8, spirit: -4 } },
      },
    },
  },

  decks: [
    ...babyDecks,
    ...childhoodDecks,
    ...adultDecks,
    ...homeDecks,
    ...educationDecks,
    ...jobDecks,
    ...siblingDecks,
  ],
} satisfies Content;

// `content` above keeps its literal type so authoring stays fully type-checked.
// `gameContent` is the same data widened to `Content` for the engine/UI to read.
export const gameContent: Content = content;
