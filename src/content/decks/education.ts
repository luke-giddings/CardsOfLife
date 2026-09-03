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
          // basic); only reaching this counts, so dropping out earlier (for
          // work / the workhouse) leaves you "Illiterate". Then either go UP to
          // grammar school (the fee-paying academic ladder), or leave STRAIGHT
          // INTO WORK — your letters land you a shop position (shophand, the
          // educated-path entry the `basic` credential unlocks) rather than the
          // punishing scramble through unemployment.
          id: "edu_basicschool_leaver",
          kind: "milestone",
          priority: 60,
          conditions: { ageMin: 14 },
          prompt: "edu_basicschool_leaver.prompt",
          options: {
            left: { label: "edu_basicschool_leaver.left", outcomes: [{ result: "edu_basicschool_leaver.left.r0", effects: { vitals: { spirit: "+" }, setStatus: { education: "basic", job: "grammar_school" } } }] },
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
      cards: [
        {
          id: "edu_grammar_classics",
          kind: "one_time",
          prompt: "edu_grammar_classics.prompt",
          options: {
            left: { label: "edu_grammar_classics.left", outcomes: [{ result: "edu_grammar_classics.left.r0", effects: { vitals: { spirit: "++", health: "-" } } }] },
            right: { label: "edu_grammar_classics.right", outcomes: [{ result: "edu_grammar_classics.right.r0", effects: { vitals: { happiness: "+", spirit: "-" } } }] },
          },
        },
        {
          id: "edu_grammar_master",
          kind: "one_time",
          prompt: "edu_grammar_master.prompt",
          options: {
            left: { label: "edu_grammar_master.left", outcomes: [{ result: "edu_grammar_master.left.r0", effects: { vitals: { spirit: "+", happiness: "-" } } }] },
            right: { label: "edu_grammar_master.right", outcomes: [{ result: "edu_grammar_master.right.r0", effects: { vitals: { happiness: "+", spirit: "-" } } }] },
          },
        },
        {
          id: "edu_grammar_debate",
          kind: "one_time",
          prompt: "edu_grammar_debate.prompt",
          options: {
            // A bookish scholar (bookish >= 3) takes to the debate as a pleasure —
            // no health cost of burning the midnight oil (mirrors how bookish
            // softens the basic-school achievement cards).
            left: { label: "edu_grammar_debate.left", outcomes: [
              { if: { traits: { bookish: { min: 3 } } }, result: "edu_grammar_debate.left.r1", effects: { vitals: { spirit: "++", happiness: "+" } } },
              { result: "edu_grammar_debate.left.r0", effects: { vitals: { spirit: "++", happiness: "+", health: "-" } } },
            ] },
            right: { label: "edu_grammar_debate.right", outcomes: [{ result: "edu_grammar_debate.right.r0", effects: { vitals: { happiness: "+", spirit: "-" } } }] },
          },
        },
        {
          // Tutoring a younger boy for pennies — the income card that offsets the
          // grammar-school fees (filler, so it recurs through the years).
          id: "edu_grammar_tutoring",
          kind: "filler",
          prompt: "edu_grammar_tutoring.prompt",
          options: {
            left: { label: "edu_grammar_tutoring.left", outcomes: [{ result: "edu_grammar_tutoring.left.r0", effects: { vitals: { finances: "++", health: "-", happiness: "-" } } }] },
            right: { label: "edu_grammar_tutoring.right", outcomes: [{ result: "edu_grammar_tutoring.right.r0", effects: { vitals: { spirit: "+", happiness: "+", finances: "-" } } }] },
          },
        },
        {
          // End of grammar school (age >= 17): earns the `grammar` credential.
          // Then UP to university — the family fund OR your own savings pay the
          // way (uniFund OR finances >= 50, so the option hides if you can't
          // afford it) — or leave for work. The way is actually PAID for now: the
          // family fund covers it and is spent (uniFund -> false); otherwise your
          // own savings foot a heavy tuition bill (finances --).
          id: "edu_grammar_leaver",
          kind: "milestone",
          priority: 60,
          conditions: { ageMin: 17 },
          prompt: "edu_grammar_leaver.prompt",
          options: {
            left: {
              label: "edu_grammar_leaver.left",
              if: { any: [{ traits: { uniFund: true } }, { vitals: { finances: { min: 50 } } }] },
              outcomes: [
                { if: { traits: { uniFund: true } }, result: "edu_grammar_leaver.left.r0", effects: { vitals: { spirit: "+" }, setStatus: { education: "grammar", job: "university" }, setTraits: { uniFund: false } } },
                { result: "edu_grammar_leaver.left.r1", effects: { vitals: { spirit: "+", finances: "--" }, setStatus: { education: "grammar", job: "university" } } },
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
      cards: [
        {
          id: "edu_university_lectures",
          kind: "one_time",
          prompt: "edu_university_lectures.prompt",
          options: {
            // A bookish scholar (bookish >= 3) finds the lecture hall a delight,
            // not a grind — the punishing study turns into a happiness gain.
            left: { label: "edu_university_lectures.left", outcomes: [
              { if: { traits: { bookish: { min: 3 } } }, result: "edu_university_lectures.left.r1", effects: { vitals: { spirit: "++", happiness: "+" } } },
              { result: "edu_university_lectures.left.r0", effects: { vitals: { spirit: "++", health: "-" } } },
            ] },
            right: { label: "edu_university_lectures.right", outcomes: [{ result: "edu_university_lectures.right.r0", effects: { vitals: { happiness: "+", spirit: "-" } } }] },
          },
        },
        {
          id: "edu_university_mentor",
          kind: "one_time",
          prompt: "edu_university_mentor.prompt",
          options: {
            left: { label: "edu_university_mentor.left", outcomes: [{ result: "edu_university_mentor.left.r0", effects: { vitals: { spirit: "+", happiness: "-" } } }] },
            right: { label: "edu_university_mentor.right", outcomes: [{ result: "edu_university_mentor.right.r0", effects: { vitals: { happiness: "+", spirit: "-" } } }] },
          },
        },
        {
          id: "edu_university_life",
          kind: "one_time",
          prompt: "edu_university_life.prompt",
          options: {
            left: { label: "edu_university_life.left", outcomes: [{ result: "edu_university_life.left.r0", effects: { vitals: { happiness: "++", finances: "-", spirit: "-" } } }] },
            right: { label: "edu_university_life.right", outcomes: [{ result: "edu_university_life.right.r0", effects: { vitals: { spirit: "+", happiness: "-", health: "-" } } }] },
          },
        },
        {
          // A junior tutoring / clerking post — the income card that offsets the
          // university fees (filler).
          id: "edu_university_stipend",
          kind: "filler",
          prompt: "edu_university_stipend.prompt",
          options: {
            left: { label: "edu_university_stipend.left", outcomes: [{ result: "edu_university_stipend.left.r0", effects: { vitals: { finances: "++", health: "-" } } }] },
            right: { label: "edu_university_stipend.right", outcomes: [{ result: "edu_university_stipend.right.r0", effects: { vitals: { spirit: "+", finances: "-" } } }] },
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
