// Decks — domain group: pets. Split out of content/index.ts; assembled there.
// Player-facing text is by STRING ID (tables in src/i18n); typed
// `satisfies Deck[]` so a misspelled id is still a compile error.
import type { Deck } from "../../engine/types.ts";

export const petDecks = [

    // --- A cat: active while pet = "cat" (set by the stray-cat / pet-shop cards).
    //     A small POSITIVE deck leaning on HAPPINESS — steady comfort for a little
    //     cost (the pet status drift), plus a lifespan. `petCatAge` ticks up a year
    //     each turn (the status `tick`); the passing milestone fires at old age.
    //     `petCatLove` tracks how you treat it — neglect (chiefly refusing the vet)
    //     drives it down until the cat runs off, which removes the pet BEFORE old
    //     age (so a mistreated cat never reaches the passing card). A rare mid-life
    //     litter (pet_cat_kittens) offers coin or a reset clock. All numbers
    //     tunable. The dog deck below mirrors this, leaning on SPIRIT instead. ---
    {
      id: "pet_cat",
      title: "deck.pet_cat.title",
      unlock: "deck.pet_cat.blurb",
      cards: [
        {
          // Kindness raises love; brushing it off lowers it.
          id: "pet_cat_play",
          kind: "one_time",
          prompt: "pet_cat_play.prompt",
          options: {
            left: { label: "pet_cat_play.left", outcomes: [{ result: "pet_cat_play.left.r0", effects: { vitals: { happiness: "+", spirit: "+" }, incTraits: { petCatLove: 1 } } }] },
            right: { label: "pet_cat_play.right", outcomes: [{ result: "pet_cat_play.right.r0", effects: { vitals: { happiness: "-" }, incTraits: { petCatLove: -1 } } }] },
          },
        },
        {
          // Pure flavour — a cat's grim little gift.
          id: "pet_cat_mouse",
          kind: "one_time",
          prompt: "pet_cat_mouse.prompt",
          options: {
            left: { label: "pet_cat_mouse.left", outcomes: [{ result: "pet_cat_mouse.left.r0", effects: { vitals: { happiness: "+", spirit: "+" } } }] },
            right: { label: "pet_cat_mouse.right", outcomes: [{ result: "pet_cat_mouse.right.r0", effects: { vitals: { happiness: "-", health: "-" } } }] },
          },
        },
        {
          // The warm comfort of a cat on your lap — or the coin lost when you shoo
          // it off to get back to work.
          id: "pet_cat_lap",
          kind: "one_time",
          prompt: "pet_cat_lap.prompt",
          options: {
            left: { label: "pet_cat_lap.left", outcomes: [{ result: "pet_cat_lap.left.r0", effects: { vitals: { happiness: "+", spirit: "+" }, incTraits: { petCatLove: 1 } } }] },
            right: { label: "pet_cat_lap.right", outcomes: [{ result: "pet_cat_lap.right.r0", effects: { vitals: { finances: "+", happiness: "-" }, incTraits: { petCatLove: -1 } } }] },
          },
        },
        {
          // The care test: the cat falls ill. Pay the vet (money, and a bond
          // deepened) or leave it to fend for itself (a real blow to its trust —
          // enough on its own to send it off; see the runaway milestone).
          id: "pet_cat_vet",
          kind: "one_time",
          prompt: "pet_cat_vet.prompt",
          options: {
            left: { label: "pet_cat_vet.left", outcomes: [{ result: "pet_cat_vet.left.r0", effects: { vitals: { finances: "-", happiness: "+" }, incTraits: { petCatLove: 2 } } }] },
            right: { label: "pet_cat_vet.right", outcomes: [{ result: "pet_cat_vet.right.r0", effects: { vitals: { happiness: "-" }, incTraits: { petCatLove: -3 } } }] },
          },
        },
        {
          // Neglected, the cat stops coming home. Fires (milestone) once love has
          // sunk low enough — a smaller loss than the old-age passing, and it takes
          // the pet away before it can reach that card. Both options end the pet.
          id: "pet_cat_runaway",
          kind: "milestone",
          priority: 90,
          conditions: { traits: { petCatLove: { max: -1 } } },
          prompt: "pet_cat_runaway.prompt",
          options: {
            left: { label: "pet_cat_runaway.left", outcomes: [{ result: "pet_cat_runaway.left.r0", effects: { vitals: { happiness: "-" }, setStatus: { pet: "none" } } }] },
            right: { label: "pet_cat_runaway.right", outcomes: [{ result: "pet_cat_runaway.right.r0", effects: { vitals: { happiness: "-", health: "-", spirit: "+" }, setStatus: { pet: "none" } } }] },
          },
        },
        {
          // Old age (~12 years on — a good long cat life). Fires (milestone) at
          // petCatAge >= 12. Grieve and let them rest (a big happiness blow, pet
          // gone) or take in a kitten (a smaller blow + the cost of a new one, and
          // the clock resets: petCatAge 0, love refreshed).
          id: "pet_cat_passing",
          kind: "milestone",
          priority: 100,
          conditions: { traits: { petCatAge: { min: 12 } } },
          prompt: "pet_cat_passing.prompt",
          options: {
            left: { label: "pet_cat_passing.left", outcomes: [{ result: "pet_cat_passing.left.r0", effects: { vitals: { happiness: "--" }, setStatus: { pet: "none" } } }] },
            right: { label: "pet_cat_passing.right", outcomes: [{ result: "pet_cat_passing.right.r0", effects: { vitals: { happiness: "-", finances: "--" }, setTraits: { petCatAge: 0, petCatLove: 3 } } }] },
          },
        },
        {
          // A RARE mid-life surprise: the cat has a litter. `chance` gates it to a
          // low per-year roll (see Card.chance) AND it's confined to the middle of
          // the cat's life (petCatAge 4–7), so most cats never have one. Sell the
          // litter for coin, or keep a kitten — which resets the life clock
          // (petCatAge 0), effectively carrying the pet on for another lifespan.
          // one_time, so at most one litter per run.
          id: "pet_cat_kittens",
          kind: "one_time",
          chance: 0.5,
          conditions: { traits: { petCatAge: { min: 4, max: 7 } } },
          prompt: "pet_cat_kittens.prompt",
          options: {
            left: { label: "pet_cat_kittens.left", outcomes: [{ result: "pet_cat_kittens.left.r0", effects: { vitals: { finances: "++", happiness: "-" } } }] },
            right: { label: "pet_cat_kittens.right", outcomes: [{ result: "pet_cat_kittens.right.r0", effects: { vitals: { happiness: "+" }, setTraits: { petCatAge: 0 } } }] },
          },
        },
      ],
    },

    // --- A dog: active while pet = "dog" (set by the pet-shop cards). Mirrors the
    //     cat deck but leans on SPIRIT rather than happiness (and costs a touch
    //     more to keep — see the pet status drift). `petDogAge` ticks up each year;
    //     the passing milestone fires at old age. `petDogLove` tracks how you treat
    //     it — neglect (chiefly refusing the vet) drives it down until the dog
    //     strays, which removes the pet BEFORE old age. A rare mid-life litter
    //     (pet_dog_puppies) offers coin or a reset clock. All numbers tunable. ---
    {
      id: "pet_dog",
      title: "deck.pet_dog.title",
      unlock: "deck.pet_dog.blurb",
      cards: [
        {
          // A walk together: spirit and health if you go, a small pang if you don't.
          id: "pet_dog_walk",
          kind: "one_time",
          prompt: "pet_dog_walk.prompt",
          options: {
            left: { label: "pet_dog_walk.left", outcomes: [{ result: "pet_dog_walk.left.r0", effects: { vitals: { spirit: "+", health: "+" }, incTraits: { petDogLove: 1 } } }] },
            right: { label: "pet_dog_walk.right", outcomes: [{ result: "pet_dog_walk.right.r0", effects: { vitals: { spirit: "-" }, incTraits: { petDogLove: -1 } } }] },
          },
        },
        {
          // The dog earns its keep — flavour, with a sting if you ignore its warning.
          id: "pet_dog_guard",
          kind: "one_time",
          prompt: "pet_dog_guard.prompt",
          options: {
            left: { label: "pet_dog_guard.left", outcomes: [{ result: "pet_dog_guard.left.r0", effects: { vitals: { spirit: "+", happiness: "+" } } }] },
            right: { label: "pet_dog_guard.right", outcomes: [{ result: "pet_dog_guard.right.r0", effects: { vitals: { spirit: "-", finances: "-" } } }] },
          },
        },
        {
          // Loyal comfort after a hard day — the dog's spirit gift, or the coin
          // saved by shooing it back to its corner.
          id: "pet_dog_companion",
          kind: "one_time",
          prompt: "pet_dog_companion.prompt",
          options: {
            left: { label: "pet_dog_companion.left", outcomes: [{ result: "pet_dog_companion.left.r0", effects: { vitals: { spirit: "+", happiness: "+" }, incTraits: { petDogLove: 1 } } }] },
            right: { label: "pet_dog_companion.right", outcomes: [{ result: "pet_dog_companion.right.r0", effects: { vitals: { finances: "+", spirit: "-" }, incTraits: { petDogLove: -1 } } }] },
          },
        },
        {
          // The care test (mirrors the cat's vet card): pay for its care (money, a
          // bond deepened) or leave it — a real blow to its trust, enough on its own
          // to send it off (see the runaway milestone).
          id: "pet_dog_vet",
          kind: "one_time",
          prompt: "pet_dog_vet.prompt",
          options: {
            left: { label: "pet_dog_vet.left", outcomes: [{ result: "pet_dog_vet.left.r0", effects: { vitals: { finances: "-", spirit: "+" }, incTraits: { petDogLove: 2 } } }] },
            right: { label: "pet_dog_vet.right", outcomes: [{ result: "pet_dog_vet.right.r0", effects: { vitals: { spirit: "-" }, incTraits: { petDogLove: -3 } } }] },
          },
        },
        {
          // Neglected, the dog strays for good. Fires (milestone) once love has sunk
          // low enough — a smaller loss than the old-age passing, and it takes the
          // pet away before it can reach that card. Both options end the pet.
          id: "pet_dog_runaway",
          kind: "milestone",
          priority: 90,
          conditions: { traits: { petDogLove: { max: -1 } } },
          prompt: "pet_dog_runaway.prompt",
          options: {
            left: { label: "pet_dog_runaway.left", outcomes: [{ result: "pet_dog_runaway.left.r0", effects: { vitals: { happiness: "-", spirit: "-" }, setStatus: { pet: "none" } } }] },
            right: { label: "pet_dog_runaway.right", outcomes: [{ result: "pet_dog_runaway.right.r0", effects: { vitals: { happiness: "-", health: "-", spirit: "+" }, setStatus: { pet: "none" } } }] },
          },
        },
        {
          // Old age (~12 years on). Fires (milestone) at petDogAge >= 12. Let it
          // rest (a big spirit blow, pet gone) or bring home a pup (a smaller blow +
          // the cost of a new one, and the clock resets: petDogAge 0, love refreshed).
          id: "pet_dog_passing",
          kind: "milestone",
          priority: 100,
          conditions: { traits: { petDogAge: { min: 12 } } },
          prompt: "pet_dog_passing.prompt",
          options: {
            left: { label: "pet_dog_passing.left", outcomes: [{ result: "pet_dog_passing.left.r0", effects: { vitals: { spirit: "--" }, setStatus: { pet: "none" } } }] },
            right: { label: "pet_dog_passing.right", outcomes: [{ result: "pet_dog_passing.right.r0", effects: { vitals: { spirit: "-", finances: "--" }, setTraits: { petDogAge: 0, petDogLove: 3 } } }] },
          },
        },
        {
          // A RARE mid-life litter of pups (mirrors pet_cat_kittens): sell them for
          // coin, or keep the runt — which resets the life clock (petDogAge 0).
          // `chance`-gated + confined to petDogAge 4–7, one_time.
          id: "pet_dog_puppies",
          kind: "one_time",
          chance: 0.5,
          conditions: { traits: { petDogAge: { min: 4, max: 7 } } },
          prompt: "pet_dog_puppies.prompt",
          options: {
            left: { label: "pet_dog_puppies.left", outcomes: [{ result: "pet_dog_puppies.left.r0", effects: { vitals: { finances: "++", spirit: "-" } } }] },
            right: { label: "pet_dog_puppies.right", outcomes: [{ result: "pet_dog_puppies.right.r0", effects: { vitals: { spirit: "+" }, setTraits: { petDogAge: 0 } } }] },
          },
        },
      ],
    },
] satisfies Deck[];
