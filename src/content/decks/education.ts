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
          // GOING UP IS NOW A TRIAL, not a choice, and it is the apprenticeship's
          // trial wearing a gown: `eduStudy >= 3` or you sit the scholarship exam
          // and fail. Nine years of board school supply it — a determined pupil
          // banks a median 2 and a bookish one 3, of a possible 4 or more — so the
          // bar is a real test that a bookish child clears more often, which is
          // the point of being bookish.
          //
          // The option is NOT hidden when you are short. That was tried on the
          // university leaver and it turned the card into an announcement and a
          // taunt (see the grammar leaver below); and the failing outcome's chips
          // are on the card face, so an idle pupil can see the exam is beyond him
          // and take the shop position with his eyes open. Failing costs more than
          // never trying, exactly as it does at the bench.
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
                { result: "edu_basicschool_leaver.left.r1", effects: { vitals: { spirit: "-", happiness: "--" }, setStatus: { education: "basic", job: "shophand" } } },
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
                // back. The bar is the same NUMBER as the board school's but a
                // looser bar in practice, because this deck is `priority` and so
                // hands you nearly two of its own cards in two and a half years
                // where it used to hand you one: a determined scholar clears it
                // half the time here against three times in ten there. Checked
                // FIRST, so no amount of money buys a place you have not earned.
                { if: { traits: { eduStudy: { max: 2 } } }, result: "edu_grammar_leaver.left.r3", effects: { vitals: { spirit: "-", happiness: "--" }, setStatus: { education: "grammar", job: "clerk" } } },
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
