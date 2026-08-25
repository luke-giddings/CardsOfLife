# Cards of Life — Design Document

> **Living document**, kept in sync with the build. This reflects the game as
> it actually stands (Victorian childhood, mortality, the status/deck systems),
> not just the original paper design. The **Backlog** (§18) lists agreed future
> work.

---

## 1. Premise

A single-player, swipe-to-decide life simulation. You are dealt a shuffled
"deck of life"; each card is **one year** and poses a dilemma. You answer by
**swiping** (or tapping) in a direction, then read the **result** on the back of
the card. Every choice moves your **Vitals**, can change your **Statuses** and
hidden **Traits**, add or remove whole decks, and quietly shapes the story. The
run ends when any Vital hits 0.

Lineage: *Reigns* (swipe/juggle) crossed with a life-sim's long arc — but the
persistent-pressure Status system and the earned-mortality hazards are our own.

## 2. Setting

**Victorian era.** Chosen because it justifies real childhood mortality (roughly
half of children didn't reach 18), gives period-authentic institutions (the
**workhouse**, **child labour**, the smallpox **vaccinator**, dame schools), and
nothing built so far had to be thrown away. Tone is **light/wry** for now; a
full tone pass comes once the decks are complete.

## 3. Terminology

| Term | Meaning |
|---|---|
| **Vital** | One of four bars (0–100). Any at 0 = game over. |
| **Status** | A persistent side-state (Job/occupation, Housing, Education, Lifestyle). Applies per-turn **drift** and gates content; can own decks. |
| **Trait** | Hidden state — booleans, enums, counters (e.g. `vaccinated`, `gender`, `relBrother`). |
| **Card** | One year. A **front** (prompt + 2–4 options) and a **back** (the result). |
| **Outcome** | One resolution of an option: result text + effects, optionally condition-gated. |
| **Deck** | A named set of cards, switched on/off as life progresses. |
| **Pool** | The cards eligible to draw right now, computed live from active decks. |
| **Milestone** | A card that fires when its condition is met, ahead of a random draw. |
| **Filler** | A repeatable card (returns to the pool) so years keep ticking. |
| **Hazard** | A card that can kill (fever, accident…), survival earned by preparation. |
| **Drift** | A Status's fixed per-turn effect on Vitals. |

## 4. Vitals

Four bars, range **0–100**, shown along the top, each with a **colour and an
icon** (£ Finances, ☺ Happiness, ♥ Health, ✦ Spirit) for legibility.

**Game-over rule:** if **any** Vital reaches 0, the run ends (single-threshold;
no "too high" death). Which Vital fell frames the end screen; only **Health**'s
is worded as literal death (Finances → Bankrupt, Happiness → Despair, Spirit →
Emptiness).

Start values are **20 each** (low and even); babyhood builds them up.

## 5. Magnitude system

Card vital changes are **not raw numbers** — they use readable magnitude steps,
so every bar move is a clearly-perceptible size (no muddy +10-vs-+15):

| Token | Points |
|---|---|
| `++` | +25 |
| `+` | +10 |
| `-` | −10 |
| `--` | −25 |
| `---` | **−50%** (proportional — halves the vital; can't reach 0 from a positive value, so a floor-gated card can't game-over) |

Point values live in one place (`MAGNITUDE_POINTS`, `types.ts`) — balancing is a
single table, and more levels (e.g. `+++`) can be added later. Relationship
nudges and drift use raw numbers (they're not player-facing bar moves).

## 6. Statuses

A Status does two jobs: **drift** (a fixed per-turn effect on Vitals) and
**gating/deck-ownership** (a state can `addDecks`). Drift is shown to the player
on the status chip as **icon + sign** (e.g. *Workhouse ♥− ☺−*).

| Status | States (so far) | Notes |
|---|---|---|
| **Job / occupation** | infant · child_labourer · studying · apprentice · unemployed · shophand · factory · pickpocket | Start = infant (no drain). Child labourer: finances +5 / health −5, opens `job_labour`. Studying: spirit −5, opens `edu_basicschool`. Apprentice: finances +5. **Unemployed** (school-leaver, no work): **happiness −5 / spirit −5** — a grim state you want out of fast; opens `job_unemployed`. First jobs: **shophand** (finances +5, safe — **needs education ≥ school**), **factory** (finances +10 / health −5), or **pickpocket** (finances +10 / spirit −5 — the criminal life). |
| **Housing** | family · workhouse · renting · homeless · apprentice | Start = family: finances −5 drift (your keep — offset by a wage, not by studying), opens `home_family`; a well-off teen can **move out → renting**. Workhouse: health −5 / happiness −5, opens `home_workhouse`. **renting** (moved out / bought out): finances −5 rent but spirit +5 (independence); own deck is Backlog. **homeless** (ran away): health −5 / happiness −5, no deck yet. **apprentice** ("with a master"): safe, paired with job=apprentice. Drift is **suspended in babyhood** (the baby deck's `noDrift`), so the family cost doesn't bite the unloseable phase. |
| **Education** | none · school | Ordered (levels), a persisting **record** of the level reached (for later `atLeast` gating, e.g. grammar school). The *activity* of studying lives on `job = studying`. The credential (`school`) is earned by **effort** — studying hard at exams or winning the prize (you know your stuff even if you leave early) — or, failing that, granted at the **end-of-school leaver** (age 14) as the fallback. Drop out for work/the workhouse before earning it either way and you stay `none` (Illiterate). |
| **Lifestyle** | default | Reserved. |

**Deck naming:** decks owned by a status are prefixed by that status's kind —
`edu_*` (education), `home_*` (housing), `job_*` (occupation) — so the growing
set of small per-status decks stays legible and leaves room for siblings like
`edu_grammar`. Cross-cutting decks that aren't owned by a status keep plain
names (`baby`, `childhood`, `sibling`). Changing a status hands its decks over
automatically (leaving `family` for `workhouse` swaps `home_family` out for
`home_workhouse`).

Statuses are **ordered or unordered** (Education is ordered for `≥` checks;
Job/Housing are named states).

## 7. Traits (hidden state)

Arbitrary persistent variables, set by effects and read by conditions **and
results**:
- **Booleans:** `knowsMartialArts`, `vaccinated`, `uniFund`, `bookish`,
  `sporty`, `sweetTooth`, `sociable`, `hasBrother`, `hasSister`.
- **Enum:** `gender` (boy/girl), chosen on the birth card.
- **Counters:** `relBrother`, `relSister` (relationship stats, can go negative =
  rivalry), `numTimesChangedJob`, `numTimesPlayedLottery`.

**Relationships are just Traits.** Character decks can later branch on
thresholds (e.g. high `relBrother` → a loyal-sibling arc). Baby-deck "setups"
(vaccinated, sporty, uniFund…) exist to **pay off later** — notably as what
keeps you alive through childhood hazards.

## 8. Cards: front and back

- **Front:** a prompt + 2–4 options mapped to swipe directions (left/right
  always; up/down optional). The player sees **only the labels** — never the
  numbers.
- **Back:** the **result** — outcome text + effects. An option carries an
  ordered list of **outcomes**; the engine picks the **first whose conditions
  match** (author the last one unconditional as the fallback). So the same swipe
  can read/behave differently by Trait/Status (e.g. the bully card's
  `knowsMartialArts` branch).

**Effects** an outcome can carry: vital magnitudes, set/clear Status, add/remove
decks, set/inc Traits, and `endGame` (a scripted ending — used by hazards).

**Design rules for options** (see §15).

## 9. Draw model

The deck is **virtual**: each turn, filter every card in the **active decks** by
eligibility (deck membership + optional conditions + not exhausted) into the
**pool**, then draw. To the player it's "draw the top card"; behind the scenes,
adding/removing decks and gating are trivial filters.

- **Milestones** that are due jump the queue (highest priority first).
- Otherwise a **random** eligible non-milestone card is drawn.
- **No card repeats twice in a row** (when alternatives exist).
- **Draw-and-discard:** a played card is consumed, unless it's **filler**
  (returns to the pool). `one_time` cards carry `copies` = max occurrences.

Per-turn order: pick card → resolve outcome → apply effects → age +1 → apply
Status **drift** (after effects) → check game-over.

## 10. Decks & progression

- **baby** (ages 0–5): tutorial + build-up. **Impossible to lose** (positive
  effects only). Teaches swipe/up/down, the vitals, and seeds Traits. Ends at
  the **school-or-work** milestone.
- **childhood** (shared, ages 5–17): events any child has regardless of status —
  the boxing coach, the bully, street football, the **hazards**, and turning 18.
- **home_family** (housing = family): home life with a home to have — chores,
  the sweet shop, a stray cat to take in. Lost on entering the workhouse.
- **home_workhouse** (housing = workhouse): bleak workhouse daily life — gruel,
  oakum (piecework pennies toward buying out), a ward friend, the matron — plus
  **three exits**: buy your freedom (→ renting, needs ~40 saved), run away
  (→ homeless), or take an apprenticeship (→ apprentice housing + job, age 10+).
- **edu_basicschool** (job = studying): exams, first crush, a friend, prize
  day, after-school **errands** (money route), and the **leaver** milestone at
  14. The credential is earned by effort (study hard / win the prize); the
  leaver grants it as a fallback and is the branch point — stay on to study
  (toward a future grammar tier) or leave for work (→ unemployed). (Room for
  `edu_grammar` → `university` later.)
- **job_unemployed** (job = unemployed): a grim state (heavy happiness/spirit
  drift) you want out of fast. Mostly **painful `one_time`** cards (pawn your
  coat, family pressure, the empty days — so the deck shrinks toward the exits)
  plus **`filler` job offers** — honest work (shop, needs education / factory)
  or the criminal life (a Fagin-style pickpocket gang). Taking any job hands the
  deck away. **Jobs can have education requirements** (the shop counter needs
  `education ≥ school`) — currently forward-looking, since every unemployed kid
  comes via the school-leaver and so is already educated.
- **home_renting** (housing = renting): flat life on top of the rent/spirit
  drift — a **lodger** for income, the **landlord**, doing the place up,
  neighbours, a quiet night. First-pass mock-up.
- **job_labour** (job = child_labourer): the loom hazard, Friday wages.
- **sibling** (unlocked by the baby brother/sister cards): repeatable
  relationship events; each option branches to whichever sibling you have.

**Deck-per-status:** occupation/education/housing choices pull in the matching
deck, so what you *are* determines what cards you *see*, and a status change
hands its decks over. First-time deck unlocks show a "new chapter"
announcement (the shared `childhood` deck and the `workhouse` carry one; the
rest are silent to avoid double interstitials).

## 11. Mortality & hazards

Childhood carries real, **earned** risk — never a pure random rug-pull. A hazard
appears at random, but **survival depends on prior preparation**:
- **Fever** → survive if `vaccinated`, or health-hardy, or you can afford a
  doctor; else `endGame` (death).
- **Runaway cart** → survive if `sporty`, or health-hardy.
- **Factory loom** (workers only) → survive if `sporty`/hardy; refusing is safe
  but costs pay.

**Finances safety net (the workhouse).** Money is *not* directly lethal the
first time. A card can carry `rescue: <vital>`; when that vital would hit 0 the
engine floors it (to 1) and forces the rescue card instead of a game-over —
one-shot, so a *second* collapse of that vital is fatal. `child_hunger` is the
finances rescue: run out of money and you fall into the **workhouse** (the safe
landing — no money drain, its own exits) or take to the **streets** (free but
harsher). Rescue cards are never drawn normally, only fired by this mechanism.
This makes health/happiness/spirit the directly-lethal vitals; poverty routes
you through the workhouse instead — thematically, the Victorian safety net.

**Target:** a *thoughtful, prepared* player reaches 18 roughly **70%** of the
time; careless/random play dies far more. The **work path** is a deliberate
high-risk/high-reward gamble (money via drift, but a real chance it kills you);
**school** is the safer route.

## 12. End of run

The run ends when any Vital hits 0, or a hazard's `endGame` fires. The end
screen names the ending and shows a short recap. Reaching 18 is its own ending —
**"You Survived Childhood"** — reframing adulthood as an achievement. A richer
epitaph/scoring model is Backlog.

## 13. Save / resume / reset

Autosave to `localStorage` every turn; resume on load; a **Reset** control wipes
and restarts. A separate **Debug** toggle (persisted) unlocks the debug toolkit.
An **Easy** toggle (persisted, player-facing) previews each choice's vital
changes on the card — the vital symbols (£ ☺ ♥ ✦) and magnitude shown right
under each option's edge label, computed from the outcome that would actually
fire given the current state (a ☠ marks a choice that can end the run). A
**language** toggle switches English/Italian live.

## 14. Tech & architecture

- **Static client-side web app** — TypeScript + **Vite**, deployed to **GitHub
  Pages** by a GitHub Action on every push. No server.
- **Hard engine/content split.** Engine = draw model, condition/effect/trait
  evaluation, Vitals/Statuses/drift, result resolution, save/load, rendering,
  input. Content = decks & cards as **typed data** (`satisfies Content`), so a
  misspelled trait/stat/magnitude is a **compile error**.
- **Localisation.** No player-facing text is inline in the content: every
  prompt, option label, outcome result, deck title/blurb and status label is a
  **string id** looked up per-language in `src/i18n` (`EN` is the master table;
  `IT` is Italian). The id fields are typed `StringId = keyof typeof EN`, so a
  card referencing a missing/typo'd id is a compile error, and `IT` (typed
  `Record<StringId, string>`) must translate every id — a missing translation
  is a compile error too. `t(id)` resolves the current locale (falling back to
  English, then the id). A language toggle in the top bar switches live.
  Locale persists in `localStorage`. Languages so far: **English, Italian**.
- **Build stamp** (git SHA + time + a short label) shown at the foot of the page
  to confirm which build is loaded.
- **Debug toolkit** (when enabled): draw pool with gate reasons + force-draw,
  full card/outcome inspector, live traits, and controls to edit vitals, age,
  traits, decks, and jump to milestones (auto-setting the age).

## 15. Content conventions

- **Card ids:** `<deck>_<name>` (e.g. `baby_vaccine`, `child_bully`,
  `study_exams`). Ids are display keys only — nothing references a card by id —
  so they rename freely; **decks** are referenced by their own id.
- **No dominant options:** within a card, no option should be strictly better
  than another on every axis — trade a gain in one dimension for a cost/less in
  another. A future-positive trait means slightly less "now"; a future-liability
  trait (e.g. `sweetTooth`) can ride a bigger boost now.
- **Childhood options touch 2–3 vitals** (never just one), forcing balance.
- **Baby is unloseable:** positive/neutral effects only.
- **Magnitudes only** for player-facing vital moves (`+`/`++`/`-`/`--`).

## 16. Current scope (built)

Birth → babyhood (unloseable build-up, trait setups) → **school-or-work** at 5 →
childhood (shared events + home / education / occupation decks + hazards,
genuinely failable), the workhouse as a grim fallback → **age 18 / "You
Survived Childhood"**. Sibling relationship deck. Full debug toolkit. Deployed
and playable on a phone.

## 17. Settled decisions (quick reference)

- Four Vitals; any at 0 = game over; only Health's ending is "death".
- Victorian setting; childhood mortality, earned by preparation (~70% careful).
- Magnitude steps (`+`/`++`) with a single tunable point table.
- Engine/content split; typed content; TypeScript + Vite on GitHub Pages.
- Virtual-pool draw; milestone priority; filler; no immediate repeats.
- Cards have a front (choice, numbers hidden) and a back (result), outcomes
  chosen by condition.
- Traits drive conditions and results; relationships are Traits.
- Deck-per-status; neutral no-drain start statuses (infant / with family).
- Per-status decks are prefixed by status kind (`edu_`, `home_`, `job_`);
  cross-cutting decks keep plain names. Card ids follow `<deck>_<name>`.

---

## 18. Backlog (agreed future work)

Roughly in likely order. None of these are started.

- **Age-18 leaver branch** — the next milestone: choose a first job /
  apprenticeship / (if `education ≥ school`) further study; introduces the first
  **adult decks** and job/education gating.
- **House decks & an "owned" housing status** — renting/buying, home events;
  gives something to *own* (prerequisite for inheritance below).
- **Homeless deck & exits** — `homeless` housing (reached by begging off the
  hunger card, or running away from the workhouse) now has its own health/
  happiness drift but **no deck and no way out** — a pure hardship spiral. Give
  it a `home_homeless` deck (begging for coins, finding shelter, a soup kitchen)
  and exits (a benefactor, a doss-house job → renting/apprentice), mirroring
  what the workhouse now has.
- **Renting deck** — first-pass `home_renting` deck is in (lodger, landlord,
  furnish, neighbour, quiet). Still wants: the step up to **buying** a place
  (toward the inheritance thread), and possibly a lodger as a persistent income
  status. The **apprentice/master** life still wants its own deck. Part of the
  broader **house decks** work below.
- **Legacy / inheritance across runs** — if you owned a house *and* had an heir,
  the **next run starts in that house** (and maybe with some money/traits).
  Implemented as a shim: on the end screen write an `inheritance` record to
  `localStorage`; on `New life`, override `content.start` before the first card.
  The engine needn't change (start is already pure data). Related: the deferred
  **"continue as your child"** thread.
- **Relationship character decks** — unlock a sibling/friend/partner's storyline
  when a `rel*` trait crosses a threshold; different runs surface different
  stories.
- **Work path tuning** — child-labour drift is deliberately harsh (−5); decide
  whether to soften to −3 to make the gamble more tempting.
- **Richer end-of-run epitaph / scoring** — cause of death, life recap, a score
  to make runs feel distinct and replayable.
- **Full tone/writing pass** — once the decks are complete, sweep all cards for
  a consistent Victorian voice and a final balance/dominance check.
- **Italian gender agreement** — Italian forces gender agreement on the player
  (past participles, adjectives) that English glosses over; the first pass
  defaults to masculine. A proper fix needs gender-variant strings keyed on the
  `gender` trait (the sibling cards already split brother/sister results, which
  is the same mechanism). Also: more languages are now just another table.
- **Card art / imagery** — currently text-only; add art later.
- **Design-doc upkeep** — keep this file in sync as systems land.
