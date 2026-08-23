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
    // Start low and even — babyhood is where the meters get built up (unevenly,
    // by your choices), ready for the child deck to start spending them.
    vitals: { finances: 20, happiness: 20, health: 20, spirit: 20 },
    statuses: { job: "none", housing: "family", education: "none", lifestyle: "default" },
    decks: ["baby"],
    traits: {},
  },

  statuses: {
    job: {
      id: "job",
      states: {
        none: {},
        // Victorian child labour: a few coins, at a steady cost to health,
        // and it opens the dangerous child_work deck.
        child_labourer: { label: "Child labourer", drift: { finances: 2, health: -2 }, addDecks: ["child_work"] },
      },
    },
    housing: {
      id: "housing",
      states: {
        family: { label: "With family" },
        workhouse: { label: "Workhouse", drift: { health: -2, happiness: -2 } },
      },
    },
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
            right: { label: "A university trust fund", outcomes: [{ result: "Quietly tucked away for a clever future.", effects: { vitals: { finances: "++" }, setTraits: { uniFund: true } } }] },
            down: { label: "Healthy food & baby classes", outcomes: [{ result: "Organic everything and splashy swim lessons.", effects: { vitals: { health: "++" } } }] },
          },
        },
        {
          id: "b_bookworm",
          kind: "one_time",
          prompt: "You reach for the same picture book, over and over again.",
          options: {
            left: { label: "Read together nightly", outcomes: [{ result: "A shared love of stories takes root.", effects: { vitals: { spirit: "+" }, setTraits: { bookish: true } } }] },
            right: { label: "Run wild outside", outcomes: [{ result: "You tear about the yard with the other urchins.", effects: { vitals: { happiness: "++" } } }] },
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
            right: { label: "Just a little treat", outcomes: [{ result: "A wholesome bit of everything, in moderation.", effects: { vitals: { health: "+" } } }] },
            down: { label: "Bank it for the future", outcomes: [{ result: "She squirrels the treat money into a savings account for you.", effects: { vitals: { finances: "++" } } }] },
          },
        },
        {
          id: "b_vaccine",
          kind: "one_time",
          prompt: "The vaccinator calls at the door with his lancet — the smallpox jab.",
          options: {
            left: { label: "Brave the lancet", outcomes: [{ result: "One yelp, and it's done. You're protected against the pox.", effects: { vitals: { health: "+" }, setTraits: { vaccinated: true } } }] },
            right: { label: "Squirm free", outcomes: [{ result: "You wriggle free and dig your heels in — nobody pins you down.", effects: { vitals: { spirit: "++" } } }] },
          },
        },
        {
          id: "b_nursery",
          kind: "one_time",
          prompt: "Should you start at the local nursery?",
          options: {
            left: { label: "Off you go!", outcomes: [{ result: "New friends, finger paints and snack time.", effects: { vitals: { spirit: "+" }, setTraits: { sociable: true } } }] },
            right: { label: "Stay home a while", outcomes: [{ result: "Cosy, unhurried, well-rested days at home.", effects: { vitals: { health: "+" } } }] },
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
          id: "m_schooling",
          kind: "milestone",
          priority: 20,
          conditions: { ageMin: 5 },
          prompt: "You're old enough now. Off to school to better yourself — or out to work to help feed the family?",
          options: {
            left: {
              label: "Go to school",
              outcomes: [{ result: "Slate, chalk, and a stern schoolmaster. A chance at something more.", effects: { vitals: { spirit: "+" }, setStatus: { education: "school" }, addDecks: ["child"], removeDecks: ["baby"] } }],
            },
            right: {
              label: "Out to work",
              outcomes: [{ result: "Long hours in the din for a few coins in the family pot.", effects: { vitals: { finances: "+" }, setStatus: { job: "child_labourer" }, addDecks: ["child"], removeDecks: ["baby"] } }],
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
          prompt: "Old Tom, a retired prizefighter, offers to teach the local lads to box.",
          options: {
            left: { label: "Learn to box", outcomes: [{ result: "Fists up, chin down. You learn to handle yourself — for a few coins.", effects: { vitals: { spirit: "++", health: "+", finances: "-" }, setTraits: { knowsMartialArts: true } } }] },
            right: { label: "Keep your head down", outcomes: [{ result: "You keep your pennies and your quiet life — but never learn to stand up for yourself.", effects: { vitals: { happiness: "+", finances: "+", spirit: "-" } } }] },
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
                { if: { traits: { knowsMartialArts: true } }, result: "You calmly floor them. The yard cheers — bar one scraped knuckle.", effects: { vitals: { spirit: "++", happiness: "+", health: "-" } } },
                { result: "A bloody nose. You stood your ground, but it really hurt.", effects: { vitals: { spirit: "+", happiness: "-", health: "--" } } },
              ],
            },
            right: { label: "Walk away", outcomes: [{ result: "You avoid the beating, but the humiliation festers for weeks.", effects: { vitals: { happiness: "--", spirit: "-", health: "+" } } }] },
          },
        },
        {
          id: "c_exams",
          kind: "one_time",
          conditions: { ageMin: 11 },
          prompt: "Big exams are looming on the horizon.",
          options: {
            left: { label: "Study hard", outcomes: [{ result: "Top marks — earned with stress and sleepless nights.", effects: { vitals: { spirit: "++", happiness: "-", health: "-" } } }] },
            right: { label: "Wing it", outcomes: [{ result: "Relaxed and well-rested, but the results sting.", effects: { vitals: { happiness: "+", health: "+", spirit: "-" } } }] },
          },
        },
        {
          id: "c_firstcrush",
          kind: "one_time",
          conditions: { ageMin: 13 },
          prompt: "Your heart does something strange when a certain classmate walks by.",
          options: {
            left: { label: "Say hello", outcomes: [{ result: "They smile back! Butterflies, and not much sleep.", effects: { vitals: { happiness: "++", spirit: "+", health: "-" } } }] },
            right: { label: "Panic and hide", outcomes: [{ result: "You dive behind the coal shed. Mortifying — but the panic soon passes.", effects: { vitals: { happiness: "-", spirit: "-", health: "+" } } }] },
          },
        },
        {
          id: "c_pet",
          kind: "filler",
          prompt: "A scruffy stray cat follows you all the way home.",
          options: {
            left: { label: "Take it in", outcomes: [{ result: "A new best friend who gets you outdoors — vet bills and all.", effects: { vitals: { happiness: "++", health: "+", finances: "-" } } }] },
            right: { label: "Shoo it off", outcomes: [{ result: "You save the hassle and the money, but feel a pang.", effects: { vitals: { happiness: "-", spirit: "-", finances: "+" } } }] },
          },
        },
        {
          id: "c_friend",
          kind: "filler",
          prompt: "The new kid at school is looking for someone to sit with.",
          options: {
            left: { label: "Wave over", outcomes: [{ result: "A wonderful friend — though you rather lose yourself in them.", effects: { vitals: { happiness: "++", spirit: "-" } } }] },
            right: { label: "Look away", outcomes: [{ result: "A lonelier term, but you learn to stand on your own two feet.", effects: { vitals: { happiness: "-", spirit: "+" } } }] },
          },
        },
        {
          id: "c_sports",
          kind: "filler",
          prompt: "The lads get up a rough game of football in the muddy street.",
          options: {
            left: { label: "Go all-out", outcomes: [{ result: "Wrecked, grass-stained and fiercely proud.", effects: { vitals: { health: "++", spirit: "+", happiness: "-" } } }] },
            right: { label: "Take it easy", outcomes: [{ result: "A laugh on the sidelines, but unfit and a bit of a let-down.", effects: { vitals: { happiness: "+", health: "-", spirit: "-" } } }] },
          },
        },
        {
          id: "c_chores",
          kind: "filler",
          prompt: "Your parents offer pocket money for helping around the house.",
          options: {
            left: { label: "Do the chores", outcomes: [{ result: "Money in your pocket and a puffed-out chest — but no play.", effects: { vitals: { finances: "+", spirit: "+", happiness: "-" } } }] },
            right: { label: "Go play", outcomes: [{ result: "Fun and fresh air, and an empty piggy bank.", effects: { vitals: { happiness: "+", health: "+", finances: "-" } } }] },
          },
        },
        {
          id: "c_sweets",
          kind: "filler",
          prompt: "The sweet-shop window: humbugs, sherbet and liquorice, a farthing a twist.",
          options: {
            left: {
              label: "Buy a bagful",
              outcomes: [
                { if: { traits: { sweetTooth: true } }, result: "That sweet tooth wins — you buy double and regret nothing (yet).", effects: { vitals: { happiness: "++", health: "--", finances: "-" } } },
                { result: "Sugar heaven — bad for your teeth and your pocket.", effects: { vitals: { happiness: "+", health: "-", finances: "-" } } },
              ],
            },
            right: {
              label: "Save your coins",
              outcomes: [
                { if: { traits: { sweetTooth: true } }, result: "Walking past the pick-and-mix is agony, but your willpower hardens.", effects: { vitals: { spirit: "++", happiness: "--", finances: "+" } } },
                { result: "The piggy bank grows. Easy, when you're not that fussed.", effects: { vitals: { finances: "+", spirit: "+", happiness: "-" } } },
              ],
            },
          },
        },
        // --- Hazards: childhood was deadly. Survival is earned through your
        //     earlier choices (vaccinated, sporty, health kept up, savings). ---
        {
          id: "h_fever",
          kind: "one_time",
          conditions: { ageMin: 6 },
          prompt: "A fever sweeps through the street, and now it is burning through you.",
          options: {
            left: {
              label: "Sweat it out",
              outcomes: [
                { if: { traits: { vaccinated: true } }, result: "Your inoculation holds. You pull through, pale but alive.", effects: { vitals: { health: "-" } } },
                { if: { vitals: { health: { min: 50 } } }, result: "You are strong enough to fight it off.", effects: { vitals: { health: "--" } } },
                { result: "You are too weak. The fever takes you in the night.", effects: { endGame: "health" } },
              ],
            },
            right: {
              label: "Send for the doctor",
              outcomes: [
                { if: { vitals: { finances: { min: 30 } } }, result: "The doctor's tonic works — dear, but worth every penny.", effects: { vitals: { finances: "--", health: "-" } } },
                { if: { vitals: { health: { min: 40 } } }, result: "No coin for a doctor, but you are just hardy enough to endure.", effects: { vitals: { health: "--" } } },
                { result: "No money and no strength. The fever wins.", effects: { endGame: "health" } },
              ],
            },
          },
        },
        {
          id: "h_accident",
          kind: "one_time",
          conditions: { ageMin: 5 },
          prompt: "A runaway cart thunders down the cobbles — straight at you!",
          options: {
            left: {
              label: "Leap clear",
              outcomes: [
                { if: { traits: { sporty: true } }, result: "Quick as a cat, you spring aside.", effects: { vitals: { spirit: "+" } } },
                { if: { vitals: { health: { min: 40 } } }, result: "You dive and roll — bruised, but whole.", effects: { vitals: { health: "--" } } },
                { result: "You are not quick enough.", effects: { endGame: "health" } },
              ],
            },
            right: {
              label: "Freeze",
              outcomes: [
                { if: { vitals: { health: { min: 60 } } }, result: "It clips you and flings you aside — battered, but breathing.", effects: { vitals: { health: "--", happiness: "-" } } },
                { result: "You freeze. The wheels do not.", effects: { endGame: "health" } },
              ],
            },
          },
        },
        {
          id: "h_hunger",
          kind: "one_time",
          conditions: { ageMin: 6, vitals: { finances: { max: 25 } } },
          prompt: "The cupboards are bare, and there are too many mouths to feed.",
          options: {
            left: { label: "Beg and scavenge", outcomes: [{ result: "You get by on scraps, charity and quick fingers.", effects: { vitals: { finances: "+", health: "-", happiness: "-" } } }] },
            right: { label: "Into the workhouse", outcomes: [{ result: "Cold gruel and hard labour — but a roof, of sorts.", effects: { vitals: { happiness: "--", health: "-" }, setStatus: { housing: "workhouse" } } }] },
          },
        },

        {
          id: "m_adult",
          kind: "milestone",
          priority: 100,
          conditions: { ageMin: 18 },
          prompt: "Against the odds, you reach eighteen. So many did not. Childhood is behind you.",
          options: {
            left: { label: "Look back", outcomes: [{ result: "You survived. So much has happened already…", effects: { endGame: "grown_up" } }] },
            right: { label: "Charge ahead", outcomes: [{ result: "You made it this far. Whatever comes next, you're ready.", effects: { endGame: "grown_up" } }] },
          },
        },
      ],
    },

    // --- Child at work: hazards and events only for the labouring path. ------
    {
      id: "child_work",
      cards: [
        {
          id: "hw_machine",
          kind: "one_time",
          prompt: "The foreman waves you under the thundering loom to clear a jam.",
          options: {
            left: {
              label: "Reach in",
              outcomes: [
                { if: { traits: { sporty: true } }, result: "Deft, nimble fingers — the jam clears, no harm done.", effects: { vitals: { finances: "+", spirit: "+" } } },
                { if: { vitals: { health: { min: 40 } } }, result: "A nasty gash across your hand, but you manage.", effects: { vitals: { health: "--", finances: "+" } } },
                { result: "The machine does not stop for anyone.", effects: { endGame: "health" } },
              ],
            },
            right: { label: "Refuse", outcomes: [{ result: "The foreman docks your pay and clips your ear.", effects: { vitals: { finances: "-", happiness: "-", health: "-" } } }] },
          },
        },
        {
          id: "jw_wages",
          kind: "filler",
          prompt: "Friday, and the foreman counts out your wages.",
          options: {
            left: { label: "All to the family", outcomes: [{ result: "Every penny to the family pot. They are proud of you.", effects: { vitals: { finances: "+", spirit: "+", happiness: "-" } } }] },
            right: { label: "Keep a little back", outcomes: [{ result: "A secret farthing for yourself — guilty, but glad.", effects: { vitals: { happiness: "+", finances: "+", spirit: "-" } } }] },
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
