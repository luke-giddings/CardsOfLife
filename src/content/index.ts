import type { Content } from "../engine/types.ts";

// ---------------------------------------------------------------------------
// Content — BABY (ages 0–5) then CHILD (ages 5–17), ending at 18 for now.
//
// Vital changes use readable magnitude steps: "+" (small) / "++" (large), and
// "-" / "--" for losses. The point values live in MAGNITUDE_POINTS (types.ts),
// so balancing is one place and every move is a clearly-perceptible size.
// Baby is a tutorial + build-up and is impossible to lose (positive only).
//
// Authored as typed data (`satisfies Content`) — misspelled traits, stats or
// magnitudes are compile errors.
// ---------------------------------------------------------------------------

export const content = {
  start: {
    // Start low — babyhood is where the meters get built up, ready for the
    // child deck to start spending them.
    vitals: { finances: 15, happiness: 20, health: 25, spirit: 15 },
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
    // --- Baby: ages 0–5. Tutorial + build-up; impossible to lose. -----------
    {
      id: "baby",
      cards: [
        {
          id: "b_birth",
          kind: "milestone",
          priority: 100,
          conditions: { ageMin: 0, ageMax: 0 },
          prompt: "You have just been born!\n\nSwipe to choose — are you a boy or a girl?",
          options: {
            left: { label: "Boy", outcomes: [{ result: "A boy. Your story begins.", effects: { setTraits: { gender: "boy" } } }] },
            right: { label: "Girl", outcomes: [{ result: "A girl. Your story begins.", effects: { setTraits: { gender: "girl" } } }] },
          },
        },
        {
          // Teaches that choices move the bars, and teaches the down-swipe.
          // Each option boosts a different vital (all positive).
          id: "b_firststeps",
          kind: "milestone",
          priority: 90,
          conditions: { ageMin: 1, ageMax: 1 },
          prompt: "You take your first wobbly steps!\n\nEach choice boosts a different stat — watch the bars. Where do you toddle?",
          options: {
            left: { label: "To your toys", outcomes: [{ result: "Hours of giggling, gurgling fun.", effects: { vitals: { happiness: "++" } } }] },
            right: { label: "To your parents", outcomes: [{ result: "A proud, loving cuddle.", effects: { vitals: { spirit: "++" } } }] },
            down: { label: "To your cot", outcomes: [{ result: "A long nap does you the world of good.", effects: { vitals: { health: "++" } } }] },
          },
        },

        // --- ages 2–4: one_time "setups" (you'll see ~3 of these per run) ---
        {
          id: "b_uncle",
          kind: "one_time",
          prompt: "Your well-off uncle wants to help the little one out.",
          options: {
            left: { label: "A mountain of toys!", outcomes: [{ result: "Christmas comes early. Wrapping paper everywhere.", effects: { vitals: { happiness: "++" } } }] },
            right: { label: "A university trust fund", outcomes: [{ result: "Quietly tucked away for a clever future.", effects: { vitals: { finances: "+" }, setTraits: { uniFund: true } } }] },
            down: { label: "Healthy food & baby classes", outcomes: [{ result: "Organic everything and splashy swim lessons.", effects: { vitals: { health: "++" } } }] },
          },
        },
        {
          id: "b_bookworm",
          kind: "one_time",
          prompt: "You reach for the same picture book, over and over again.",
          options: {
            left: { label: "Read together nightly", outcomes: [{ result: "A shared love of stories takes root.", effects: { vitals: { spirit: "+" }, setTraits: { bookish: true } } }] },
            right: { label: "Pop the telly on", outcomes: [{ result: "Bright colours and very catchy songs.", effects: { vitals: { happiness: "++" } } }] },
          },
        },
        {
          id: "b_sporty",
          kind: "one_time",
          prompt: "You will NOT sit still for one single second.",
          options: {
            left: { label: "Enrol in tumble-tots", outcomes: [{ result: "Forward rolls and gloriously grazed knees.", effects: { vitals: { health: "+" }, setTraits: { sporty: true } } }] },
            right: { label: "Let them wear out", outcomes: [{ result: "You crash out, fast asleep, by 7pm sharp.", effects: { vitals: { health: "++" } } }] },
          },
        },
        {
          id: "b_grandma",
          kind: "one_time",
          prompt: "Grandma is absolutely determined to spoil you rotten.",
          options: {
            left: { label: "Second helpings of pudding!", outcomes: [{ result: "A lifelong sweet tooth is born.", effects: { vitals: { happiness: "++" }, setTraits: { sweetTooth: true } } }] },
            right: { label: "Just a little treat", outcomes: [{ result: "A bit of everything, in moderation.", effects: { vitals: { happiness: "+", health: "+" } } }] },
          },
        },
        {
          id: "b_vaccine",
          kind: "one_time",
          prompt: "The doctor readies a very small needle.",
          options: {
            left: { label: "Brave it", outcomes: [{ result: "One yelp, then a lollipop. Protected for life.", effects: { vitals: { health: "++" }, setTraits: { vaccinated: true } } }] },
            right: { label: "Squirm free", outcomes: [{ result: "You wriggle away from the needle — this time.", effects: { vitals: { happiness: "++" } } }] },
          },
        },
        {
          id: "b_nursery",
          kind: "one_time",
          prompt: "Should you start at the local nursery?",
          options: {
            left: { label: "Off you go!", outcomes: [{ result: "New friends, finger paints and snack time.", effects: { vitals: { spirit: "+" }, setTraits: { sociable: true } } }] },
            right: { label: "Stay home a while", outcomes: [{ result: "Cosy, unhurried days with family.", effects: { vitals: { happiness: "++" } } }] },
          },
        },
        {
          id: "b_brother",
          kind: "one_time",
          prompt: "Big news — a baby brother has arrived!",
          options: {
            left: { label: "Adore him", outcomes: [{ result: "You appoint yourself his chief protector.", effects: { vitals: { happiness: "++" }, setTraits: { hasBrother: true }, incTraits: { relBrother: 30 }, addDecks: ["sibling"] } }] },
            right: { label: "Cold shoulder", outcomes: [{ result: "You keep your distance and your own world.", effects: { vitals: { spirit: "++" }, setTraits: { hasBrother: true }, incTraits: { relBrother: -15 }, addDecks: ["sibling"] } }] },
          },
        },
        {
          id: "b_sister",
          kind: "one_time",
          prompt: "Big news — a baby sister has arrived!",
          options: {
            left: { label: "Adore her", outcomes: [{ result: "Instant best friend and partner in crime.", effects: { vitals: { happiness: "++" }, setTraits: { hasSister: true }, incTraits: { relSister: 30 }, addDecks: ["sibling"] } }] },
            right: { label: "Cold shoulder", outcomes: [{ result: "You keep to yourself and your own world.", effects: { vitals: { spirit: "++" }, setTraits: { hasSister: true }, incTraits: { relSister: -15 }, addDecks: ["sibling"] } }] },
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
              outcomes: [{ result: "You stride in without looking back.", effects: { vitals: { spirit: "+" }, setStatus: { education: "school" }, addDecks: ["child"], removeDecks: ["baby"] } }],
            },
            right: {
              label: "Cling on",
              outcomes: [{ result: "Peeling you off the railings takes a while, but you settle in.", effects: { vitals: { happiness: "+" }, setStatus: { education: "school" }, addDecks: ["child"], removeDecks: ["baby"] } }],
            },
          },
        },
      ],
    },

    // --- Child: ages 5–17. Ends at 18. The balancing game begins. -----------
    {
      id: "child",
      title: "Childhood",
      unlock: "You're a child now — a whole world of playgrounds, lessons, scraped knees and best friends awaits.",
      cards: [
        {
          id: "c_martialarts",
          kind: "one_time",
          prompt: "A dojo opens down the road. The instructor waves you in.",
          options: {
            left: { label: "Sign up", outcomes: [{ result: "You learn to stand your ground. Hi-yah!", effects: { vitals: { spirit: "++", finances: "-" }, setTraits: { knowsMartialArts: true } } }] },
            right: { label: "No thanks", outcomes: [{ result: "You head home to your cartoons instead.", effects: { vitals: { happiness: "+" } } }] },
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
                { if: { traits: { knowsMartialArts: true } }, result: "You calmly floor them. The yard goes silent — then cheers.", effects: { vitals: { spirit: "++", health: "-" } } },
                { result: "You get a bloody nose, but you stood your ground.", effects: { vitals: { spirit: "+", health: "--" } } },
              ],
            },
            right: { label: "Walk away", outcomes: [{ result: "You swallow it and leave. It stings for weeks.", effects: { vitals: { happiness: "--", spirit: "-" } } }] },
          },
        },
        {
          id: "c_exams",
          kind: "one_time",
          conditions: { ageMin: 11 },
          prompt: "Big exams are looming on the horizon.",
          options: {
            left: { label: "Study hard", outcomes: [{ result: "Late nights, but you ace them.", effects: { vitals: { spirit: "+", happiness: "-" } } }] },
            right: { label: "Wing it", outcomes: [{ result: "You coast through on charm and luck.", effects: { vitals: { happiness: "+", spirit: "-" } } }] },
          },
        },
        {
          id: "c_firstcrush",
          kind: "one_time",
          conditions: { ageMin: 13 },
          prompt: "Your heart does something strange when a certain classmate walks by.",
          options: {
            left: { label: "Say hello", outcomes: [{ result: "You manage a squeaky 'hi'. They smile back!", effects: { vitals: { happiness: "++", spirit: "+" } } }] },
            right: { label: "Panic and hide", outcomes: [{ result: "You duck behind a locker. Smooth.", effects: { vitals: { happiness: "-" } } }] },
          },
        },
        {
          id: "c_pet",
          kind: "filler",
          prompt: "A scruffy stray cat follows you all the way home.",
          options: {
            left: { label: "Take it in", outcomes: [{ result: "You have a new best friend.", effects: { vitals: { happiness: "++" } } }] },
            right: { label: "Shoo it off", outcomes: [{ result: "It slinks off into the hedge.", effects: { vitals: { happiness: "-" } } }] },
          },
        },
        {
          id: "c_friend",
          kind: "filler",
          prompt: "The new kid at school is looking for someone to sit with.",
          options: {
            left: { label: "Wave over", outcomes: [{ result: "The start of a great friendship.", effects: { vitals: { happiness: "+", spirit: "+" } } }] },
            right: { label: "Look away", outcomes: [{ result: "You keep to yourself today.", effects: { vitals: { happiness: "-" } } }] },
          },
        },
        {
          id: "c_sports",
          kind: "filler",
          prompt: "Sports day. The whole class is picking teams.",
          options: {
            left: { label: "Dive in", outcomes: [{ result: "Grass stains and grinning.", effects: { vitals: { health: "+", happiness: "+" } } }] },
            right: { label: "Sit out", outcomes: [{ result: "You cheer from the sidelines.", effects: { vitals: { happiness: "+", health: "-" } } }] },
          },
        },
        {
          id: "c_chores",
          kind: "filler",
          prompt: "Your parents offer pocket money for helping around the house.",
          options: {
            left: { label: "Do the chores", outcomes: [{ result: "A little jingle in your pocket.", effects: { vitals: { finances: "+", happiness: "-" } } }] },
            right: { label: "Go play", outcomes: [{ result: "Chores can wait. Fun can't.", effects: { vitals: { happiness: "+" } } }] },
          },
        },
        {
          id: "c_sweets",
          kind: "filler",
          prompt: "The corner shop is full of pick-and-mix.",
          options: {
            left: { label: "Buy a bagful", outcomes: [{ result: "Sugar heaven, dentist's nightmare.", effects: { vitals: { happiness: "+", health: "-" } } }] },
            right: { label: "Save your coins", outcomes: [{ result: "The piggy bank thanks you.", effects: { vitals: { finances: "+" } } }] },
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

    // --- Sibling: one shared deck for now, unlocked by the brother/sister
    //     cards. Repeatable relationship up/down events. Each option branches
    //     to whichever sibling you have (brother first, sister as fallback).
    //     Only the hidden relationship changes direction — the "rival" option
    //     still gives a vital (independence), so rivalry isn't a worse choice,
    //     just a different one, and it stays baby-safe (no vital losses).
    {
      id: "sibling",
      title: "Your Sibling",
      unlock: "You've got a little sidekick now — partner in crime, or thorn in your side. That's up to you.",
      cards: [
        {
          id: "sib_play",
          kind: "filler",
          prompt: "Your little sibling is begging you to come and play.",
          options: {
            left: {
              label: "Play along",
              outcomes: [
                { if: { traits: { hasBrother: true } }, result: "You build an epic blanket fort together. Best mates.", effects: { vitals: { happiness: "+" }, incTraits: { relBrother: 8 } } },
                { result: "You build an epic blanket fort together. Best mates.", effects: { vitals: { happiness: "+" }, incTraits: { relSister: 8 } } },
              ],
            },
            right: {
              label: "Wind them up",
              outcomes: [
                { if: { traits: { hasBrother: true } }, result: "You hide their favourite toy. Cue meltdown.", effects: { vitals: { spirit: "+" }, incTraits: { relBrother: -8 } } },
                { result: "You hide their favourite toy. Cue meltdown.", effects: { vitals: { spirit: "+" }, incTraits: { relSister: -8 } } },
              ],
            },
          },
        },
        {
          id: "sib_blame",
          kind: "filler",
          prompt: "Something's broken, and a parent is demanding to know who did it.",
          options: {
            left: {
              label: "Take the blame",
              outcomes: [
                { if: { traits: { hasBrother: true } }, result: "You cover for your brother. He never forgets it.", effects: { vitals: { spirit: "+" }, incTraits: { relBrother: 8 } } },
                { result: "You cover for your sister. She never forgets it.", effects: { vitals: { spirit: "+" }, incTraits: { relSister: 8 } } },
              ],
            },
            right: {
              label: "Point the finger",
              outcomes: [
                { if: { traits: { hasBrother: true } }, result: "You dob your brother in. You're off the hook — he isn't.", effects: { vitals: { happiness: "+" }, incTraits: { relBrother: -8 } } },
                { result: "You dob your sister in. You're off the hook — she isn't.", effects: { vitals: { happiness: "+" }, incTraits: { relSister: -8 } } },
              ],
            },
          },
        },
        {
          id: "sib_treat",
          kind: "filler",
          prompt: "There is exactly one biscuit left in the tin.",
          options: {
            left: {
              label: "Split it fairly",
              outcomes: [
                { if: { traits: { hasBrother: true } }, result: "Half each, no arguments. Your brother grins.", effects: { vitals: { spirit: "+" }, incTraits: { relBrother: 8 } } },
                { result: "Half each, no arguments. Your sister grins.", effects: { vitals: { spirit: "+" }, incTraits: { relSister: 8 } } },
              ],
            },
            right: {
              label: "Scoff it yourself",
              outcomes: [
                { if: { traits: { hasBrother: true } }, result: "Delicious. Your brother is furious.", effects: { vitals: { happiness: "+" }, incTraits: { relBrother: -8 } } },
                { result: "Delicious. Your sister is furious.", effects: { vitals: { happiness: "+" }, incTraits: { relSister: -8 } } },
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
