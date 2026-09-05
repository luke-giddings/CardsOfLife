// Decks — domain group: home. Split out of content/index.ts; assembled there.
// Player-facing text is by STRING ID (tables in src/i18n); typed
// `satisfies Deck[]` so a misspelled id is still a compile error.
import type { Deck } from "../../engine/types.ts";

export const homeDecks = [

    // --- Home life with the family: active while housing = family. ----------
    {
      id: "home_family",
      cards: [
        {
          id: "home_family_chores",
          kind: "one_time",
          prompt: "home_family_chores.prompt",
          options: {
            left: { label: "home_family_chores.left", outcomes: [{ result: "home_family_chores.left.r0", effects: { vitals: { finances: "++", spirit: "+", happiness: "-" } } }] },
            right: { label: "home_family_chores.right", outcomes: [{ result: "home_family_chores.right.r0", effects: { vitals: { happiness: "+", health: "+", finances: "-" } } }] },
          },
        },
        {
          id: "home_family_sweets",
          kind: "one_time",
          prompt: "home_family_sweets.prompt",
          options: {
            left: {
              label: "home_family_sweets.left",
              outcomes: [
                { if: { traits: { persSweetTooth: true } }, result: "home_family_sweets.left.r0", effects: { vitals: { happiness: "++", health: "--", finances: "-" } } },
                { result: "home_family_sweets.left.r1", effects: { vitals: { happiness: "+", health: "-", finances: "-" } } },
              ],
            },
            right: {
              label: "home_family_sweets.right",
              outcomes: [
                { if: { traits: { persSweetTooth: true } }, result: "home_family_sweets.right.r0", effects: { vitals: { spirit: "++", happiness: "--", finances: "+" } } },
                { result: "home_family_sweets.right.r1", effects: { vitals: { finances: "+", spirit: "+", happiness: "-" } } },
              ],
            },
          },
        },
        {
          id: "home_family_pet",
          kind: "one_time",
          prompt: "home_family_pet.prompt",
          options: {
            left: { label: "home_family_pet.left", outcomes: [{ result: "home_family_pet.left.r0", effects: { vitals: { happiness: "++", health: "+", finances: "-" } } }] },
            right: { label: "home_family_pet.right", outcomes: [{ result: "home_family_pet.right.r0", effects: { vitals: { finances: "+", spirit: "+", happiness: "-" } } }] },
          },
        },
        {
          id: "home_family_market",
          kind: "one_time",
          prompt: "home_family_market.prompt",
          options: {
            left: { label: "home_family_market.left", outcomes: [{ result: "home_family_market.left.r0", effects: { vitals: { finances: "+", spirit: "+", happiness: "-" } } }] },
            right: { label: "home_family_market.right", outcomes: [{ result: "home_family_market.right.r0", effects: { vitals: { happiness: "+", health: "+", finances: "-" } } }] },
          },
        },
        {
          id: "home_family_fair",
          kind: "one_time",
          prompt: "home_family_fair.prompt",
          options: {
            left: { label: "home_family_fair.left", outcomes: [{ result: "home_family_fair.left.r0", effects: { vitals: { happiness: "++", finances: "-", health: "-" } } }] },
            right: { label: "home_family_fair.right", outcomes: [{ result: "home_family_fair.right.r0", effects: { vitals: { finances: "+", spirit: "+", happiness: "-" } } }] },
          },
        },
        {
          id: "home_family_church",
          kind: "one_time",
          prompt: "home_family_church.prompt",
          options: {
            left: { label: "home_family_church.left", outcomes: [{ result: "home_family_church.left.r0", effects: { vitals: { spirit: "++", happiness: "-" } } }] },
            right: { label: "home_family_church.right", outcomes: [{ result: "home_family_church.right.r0", effects: { vitals: { happiness: "+", spirit: "-" } } }] },
          },
        },
        {
          id: "home_family_relative",
          kind: "one_time",
          prompt: "home_family_relative.prompt",
          options: {
            left: { label: "home_family_relative.left", outcomes: [{ result: "home_family_relative.left.r0", effects: { vitals: { finances: "+", spirit: "-" } } }] },
            right: { label: "home_family_relative.right", outcomes: [{ result: "home_family_relative.right.r0", effects: { vitals: { spirit: "+", happiness: "+", finances: "-" } } }] },
          },
        },
        {
          id: "home_family_scrump",
          kind: "one_time",
          prompt: "home_family_scrump.prompt",
          options: {
            left: { label: "home_family_scrump.left", outcomes: [{ result: "home_family_scrump.left.r0", effects: { vitals: { happiness: "++", finances: "+", health: "-" } } }] },
            right: { label: "home_family_scrump.right", outcomes: [{ result: "home_family_scrump.right.r0", effects: { vitals: { spirit: "++", happiness: "-", health: "+" } } }] },
          },
        },
        {
          // A well-off older child can strike out on their own: a big up-front
          // cost, then housing=renting (its own rent/spirit drift), which hands
          // the home_family deck away. `filler` so the offer recurs while you
          // can afford it.
          id: "home_family_moveout",
          kind: "filler",
          // Forced when money maxes out (so full coffers always surface the
          // chance to spend), and available in the pool from finances >= 50.
          force: "finances",
          conditions: { ageMin: 14, vitals: { finances: { min: 50 } } },
          prompt: "home_family_moveout.prompt",
          options: {
            left: { label: "home_family_moveout.left", outcomes: [{ result: "home_family_moveout.left.r0", effects: { vitals: { finances: "---", happiness: "+", spirit: "+" }, setStatus: { housing: "renting" } } }] },
            right: { label: "home_family_moveout.right", outcomes: [{ result: "home_family_moveout.right.r0", effects: { vitals: { happiness: "-" } } }] },
          },
        },
      ],
    },

    // --- A place of your own: active while housing = renting. Flat life on top
    //     of the rent/spirit drift — a lodger for income, the landlord, doing
    //     the place up, neighbours. (First pass / mock-up.) ------------------
    {
      id: "home_renting",
      title: "deck.home_renting.title",
      unlock: "deck.home_renting.blurb",
      cards: [
        {
          id: "home_renting_lodger",
          kind: "one_time",
          prompt: "home_renting_lodger.prompt",
          options: {
            left: { label: "home_renting_lodger.left", outcomes: [{ result: "home_renting_lodger.left.r0", effects: { vitals: { finances: "++", happiness: "-", spirit: "-" } } }] },
            right: { label: "home_renting_lodger.right", outcomes: [{ result: "home_renting_lodger.right.r0", effects: { vitals: { spirit: "++", happiness: "+", finances: "-" } } }] },
          },
        },
        {
          id: "home_renting_landlord",
          kind: "one_time",
          prompt: "home_renting_landlord.prompt",
          options: {
            left: { label: "home_renting_landlord.left", outcomes: [{ result: "home_renting_landlord.left.r0", effects: { vitals: { finances: "--", spirit: "+" } } }] },
            right: { label: "home_renting_landlord.right", outcomes: [{ result: "home_renting_landlord.right.r0", effects: { vitals: { finances: "+", happiness: "-", health: "-" } } }] },
          },
        },
        {
          id: "home_renting_furnish",
          kind: "one_time",
          prompt: "home_renting_furnish.prompt",
          options: {
            left: { label: "home_renting_furnish.left", outcomes: [{ result: "home_renting_furnish.left.r0", effects: { vitals: { happiness: "++", spirit: "+", finances: "-" } } }] },
            right: { label: "home_renting_furnish.right", outcomes: [{ result: "home_renting_furnish.right.r0", effects: { vitals: { finances: "+", happiness: "-", health: "-" } } }] },
          },
        },
        {
          id: "home_renting_neighbour",
          kind: "one_time",
          prompt: "home_renting_neighbour.prompt",
          options: {
            left: { label: "home_renting_neighbour.left", outcomes: [{ result: "home_renting_neighbour.left.r0", effects: { vitals: { happiness: "++", spirit: "+", finances: "-" } } }] },
            right: { label: "home_renting_neighbour.right", outcomes: [{ result: "home_renting_neighbour.right.r0", effects: { vitals: { finances: "+", health: "+", happiness: "-" } } }] },
          },
        },
        {
          id: "home_renting_quiet",
          kind: "one_time",
          prompt: "home_renting_quiet.prompt",
          options: {
            left: { label: "home_renting_quiet.left", outcomes: [{ result: "home_renting_quiet.left.r0", effects: { vitals: { health: "++", spirit: "+", happiness: "-" } } }] },
            right: { label: "home_renting_quiet.right", outcomes: [{ result: "home_renting_quiet.right.r0", effects: { vitals: { happiness: "++", finances: "-", health: "-" } } }] },
          },
        },
        {
          // The rung up from renting: buy a place of your own. OFFERED (not
          // forced) once you've saved (finances >= 75); the "---" cost keeps ~a
          // third of your money — a huge felt hit — but you own it: modest upkeep
          // and a real health/spirit bonus (the owned_small status). A genuine
          // choice — commit the savings, or hold your money and keep renting.
          id: "home_buy_small",
          kind: "filler",
          // Force-DRAWN at max finances (like the move-out card): capped at 100,
          // the offer is guaranteed to surface rather than hiding in the random
          // pool — you still CHOOSE whether to buy (right = decline). Also offered
          // from finances >= 75 in the normal pool.
          force: "finances",
          conditions: { vitals: { finances: { min: 75 } } },
          prompt: "home_buy_small.prompt",
          options: {
            left: { label: "home_buy_small.left", outcomes: [{ result: "home_buy_small.left.r0", effects: { vitals: { finances: "---", happiness: "+", spirit: "+" }, setStatus: { housing: "owned_small" } } }] },
            right: { label: "home_buy_small.right", outcomes: [{ result: "home_buy_small.right.r0", effects: { vitals: { happiness: "-" } } }] },
          },
        },
        {
          // The adult finances net for RENTERS (age >= 18, so childhood's
          // workhouse rescue has already handed over): can't make the rent →
          // TURNED OUT ONTO THE STREETS (housing → homeless) rather than a
          // bankruptcy game-over. The rescue floors finances to 1; then you
          // choose how you go — salvage a few coins, or leave with your dignity.
          // (Homeless has its own harsh drift; its deck + ways out are Backlog.)
          id: "home_renting_eviction",
          kind: "one_time",
          rescue: "finances",
          conditions: { ageMin: 18 },
          prompt: "home_renting_eviction.prompt",
          options: {
            left: { label: "home_renting_eviction.left", outcomes: [{ result: "home_renting_eviction.left.r0", effects: { vitals: { finances: "+", happiness: "-" }, setStatus: { housing: "homeless" } } }] },
            right: { label: "home_renting_eviction.right", outcomes: [{ result: "home_renting_eviction.right.r0", effects: { vitals: { spirit: "+", happiness: "-" }, setStatus: { housing: "homeless" } } }] },
          },
        },
      ],
    },

    // --- Owned homes: the adult housing ladder. Each owned-tier deck hosts the
    //     offer of the NEXT tier up (finances >= 75, "---" cost) — buying is a
    //     "rebuild to 75, spend down, rebuild" cycle. The estate is the top. ---
    {
      id: "home_owned_small",
      cards: [
        {
          id: "home_buy_large",
          kind: "filler",
          force: "finances", // force-drawn at 100, still a choice (see home_buy_small)
          conditions: { vitals: { finances: { min: 75 } } },
          prompt: "home_buy_large.prompt",
          options: {
            left: { label: "home_buy_large.left", outcomes: [{ result: "home_buy_large.left.r0", effects: { vitals: { finances: "---", happiness: "+", spirit: "+" }, setStatus: { housing: "owned_large" } } }] },
            right: { label: "home_buy_large.right", outcomes: [{ result: "home_buy_large.right.r0", effects: { vitals: { happiness: "-" } } }] },
          },
        },
        {
          // The adult finances net: bankrupt while you own → the house is sold to
          // clear your debts. The `rescue` floors finances to 1, then the sale
          // proceeds top you up (a bigger house sells for more — see large/estate)
          // and you crash all the way back to RENTING, marked `flawSoldUp`. A real
          // choice in the fall: sell up cleanly (less shame) or cling to your
          // pride as it's taken (spirit, but a deeper public humiliation).
          // One-shot per tier (re-buy and you can be caught again).
          id: "home_sellup_small",
          kind: "one_time",
          rescue: "finances",
          prompt: "home_sellup_small.prompt",
          options: {
            left: { label: "home_sellup_small.left", outcomes: [{ result: "home_sellup_small.left.r0", effects: { vitals: { finances: "++", happiness: "-", spirit: "-" }, setStatus: { housing: "renting" }, setFlaws: { flawSoldUp: true } } }] },
            right: { label: "home_sellup_small.right", outcomes: [{ result: "home_sellup_small.right.r0", effects: { vitals: { finances: "++", happiness: "--", spirit: "+" }, setStatus: { housing: "renting" }, setFlaws: { flawSoldUp: true } } }] },
          },
        },
      ],
    },
    {
      id: "home_owned_large",
      cards: [
        {
          id: "home_buy_estate",
          kind: "filler",
          force: "finances", // force-drawn at 100, still a choice (see home_buy_small)
          conditions: { vitals: { finances: { min: 75 } } },
          prompt: "home_buy_estate.prompt",
          options: {
            left: { label: "home_buy_estate.left", outcomes: [{ result: "home_buy_estate.left.r0", effects: { vitals: { finances: "---", happiness: "+", spirit: "+" }, setStatus: { housing: "owned_estate" } } }] },
            right: { label: "home_buy_estate.right", outcomes: [{ result: "home_buy_estate.right.r0", effects: { vitals: { happiness: "-" } } }] },
          },
        },
        {
          // Sell-up net for the large house — sells for more than the small
          // (finances "+++" proceeds vs "++"). A proper cushion: you crash to
          // renting (often jobless), so the proceeds have to carry you for
          // years while you find your feet again.
          id: "home_sellup_large",
          kind: "one_time",
          rescue: "finances",
          prompt: "home_sellup_large.prompt",
          options: {
            left: { label: "home_sellup_large.left", outcomes: [{ result: "home_sellup_large.left.r0", effects: { vitals: { finances: "+++", happiness: "-", spirit: "-" }, setStatus: { housing: "renting" }, setFlaws: { flawSoldUp: true } } }] },
            right: { label: "home_sellup_large.right", outcomes: [{ result: "home_sellup_large.right.r0", effects: { vitals: { finances: "+++", happiness: "--", spirit: "+" }, setStatus: { housing: "renting" }, setFlaws: { flawSoldUp: true } } }] },
          },
        },
      ],
    },
    {
      // Top of the housing ladder — no further purchase, just the comfortable
      // life of the landed. (More owned-home flavour events are Backlog.)
      id: "home_owned_estate",
      cards: [
        {
          id: "home_owned_estate_life",
          kind: "filler",
          prompt: "home_owned_estate_life.prompt",
          options: {
            left: { label: "home_owned_estate_life.left", outcomes: [{ result: "home_owned_estate_life.left.r0", effects: { vitals: { happiness: "++", finances: "-", spirit: "-" } } }] },
            right: { label: "home_owned_estate_life.right", outcomes: [{ result: "home_owned_estate_life.right.r0", effects: { vitals: { spirit: "+", finances: "+", happiness: "-" } } }] },
          },
        },
        {
          // Sell-up net for the estate — the highest fall, and the biggest sale
          // ("sells for a fortune": finances "++++" proceeds, floored highest of
          // the three, effectively topping the purse right up).
          id: "home_sellup_estate",
          kind: "one_time",
          rescue: "finances",
          prompt: "home_sellup_estate.prompt",
          options: {
            left: { label: "home_sellup_estate.left", outcomes: [{ result: "home_sellup_estate.left.r0", effects: { vitals: { finances: "++++", happiness: "-", spirit: "-" }, setStatus: { housing: "renting" }, setFlaws: { flawSoldUp: true } } }] },
            right: { label: "home_sellup_estate.right", outcomes: [{ result: "home_sellup_estate.right.r0", effects: { vitals: { finances: "++++", happiness: "--", spirit: "+" }, setStatus: { housing: "renting" }, setFlaws: { flawSoldUp: true } } }] },
          },
        },
      ],
    },

    // --- The workhouse: active while housing = workhouse. Bleak daily life on
    //     top of the drift, plus three ways out. -----------------------------
    {
      id: "home_workhouse",
      title: "deck.home_workhouse.title",
      unlock: "deck.home_workhouse.blurb",
      // Urgent: the workhouse grind + its three exits own the draw, so you can
      // get out rather than drifting there while childhood flavour draws.
      priority: true,
      cards: [
        {
          id: "home_workhouse_gruel",
          kind: "one_time",
          prompt: "home_workhouse_gruel.prompt",
          options: {
            left: { label: "home_workhouse_gruel.left", outcomes: [{ result: "home_workhouse_gruel.left.r0", effects: { vitals: { health: "+", happiness: "--", spirit: "+" } } }] },
            right: { label: "home_workhouse_gruel.right", outcomes: [{ result: "home_workhouse_gruel.right.r0", effects: { vitals: { health: "-", spirit: "+", happiness: "-" } } }] },
          },
        },
        {
          id: "home_workhouse_oakum",
          kind: "one_time",
          prompt: "home_workhouse_oakum.prompt",
          options: {
            left: { label: "home_workhouse_oakum.left", outcomes: [{ result: "home_workhouse_oakum.left.r0", effects: { vitals: { finances: "+", health: "-" } } }] },
            right: { label: "home_workhouse_oakum.right", outcomes: [{ result: "home_workhouse_oakum.right.r0", effects: { vitals: { spirit: "++", happiness: "+", health: "--" } } }] },
          },
        },
        {
          id: "home_workhouse_friend",
          kind: "one_time",
          prompt: "home_workhouse_friend.prompt",
          options: {
            left: { label: "home_workhouse_friend.left", outcomes: [{ result: "home_workhouse_friend.left.r0", effects: { vitals: { happiness: "++", spirit: "+", health: "-" } } }] },
            right: { label: "home_workhouse_friend.right", outcomes: [{ result: "home_workhouse_friend.right.r0", effects: { vitals: { health: "+", spirit: "+", happiness: "--" } } }] },
          },
        },
        {
          id: "home_workhouse_sunday",
          kind: "one_time",
          prompt: "home_workhouse_sunday.prompt",
          options: {
            left: { label: "home_workhouse_sunday.left", outcomes: [{ result: "home_workhouse_sunday.left.r0", effects: { vitals: { happiness: "++", spirit: "+", health: "-" } } }] },
            right: { label: "home_workhouse_sunday.right", outcomes: [{ result: "home_workhouse_sunday.right.r0", effects: { vitals: { health: "+", happiness: "-", spirit: "-" } } }] },
          },
        },
        {
          id: "home_workhouse_matron",
          kind: "one_time",
          conditions: { ageMin: 8 },
          prompt: "home_workhouse_matron.prompt",
          options: {
            left: { label: "home_workhouse_matron.left", outcomes: [{ result: "home_workhouse_matron.left.r0", effects: { vitals: { health: "+", happiness: "+", spirit: "--" } } }] },
            right: { label: "home_workhouse_matron.right", outcomes: [{ result: "home_workhouse_matron.right.r0", effects: { vitals: { spirit: "++", health: "-", happiness: "-" } } }] },
          },
        },

        // --- Three ways out. Each changes the housing status (and the
        //     apprenticeship changes the job too), handing the workhouse deck
        //     away. `filler` so declining doesn't burn the chance. -----------
        {
          id: "home_workhouse_buyout",
          kind: "filler",
          conditions: { vitals: { finances: { min: 40 } } },
          prompt: "home_workhouse_buyout.prompt",
          options: {
            left: { label: "home_workhouse_buyout.left", outcomes: [{ result: "home_workhouse_buyout.left.r0", effects: { vitals: { finances: "--", happiness: "++", spirit: "+" }, setStatus: { housing: "renting" } } }] },
            right: { label: "home_workhouse_buyout.right", outcomes: [{ result: "home_workhouse_buyout.right.r0", effects: { vitals: { happiness: "-" } } }] },
          },
        },
        {
          id: "home_workhouse_runaway",
          kind: "filler",
          conditions: { ageMin: 7 },
          prompt: "home_workhouse_runaway.prompt",
          options: {
            // Onto the streets — and off the parish books. `pauper` (the workhouse
            // occupation) owns no deck, so leaving it as-is would strand you with
            // no job cards to draw; flip to `unemployed` so the job_unemployed deck
            // (the route back to work) comes with you. Housing homeless brings its
            // own home_homeless deck (streets life + exits) alongside it.
            left: { label: "home_workhouse_runaway.left", outcomes: [{ result: "home_workhouse_runaway.left.r0", effects: { vitals: { spirit: "++", happiness: "+", health: "-" }, setStatus: { housing: "homeless", job: "unemployed" } } }] },
            // The SAME back-to-school escape as the apprentice card (same gate), on
            // this card too — the runaway has no upper age gate, so it widens the
            // window to ~7–13 without adding a new card to the deck.
            down: { label: "home_workhouse_runaway.down", if: { ageMax: 13, vitals: { finances: { min: 40 }, health: { min: 35 }, happiness: { min: 35 }, spirit: { min: 35 } } }, outcomes: [{ result: "home_workhouse_runaway.down.r0", effects: { vitals: { happiness: "+" }, setStatus: { housing: "family", job: "studying" } } }] },
            right: { label: "home_workhouse_runaway.right", outcomes: [{ result: "home_workhouse_runaway.right.r0", effects: { vitals: { spirit: "-" } } }] },
          },
        },
        {
          id: "home_workhouse_apprentice",
          kind: "filler",
          conditions: { ageMin: 10 },
          prompt: "home_workhouse_apprentice.prompt",
          options: {
            left: { label: "home_workhouse_apprentice.left", outcomes: [{ result: "home_workhouse_apprentice.left.r0", effects: { vitals: { spirit: "++", finances: "+", happiness: "+" }, setStatus: { housing: "apprentice", job: "apprentice" } } }] },
            // A way back to SCHOOL — leave the workhouse for the family home and
            // resume your letters (job → studying, its edu deck; housing → family).
            // Shown only while you're still school-age (<= 13, before the leaver at
            // 14) AND recovered enough not to relapse straight into ruin: you need
            // a school fund (finances >= 40, the child_hunger net is spent) and
            // your vitals off the floor, so the studying/keep drains don't kill you.
            down: { label: "home_workhouse_apprentice.down", if: { ageMax: 13, vitals: { finances: { min: 40 }, health: { min: 35 }, happiness: { min: 35 }, spirit: { min: 35 } } }, outcomes: [{ result: "home_workhouse_apprentice.down.r0", effects: { vitals: { happiness: "+" }, setStatus: { housing: "family", job: "studying" } } }] },
            right: { label: "home_workhouse_apprentice.right", outcomes: [{ result: "home_workhouse_apprentice.right.r0", effects: { vitals: { happiness: "-" } } }] },
          },
        },
      ],
    },

    // --- The streets: active while housing = homeless. The hardest grind — a
    //     health/happiness drain and none of a home's comforts. `priority` (like
    //     the workhouse) so the escape routes own the draw instead of drowning
    //     under other flavour. Two grim daily cards (a little begged income; a
    //     charity meal to recover), then FOUR ways off the streets, each gated to
    //     fit your age/means:
    //       • rent a room again  (finances >= 40 → renting)
    //       • back to your books (recovered enough → the next school rung by your
    //         credential + age: basic <= 13, grammar <= 18, university 18–25 with
    //         the fund or savings)
    //       • the workhouse      (a child's shelter of last resort, age <= 13)
    //       • crawl home         (a teen with no rent money, 14–18 → family)
    //     You also keep/seek work via job_unemployed (also priority), so you can
    //     earn your way toward the rent. All gates/values are tunable. ----------
    {
      id: "home_homeless",
      title: "deck.home_homeless.title",
      unlock: "deck.home_homeless.blurb",
      priority: true,
      cards: [
        {
          // A charity meal and a warm mission hall — recover a little, if you can
          // stomach the sermon and the pity (a knock to your pride).
          id: "home_homeless_charity",
          kind: "filler",
          prompt: "home_homeless_charity.prompt",
          options: {
            left: { label: "home_homeless_charity.left", outcomes: [{ result: "home_homeless_charity.left.r0", effects: { vitals: { health: "+", happiness: "+", spirit: "-" } } }] },
            right: { label: "home_homeless_charity.right", outcomes: [{ result: "home_homeless_charity.right.r0", effects: { vitals: { spirit: "+", health: "-" } } }] },
          },
        },
        {
          // A little begged and scavenged coin — a slow trickle toward a deposit
          // even with no work, at a cost to your dignity (or go without, keeping
          // your pride but not your strength).
          id: "home_homeless_beg",
          kind: "filler",
          prompt: "home_homeless_beg.prompt",
          options: {
            left: { label: "home_homeless_beg.left", outcomes: [{ result: "home_homeless_beg.left.r0", effects: { vitals: { finances: "+", spirit: "-", happiness: "-" } } }] },
            right: { label: "home_homeless_beg.right", outcomes: [{ result: "home_homeless_beg.right.r0", effects: { vitals: { spirit: "+", health: "-" } } }] },
          },
        },
        // --- Four ways off the streets. `filler`, so passing one up doesn't burn
        //     it — it comes round again when you're readier. --------------------
        {
          // Save a deposit and first rent (finances >= 40 so the −10 rent drift
          // doesn't sink you the moment you move in) → back to a rented room.
          id: "home_homeless_room",
          kind: "filler",
          conditions: { vitals: { finances: { min: 40 } } },
          prompt: "home_homeless_room.prompt",
          options: {
            left: { label: "home_homeless_room.left", outcomes: [{ result: "home_homeless_room.left.r0", effects: { vitals: { finances: "-", happiness: "++", spirit: "+" }, setStatus: { housing: "renting" } } }] },
            right: { label: "home_homeless_room.right", outcomes: [{ result: "home_homeless_room.right.r0", effects: { vitals: { happiness: "-" } } }] },
          },
        },
        {
          // Back to your books — but only once you've clawed your vitals off the
          // floor (recovered), and to the rung your credential+age allow: a former
          // undergraduate RETURNS to UNIVERSITY to finish (18–25, `eduWasUndergraduate`
          // — the uni fund was already spent getting in the first time, so it's the
          // "been there before" marker that qualifies you, not the fund), a
          // basic-schooled child to GRAMMAR (<= 18), an unlettered child to the
          // board school (<= 13). Each takes you home to study (housing → family,
          // job → the schooling). The card is gated on a rung fitting (so it never
          // draws as a dead decline when you topped out, or are too old / too far
          // gone); the LEFT outcomes then route to whichever rung you qualify for.
          id: "home_homeless_school",
          kind: "filler",
          conditions: {
            vitals: { finances: { min: 40 }, health: { min: 35 }, happiness: { min: 35 }, spirit: { min: 35 } },
            any: [
              { status: { education: "illiterate" }, ageMax: 13 },
              { status: { education: "basic" }, ageMax: 18 },
              { status: { education: "grammar" }, ageMin: 18, ageMax: 25, traits: { eduWasUndergraduate: true } },
            ],
          },
          prompt: "home_homeless_school.prompt",
          options: {
            left: {
              label: "home_homeless_school.left",
              outcomes: [
                { if: { status: { education: "grammar" }, traits: { eduWasUndergraduate: true }, ageMin: 18, ageMax: 25 }, result: "home_homeless_school.left.r0", effects: { vitals: { spirit: "+" }, setStatus: { housing: "family", job: "university" } } },
                { if: { status: { education: "basic" }, ageMax: 18 }, result: "home_homeless_school.left.r1", effects: { vitals: { spirit: "+" }, setStatus: { housing: "family", job: "grammar_school" } } },
                { result: "home_homeless_school.left.r2", effects: { vitals: { spirit: "+" }, setStatus: { housing: "family", job: "studying" } } },
              ],
            },
            right: { label: "home_homeless_school.right", outcomes: [{ result: "home_homeless_school.right.r0", effects: { vitals: { spirit: "-" } } }] },
          },
        },
        {
          // The workhouse: a child's shelter of last resort (age <= 13, matching
          // how you otherwise enter it). Gruel and a roof (health up) for your
          // freedom (spirit down) → housing workhouse, job pauper, handing over
          // the workhouse deck (with its own exits). The reciprocal of the runaway.
          id: "home_homeless_workhouse",
          kind: "filler",
          conditions: { ageMax: 13 },
          prompt: "home_homeless_workhouse.prompt",
          options: {
            left: { label: "home_homeless_workhouse.left", outcomes: [{ result: "home_homeless_workhouse.left.r0", effects: { vitals: { health: "+", spirit: "-" }, setStatus: { housing: "workhouse", job: "pauper" } } }] },
            right: { label: "home_homeless_workhouse.right", outcomes: [{ result: "home_homeless_workhouse.right.r0", effects: { vitals: { spirit: "+", health: "-" } } }] },
          },
        },
        {
          // Crawl home: for a teen (14–18) with no deposit for a room (finances <
          // 40, so it only surfaces when renting is out of reach) — swallow your
          // pride and go back to the family (health/happiness up, spirit down) →
          // housing family. You keep looking for work from there (job unchanged).
          // The humble fallback when the other exits can't help.
          id: "home_homeless_family",
          kind: "filler",
          conditions: { ageMin: 14, ageMax: 18, vitals: { finances: { max: 39 } } },
          prompt: "home_homeless_family.prompt",
          options: {
            left: { label: "home_homeless_family.left", outcomes: [{ result: "home_homeless_family.left.r0", effects: { vitals: { health: "+", happiness: "+", spirit: "-" }, setStatus: { housing: "family" } } }] },
            right: { label: "home_homeless_family.right", outcomes: [{ result: "home_homeless_family.right.r0", effects: { vitals: { spirit: "+", happiness: "-" } } }] },
          },
        },
      ],
    },
] satisfies Deck[];
