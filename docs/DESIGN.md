# Cards of Life — Design Document

> Status: **living draft**. This is the shared source of truth we build against.
> Anything marked **OPEN** is a decision we've deliberately deferred, with a
> recommended default so it doesn't block us.

---

## 1. Premise

A single-player life-simulation game. You are dealt a shuffled "deck of life."
Each card is **one year** and presents a dilemma or choice. You answer by
**swiping** the card in a direction. Every choice nudges your **Vitals**, may
show a **result** on the back of the card, and can change your **Statuses** and
hidden **Traits**, add or remove whole decks, and quietly move the story along.
The run ends when any Vital runs out.

Reference points: *Reigns* (swipe-to-decide, juggling stats) crossed with a
life-sim's long-arc progression. We borrow the swipe/juggle feel deliberately,
but the persistent-pressure Status system is our own and drives most of the
game's texture.

---

## 2. Terminology

Precise names so we never talk past each other:

| Term | Meaning |
|---|---|
| **Vital** | One of the four lethal bars (0–100). If **any** hits 0, the run ends. |
| **Status** | A persistent side-state (Job, Housing, Lifestyle, Education). Applies per-turn drift to Vitals and gates content. |
| **Trait** | Hidden state — booleans, enums, counters (gender, vaccinated, numTimesChangedJob). Set by effects; read by conditions and results. |
| **Card** | One decision = one year. A **front** (prompt + 2–4 swipe options) and a **back** (the result). |
| **Result** | The outcome shown on the back of a card after you choose — story text plus the effects that apply. Can vary by Trait/Status. |
| **Deck** | A named collection of cards (e.g. `child`, `job_teacher`, `homeless`). Decks are added and removed as life progresses. |
| **Active decks** | The set of decks currently switched on. |
| **Pool** | The set of cards eligible to be drawn *right now* — computed live from the active decks. |
| **Milestone** | A special card that fires when its condition is met, taking priority over a random draw. Carries the life-stage spine. |
| **Filler** | A repeatable card that returns to the pool, keeping years ticking so decks don't run dry. |

---

## 3. Vitals (the four bars)

Displayed along the **top**. Range **0–100**.

- **Finances** — money and material security.
- **Happiness** — day-to-day contentment.
- **Health** — physical wellbeing; also the natural old-age clock.
- **Spirit** — inner drive / sense of meaning.

**Game-over rule:** if **any** Vital reaches **0**, the run ends. Single-threshold
only — there is no "too high" ending. (We don't need one: our Statuses supply
constant downward pressure, so the tension comes from *maintaining* Vitals, not
from over-shooting them. This is the key place we intentionally diverge from
*Reigns*.)

The Vital that hit 0 frames the **end screen** — but only Health's ending is
literally death:

| Vital at 0 | End framing |
|---|---|
| Finances | **Bankrupt** |
| Happiness | **Despair** — gave up |
| Health | **Death** — old age / illness |
| Spirit | **Emptiness** — burnt out / lost yourself |

The word "died" is reserved for Health. **OPEN:** exact wording of the non-Health
endings — flavour, decided with card/writing work.

**Balance rule:** the early game (baby, and largely child) must be **impossible
to lose** — no early card may drive any Vital to 0. Starting values and early
effects must keep clear headroom. (Detailed tuning lives with card design.)

---

## 4. Statuses (the side rail)

Displayed down the **side**. A Status is a persistent state that does two jobs:

1. **Drift** — applies a fixed per-turn effect to Vitals while held (e.g. a job
   steadily raises Finances but slowly drains Spirit).
2. **Gating** — acts as a condition other cards/decks/results can check.

Each Status change also typically **adds and/or removes decks**.

| Status | Examples | Notes |
|---|---|---|
| **Job** | Unemployed, Teacher, Plumber… | Sets the active job deck. Drives Finances up, often Spirit/Happiness down. Promotions, job-changes, and firings are cards within a job deck. |
| **Housing** | Homeless, Renting, Owned home… | No home ⇒ **Homeless** status + `homeless` deck + constant **Health** drain. |
| **Education** | None → School → College → Degree → Postgrad | **Ordered/tiered** — mostly a *gate* (unlocks certain jobs / university), bumped up a tier by cards, rarely gives drift. |
| **Lifestyle** | (TBD) | Reserved. Per-turn drift + gating, same machinery. |

### Ordered vs unordered Statuses
Job and Housing are **unordered** named states (Teacher isn't "greater than"
Plumber). Education is **ordered** — cards want to check `education ≥ Degree`.
So the Status data model carries an **optional rank/level** field enabling
ordered comparisons. Lifestyle may use this later.

---

## 5. Cards: front and back

A card has two faces.

**Front** — what you decide on:
- A **prompt** (the situation).
- **2–4 options**, each mapped to a swipe direction:
  - **Left / Right** — every card has at least these two.
  - **Up / Down** — optional, for 3- or 4-option cards.
- Each option shows only its **label** (the choice text). **We do not show the
  stat effects to the player** — the numbers stay behind the curtain.

**Back** — the **result** of your choice:
- After you commit a swipe, the card resolves to a **result**: a short piece of
  outcome/story text, plus the **effects** that apply.
- Crucially, a result can depend on **hidden Traits and Statuses**, not just the
  choice. *Fight back* against the bully reads very differently if
  `knowsMartialArts` is true. This is the main storytelling lever and what makes
  choices feel like they have consequences.

### How an option resolves to a result
Each option carries a small ordered list of **outcomes**. The engine picks the
**first outcome whose conditions match** (a no-condition outcome at the end is
the default fallback). The chosen outcome supplies the result text and the
effects.

```
option "Fight back":
  outcome  if knowsMartialArts  → "You floor the bully. A crowd cheers."  (spirit +8, health -2)
  outcome  (default)            → "You get a bloody nose, but you stood up."  (spirit +4, health -6)
```

**OPEN:** if several outcomes match, is it first-match or weighted-random among
matches? *Default:* first-match. Weighted-random can be added later without
changing the shape.

---

## 6. Decks & the draw model (the "virtual pool")

We do **not** pre-shuffle every card into one physical array. Instead the deck is
**virtual**:

> Each turn, filter every card in the **active decks** by its eligibility
> (deck membership + optional conditions) into the **pool**, then draw one at
> random.

To the player this is identical to "draw the top of a shuffled deck." Behind the
scenes it makes the mechanics trivial:

- **Add a deck** → its cards simply become eligible. No reshuffle.
- **Get fired / lose a deck** → those cards leave the pool instantly, even
  "mid-shuffle." (Firing removes the whole `job_*` deck; the player gains
  **Unemployed** + the `unemployed` deck.)
- **Conditions & age-banding** → just extra filters at draw time.

Cost is a filter over a few hundred cards, once per swipe — negligible. If it
ever mattered we'd cache the pool and invalidate on state change, but we won't
until proven necessary.

### Draw-and-discard, no reshuffle
Once a card is played it's **consumed** and does not return — **unless** it's
Filler (see §7). We never shuffle the discard back in.

---

## 7. Card lifecycle

Three card kinds fall out of the draw model:

1. **One-time cards** — consumed when played. `copies = N` means the card can
   occur at most **N times** in a life, then it's gone. (This replaces any notion
   of probabilistic "weight": copies = max occurrences.) Promotions, firings,
   specific dilemmas.

2. **Filler cards** — repeatable; **return to the pool** after being played.
   These keep the year-clock ticking so a deck can't run dry and stall the game
   before a Vital reaches 0.
   - Risk: filler feels repetitive. Mitigations: keep a *large, varied* filler
     pool (many small events, not the same three), tag them as a category so we
     can **dial them down** as real content grows. Leaned on early, ideally
     near-invisible later.

3. **Milestone cards** — fire when their **condition** is met, taking **priority
   over a random draw**. These carry the life-stage spine — e.g. the child deck
   emptying triggers the "leave school: job or university?" milestone. Not left
   to chance.

### Turn logic
```
on next turn:
  if a milestone is due → play the highest-priority due milestone   (the front)
  else                  → draw a random card from the eligible pool  (the front)

  player swipes → picks an option
  resolve the option's outcome (first outcome whose conditions match, else default)
  reveal the result text (the back) and apply its effects

  apply per-turn Status drift        // every turn, including milestone turns,
                                      // AFTER the card's effects — so a Status
                                      // set this turn drifts this turn
  if any Vital == 0 → end screen
```
**Settled:** drift applies every turn (milestones included), after the card's
effects. Get a new job this turn and its drift lands the same turn.

---

## 8. Conditions, Effects & Traits (the shared vocabulary)

The single system that unifies unlocks, firings, homelessness, age-gating,
milestones, results, and character decks. Cards are **data**; the engine just
reads this.

### Traits — hidden state
Arbitrary hidden variables that persist across the run:
- **Booleans** — `vaccinated`, `knowsMartialArts`
- **Enums** — `gender` (boy / girl), set once (likely in the baby deck)
- **Counters** — `numTimesPlayedLottery`, `numTimesChangedJob`

Traits are set/changed by **effects** and read by **conditions** and
**results**. **Relationships are just a structured slice of Traits** — per-
character sub-values (affection, trust…). Nothing new in the engine.

### Conditions (all optional)
Used to gate a whole card's eligibility *and* to pick an option's outcome.
- Vital thresholds — `happiness < 20`, `finances ≥ 50`
- Status checks — `job == unemployed`, `education ≥ college`, `housing != homeless`
- Age band — `age ≥ 40`, `age between 5 and 11`
- Trait checks — `knowsMartialArts == true`, `gender == girl`, `numTimesChangedJob ≥ 3`

### Effects (carried by an outcome)
- Vital deltas — `finances +10, spirit -5`
- Set/clear Status — `set job = teacher`, `set housing = homeless`
- Deck ops — `add deck job_teacher`, `remove deck job_*`
- Trait ops — `set knowsMartialArts = true`, `set gender = girl`, `inc numTimesChangedJob`

**OPEN (schema detail):** exact field names/JSON shape, and how 2- vs 4-option
cards are encoded. Recommended default sketched in §14.

---

## 9. Relationships (hidden, story engine)

Characters recur through the decks. Behind the scenes we track **hidden per-
character Traits** (e.g. affection, trust, rivalry). When one crosses a
threshold, we **unlock a character deck** that tells that person's story.

Because unlocks and story branches key off hidden Traits that each playthrough
grows differently, **different runs surface different stories**. Character-deck
cards can themselves alter the hidden Traits and set flags, branching the arc.
Results (§5) reading these Traits is what makes the branching feel personal.

**v1 scope:** keep this *light* — one or two characters, a couple of thresholds —
enough to prove the machinery. It reuses the exact same Conditions/Effects/Traits
system; nothing new in the engine.

---

## 10. End of run

The run ends the instant any Vital hits 0. Show an **end-of-run summary**: age
reached, the ending framing for whichever Vital fell (§3), and a recap of the
life (jobs held, homes, key relationships, notable choices, Traits accumulated).
This is the "why replay" payoff and we expect to expand it. **OPEN:** scoring
model — deferred.

---

## 11. Save / resume / reset

- **Autosave** to `localStorage` every turn (a full life is long; nobody
  finishes in one phone sitting).
- **Resume** on load if a save exists.
- **Easy reset** — a clearly available "new life" / wipe control.

---

## 12. Tech & architecture

- **Static client-side web app** (HTML/CSS/JS), **no server at runtime**. Hosted
  on **GitHub Pages** so it's a URL you open on your phone; free. (Python is
  rejected for the runtime precisely because it would need a running server.
  Python may still serve as *tooling* — e.g. a card-data validator.)
- **Hard split: engine vs content.**
  - **Engine** — draw model, condition/effect/trait evaluation, Vitals/Statuses,
    result resolution, save/load, rendering, swipe input.
  - **Content** — decks and cards as **data files (JSON)**. Adding content =
    adding data, never editing engine code.
- **Toolchain: TypeScript + Vite**, auto-deployed to Pages via a **GitHub
  Action** (so you still just get a URL). Chosen for the **type-checking safety
  net** — valued because the code can't be reviewed line-by-line on mobile.
  - Bonus: because cards/effects/conditions/**Traits** are data, we give them
    real TS types and a **typed registry** of known Traits & Statuses, so the
    compiler catches a card referencing a misspelled trait or a non-existent
    stat *before* the game runs. Content is type-checked, not just the engine.

---

## 13. First-playable scope

The minimum that exercises **every** mechanic, so the rest is pure content:

- Decks: **baby (tutorial) → child → one starter job + unemployed → one house +
  homeless**, plus a **filler** set.
- All four **Vitals** with drift + game-over.
- **Statuses:** Job (incl. Unemployed), Housing (incl. Homeless), Education
  (at least None→School→College).
- **Traits:** at least `gender` (set at birth) and one boolean used in a result
  (e.g. `knowsMartialArts`); one **Relationship** character (light).
- **Cards:** front/back with at least one **conditional result**.
- **Milestones:** at least the child→(job|university) transition.
- **Save/resume/reset.**

Proves add/remove-deck, milestones, status drift, gating, traits, conditional
results, and game-over all work. After that, decks are content expansion.

---

## 14. Data schema — proposal (OPEN, react freely)

A first sketch so we have something concrete to poke at. Names are provisional.

```jsonc
// a deck file
{
  "id": "child",
  "cards": [
    {
      "id": "child_bully",
      "kind": "one_time",              // one_time | filler | milestone
      "copies": 1,
      "prompt": "A bully shoves you in the yard.",
      "conditions": { "ageMin": 6, "ageMax": 11 },   // eligibility (optional)
      "options": {
        "left": {
          "label": "Fight back",
          "outcomes": [
            {
              "if": { "trait": { "knowsMartialArts": true } },
              "result": "You floor the bully. The yard goes quiet, then cheers.",
              "effects": { "vitals": { "spirit": 8, "health": -2 } }
            },
            {
              "result": "You get a bloody nose — but you stood your ground.",
              "effects": { "vitals": { "spirit": 4, "health": -6 } }
            }
          ]
        },
        "right": {
          "label": "Walk away",
          "outcomes": [
            {
              "result": "You slip away. It gnaws at you.",
              "effects": { "vitals": { "happiness": -5, "spirit": -2 } }
            }
          ]
        }
        // "up" / "down" optional for 3–4 option cards
      }
    }
  ]
}
```

```jsonc
// a status definition
{
  "id": "education",
  "ordered": true,
  "levels": ["none", "school", "college", "degree", "postgrad"],
  "states": {
    "teacher": { "drift": { "finances": 6, "spirit": -3 }, "addDecks": ["job_teacher"] }
  }
}
```

**OPEN for later:** whether effects reference `remove deck job_*` by wildcard vs
explicit id; how milestone priority ties are broken; exact per-character Trait
shape; first-match vs weighted-random outcome selection.

---

## 15. Deferred (explicitly not in first pass)

- **Legacy / inheritance** — "continue as your child" (soft reset carrying over
  money/traits/unlocked characters). Model should *allow* it later; not built now.
- **Scoring depth** beyond a basic end-of-run summary.
- **Card art / imagery** — start text + emoji; add art later.
- **Max-Vital ending** — considered and rejected for now.

---

## 16. Settled decisions (quick reference)

- Four **Vitals**: Finances, Happiness, Health, Spirit. **Any at 0 = game over**;
  only Health's ending is worded as "death". No max-Vital ending.
- **Education** is an ordered Status; there are four Vitals, not five.
- Engine/content split; cards & decks are **JSON data**.
- Cards have a **front** (choice; effects hidden from player) and a **back**
  (**result** text + effects), with outcomes selectable by condition.
- **Traits** (hidden bools/enums/counters) drive conditions and results;
  relationships are a slice of Traits.
- **Virtual pool** draw; draw-and-discard; no reshuffle.
- **Filler** repeats to avoid deck exhaustion; **one-time** `copies` = max occurrences.
- **Milestones** fire on condition, priority over random draw.
- **Drift** applies every turn (milestones included), after the card's effects.
- **Conditions + Effects + Traits** is the one system behind all gating/unlocks.
- **Relationships**: hidden per-character Traits unlock branching character decks (v1-light).
- Static web app on **GitHub Pages**; **localStorage** save + easy reset.
- **Toolchain: TypeScript + Vite**, deployed via a GitHub Action; content is
  type-checked against a typed Trait/Status registry.
- Start small (§13), expand via content.
