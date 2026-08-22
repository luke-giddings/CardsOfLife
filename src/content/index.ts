import type { Content } from "../engine/types.ts";

// ---------------------------------------------------------------------------
// Content — the first-playable slice: baby -> child -> working life, plus a
// small always-on filler deck. Authored as typed data (`satisfies Content`),
// so a misspelled trait or a stat that doesn't exist is a compile error.
//
// This is deliberately thin. The whole point of the engine/content split is
// that everything below can grow (or be rewritten) without touching the engine.
// ---------------------------------------------------------------------------

export const content = {
  start: {
    vitals: { finances: 50, happiness: 70, health: 90, spirit: 70 },
    statuses: { job: "none", housing: "family", education: "none", lifestyle: "default" },
    decks: ["baby"],
    traits: {},
  },

  statuses: {
    job: {
      id: "job",
      states: {
        none: {},
        general: { label: "Working", drift: { finances: 5, spirit: -2 }, addDecks: ["job_general"] },
        unemployed: { label: "Unemployed", drift: { finances: -3, spirit: -2, happiness: -1 }, addDecks: ["unemployed"] },
      },
    },
    housing: {
      id: "housing",
      states: {
        family: { label: "With family" },
        renting: { label: "Renting", drift: { finances: -2 } },
        owned: { label: "Homeowner", drift: { finances: -1, happiness: 1 } },
        homeless: { label: "Homeless", drift: { health: -4, happiness: -2 }, addDecks: ["homeless"] },
      },
    },
    education: {
      id: "education",
      ordered: true,
      levels: ["none", "school", "college", "degree"],
      states: {
        none: {},
        school: { label: "At school" },
        college: { label: "At college" },
        degree: { label: "Graduate" },
      },
    },
    lifestyle: {
      id: "lifestyle",
      states: { default: {} },
    },
  },

  decks: [
    // --- Baby: tutorial; impossible to lose. --------------------------------
    {
      id: "baby",
      cards: [
        {
          id: "b_firststeps",
          kind: "filler",
          prompt: "You wobble upright. Your very first steps — but towards whom?",
          options: {
            left: { label: "Toddle to Mum", outcomes: [{ result: "She scoops you up, beaming.", effects: { vitals: { happiness: 3 } } }] },
            right: { label: "Toddle to Dad", outcomes: [{ result: "He catches you just in time.", effects: { vitals: { happiness: 3 } } }] },
          },
        },
        {
          id: "b_sleep",
          kind: "filler",
          prompt: "It is 3am. You are wide awake and full of opinions.",
          options: {
            left: { label: "Wail", outcomes: [{ result: "The whole house is up now.", effects: { vitals: { happiness: 1 } } }] },
            right: { label: "Giggle", outcomes: [{ result: "Somehow, all is forgiven.", effects: { vitals: { happiness: 2 } } }] },
          },
        },
        {
          id: "b_vaccine",
          kind: "one_time",
          prompt: "The doctor readies a very small needle.",
          options: {
            left: { label: "Brave it", outcomes: [{ result: "One yelp, then a lollipop. Protected.", effects: { vitals: { health: 3 }, setTraits: { vaccinated: true } } }] },
            right: { label: "Squirm free", outcomes: [{ result: "You escape the needle — for now.", effects: { vitals: { happiness: 1 } } }] },
          },
        },
        {
          id: "m_school",
          kind: "milestone",
          priority: 10,
          conditions: { ageMin: 4 },
          prompt: "A satchel, a uniform, and the school gates. Your first day.",
          options: {
            left: {
              label: "March in bravely",
              outcomes: [{ result: "You stride in without looking back.", effects: { vitals: { spirit: 3 }, setStatus: { education: "school" }, addDecks: ["child", "life_filler"], removeDecks: ["baby"] } }],
            },
            right: {
              label: "Cling to the gate",
              outcomes: [{ result: "Peeling you off the railings takes a while.", effects: { vitals: { happiness: -2, spirit: -1 }, setStatus: { education: "school" }, addDecks: ["child", "life_filler"], removeDecks: ["baby"] } }],
            },
          },
        },
      ],
    },

    // --- Child: school years. -----------------------------------------------
    {
      id: "child",
      cards: [
        {
          id: "c_martialarts",
          kind: "one_time",
          prompt: "A dojo opens down the road. The instructor waves you in.",
          options: {
            left: { label: "Sign up", outcomes: [{ result: "You learn to stand your ground. Hi-yah!", effects: { vitals: { spirit: 4, finances: -3 }, setTraits: { knowsMartialArts: true } } }] },
            right: { label: "Not for me", outcomes: [{ result: "You head home to your cartoons instead.", effects: { vitals: { happiness: 1 } } }] },
          },
        },
        {
          id: "c_bully",
          kind: "one_time",
          conditions: { ageMin: 7 },
          prompt: "A bully shoves you hard in the yard. Everyone is watching.",
          options: {
            left: {
              label: "Fight back",
              outcomes: [
                { if: { traits: { knowsMartialArts: true } }, result: "You calmly floor them. The yard goes silent — then cheers.", effects: { vitals: { spirit: 8, health: -2 } } },
                { result: "You get a bloody nose, but you stood your ground.", effects: { vitals: { spirit: 4, health: -6 } } },
              ],
            },
            right: { label: "Walk away", outcomes: [{ result: "You swallow it and leave. It stings for weeks.", effects: { vitals: { happiness: -4, spirit: -2 } } }] },
          },
        },
        {
          id: "c_exams",
          kind: "one_time",
          conditions: { ageMin: 11 },
          prompt: "Big exams are looming on the horizon.",
          options: {
            left: { label: "Study hard", outcomes: [{ result: "Late nights, but it pays off.", effects: { vitals: { spirit: -2, happiness: -2, finances: 0 } } }] },
            right: { label: "Wing it", outcomes: [{ result: "You coast through on charm and luck.", effects: { vitals: { happiness: 2, spirit: -1 } } }] },
          },
        },
        {
          id: "m_leaveschool",
          kind: "milestone",
          priority: 10,
          conditions: { ageMin: 16 },
          prompt: "School is behind you. The rest of your life is ahead. Which way?",
          options: {
            left: {
              label: "Get a job",
              outcomes: [{ result: "You join the world of work.", effects: { setStatus: { job: "general" }, addDecks: ["adult"], removeDecks: ["child"] } }],
            },
            right: {
              label: "Go to university",
              outcomes: [{ result: "Three years of lectures, noodles and growth.", effects: { vitals: { finances: -10, spirit: 3 }, setStatus: { education: "degree" }, addDecks: ["adult"], removeDecks: ["child"] } }],
            },
          },
        },
      ],
    },

    // --- Adult: working life, added when you leave school. -------------------
    {
      id: "adult",
      cards: [
        {
          id: "a_joboffer",
          kind: "one_time",
          conditions: { status: { job: "none" } },
          prompt: "A company likes the look of you and offers a role.",
          options: {
            left: { label: "Take it", outcomes: [{ result: "A steady wage at last.", effects: { setStatus: { job: "general" } } }] },
            right: { label: "Hold out for better", outcomes: [{ result: "You wait. Rent doesn't.", effects: { vitals: { happiness: 1 } } }] },
          },
        },
        {
          id: "a_promotion",
          kind: "one_time",
          conditions: { status: { job: "general" } },
          prompt: "Your manager pulls you aside — a promotion is on the table.",
          options: {
            left: { label: "Accept the corner office", outcomes: [{ result: "More money, more meetings.", effects: { vitals: { finances: 15, spirit: -3 } } }] },
            right: { label: "Stay where you're happy", outcomes: [{ result: "You keep your evenings.", effects: { vitals: { happiness: 3 } } }] },
          },
        },
        {
          id: "a_fired",
          kind: "one_time",
          conditions: { status: { job: "general" }, ageMin: 25 },
          prompt: "Cutbacks. HR wants 'a quick word'.",
          options: {
            left: { label: "Take it hard", outcomes: [{ result: "The floor drops out from under you.", effects: { vitals: { happiness: -6 }, setStatus: { job: "unemployed" }, incTraits: { numTimesChangedJob: 1 } } }] },
            right: { label: "Shrug it off", outcomes: [{ result: "Onward. Something will turn up.", effects: { vitals: { spirit: -2 }, setStatus: { job: "unemployed" }, incTraits: { numTimesChangedJob: 1 } } }] },
          },
        },
        {
          id: "a_moveout",
          kind: "one_time",
          conditions: { status: { housing: "family" }, ageMin: 20 },
          prompt: "You still live with your family. Time for your own place?",
          options: {
            left: { label: "Rent a flat", outcomes: [{ result: "Keys of your own. And bills of your own.", effects: { vitals: { happiness: 4 }, setStatus: { housing: "renting" } } }] },
            right: { label: "Stay put a while", outcomes: [{ result: "Home comforts win. For now.", effects: { vitals: { happiness: -2 } } }] },
          },
        },
        {
          id: "a_lottery",
          kind: "filler",
          conditions: { ageMin: 18 },
          prompt: "The lottery jackpot is enormous this week.",
          options: {
            left: { label: "Buy a ticket", outcomes: [{ result: "You dream big for a whole evening.", effects: { vitals: { finances: -1, happiness: 1 }, incTraits: { numTimesPlayedLottery: 1 } } }] },
            right: { label: "Save your money", outcomes: [{ result: "The sensible choice, as ever.", effects: { vitals: { finances: 1 } } }] },
          },
        },
      ],
    },

    // --- Job (held while employed via the job status). ----------------------
    {
      id: "job_general",
      cards: [
        {
          id: "j_deadline",
          kind: "filler",
          prompt: "A brutal deadline lands on your desk.",
          options: {
            left: { label: "Pull an all-nighter", outcomes: [{ result: "Done — but you feel it.", effects: { vitals: { finances: 3, health: -3 } } }] },
            right: { label: "Set a boundary", outcomes: [{ result: "It can wait until Monday.", effects: { vitals: { spirit: 2, finances: -1 } } }] },
          },
        },
      ],
    },

    // --- Unemployed. ---------------------------------------------------------
    {
      id: "unemployed",
      cards: [
        {
          id: "u_applications",
          kind: "one_time",
          prompt: "Another day, another stack of job applications.",
          options: {
            left: { label: "Apply everywhere", outcomes: [{ result: "One of them bites. You're back in work.", effects: { vitals: { spirit: 2 }, setStatus: { job: "general" }, incTraits: { numTimesChangedJob: 1 } } }] },
            right: { label: "Take a break", outcomes: [{ result: "You recharge, but the savings dwindle.", effects: { vitals: { happiness: 2, finances: -3 } } }] },
          },
        },
      ],
    },

    // --- Homeless (held while housing is homeless). -------------------------
    {
      id: "homeless",
      cards: [
        {
          id: "h_shelter",
          kind: "filler",
          prompt: "The nights are getting cold.",
          options: {
            left: { label: "Find a shelter", outcomes: [{ result: "A warm bed for the night.", effects: { vitals: { health: 2 } } }] },
            right: { label: "Tough it out", outcomes: [{ result: "You barely sleep.", effects: { vitals: { health: -2, spirit: -1 } } }] },
          },
        },
      ],
    },

    // --- Always-on filler: keeps the years ticking. -------------------------
    {
      id: "life_filler",
      cards: [
        {
          id: "f_flu",
          kind: "filler",
          prompt: "A rotten flu knocks you flat.",
          options: {
            left: { label: "Rest and recover", outcomes: [{ result: "A few days off and you're right again.", effects: { vitals: { health: 3, happiness: -1 } } }] },
            right: { label: "Power through it", outcomes: [{ result: "You spread it round the whole office.", effects: { vitals: { health: -5 } } }] },
          },
        },
        {
          id: "f_friend",
          kind: "filler",
          prompt: "An old friend gets in touch out of the blue.",
          options: {
            left: { label: "Meet up", outcomes: [{ result: "Hours vanish in good company.", effects: { vitals: { happiness: 4, finances: -1 } } }] },
            right: { label: "Too busy right now", outcomes: [{ result: "You mean to reschedule. You don't.", effects: { vitals: { happiness: -2, spirit: -1 } } }] },
          },
        },
        {
          id: "f_walk",
          kind: "filler",
          prompt: "The morning is impossibly bright and clear.",
          options: {
            left: { label: "Go for a walk", outcomes: [{ result: "You come back lighter than you left.", effects: { vitals: { health: 2, happiness: 2 } } }] },
            right: { label: "Stay in bed", outcomes: [{ result: "Cosy, if a little wasted.", effects: { vitals: { happiness: 1 } } }] },
          },
        },
        {
          id: "f_frailty",
          kind: "filler",
          conditions: { ageMin: 70 },
          prompt: "Your body aches a little more with each passing year.",
          options: {
            left: { label: "Push on regardless", outcomes: [{ result: "You won't be slowed down easily.", effects: { vitals: { health: -6, spirit: 1 } } }] },
            right: { label: "Take it easy", outcomes: [{ result: "You pace yourself through the seasons.", effects: { vitals: { health: -4, happiness: -1 } } }] },
          },
        },
      ],
    },
  ],
} satisfies Content;

// `content` above keeps its literal type so authoring stays fully type-checked.
// `gameContent` is the same data widened to `Content` for the engine/UI to read
// (indexing `states[someString]` needs the interface, not the literal).
export const gameContent: Content = content;
