import type { Content } from "../engine/types.ts";

// ---------------------------------------------------------------------------
// Content — scoped down to the BABY and CHILD decks while we iterate on feel.
// New decks (adult, jobs, housing, …) get added one at a time later.
//
// Authored as typed data (`satisfies Content`), so a misspelled trait or a
// stat that doesn't exist is a compile error.
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
      states: {
        none: {},
        school: { label: "At school" },
      },
    },
    lifestyle: { id: "lifestyle", states: { default: {} } },
  },

  decks: [
    // --- Baby: tutorial; impossible to lose. --------------------------------
    {
      id: "baby",
      cards: [
        {
          id: "b_birth",
          kind: "milestone",
          priority: 100,
          conditions: { ageMin: 0, ageMax: 0 },
          prompt:
            "You have just been born!\n\nSwipe the card left or right to make your choice. Which way will you go?\n\nAre you a boy or a girl?",
          options: {
            left: { label: "Boy", outcomes: [{ result: "A boy. Your story begins.", effects: { setTraits: { gender: "boy" } } }] },
            right: { label: "Girl", outcomes: [{ result: "A girl. Your story begins.", effects: { setTraits: { gender: "girl" } } }] },
          },
        },
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
              outcomes: [{ result: "You stride in without looking back.", effects: { vitals: { spirit: 3 }, setStatus: { education: "school" }, addDecks: ["child"], removeDecks: ["baby"] } }],
            },
            right: {
              label: "Cling to the gate",
              outcomes: [{ result: "Peeling you off the railings takes a while.", effects: { vitals: { happiness: -2, spirit: -1 }, setStatus: { education: "school" }, addDecks: ["child"], removeDecks: ["baby"] } }],
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
            left: { label: "Study hard", outcomes: [{ result: "Late nights, but it pays off.", effects: { vitals: { spirit: -2, happiness: -2 } } }] },
            right: { label: "Wing it", outcomes: [{ result: "You coast through on charm and luck.", effects: { vitals: { happiness: 2, spirit: -1 } } }] },
          },
        },
        {
          id: "c_pet",
          kind: "filler",
          prompt: "A scruffy stray cat follows you all the way home.",
          options: {
            left: { label: "Take it in", outcomes: [{ result: "You have a new best friend.", effects: { vitals: { happiness: 4 } } }] },
            right: { label: "Shoo it away", outcomes: [{ result: "It slinks off into the hedge.", effects: { vitals: { happiness: -1 } } }] },
          },
        },
        {
          id: "c_friend",
          kind: "filler",
          prompt: "The new kid at school is looking for someone to sit with.",
          options: {
            left: { label: "Wave them over", outcomes: [{ result: "The start of a great friendship.", effects: { vitals: { happiness: 3, spirit: 1 } } }] },
            right: { label: "Look away", outcomes: [{ result: "You keep to yourself today.", effects: { vitals: { happiness: -1 } } }] },
          },
        },
        {
          id: "c_sports",
          kind: "filler",
          prompt: "Sports day. The whole class is picking teams.",
          options: {
            left: { label: "Throw yourself in", outcomes: [{ result: "Grass stains and grinning.", effects: { vitals: { health: 3, happiness: 1 } } }] },
            right: { label: "Sit it out", outcomes: [{ result: "You cheer from the sidelines.", effects: { vitals: { happiness: 1 } } }] },
          },
        },
      ],
    },
  ],
} satisfies Content;

// `content` above keeps its literal type so authoring stays fully type-checked.
// `gameContent` is the same data widened to `Content` for the engine/UI to read.
export const gameContent: Content = content;
