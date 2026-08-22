import type { Content } from "../engine/types.ts";

// ---------------------------------------------------------------------------
// Content — BABY (ages 0–4) then CHILD (ages 5–17), ending at 18 for now.
// Vitals move by 10 (minor) or 25 (major) so choices feel impactful.
// Baby is a tutorial and is impossible to lose (positive / small effects only).
//
// Authored as typed data (`satisfies Content`) — misspelled traits or stats
// are compile errors.
// ---------------------------------------------------------------------------

export const content = {
  start: {
    vitals: { finances: 50, happiness: 70, health: 90, spirit: 70 },
    statuses: { job: "none", housing: "family", education: "none", lifestyle: "default" },
    decks: ["baby"],
    traits: {},
  },

  statuses: {
    job: { id: "job", states: { none: {} } },
    housing: { id: "housing", states: { family: { label: "With family" } } },
    education: {
      id: "education",
      ordered: true,
      levels: ["none", "school"],
      states: { none: {}, school: { label: "At school" } },
    },
    lifestyle: { id: "lifestyle", states: { default: {} } },
  },

  decks: [
    // --- Baby: ages 0–4. Tutorial; impossible to lose. ----------------------
    {
      id: "baby",
      cards: [
        {
          id: "b_birth",
          kind: "milestone",
          priority: 100,
          conditions: { ageMin: 0, ageMax: 0 },
          prompt:
            "You have just been born!\n\nSwipe the card left or right to choose. The choice for each direction is written on the edge you swipe towards.\n\nAre you a boy or a girl?",
          options: {
            left: { label: "Boy", outcomes: [{ result: "A boy. Your story begins.", effects: { setTraits: { gender: "boy" } } }] },
            right: { label: "Girl", outcomes: [{ result: "A girl. Your story begins.", effects: { setTraits: { gender: "girl" } } }] },
          },
        },
        {
          id: "b_firstword",
          kind: "milestone",
          priority: 90,
          conditions: { ageMin: 1, ageMax: 1 },
          prompt:
            "You babble your very first word!\n\nEach choice changes your stats — watch the bars at the top move.",
          options: {
            left: { label: "“Mama”", outcomes: [{ result: "Mum bursts into happy tears. Happiness soars.", effects: { vitals: { happiness: 25 } } }] },
            right: { label: "“Dada”", outcomes: [{ result: "Dad punches the air. Happiness soars.", effects: { vitals: { happiness: 25 } } }] },
          },
        },
        {
          id: "b_firststeps",
          kind: "filler",
          prompt: "You wobble upright. Your very first steps — but towards whom?",
          options: {
            left: { label: "To Mum", outcomes: [{ result: "She scoops you up, beaming.", effects: { vitals: { happiness: 10 } } }] },
            right: { label: "To Dad", outcomes: [{ result: "He catches you just in time.", effects: { vitals: { happiness: 10 } } }] },
          },
        },
        {
          id: "b_veg",
          kind: "filler",
          prompt: "A spoonful of mushed green something approaches your mouth.",
          options: {
            left: { label: "Eat up", outcomes: [{ result: "Surprisingly tasty. You feel strong.", effects: { vitals: { health: 10 } } }] },
            right: { label: "Spit it out", outcomes: [{ result: "It ends up on the wall. Worth it.", effects: { vitals: { happiness: 10 } } }] },
          },
        },
        {
          id: "b_vaccine",
          kind: "one_time",
          prompt: "The doctor readies a very small needle.",
          options: {
            left: { label: "Brave it", outcomes: [{ result: "One yelp, then a lollipop. Protected.", effects: { vitals: { health: 10 }, setTraits: { vaccinated: true } } }] },
            right: { label: "Squirm free", outcomes: [{ result: "You escape the needle — for now.", effects: { vitals: { happiness: 10 } } }] },
          },
        },
        {
          id: "m_school",
          kind: "milestone",
          priority: 20,
          conditions: { ageMin: 5 },
          prompt: "A satchel, a uniform, and the school gates. Your first day.",
          options: {
            left: {
              label: "March in",
              outcomes: [{ result: "You stride in without looking back.", effects: { vitals: { spirit: 10 }, setStatus: { education: "school" }, addDecks: ["child"], removeDecks: ["baby"] } }],
            },
            right: {
              label: "Cling on",
              outcomes: [{ result: "Peeling you off the railings takes a while.", effects: { vitals: { happiness: -10 }, setStatus: { education: "school" }, addDecks: ["child"], removeDecks: ["baby"] } }],
            },
          },
        },
      ],
    },

    // --- Child: ages 5–17. Ends at 18. --------------------------------------
    {
      id: "child",
      cards: [
        {
          id: "c_martialarts",
          kind: "one_time",
          prompt: "A dojo opens down the road. The instructor waves you in.",
          options: {
            left: { label: "Sign up", outcomes: [{ result: "You learn to stand your ground. Hi-yah!", effects: { vitals: { spirit: 25, finances: -10 }, setTraits: { knowsMartialArts: true } } }] },
            right: { label: "No thanks", outcomes: [{ result: "You head home to your cartoons instead.", effects: { vitals: { happiness: 10 } } }] },
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
                { if: { traits: { knowsMartialArts: true } }, result: "You calmly floor them. The yard goes silent — then cheers.", effects: { vitals: { spirit: 25, health: -10 } } },
                { result: "You get a bloody nose, but you stood your ground.", effects: { vitals: { spirit: 10, health: -25 } } },
              ],
            },
            right: { label: "Walk away", outcomes: [{ result: "You swallow it and leave. It stings for weeks.", effects: { vitals: { happiness: -25, spirit: -10 } } }] },
          },
        },
        {
          id: "c_exams",
          kind: "one_time",
          conditions: { ageMin: 11 },
          prompt: "Big exams are looming on the horizon.",
          options: {
            left: { label: "Study hard", outcomes: [{ result: "Late nights, but you ace them.", effects: { vitals: { spirit: 10, happiness: -10 } } }] },
            right: { label: "Wing it", outcomes: [{ result: "You coast through on charm and luck.", effects: { vitals: { happiness: 10, spirit: -10 } } }] },
          },
        },
        {
          id: "c_firstcrush",
          kind: "one_time",
          conditions: { ageMin: 13 },
          prompt: "Your heart does something strange when a certain classmate walks by.",
          options: {
            left: { label: "Say hello", outcomes: [{ result: "You manage a squeaky 'hi'. They smile back!", effects: { vitals: { happiness: 25, spirit: 10 } } }] },
            right: { label: "Panic and hide", outcomes: [{ result: "You duck behind a locker. Smooth.", effects: { vitals: { happiness: -10 } } }] },
          },
        },
        {
          id: "c_pet",
          kind: "filler",
          prompt: "A scruffy stray cat follows you all the way home.",
          options: {
            left: { label: "Take it in", outcomes: [{ result: "You have a new best friend.", effects: { vitals: { happiness: 25 } } }] },
            right: { label: "Shoo it off", outcomes: [{ result: "It slinks off into the hedge.", effects: { vitals: { happiness: -10 } } }] },
          },
        },
        {
          id: "c_friend",
          kind: "filler",
          prompt: "The new kid at school is looking for someone to sit with.",
          options: {
            left: { label: "Wave over", outcomes: [{ result: "The start of a great friendship.", effects: { vitals: { happiness: 10, spirit: 10 } } }] },
            right: { label: "Look away", outcomes: [{ result: "You keep to yourself today.", effects: { vitals: { happiness: -10 } } }] },
          },
        },
        {
          id: "c_sports",
          kind: "filler",
          prompt: "Sports day. The whole class is picking teams.",
          options: {
            left: { label: "Dive in", outcomes: [{ result: "Grass stains and grinning.", effects: { vitals: { health: 10, happiness: 10 } } }] },
            right: { label: "Sit out", outcomes: [{ result: "You cheer from the sidelines.", effects: { vitals: { happiness: 10, health: -10 } } }] },
          },
        },
        {
          id: "c_chores",
          kind: "filler",
          prompt: "Your parents offer pocket money for helping around the house.",
          options: {
            left: { label: "Do the chores", outcomes: [{ result: "A little jingle in your pocket.", effects: { vitals: { finances: 10, happiness: -10 } } }] },
            right: { label: "Go play", outcomes: [{ result: "Chores can wait. Fun can't.", effects: { vitals: { happiness: 10 } } }] },
          },
        },
        {
          id: "c_sweets",
          kind: "filler",
          prompt: "The corner shop is full of pick-and-mix.",
          options: {
            left: { label: "Buy a bagful", outcomes: [{ result: "Sugar heaven, dentist's nightmare.", effects: { vitals: { happiness: 10, health: -10 } } }] },
            right: { label: "Save your coins", outcomes: [{ result: "The piggy bank thanks you.", effects: { vitals: { finances: 10 } } }] },
          },
        },
        {
          id: "m_adult",
          kind: "milestone",
          priority: 100,
          conditions: { ageMin: 18 },
          prompt: "You turn eighteen. Childhood is officially over.",
          options: {
            left: { label: "Look back", outcomes: [{ result: "So much has happened already…", effects: { endGame: "grown_up" } }] },
            right: { label: "Charge ahead", outcomes: [{ result: "Whatever comes next, you're ready.", effects: { endGame: "grown_up" } }] },
          },
        },
      ],
    },
  ],
} satisfies Content;

// `content` above keeps its literal type so authoring stays fully type-checked.
// `gameContent` is the same data widened to `Content` for the engine/UI to read.
export const gameContent: Content = content;
