# Cards of Life — Design Document

> Status: **living draft**. This is the shared source of truth we build against.
> Anything marked **OPEN** is a decision we've deliberately deferred, with a
> recommended default so it doesn't block us.

---

## 1. Premise

A single-player life-simulation game. You are dealt a shuffled "deck of life."
Each card is **one year** and presents a dilemma or choice. You answer by
**swiping** the card in a direction. Every choice nudges your **Vitals** and can
change your **Statuses**, add or remove whole decks, and quietly move the story
along. The run ends when you die.

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
| **Status** | A persistent side-state (Job, Housing, Lifestyle, Education, Relationships). Applies per-turn drift to Vitals and gates content. |
| **Card** | One decision = one year. Has a prompt and 2–4 swipe options, each with effects. |
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

**Death rule:** if **any** Vital reaches **0**, the run ends. Single-threshold
only — there is no "too high" death. (We don't need one: our Statuses supply
constant downward pressure, so the tension comes from *maintaining* Vitals, not
from over-shooting them. This is the key place we intentionally diverge from
*Reigns*.)

The Vital that hit 0 becomes the **cause of death** on the end screen:
- Finances → *died destitute*
- Happiness → *died in despair*
- Health → *died of poor health / old age*
- Spirit → *lost the will to go on*

**Balance rule:** the early game (baby, and largely child) must be **impossible
to lose** — no early card may be able to drop any Vital to 0. Starting values and
early effects must keep clear headroom. (Detailed tuning lives with card design.)

---

## 4. Statuses (the side rail)

Displayed down the **side**. A Status is a persistent state that does two jobs:

1. **Drift** — applies a fixed per-turn effect to Vitals while held (e.g. a job
   steadily raises Finances but slowly drains Spirit).
2. **Gating** — acts as a condition other cards/decks can check.

Each Status change also typically **adds and/or removes decks**.

| Status | Examples | Notes |
|---|---|---|
| **Job** | Unemployed, Teacher, Plumber… | Sets the active job deck. Drives Finances up, often Spirit/Happiness down. Promotions, job-changes, and firings are cards within a job deck. |
| **Housing** | Homeless, Renting, Owned home… | No home ⇒ **Homeless** status + `homeless` deck + constant **Health** drain. |
| **Lifestyle** | (TBD) | Reserved. Per-turn drift + gating, same machinery. |
| **Education** | None → School → College → Degree → Postgrad | **Ordered/tiered** (see below). Mostly a *gate* — bumped up a tier by cards, rarely gives drift. |
| **Relationships** | Hidden per-character stats | Not shown as a normal status; see §9. |

### Ordered vs unordered Statuses
Job and Housing are **unordered** named states (Teacher isn't "greater than"
Plumber). Education is **ordered** — cards want to check `education ≥ Degree`.
So the Status data model carries an **optional rank/level** field enabling
ordered comparisons. Lifestyle may use this later.

### Knowledge → Education
Knowledge is **not** a Vital. Turning it into an ordered Education status means
it's a qualification you accumulate and that unlocks opportunities (certain jobs,
university), rather than a bar you can die from. This is why we have **four**
Vitals, not five.

---

## 5. Cards & swipes

A card presents a **prompt** and **2–4 options**, each mapped to a swipe
direction:

- **Left / Right** — every card has at least these two.
- **Up / Down** — optional, for 3- or 4-option cards.

Each option carries:
- **Label** (the choice text / preview shown as you swipe).
- **Effects** — Vital changes, Status changes, deck add/remove, relationship
  changes, flags set (see §8).
- Optional **result text** (a short outcome line after committing).

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
on swipe / next turn:
  if a milestone is due → play the highest-priority due milestone
  else                  → draw a random card from the eligible pool
  apply chosen option's effects
  apply per-turn Status drift
  check death (any Vital == 0) → end screen
```
**OPEN:** does Status drift apply before or after the card's own effects, and
does it apply on milestone turns too? *Default:* drift applies every turn, after
the card's effects.

---

## 8. Conditions & Effects (the shared vocabulary)

The single system that unifies unlocks, firings, homelessness, age-gating,
milestones, and character decks. Cards are **data**; the engine just reads this.

**Conditions** (all optional; a card with none is eligible whenever its deck is
active):
- Vital thresholds — `happiness < 20`, `finances ≥ 50`
- Status checks — `job == unemployed`, `education ≥ college`, `housing != homeless`
- Age band — `age ≥ 40`, `age between 5 and 11`
- Relationship checks — `rel(alex).affection ≥ 70`
- Flags — arbitrary story flags set by earlier cards (`met_alex == true`)

**Effects** (any option can carry any mix):
- Vital deltas — `finances +10, spirit -5`
- Set/clear Status — `set job = teacher`, `set housing = homeless`
- Deck ops — `add deck job_teacher`, `remove deck job_*`
- Relationship deltas — `rel(alex).affection +5`
- Set flags — `set flag met_alex = true`

**OPEN (schema detail, deferred):** exact field names/JSON shape, and how 2- vs
4-option cards are encoded. Recommended default sketched in §14.

---

## 9. Relationships (hidden, story engine)

Characters recur through the decks. Behind the scenes we track **hidden
per-character stats** (e.g. affection, trust, rivalry). When a stat crosses a
threshold, we **unlock a character deck** that tells that person's story.

Because unlocks and story branches key off hidden stats that each playthrough
grows differently, **different runs surface different stories**. Character-deck
cards can themselves alter the hidden stats and set flags, branching the arc.

**v1 scope:** keep this *light* — one or two characters, a couple of thresholds —
enough to prove the machinery. It reuses the exact same Conditions/Effects
system; nothing new in the engine.

---

## 10. Death & end of life

Run ends the instant any Vital hits 0. Show an **epitaph / life summary**:
age at death, cause of death (§3), and a recap of the life (jobs held, homes,
key relationships, notable choices). This is the "why replay" payoff and we
expect to expand it. **OPEN:** scoring model — deferred.

---

## 11. Save / resume / reset

- **Autosave** to `localStorage` every turn (a full life is long; nobody
  finishes in one phone sitting).
- **Resume** on load if a save exists.
- **Easy reset** — a clearly available "new life" / wipe control.

---

## 12. Tech & architecture

- **Static client-side web app** (HTML/CSS/JS), **no server**. Hosted on
  **GitHub Pages** so it's a URL you open on your phone; deploys on push; free.
  (Python is rejected for the runtime precisely because it would need a running
  server. Python may still serve as *tooling* — e.g. a card-data validator.)
- **Hard split: engine vs content.**
  - **Engine** — draw model, condition/effect evaluation, Vitals/Statuses,
    save/load, rendering, swipe input.
  - **Content** — decks and cards as **data files (JSON)**. Adding content =
    adding data, never editing engine code.
- **OPEN (tooling):** plain vanilla TS vs a light build (e.g. Vite). *Default:*
  start minimal; add a bundler only if it earns its place.

---

## 13. First-playable scope

The minimum that exercises **every** mechanic, so the rest is pure content:

- Decks: **baby (tutorial) → child → one starter job + unemployed → one house +
  homeless**, plus a **filler** set.
- All four **Vitals** with drift + death.
- **Statuses:** Job (incl. Unemployed), Housing (incl. Homeless), Education
  (at least None→School→College), one **Relationship** character (light).
- **Milestones:** at least the child→(job|university) transition.
- **Save/resume/reset.**

Proves add/remove-deck, milestones, status drift, gating, and death all work.
After that, decks are content expansion.

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
      "kind": "one_time",          // one_time | filler | milestone
      "copies": 1,                  // for one_time
      "prompt": "A bully shoves you in the yard.",
      "conditions": { "ageMin": 6, "ageMax": 11 },
      "options": {
        "left":  { "label": "Fight back", "effects": { "vitals": { "spirit": +5, "health": -5 } } },
        "right": { "label": "Walk away",  "effects": { "vitals": { "happiness": -5, "spirit": -2 } } }
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
    "teacher": { "drift": { "finances": +6, "spirit": -3 }, "addDecks": ["job_teacher"] }
  }
}
```

**OPEN for later:** whether effects reference `remove deck job_*` by wildcard vs
explicit id; how milestone priority ties are broken; exact relationship-stat
shape.

---

## 15. Deferred (explicitly not in first pass)

- **Legacy / inheritance** — "continue as your child" (soft reset carrying over
  money/traits/unlocked characters). Model should *allow* it later; not built now.
- **Scoring depth** beyond a basic epitaph.
- **Card art / imagery** — start text + emoji; add art later.
- **Max-Vital death** — considered and rejected for now.

---

## 16. Settled decisions (quick reference)

- Four **Vitals**: Finances, Happiness, Health, Spirit. Any at 0 = death. No max death.
- **Education** is an ordered Status, not a Vital.
- Engine/content split; cards & decks are **JSON data**.
- **Virtual pool** draw; draw-and-discard; no reshuffle.
- **Filler** repeats to avoid deck exhaustion; **one-time** `copies` = max occurrences.
- **Milestones** fire on condition, priority over random draw.
- **Conditions + Effects** is the one system behind all gating/unlocks.
- **Relationships**: hidden per-character stats unlock branching character decks (v1-light).
- Static web app on **GitHub Pages**; **localStorage** save + easy reset.
- Start small (§13), expand via content.
