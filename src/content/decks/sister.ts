// Deck — SARAH (rel_sis), the sister arc. Activated by home_family_sister.
//
// Mirrors Tom's SHAPE — love + distance, beats gated on windows of her own life,
// a crossroads milestone, a heavily-weighted finale, an estrangement — but is his
// opposite in temperament and in mechanics.
//
//   Tom is scrapes and fists: his beats ask whether you PROTECT him or TOUGHEN
//   him, and his second axis (`grit`) grows when you make him stand alone.
//   Sarah is a performer and a maker: her beats ask whether you can AFFORD her,
//   and her second axis (`relSisterPromise`) only grows when you step in and
//   SPEND — lessons, slippers, an afternoon off work to watch her dance. He
//   hardens by your absence; she rises by your presence.
//
// She WANTS the schoolroom, so the crossroads is not the even trade it is for Tom:
// putting her to the needle pays you a wage and costs you her (love −12), where
// sending her to school costs money and delights her. From there the road forks:
//   SCHOOL → lessons → recital → the audition, which reads `promise` and decides
//            between the stage (ballerina) and the back row (chorus).
//   WORK   → the sweatshop → the dressmaker, which lands her as a seamstress:
//            skilled and steady, the dream folded away.
// Her calling is recorded in `relSisterCalling` for the epilogue.
//
// Two cards only exist when you have BOTH siblings (see rel_sis_purse and
// rel_sis_quarrel, and their mirrors in the brother deck): one divides a purse
// that cannot stretch to both children, one makes you take a side.
//
// BALANCE RULE for this deck: THE COLD SWIPE PAYS BEST. Her arc is about what
// you can afford, so the cruel option is the one with the best immediate return
// (money, and the hours her dancing was eating), bought with the currency the
// deck actually scores you on — her love, and the `promise` that decides the
// audition. A cold swipe that merely costs you something is not a choice, it is
// a punishment button: the three childhood beats each had one, and they were
// strictly dominated by the swipe beside them until this was applied.
import type { Deck } from "../../engine/types.ts";

export const sisterDecks = [
  {
    id: "rel_sis",
    // As with Tom: her windows are her own age, and a suppressed year is a
    // beat missed rather than postponed.
    neverSuppressed: true,
    title: "deck.rel_sis.title",
    unlock: "deck.rel_sis.blurb",
    tick: { relSisterAge: 1, relSisterDistance: 1 },
    // Frozen once her story concludes — see the brother deck for why (a long life
    // would otherwise drift away from her however devoted you had been).
    tickWhile: { traits: { relSisterStoryDone: false } },
    // THE COOLDOWN: after one of this sibling's beats, the next waits
    // 3 years, so their story is spread across a life rather than dealt
    // in a burst — and so a `priority` phase (an apprenticeship, the
    // workhouse) is not swamped by a never-suppressed deck. Each gated beat
    // sets `relSisterCooldown` to 4 with setTraitsQuiet (ticks land after the card, so
    // 4 blocks the next 3 years) and this counts it down, stopping at
    // 0. Milestones and the childhood beats are exempt: they neither wait for
    // it nor start it — the childhood ones share a window too narrow to
    // space out without losing some of them.
    ticks: [{ traits: { relSisterCooldown: -1 }, while: { traits: { relSisterCooldown: { min: 1 } } } }],
    cards: [
      // === CHILDHOOD (her ages 0–7) ======================================
      // Three one-shots, each with a cold third swipe, so shutting her out is
      // something you can actually choose rather than something the draw does.
      //
      // The window was 0–4 and is now 0–7. These three carry a third of the
      // `promise` in her deck, and four years inside YOUR childhood — where the
      // pool is at its fattest — delivered almost none of it: 53.7% of lives drew
      // none of the three at all, measured over 4,000 (scripts/ballerina.ts). At
      // 0–7 that is 39.0%, and the median promise banked by the audition goes
      // from 6 to 8. This is STORY COVERAGE rather than a balance fix — widening
      // it barely moves the ballerina rate (38.9% → 40.8% at the old gate of 9),
      // which is why the gate came down instead — but a third of her childhood
      // going unseen in half of all lives is reason enough on its own. Nothing
      // here reads as a toddler's beat (a girl of seven still spins on the
      // flagstones and still stops at the shop window), so the extra years cost
      // the writing nothing, and 7 keeps them clear of the lessons card at 8.
      {
        // Her gift shows early — and all it asks for is an audience.
        id: "rel_sis_dance",
        kind: "one_time",
        conditions: { traits: { relSisterStoryDone: false, relSisterAge: { max: 7 } } },
        prompt: "rel_sis_dance.prompt",
        options: {
          left: { label: "rel_sis_dance.left", outcomes: [{ result: "rel_sis_dance.left.r0", effects: { vitals: { happiness: "+" }, incTraits: { relSisterLove: 10, relSisterPromise: 2, relSisterDistance: -6 } } }] },
          right: { label: "rel_sis_dance.right", outcomes: [{ result: "rel_sis_dance.right.r0", effects: { vitals: { finances: "+" }, incTraits: { relSisterLove: 4, relSisterDistance: -6 } } }] },
          // Cold: not neglect but scorn — the cheapest way to teach a child that
          // her one talent is an embarrassment.
          up: { label: "rel_sis_dance.up", outcomes: [{ result: "rel_sis_dance.up.r0", effects: { vitals: { finances: "+", spirit: "+" }, incTraits: { relSisterLove: -12, relSisterPromise: -2, relSisterDistance: -6 } } }] },
        },
      },
      {
        // The other thread of her life: a good eye and a steady hand. This is the
        // seed of the seamstress she becomes if the schoolroom never happens.
        id: "rel_sis_mend",
        kind: "one_time",
        conditions: { traits: { relSisterStoryDone: false, relSisterAge: { max: 7 } } },
        prompt: "rel_sis_mend.prompt",
        options: {
          left: { label: "rel_sis_mend.left", outcomes: [{ result: "rel_sis_mend.left.r0", effects: { vitals: { happiness: "+" }, incTraits: { relSisterLove: 10, relSisterDistance: -6 } } }] },
          right: { label: "rel_sis_mend.right", outcomes: [{ result: "rel_sis_mend.right.r0", effects: { vitals: { finances: "+" }, incTraits: { relSisterLove: 4, relSisterDistance: -6 } } }] },
          up: { label: "rel_sis_mend.up", outcomes: [{ result: "rel_sis_mend.up.r0", effects: { vitals: { finances: "+", spirit: "+" }, incTraits: { relSisterLove: -12, relSisterDistance: -6 } } }] },
        },
      },
      {
        // The first time her gift costs money. `promise` is bought, never given.
        id: "rel_sis_slippers",
        kind: "one_time",
        conditions: { traits: { relSisterStoryDone: false, relSisterAge: { max: 7 } } },
        prompt: "rel_sis_slippers.prompt",
        options: {
          left: { label: "rel_sis_slippers.left", outcomes: [{ result: "rel_sis_slippers.left.r0", effects: { vitals: { finances: "-", happiness: "+" }, incTraits: { relSisterLove: 10, relSisterPromise: 3, relSisterDistance: -6 } } }] },
          // The middle road costs no money but an evening of your own: spirit "+"
          // for doing what you could with what you had, so the option isn't blank
          // on the card face (it used to show no change at all).
          right: { label: "rel_sis_slippers.right", outcomes: [{ result: "rel_sis_slippers.right.r0", effects: { vitals: { spirit: "+" }, incTraits: { relSisterLove: 4, relSisterPromise: 1, relSisterDistance: -6 } } }] },
          up: { label: "rel_sis_slippers.up", outcomes: [{ result: "rel_sis_slippers.up.r0", effects: { vitals: { finances: "+" }, incTraits: { relSisterLove: -12, relSisterDistance: -6 } } }] },
        },
      },

      // === THE CROSSROADS (her age 5) ====================================
      {
        // A MILESTONE, like Tom's, so the fork always happens. Unlike his, it is
        // NOT an even trade: she wants the schoolroom badly, so the needle pays
        // you a wage and costs you her. That asymmetry is the whole point of her
        // character — her road is the expensive one.
        id: "rel_sis_crossroads",
        kind: "milestone",
        priority: 40,
        conditions: { traits: { relSisterStoryDone: false, relSisterAge: { min: 5 } } },
        prompt: "rel_sis_crossroads.prompt",
        options: {
          left: { label: "rel_sis_crossroads.left", outcomes: [{ result: "rel_sis_crossroads.left.r0", effects: { vitals: { finances: "-", spirit: "+" }, setTraits: { relSisterSchooled: true }, incTraits: { relSisterLove: 12, relSisterPromise: 2, relSisterDistance: -10 } } }] },
          right: { label: "rel_sis_crossroads.right", outcomes: [{ result: "rel_sis_crossroads.right.r0", effects: { vitals: { finances: "+" }, setTraits: { relSisterSchooled: false }, incTraits: { relSisterLove: -12, relSisterDistance: -10 } } }] },
        },
      },

      // === THE SCHOOL ROAD ===============================================
      {
        // Lessons cost real money — the biggest single source of `promise`.
        id: "rel_sis_lessons",
        kind: "one_time",
        conditions: { traits: { relSisterStoryDone: false, relSisterCooldown: { max: 0 }, relSisterSchooled: true, relSisterAge: { min: 8 } } },
        prompt: "rel_sis_lessons.prompt",
        options: {
          left: { label: "rel_sis_lessons.left", outcomes: [{ result: "rel_sis_lessons.left.r0", effects: { setTraitsQuiet: { relSisterCooldown: 4 }, vitals: { finances: "--" }, incTraits: { relSisterLove: 8, relSisterPromise: 4, relSisterDistance: -6 } } }] },
          right: { label: "rel_sis_lessons.right", outcomes: [{ result: "rel_sis_lessons.right.r0", effects: { setTraitsQuiet: { relSisterCooldown: 4 }, vitals: { happiness: "+" }, incTraits: { relSisterLove: 2, relSisterPromise: 1, relSisterDistance: -6 } } }] },
          up: { label: "rel_sis_lessons.up", outcomes: [{ result: "rel_sis_lessons.up.r0", effects: { setTraitsQuiet: { relSisterCooldown: 4 }, vitals: { finances: "++" }, incTraits: { relSisterLove: -12, relSisterPromise: -2, relSisterDistance: -6 } } }] },
        },
      },
      {
        // Presence vs money, made explicit: the middle swipe BUYS her the costume
        // but misses the night, so it gives promise without pulling distance down.
        // The only card in the game where the two axes are separated by hand.
        id: "rel_sis_recital",
        kind: "one_time",
        conditions: { traits: { relSisterStoryDone: false, relSisterCooldown: { max: 0 }, relSisterSchooled: true, relSisterAge: { min: 12 } } },
        prompt: "rel_sis_recital.prompt",
        options: {
          left: { label: "rel_sis_recital.left", outcomes: [{ result: "rel_sis_recital.left.r0", effects: { setTraitsQuiet: { relSisterCooldown: 4 }, vitals: { happiness: "+", finances: "--" }, incTraits: { relSisterLove: 12, relSisterPromise: 3, relSisterDistance: -10 } } }] },
          right: { label: "rel_sis_recital.right", outcomes: [{ result: "rel_sis_recital.right.r0", effects: { setTraitsQuiet: { relSisterCooldown: 4 }, vitals: { finances: "+" }, incTraits: { relSisterLove: -6 } } }] },
          up: { label: "rel_sis_recital.up", outcomes: [{ result: "rel_sis_recital.up.r0", effects: { setTraitsQuiet: { relSisterCooldown: 4 }, vitals: { finances: "-" }, incTraits: { relSisterLove: 2, relSisterPromise: 2 } } }] },
        },
      },
      {
        // THE TEST. Reads `promise` — everything you did or didn't pay for comes
        // due here. 6+ is "you put her in the schoolroom AND paid for the
        // lessons", the two commitments that actually cost you; below that she
        // dances, but in the back row of a music hall.
        //
        // It was 9, which was exactly the sum of the three promise cards a player
        // reliably DRAWS — the crossroads (+2, seen in 100% of lives), the lessons
        // (+4, 76%) and the recital (+3, 68%). So the stage demanded all three,
        // answered perfectly, with no margin at all, and everything above that was
        // draw luck: the three little-girl cards that carry the rest of the
        // promise are one_time and gated to her ages 0-4, and 53% of lives never
        // see ANY of them. Measured over 4,000 lives, a player taking the option
        // that pleases her most on every single card of this deck reached the
        // stage 38.4% of the time. Our playtester, who did exactly that bar one
        // cold swipe at the flagstones card, finished on 8 and lost the ending by
        // a single point.
        //
        // At 6 that devoted player gets there 70.2% of the time, and the ending is
        // not thereby given away: a self-interested player almost never sees this
        // card at all (1.6% of lives), because the crossroads sends her to the
        // needle for a wage. What makes the ballerina rare is schooling her, not
        // the size of this number — so the number's job is only to leave room for
        // one bad day.
        id: "rel_sis_audition",
        kind: "one_time",
        weight: 3,
        conditions: { traits: { relSisterStoryDone: false, relSisterCooldown: { max: 0 }, relSisterSchooled: true, relSisterAge: { min: 16 } } },
        prompt: "rel_sis_audition.prompt",
        options: {
          left: {
            label: "rel_sis_audition.left",
            outcomes: [
              { if: { traits: { relSisterPromise: { min: 6 } } }, result: "rel_sis_audition.left.r0", effects: { setTraitsQuiet: { relSisterCooldown: 4 }, vitals: { happiness: "++", spirit: "+" }, setTraits: { relSisterCalling: "ballerina" }, incTraits: { relSisterLove: 15, relSisterDistance: -10 }, remember: "log.sisBallerina" } },
              { result: "rel_sis_audition.left.r1", effects: { setTraitsQuiet: { relSisterCooldown: 4 }, vitals: { happiness: "-" }, setTraits: { relSisterCalling: "chorus" }, incTraits: { relSisterLove: 6, relSisterDistance: -10 } } },
            ],
          },
          right: { label: "rel_sis_audition.right", outcomes: [{ result: "rel_sis_audition.right.r0", effects: { setTraitsQuiet: { relSisterCooldown: 4 }, vitals: { finances: "+" }, setTraits: { relSisterCalling: "seamstress" }, incTraits: { relSisterLove: -10, relSisterDistance: -6 } } }] },
        },
      },

      // === THE WORK ROAD =================================================
      {
        // The needle's real cost. The kind swipe spends YOUR health, not coin —
        // the only way to help when there is no money to give.
        id: "rel_sis_sweatshop",
        kind: "one_time",
        conditions: { traits: { relSisterStoryDone: false, relSisterCooldown: { max: 0 }, relSisterSchooled: false, relSisterAge: { min: 8 } } },
        prompt: "rel_sis_sweatshop.prompt",
        options: {
          left: { label: "rel_sis_sweatshop.left", outcomes: [{ result: "rel_sis_sweatshop.left.r0", effects: { setTraitsQuiet: { relSisterCooldown: 4 }, vitals: { health: "-" }, incTraits: { relSisterLove: 10, relSisterDistance: -6 } } }] },
          right: { label: "rel_sis_sweatshop.right", outcomes: [{ result: "rel_sis_sweatshop.right.r0", effects: { setTraitsQuiet: { relSisterCooldown: 4 }, vitals: { finances: "+" }, incTraits: { relSisterLove: -4, relSisterDistance: -6 } } }] },
          up: { label: "rel_sis_sweatshop.up", outcomes: [{ result: "rel_sis_sweatshop.up.r0", effects: { setTraitsQuiet: { relSisterCooldown: 4 }, vitals: { finances: "++" }, incTraits: { relSisterLove: -12, relSisterDistance: -6 } } }] },
        },
      },
      {
        // The work road's payoff: a proper trade if you can find the premium,
        // piecework for ever if you can't. Either way she is a seamstress — the
        // difference is whether she is a respected one.
        id: "rel_sis_dressmaker",
        kind: "one_time",
        weight: 3,
        conditions: { traits: { relSisterStoryDone: false, relSisterCooldown: { max: 0 }, relSisterSchooled: false, relSisterAge: { min: 16 } } },
        prompt: "rel_sis_dressmaker.prompt",
        options: {
          left: { label: "rel_sis_dressmaker.left", outcomes: [{ result: "rel_sis_dressmaker.left.r0", effects: { setTraitsQuiet: { relSisterCooldown: 4 }, vitals: { finances: "--" }, setTraits: { relSisterCalling: "seamstress" }, incTraits: { relSisterLove: 12, relSisterPromise: 2, relSisterDistance: -10 }, remember: "log.sisSeamstress" } }] },
          right: { label: "rel_sis_dressmaker.right", outcomes: [{ result: "rel_sis_dressmaker.right.r0", effects: { setTraitsQuiet: { relSisterCooldown: 4 }, vitals: { finances: "+" }, setTraits: { relSisterCalling: "seamstress" }, incTraits: { relSisterLove: -6, relSisterDistance: -6 } } }] },
        },
      },

      // === BOTH SIBLINGS ONLY ============================================
      {
        // SCARCITY, from her side: one purse, two children. Backing her costs Tom
        // — and the cost lands on his prospects (grit) as well as his heart, so
        // the two arcs genuinely interfere.
        id: "rel_sis_purse",
        kind: "one_time",
        conditions: { traits: { relSisterStoryDone: false, relSisterCooldown: { max: 0 }, relBrotherActive: true, relSisterActive: true, relSisterAge: { min: 10 } } },
        prompt: "rel_sis_purse.prompt",
        options: {
          left: { label: "rel_sis_purse.left", outcomes: [{ result: "rel_sis_purse.left.r0", effects: { setTraitsQuiet: { relSisterCooldown: 4 }, vitals: { finances: "-" }, incTraits: { relSisterLove: 10, relSisterPromise: 4, relSisterDistance: -6, relBrotherLove: -8, relBrotherGrit: -4 } } }] },
          right: { label: "rel_sis_purse.right", outcomes: [{ result: "rel_sis_purse.right.r0", effects: { setTraitsQuiet: { relSisterCooldown: 4 }, vitals: { finances: "-" }, incTraits: { relSisterLove: -8, relSisterPromise: -2, relBrotherLove: 10, relBrotherGrit: 4, relBrotherDistance: -6 } } }] },
          // Splitting it helps neither enough — the honest cost of fairness.
          up: { label: "rel_sis_purse.up", outcomes: [{ result: "rel_sis_purse.up.r0", effects: { setTraitsQuiet: { relSisterCooldown: 4 }, vitals: { finances: "--" }, incTraits: { relSisterLove: 2, relSisterPromise: 1, relBrotherLove: 2, relSisterDistance: -6, relBrotherDistance: -6 } } }] },
        },
      },
      {
        // LOYALTY: they fall out and she reaches you first. Backing either costs
        // you the other; refusing to judge costs you a little of both.
        id: "rel_sis_quarrel",
        kind: "one_time",
        conditions: { traits: { relSisterStoryDone: false, relSisterCooldown: { max: 0 }, relBrotherActive: true, relSisterActive: true, relSisterAge: { min: 14 } } },
        prompt: "rel_sis_quarrel.prompt",
        options: {
          left: { label: "rel_sis_quarrel.left", outcomes: [{ result: "rel_sis_quarrel.left.r0", effects: { setTraitsQuiet: { relSisterCooldown: 4 }, incTraits: { relSisterLove: 12, relSisterDistance: -6, relBrotherLove: -10 } } }] },
          right: { label: "rel_sis_quarrel.right", outcomes: [{ result: "rel_sis_quarrel.right.r0", effects: { setTraitsQuiet: { relSisterCooldown: 4 }, incTraits: { relSisterLove: -10, relBrotherLove: 12, relBrotherDistance: -6 } } }] },
          up: { label: "rel_sis_quarrel.up", outcomes: [{ result: "rel_sis_quarrel.up.r0", effects: { setTraitsQuiet: { relSisterCooldown: 4 }, vitals: { spirit: "+" }, incTraits: { relSisterLove: -4, relBrotherLove: -4 } } }] },
        },
      },

      // === LATER LIFE ====================================================
      {
        // Her own household, whichever road she took. Reads distance: if you have
        // been absent she has stopped expecting you.
        id: "rel_sis_settled",
        kind: "one_time",
        conditions: { traits: { relSisterStoryDone: false, relSisterCooldown: { max: 0 }, relSisterAge: { min: 40 } } },
        prompt: "rel_sis_settled.prompt",
        options: {
          left: {
            label: "rel_sis_settled.left",
            outcomes: [
              { if: { traits: { relSisterDistance: { min: 20 } } }, result: "rel_sis_settled.left.r1", effects: { setTraitsQuiet: { relSisterCooldown: 4 }, vitals: { happiness: "+" }, incTraits: { relSisterLove: 6, relSisterDistance: -10 } } },
              { result: "rel_sis_settled.left.r0", effects: { setTraitsQuiet: { relSisterCooldown: 4 }, vitals: { happiness: "+" }, incTraits: { relSisterLove: 10, relSisterDistance: -10 } } },
            ],
          },
          right: { label: "rel_sis_settled.right", outcomes: [{ result: "rel_sis_settled.right.r0", effects: { setTraitsQuiet: { relSisterCooldown: 4 }, vitals: { finances: "+" }, incTraits: { relSisterLove: -6 } } }] },
        },
      },
      {
        // THE FINALE. Heavily weighted rather than a milestone, for the same
        // reasons as Tom's — near-certain to land without fixing exactly when.
        // See the calibration caveat on rel_bro_fate: this is drawn in old age,
        // where the pool is currently thin, so re-check the weight when late-life
        // content lands. Reads love AND distance AND what became of her.
        id: "rel_sis_fate",
        kind: "one_time",
        weight: 25,
        conditions: { traits: { relSisterStoryDone: false, relSisterCooldown: { max: 0 }, relSisterAge: { min: 59 } } },
        prompt: "rel_sis_fate.prompt",
        options: {
          left: {
            label: "rel_sis_fate.left",
            outcomes: [
              { if: { traits: { relSisterCalling: "ballerina", relSisterLove: { min: 25 }, relSisterDistance: { max: 24 } } }, result: "rel_sis_fate.left.r0", effects: { setTraitsQuiet: { relSisterCooldown: 4 }, vitals: { happiness: "++", spirit: "+" }, setTraits: { relSisterStoryDone: true } } },
              { if: { traits: { relSisterLove: { min: 25 }, relSisterDistance: { max: 24 } } }, result: "rel_sis_fate.left.r1", effects: { setTraitsQuiet: { relSisterCooldown: 4 }, vitals: { happiness: "++" }, setTraits: { relSisterStoryDone: true } } },
              { if: { traits: { relSisterLove: { min: 0 } } }, result: "rel_sis_fate.left.r2", effects: { setTraitsQuiet: { relSisterCooldown: 4 }, vitals: { happiness: "+" }, setTraits: { relSisterStoryDone: true } } },
              { result: "rel_sis_fate.left.r3", effects: { setTraitsQuiet: { relSisterCooldown: 4 }, vitals: { happiness: "-", spirit: "-" }, setTraits: { relSisterStoryDone: true } } },
            ],
          },
          right: {
            label: "rel_sis_fate.right",
            outcomes: [
              { if: { traits: { relSisterLove: { min: 25 } } }, result: "rel_sis_fate.right.r0", effects: { setTraitsQuiet: { relSisterCooldown: 4 }, vitals: { spirit: "+" }, setTraits: { relSisterStoryDone: true } } },
              { result: "rel_sis_fate.right.r1", effects: { setTraitsQuiet: { relSisterCooldown: 4 }, vitals: { spirit: "--" }, setTraits: { relSisterStoryDone: true } } },
            ],
          },
        },
      },
      {
        // Estrangement, mirroring Tom's: a high bar, reachable only by repeatedly
        // choosing the cold swipe, and never by two unlucky answers. Reaching -30
        // needs the crossroads rebuff (-12) plus a couple of deliberate cruelties.
        id: "rel_sis_estranged",
        kind: "milestone",
        priority: 60,
        conditions: { traits: { relSisterStoryDone: false, relSisterLove: { max: -30 }, relSisterAge: { min: 12 } } },
        prompt: "rel_sis_estranged.prompt",
        options: {
          left: { label: "rel_sis_estranged.left", outcomes: [{ result: "rel_sis_estranged.left.r0", effects: { vitals: { spirit: "-" }, setTraits: { relSisterStoryDone: true } } }] },
          // As with Tom, reaching for her does NOT end the story — it buys the
          // bond back and lets the remaining beats play.
          right: { label: "rel_sis_estranged.right", outcomes: [{ result: "rel_sis_estranged.right.r0", effects: { vitals: { finances: "-", spirit: "-" }, incTraits: { relSisterLove: 30 } } }] },
        },
      },
    ],
  },
] satisfies Deck[];
