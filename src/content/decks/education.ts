// Decks — domain group: education. Split out of content/index.ts; assembled there.
// Player-facing text is by STRING ID (tables in src/i18n); typed
// `satisfies Deck[]` so a misspelled id is still a compile error.
import type { Deck } from "../../engine/types.ts";

export const educationDecks = [

    // --- Basic school: active while education = school. ----------------------
    {
      id: "edu_basicschool",
      cards: [
        {
          // Examinations, from 9 rather than 11. Nine years of board school were
          // delivering exactly one study card to most pupils — the prize — so the
          // study banked at the leaver piled up at 2 and nowhere else, and any bar
          // above it failed four pupils in five for want of a card to earn it on.
          // Five years of exams instead of three is the cheapest way to make the
          // trial a test of effort rather than of the shuffle.
          id: "edu_basicschool_exams",
          weight: 3,
          kind: "one_time",
          conditions: { ageMin: 9 },
          prompt: "edu_basicschool_exams.prompt",
          options: {
            left: {
              // Studying hard earns the credential (education -> school) — you
              // know your stuff, even if you leave school early afterwards. (The
              // leaver card is the fallback for those who did neither this nor
              // the prize.) A bookish child finds it a pleasure, not a grind.
              label: "edu_basicschool_exams.left",
              outcomes: [
                { if: { traits: { persBookish: true } }, result: "edu_basicschool_exams.left.r0", effects: { vitals: { spirit: "++", happiness: "+", health: "-" }, incTraits: { eduStudy: 3 }, setStatus: { education: "basic" } } },
                { result: "edu_basicschool_exams.left.r1", effects: { vitals: { spirit: "++", happiness: "-", health: "-" }, incTraits: { eduStudy: 2 }, setStatus: { education: "basic" } } },
              ],
            },
            right: { label: "edu_basicschool_exams.right", outcomes: [{ result: "edu_basicschool_exams.right.r0", effects: { vitals: { happiness: "+", health: "+", spirit: "-" } } }] },
          },
        },
        {
          id: "edu_basicschool_crush",
          weight: 3,
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
          weight: 3,
          kind: "one_time",
          prompt: "edu_basicschool_friend.prompt",
          options: {
            left: { label: "edu_basicschool_friend.left", outcomes: [{ result: "edu_basicschool_friend.left.r0", effects: { vitals: { happiness: "++", spirit: "-" }, incTraits: { socialWarmth: 3 } } }] },
            right: { label: "edu_basicschool_friend.right", outcomes: [{ result: "edu_basicschool_friend.right.r0", effects: { vitals: { happiness: "-", spirit: "+" } } }] },
          },
        },
        {
          id: "edu_basicschool_prize",
          weight: 3,
          kind: "one_time",
          prompt: "edu_basicschool_prize.prompt",
          options: {
            left: {
              // Winning the prize also earns the credential. A bookish child has
              // already half-read the syllabus for fun — an easy win.
              label: "edu_basicschool_prize.left",
              outcomes: [
                { if: { traits: { persBookish: true } }, result: "edu_basicschool_prize.left.r0", effects: { vitals: { spirit: "++", happiness: "+" }, incTraits: { eduStudy: 3 }, setStatus: { education: "basic" } } },
                { result: "edu_basicschool_prize.left.r1", effects: { vitals: { spirit: "++", happiness: "+", health: "-" }, incTraits: { eduStudy: 2 }, setStatus: { education: "basic" } } },
              ],
            },
            right: { label: "edu_basicschool_prize.right", outcomes: [{ result: "edu_basicschool_prize.right.r0", effects: { vitals: { happiness: "+", health: "+", spirit: "-" } } }] },
          },
        },
        {
          // A money route for the school path (no wages otherwise), so the
          // family living cost is survivable while studying.
          id: "edu_basicschool_errands",
          weight: 3,
          kind: "filler",
          prompt: "edu_basicschool_errands.prompt",
          options: {
            left: { label: "edu_basicschool_errands.left", outcomes: [{ result: "edu_basicschool_errands.left.r0", effects: { vitals: { finances: "++", health: "-", happiness: "-" } } }] },
            right: { label: "edu_basicschool_errands.right", outcomes: [{ result: "edu_basicschool_errands.right.r0", effects: { vitals: { spirit: "+", health: "+", finances: "-" }, incTraits: { eduStudy: 1 } } }] },
          },
        },
        {
          // THE SCHOLAR'S LAST RESORT. A finances safety net that only a pupil
          // with something to sell can reach: the university pot your uncle put
          // by in the baby deck. Break into it and you eat, stay at your desk, and
          // give up the thing it was for; keep it and the ordinary net catches you
          // next — the workhouse or the streets, and your schooling with it.
          //
          // `priority: 100` so it outranks `child_hunger`, which is otherwise
          // chosen first purely because the childhood deck is listed above this
          // one. Declining is survivable, not suicide: the vital is floored at 1
          // and this card is spent, so the next collapse finds the ordinary net
          // still unused.
          //
          // Both tiers share one card body and one set of strings, as the prison
          // deck's two "do your time" copies do. `eduUniFund` is false after the
          // first use, so having a twin in each deck cannot pay out twice.
          id: "edu_basicschool_fund",
          kind: "one_time",
          rescue: "finances",
          priority: 100,
          conditions: { traits: { eduUniFund: true } },
          prompt: "edu_fund.prompt",
          options: {
            left: {
              label: "edu_fund.left",
              outcomes: [{ result: "edu_fund.left.r0", effects: { mark: "burden", vitals: { finances: "+++" }, setTraits: { eduUniFund: false }, remember: "log.fundspent" } }],
            },
            right: { label: "edu_fund.right", outcomes: [{ result: "edu_fund.right.r0", effects: { vitals: { spirit: "+", happiness: "-" } } }] },
          },
        },
        {
          // End of basic school. BOTH choices earn the credential (education ->
          // basic); only reaching this counts, so dropping out earlier (for
          // work / the workhouse) leaves you "Illiterate". Then either go UP to
          // grammar school (the fee-paying academic ladder), or leave STRAIGHT
          // INTO WORK — your letters land you a shop position (shophand, the
          // educated-path entry the `basic` credential unlocks) rather than the
          // punishing scramble through unemployment.
          //
          // GOING UP IS A PRICE, NOT A GATE. `eduStudy >= 3` wins the place on
          // merit and costs nothing; short of that you still go up, but your
          // people buy you in and it takes half of everything they have.
          //
          // It was a gate first, and that was wrong in a way worth remembering:
          // failing sent you to `shophand`, which is exactly where the OTHER swipe
          // goes, so the losing branch was strictly worse than its sibling with an
          // identical destination. Not a hard choice — no choice, and a trap for
          // reading the card hopefully. A gate you can fail has to fail you
          // somewhere the other option does not already go, or it should not be a
          // gate at all.
          //
          // The option is never hidden when you are short, and the price is on the
          // card face, so an idle pupil can see exactly what the place will cost
          // him and take the shop position instead with his eyes open.
          //
          // Only this step is gated. Grammar school lasts three years and delivers
          // a measured 1.7 draws, and university 1.1: there is no room to bank
          // anything there, and a bar you cannot reach is not a test. Going up to
          // university is gated on the MEANS instead, which is its own trial.
          id: "edu_basicschool_leaver",
          kind: "milestone",
          priority: 60,
          conditions: { ageMin: 14 },
          prompt: "edu_basicschool_leaver.prompt",
          options: {
            left: {
              label: "edu_basicschool_leaver.left",
              outcomes: [
                { if: { traits: { eduStudy: { min: 3 } } }, result: "edu_basicschool_leaver.left.r0", effects: { vitals: { spirit: "+" }, setStatus: { education: "basic", job: "grammar_school" } } },
                // Not a scholar — but the place can still be had, and your people
                // buy it. The proportional spend takes HALF of everything they
                // have, so it costs a comfortable family a pang and a poor one
                // nearly all of it, and (flooring at 1) it can never be the thing
                // that kills you. You go up either way; what the study bought you
                // was going up for nothing.
                { result: "edu_basicschool_leaver.left.r1", effects: { vitals: { finances: "/", happiness: "--", spirit: "-" }, setStatus: { education: "basic", job: "grammar_school" } } },
              ],
            },
            right: { label: "edu_basicschool_leaver.right", outcomes: [{ result: "edu_basicschool_leaver.right.r0", effects: { vitals: { spirit: "+" }, setStatus: { education: "basic", job: "shophand" } } }] },
          },
        },
      ],
    },

    // --- Grammar school: active while job = grammar_school (the fee-paying
    //     academic ladder above the free board school; ~14–17). Tuition drift
    //     bites and there's no wage; the tutoring card offsets it. The leaver at
    //     17 earns the `grammar` credential, then it's up to university or out
    //     to work. ------------------------------------------------------------
    {
      id: "edu_grammar",
      // PRIORITY, as the workhouse and unemployment are — a state whose own cards
      // should own the draw. Not because grammar school is grim, but because it is
      // SHORT: measured, a scholar spends 2.4 years here and saw only 1.20 of the
      // deck's own cards, the rest of the draw going to home life and the street.
      // Three years cannot both be shared out and carry a trial at the end of it.
      // Self-limiting, too: the cards are one_time, so once they are spent nothing
      // of this deck is eligible and the pool opens back up.
      priority: true,
      cards: [
        {
          id: "edu_grammar_classics",
          weight: 3,
          kind: "one_time",
          prompt: "edu_grammar_classics.prompt",
          options: {
            left: { label: "edu_grammar_classics.left", outcomes: [{ result: "edu_grammar_classics.left.r0", effects: { vitals: { spirit: "++", health: "-" }, incTraits: { eduStudy: 2 } } }] },
            right: { label: "edu_grammar_classics.right", outcomes: [{ result: "edu_grammar_classics.right.r0", effects: { vitals: { happiness: "+", spirit: "-" } } }] },
          },
        },
        {
          id: "edu_grammar_master",
          weight: 3,
          kind: "one_time",
          prompt: "edu_grammar_master.prompt",
          options: {
            left: { label: "edu_grammar_master.left", outcomes: [{ result: "edu_grammar_master.left.r0", effects: { vitals: { spirit: "+", happiness: "-" }, incTraits: { eduStudy: 2 } } }] },
            right: { label: "edu_grammar_master.right", outcomes: [{ result: "edu_grammar_master.right.r0", effects: { vitals: { happiness: "+", spirit: "-" } } }] },
          },
        },
        {
          id: "edu_grammar_debate",
          weight: 3,
          kind: "one_time",
          prompt: "edu_grammar_debate.prompt",
          options: {
            // A bookish scholar (persBookish) takes to the debate as a pleasure —
            // no health cost of burning the midnight oil (mirrors how bookish
            // softens the basic-school achievement cards).
            left: { label: "edu_grammar_debate.left", outcomes: [
              { if: { traits: { persBookish: true } }, result: "edu_grammar_debate.left.r1", effects: { vitals: { spirit: "++", happiness: "+" }, incTraits: { eduStudy: 3 } } },
              { result: "edu_grammar_debate.left.r0", effects: { vitals: { spirit: "++", happiness: "+", health: "-" }, incTraits: { eduStudy: 2 } } },
            ] },
            right: { label: "edu_grammar_debate.right", outcomes: [{ result: "edu_grammar_debate.right.r0", effects: { vitals: { happiness: "+", spirit: "-" } } }] },
          },
        },
        {
          // Tutoring a younger boy for pennies — the income card that offsets the
          // grammar-school fees (filler, so it recurs through the years).
          id: "edu_grammar_tutoring",
          weight: 3,
          kind: "filler",
          prompt: "edu_grammar_tutoring.prompt",
          options: {
            left: { label: "edu_grammar_tutoring.left", outcomes: [{ result: "edu_grammar_tutoring.left.r0", effects: { vitals: { finances: "++", health: "-", happiness: "-" } } }] },
            right: { label: "edu_grammar_tutoring.right", outcomes: [{ result: "edu_grammar_tutoring.right.r0", effects: { vitals: { spirit: "+", happiness: "+", finances: "-" }, incTraits: { eduStudy: 1 } } }] },
          },
        },
        {
          // THE SCHOLAR'S LAST RESORT. A finances safety net that only a pupil
          // with something to sell can reach: the university pot your uncle put
          // by in the baby deck. Break into it and you eat, stay at your desk, and
          // give up the thing it was for; keep it and the ordinary net catches you
          // next — the workhouse or the streets, and your schooling with it.
          //
          // `priority: 100` so it outranks `child_hunger`, which is otherwise
          // chosen first purely because the childhood deck is listed above this
          // one. Declining is survivable, not suicide: the vital is floored at 1
          // and this card is spent, so the next collapse finds the ordinary net
          // still unused.
          //
          // Both tiers share one card body and one set of strings, as the prison
          // deck's two "do your time" copies do. `eduUniFund` is false after the
          // first use, so having a twin in each deck cannot pay out twice.
          id: "edu_grammar_fund",
          kind: "one_time",
          rescue: "finances",
          priority: 100,
          conditions: { traits: { eduUniFund: true } },
          prompt: "edu_fund.prompt",
          options: {
            left: {
              label: "edu_fund.left",
              outcomes: [{ result: "edu_fund.left.r0", effects: { mark: "burden", vitals: { finances: "+++" }, setTraits: { eduUniFund: false }, remember: "log.fundspent" } }],
            },
            right: { label: "edu_fund.right", outcomes: [{ result: "edu_fund.right.r0", effects: { vitals: { spirit: "+", happiness: "-" } } }] },
          },
        },
        {
          // RUIN. The finances net for a pupil, and the reason it exists rather
          // than letting `child_hunger` do the job: a schoolboy has PEOPLE. The
          // destitute child's net offers the workhouse or the streets because he
          // has nowhere else; a grammar-school boy or an undergraduate can go home
          // and be fed, and the loss he takes is his education and his face, not
          // his shelter.
          //
          // `priority: 50` sits BELOW the scholar's fund (100) and ABOVE
          // `child_hunger` (unset, so 0), which is exactly the order these three
          // should be offered in: sell the university money first if you still
          // have it; failing that be sent down to your family; and only a pupil
          // with neither — who is not in this deck at all — meets the workhouse.
          // `findRescue` picks the highest priority, so the ordering is automatic.
          //
          // THERE IS NO CHOICE TO STAY, and that is the point. The leaver is the
          // door you walk out of on your own feet, with a position waiting. This
          // is the one you are carried out of. Both swipes set `job`, for the
          // reason `child_hunger` does: the rescue floors the vital at 1, and an
          // occupation that still charges tuition would empty it again next year
          // with the one-shot net already spent. Both wear ⚠ — you have lost
          // something that took years, and no status change should dress that as
          // momentum.
          //
          // YOU LAND AT THE LEVEL OF THE SCHOOLING YOU ALREADY HOLD, not on the
          // parish. A grammar pupil holds `basic` (the board school leaver grants
          // it on BOTH swipes) so he drops to `shophand`; an undergraduate holds
          // `grammar` so he drops to `clerk` — the same tier drop the leavers use,
          // because ruin does not unteach you your letters. The first cut sent
          // both to `unemployed`, which was wrong twice: it pays no wage at all
          // AND it is `grim: true`, so a qualified pupil was being dropped below
          // the uneducated child the workhouse catches. `child_hunger` keeps the
          // workhouse, and keeps it for the people it is for: children ruined
          // during BASIC school, who have no credential to fall back on. This
          // deck's pupils all have one.
          id: "edu_grammar_ruin",
          kind: "one_time",
          rescue: "finances",
          priority: 50,
          prompt: "edu_ruin.prompt",
          options: {
            // The streets. FIRST CUT OF THIS CARD MADE IT A TRAP: it charged
            // health on top of the `homeless` drift (health and happiness, five a
            // year each) and paid only `spirit +`, against a home that paid
            // `finances ++` and kept a roof on you. Measured, the pupils who took
            // it lived a median of ONE more year against home's EIGHT — not a
            // harsher road, a shorter one, which is the same fault the board
            // school's old gate had: an option whose sibling is better in every
            // direction is not an option.
            //
            // So you keep your pride and nothing else. No money changes hands on
            // either swipe any more — the WAGE of the job you are falling into
            // pays now — so the whole card is pride against safety: this swipe
            // buys `spirit ++` and pays for it in the body, `health -` at once and
            // then the `homeless` drift, health and happiness five a year, for as
            // long as it takes to get a roof back.
            //
            // The health cost came off when this landed you in wageless
            // `unemployed` and the streets were killing people in a year. With a
            // trade and a wage they can carry it again, and they have to: measured
            // WITHOUT it, playing both swipes from the same state, the streets
            // OUTLIVED home in 53–57% of the same lives. The streets are supposed
            // to be the harsher road, not the cleverer one.
            left: {
              label: "edu_ruin.left",
              outcomes: [{ result: "edu_ruin.left.r0", effects: { mark: "burden", vitals: { spirit: "++", health: "-" }, setStatus: { housing: "homeless", job: "shophand" }, remember: "log.streets" } }],
            },
            // Home: fed, sheltered, and looked at. `health +` is the shelter made
            // visible, because a one-year-ahead player cannot SEE the thing that
            // actually makes this the safe road — that the family keep drains
            // money a wage replaces, where the streets drain health and happiness
            // that nothing does. Without it, home read on the card face as pure
            // penalty against the streets' pure gain, and nobody sane takes pure
            // penalty. The shame is still the price: `happiness --`.
            right: {
              label: "edu_ruin.right",
              outcomes: [{ result: "edu_ruin.right.r0", effects: { mark: "burden", vitals: { happiness: "--", health: "+" }, setStatus: { housing: "family", job: "shophand" }, remember: "log.senthome" } }],
            },
          },
        },
        {
          // End of grammar school (age >= 17): earns the `grammar` credential.
          // Then UP to university, or leave for work.
          //
          // The university option used to HIDE when you could not afford the fees,
          // which left the card a single swipe under a prompt that talks about the
          // university beckoning — an announcement rather than a choice, and a
          // taunt for the poor scholar it hit most often (grammar school is free to
          // enter and bleeds -5/yr, so arriving here skint is the common case).
          // So the means are now money OR your own back, in three outcomes: the
          // family fund pays and is spent; your own savings pay a heavy bill; or
          // you go up as a SERVITOR, waiting at the tables of richer men for your
          // fees (Oxford's servitors, Cambridge's sizars — the real Victorian road
          // up for a clever poor boy). That last is not charity: it costs happiness
          // dearly and health besides, on top of the university's own drift, and it
          // is still the way onto the highest-paying ladder in the game.
          id: "edu_grammar_leaver",
          kind: "milestone",
          priority: 60,
          conditions: { ageMin: 17 },
          prompt: "edu_grammar_leaver.prompt",
          options: {
            left: {
              label: "edu_grammar_leaver.left",
              outcomes: [
                // Matriculation, the twin of the scholarship paper three years
                // back, and a price in the same way: three years of real work take
                // you up on merit by one of the three roads below, and short of
                // that you go up anyway — crammed for, paid for, and neither of
                // them cheap. (It was a gate, and it failed you to `clerk`, which
                // is where the other swipe already went. Same fault as the board
                // school's; same fix.)
                { if: { traits: { eduStudy: { max: 2 }, eduUniFund: true } }, result: "edu_grammar_leaver.left.r3", effects: { vitals: { happiness: "--", health: "-" }, setStatus: { education: "grammar", job: "university" }, setTraits: { eduUniFund: false, eduWasUndergraduate: true } } },
                { if: { traits: { eduStudy: { max: 2 } } }, result: "edu_grammar_leaver.left.r4", effects: { vitals: { finances: "//", happiness: "--", health: "-" }, setStatus: { education: "grammar", job: "university" }, setTraits: { eduWasUndergraduate: true } } },
                { if: { traits: { eduUniFund: true } }, result: "edu_grammar_leaver.left.r0", effects: { vitals: { spirit: "+" }, setStatus: { education: "grammar", job: "university" }, setTraits: { eduUniFund: false, eduWasUndergraduate: true } } },
                { if: { vitals: { finances: { min: 50 } } }, result: "edu_grammar_leaver.left.r1", effects: { vitals: { spirit: "+", finances: "--" }, setStatus: { education: "grammar", job: "university" }, setTraits: { eduWasUndergraduate: true } } },
                { result: "edu_grammar_leaver.left.r2", effects: { vitals: { spirit: "+", happiness: "--", health: "-" }, setStatus: { education: "grammar", job: "university" }, setTraits: { eduWasUndergraduate: true } } },
              ],
            },
            right: { label: "edu_grammar_leaver.right", outcomes: [{ result: "edu_grammar_leaver.right.r0", effects: { vitals: { spirit: "+" }, setStatus: { education: "grammar", job: "clerk" } } }] },
          },
        },
      ],
    },

    // --- University: active while job = university (~17–21). Higher fees, still
    //     no wage; the stipend card offsets. Graduation at 21 earns the
    //     `university` credential — the top of the academic ladder. (The
    //     graduate-only profession is Backlog; for now a grad enters the
    //     workforce, where the degree already clears the solicitor gate.) ------
    {
      id: "edu_university",
      // Priority for the same reason as grammar school above: 2.8 years, and only
      // 0.95 of its own cards seen.
      priority: true,
      cards: [
        {
          id: "edu_university_lectures",
          weight: 3,
          kind: "one_time",
          prompt: "edu_university_lectures.prompt",
          options: {
            // A bookish scholar (persBookish) finds the lecture hall a delight,
            // not a grind — the punishing study turns into a happiness gain.
            left: { label: "edu_university_lectures.left", outcomes: [
              { if: { traits: { persBookish: true } }, result: "edu_university_lectures.left.r1", effects: { vitals: { spirit: "++", happiness: "+" }, incTraits: { eduStudy: 3 } } },
              { result: "edu_university_lectures.left.r0", effects: { vitals: { spirit: "++", health: "-" }, incTraits: { eduStudy: 2 } } },
            ] },
            right: { label: "edu_university_lectures.right", outcomes: [{ result: "edu_university_lectures.right.r0", effects: { vitals: { happiness: "+", spirit: "-" } } }] },
          },
        },
        {
          id: "edu_university_mentor",
          weight: 3,
          kind: "one_time",
          prompt: "edu_university_mentor.prompt",
          options: {
            left: { label: "edu_university_mentor.left", outcomes: [{ result: "edu_university_mentor.left.r0", effects: { vitals: { spirit: "+", happiness: "-" }, incTraits: { eduStudy: 2 } } }] },
            right: { label: "edu_university_mentor.right", outcomes: [{ result: "edu_university_mentor.right.r0", effects: { vitals: { happiness: "+", spirit: "-" } } }] },
          },
        },
        {
          id: "edu_university_life",
          weight: 3,
          kind: "one_time",
          prompt: "edu_university_life.prompt",
          options: {
            left: { label: "edu_university_life.left", outcomes: [{ result: "edu_university_life.left.r0", effects: { vitals: { happiness: "++", finances: "-", spirit: "-" } } }] },
            right: { label: "edu_university_life.right", outcomes: [{ result: "edu_university_life.right.r0", effects: { vitals: { spirit: "+", happiness: "-", health: "-" }, incTraits: { eduStudy: 2 } } }] },
          },
        },
        {
          // A junior tutoring / clerking post — the income card that offsets the
          // university fees (filler).
          id: "edu_university_stipend",
          weight: 3,
          kind: "filler",
          prompt: "edu_university_stipend.prompt",
          options: {
            left: { label: "edu_university_stipend.left", outcomes: [{ result: "edu_university_stipend.left.r0", effects: { vitals: { finances: "++", health: "-" } } }] },
            right: { label: "edu_university_stipend.right", outcomes: [{ result: "edu_university_stipend.right.r0", effects: { vitals: { spirit: "+", finances: "-" }, incTraits: { eduStudy: 1 } } }] },
          },
        },
        {
          // RUIN. The finances net for a pupil, and the reason it exists rather
          // than letting `child_hunger` do the job: a schoolboy has PEOPLE. The
          // destitute child's net offers the workhouse or the streets because he
          // has nowhere else; a grammar-school boy or an undergraduate can go home
          // and be fed, and the loss he takes is his education and his face, not
          // his shelter.
          //
          // `priority: 50` sits BELOW the scholar's fund (100) and ABOVE
          // `child_hunger` (unset, so 0), which is exactly the order these three
          // should be offered in: sell the university money first if you still
          // have it; failing that be sent down to your family; and only a pupil
          // with neither — who is not in this deck at all — meets the workhouse.
          // `findRescue` picks the highest priority, so the ordering is automatic.
          //
          // THERE IS NO CHOICE TO STAY, and that is the point. The leaver is the
          // door you walk out of on your own feet, with a position waiting. This
          // is the one you are carried out of. Both swipes set `job`, for the
          // reason `child_hunger` does: the rescue floors the vital at 1, and an
          // occupation that still charges tuition would empty it again next year
          // with the one-shot net already spent. Both wear ⚠ — you have lost
          // something that took years, and no status change should dress that as
          // momentum.
          //
          // YOU LAND AT THE LEVEL OF THE SCHOOLING YOU ALREADY HOLD, not on the
          // parish. A grammar pupil holds `basic` (the board school leaver grants
          // it on BOTH swipes) so he drops to `shophand`; an undergraduate holds
          // `grammar` so he drops to `clerk` — the same tier drop the leavers use,
          // because ruin does not unteach you your letters. The first cut sent
          // both to `unemployed`, which was wrong twice: it pays no wage at all
          // AND it is `grim: true`, so a qualified pupil was being dropped below
          // the uneducated child the workhouse catches. `child_hunger` keeps the
          // workhouse, and keeps it for the people it is for: children ruined
          // during BASIC school, who have no credential to fall back on. This
          // deck's pupils all have one.
          id: "edu_university_ruin",
          kind: "one_time",
          rescue: "finances",
          priority: 50,
          prompt: "edu_ruin.prompt",
          options: {
            // The streets. FIRST CUT OF THIS CARD MADE IT A TRAP: it charged
            // health on top of the `homeless` drift (health and happiness, five a
            // year each) and paid only `spirit +`, against a home that paid
            // `finances ++` and kept a roof on you. Measured, the pupils who took
            // it lived a median of ONE more year against home's EIGHT — not a
            // harsher road, a shorter one, which is the same fault the board
            // school's old gate had: an option whose sibling is better in every
            // direction is not an option.
            //
            // So you keep your pride and nothing else. No money changes hands on
            // either swipe any more — the WAGE of the job you are falling into
            // pays now — so the whole card is pride against safety: this swipe
            // buys `spirit ++` and pays for it in the body, `health -` at once and
            // then the `homeless` drift, health and happiness five a year, for as
            // long as it takes to get a roof back.
            //
            // The health cost came off when this landed you in wageless
            // `unemployed` and the streets were killing people in a year. With a
            // trade and a wage they can carry it again, and they have to: measured
            // WITHOUT it, playing both swipes from the same state, the streets
            // OUTLIVED home in 53–57% of the same lives. The streets are supposed
            // to be the harsher road, not the cleverer one.
            left: {
              label: "edu_ruin.left",
              outcomes: [{ result: "edu_ruin.left.r0", effects: { mark: "burden", vitals: { spirit: "++", health: "-" }, setStatus: { housing: "homeless", job: "clerk" }, remember: "log.streets" } }],
            },
            // Home: fed, sheltered, and looked at. `health +` is the shelter made
            // visible, because a one-year-ahead player cannot SEE the thing that
            // actually makes this the safe road — that the family keep drains
            // money a wage replaces, where the streets drain health and happiness
            // that nothing does. Without it, home read on the card face as pure
            // penalty against the streets' pure gain, and nobody sane takes pure
            // penalty. The shame is still the price: `happiness --`.
            right: {
              label: "edu_ruin.right",
              outcomes: [{ result: "edu_ruin.right.r0", effects: { mark: "burden", vitals: { happiness: "--", health: "+" }, setStatus: { housing: "family", job: "clerk" }, remember: "log.senthome" } }],
            },
          },
        },
        {
          // THE WAY OUT. Until this card university had no exit but graduation:
          // between matriculation and the degree at 21 no swipe in the deck
          // changed your job, so an undergraduate whose purse ran dry survived the
          // drift or died of it. Measured, a THIRD of them died in it — not
          // failing the place, just running out of money inside it, with
          // `child_hunger` gone with childhood and no adult net behind it.
          //
          // The authored curve is board school easy, grammar medium, university
          // VERY HARD BUT NEVER IMPOSSIBLE, and it was "never impossible" that was
          // missing. This makes the degree no commoner — fees and drift are
          // untouched — it makes FAILING SURVIVABLE, giving the scholar the same
          // dignified exit the tiers below already have: `edu_basicschool_leaver`
          // drops you to `shophand`, `edu_grammar_leaver` to `clerk`, and quitting
          // university now drops you to `clerk` too, the work the grammar
          // credential you already hold has always earned you. You keep
          // `eduWasUndergraduate`: you went up, you simply did not finish.
          //
          // A `filler` rather than a `one_time` on purpose. Giving it up is a
          // temptation that returns every year you are still poor, not an offer
          // made once and withdrawn — and the deck's one_times are spent in the
          // first years, so a one-shot leaver declined at nineteen would leave
          // behind the very trap it was written to remove.
          id: "edu_university_leaver",
          weight: 3,
          kind: "filler",
          prompt: "edu_university_leaver.prompt",
          options: {
            left: {
              label: "edu_university_leaver.left",
              outcomes: [{ result: "edu_university_leaver.left.r0", effects: { vitals: { spirit: "+" }, incTraits: { eduStudy: 1 } } }],
            },
            // A wage at last, and the first of your life. It wears the star every
            // new job wears: leaving is a step taken, not a punishment suffered.
            right: {
              label: "edu_university_leaver.right",
              outcomes: [{ result: "edu_university_leaver.right.r0", effects: { vitals: { finances: "+", spirit: "-" }, setStatus: { job: "clerk" }, remember: "log.leftuni" } }],
            },
          },
        },
        {
          // Graduation (age >= 21): earns the `university` credential and steps
          // STRAIGHT into the learned profession (job -> junior physician, the
          // top MEDICINE ladder) — the degree's payoff. Both options graduate;
          // they differ only in outlook.
          id: "edu_university_grad",
          kind: "milestone",
          priority: 60,
          conditions: { ageMin: 21 },
          prompt: "edu_university_grad.prompt",
          options: {
            left: { label: "edu_university_grad.left", outcomes: [{ result: "edu_university_grad.left.r0", effects: { vitals: { spirit: "++", happiness: "+" }, setStatus: { education: "university", job: "physician_junior" } } }] },
            right: { label: "edu_university_grad.right", outcomes: [{ result: "edu_university_grad.right.r0", effects: { vitals: { finances: "+", happiness: "+" }, setStatus: { education: "university", job: "physician_junior" } } }] },
          },
        },
      ],
    },
] satisfies Deck[];
