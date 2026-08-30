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
| `---` | **keep ~⅓ (lose two thirds)** — the proportional "big purchase" cost (moving out, buying a house). Self-scaling and floored at 1, so it can't reach 0 from a positive value (a floor-gated card can't game-over). |

Point values live in one place (`MAGNITUDE_POINTS`, `types.ts`) — balancing is a
single table, and more levels (e.g. `+++`) can be added later. Relationship
nudges and drift use raw numbers (they're not player-facing bar moves).

## 6. Statuses

A Status does two jobs: **drift** (a fixed per-turn effect on Vitals) and
**gating/deck-ownership** (a state can `addDecks`). Drift is shown to the player
on the status chip as **icon + sign** (e.g. *Workhouse ♥− ☺−*).

| Status | States (so far) | Notes |
|---|---|---|
| **Job / occupation** | infant · child_labourer · studying · apprentice · unemployed · shophand · factory · pickpocket | Start = infant (no drain). Child labourer: **finances +10 / health −5**, opens `job_labour` — the wage is a real net income now (+5 after the family keep), so the work path can save toward moving out (→ renting → health recovery) instead of just treading water. Studying: spirit −5, opens `edu_basicschool`. Apprentice: finances +5. **Unemployed** (school-leaver, no work): **happiness −5 / spirit −5** — a grim state you want out of fast; opens `job_unemployed`. First jobs: **shophand** (finances +12, safe — **needs education ≥ school**), **factory** (finances +13 / health −5), or **pickpocket** (finances +10 / spirit −5 — the criminal life). Wages are tuned so every advancement out-earns the −10 rent line: unskilled child-labour/factory ≈ subsistence, the skilled ladder (apprentice +5 *housed*, journeyman +18, master +28) and educated ladder (shophand +12, clerk +16, solicitor +20) pay clearly more, so a promotion is a real raise. |
| **Housing** | family · workhouse · renting · owned_small/large/estate · homeless · apprentice | Start = family: finances −5 drift (your keep — offset by a wage, not by studying), opens `home_family`; a well-off teen can **move out → renting**. Workhouse: health −5 / happiness −5, opens `home_workhouse`. **renting** (moved out / bought out): **finances −10** rent but health +5 (your own place, better conditions — the childhood preview of the adult better-house→health ladder). Rent is set to **swallow the base child-labour wage** (+10), so a labourer renting nets ~0 money — you buy health recovery, not continued free savings; getting ahead again needs a better wage or the renting deck's income cards. **homeless** (ran away): health −5 / happiness −5, no deck yet. **apprentice** ("with a master"): safe, paired with job=apprentice. Entering it **remembers your prior housing** (`housingBeforeApprentice`); leaving the apprenticeship (qualify, fail, or the workshop closing) **returns you there** via the `restoreHousing` effect — the job ladder never silently grants or strips a home, so job and housing progress stay orthogonal. Drift is **suspended in babyhood** (the baby deck's `noDrift`), so the family cost doesn't bite the unloseable phase. |
| **Education** | illiterate · basic · grammar · university (+ trade: journeyman/master) | Ordered (levels), a persisting **record** of the level reached (for later `atLeast` gating, e.g. grammar school). The *activity* of studying lives on `job = studying`. The credential (`school`) is earned by **effort** — studying hard at exams or winning the prize (you know your stuff even if you leave early) — or, failing that, granted at the **end-of-school leaver** (age 14) as the fallback. Drop out for work/the workhouse before earning it either way and you stay `none` (Illiterate). |
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
- **Booleans:** `knowsMartialArts`, `vaccinated`, `uniFund`, `sweetTooth`,
  `sociable`, `hasBrother`, `hasSister`.
- **Enum:** `gender` (boy/girl), chosen on the birth card.
- **Counters:** `relBrother`, `relSister` (relationship stats, can go negative =
  rivalry), `numTimesChangedJob`, `numTimesPlayedLottery`; **`sporty`/`bookish`**
  (0..3 disposition — a baby sets it to the cap, else built +1 at a time in
  youth; reward cards gate on `{ min: 3 }`, see §18 backlog).

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
- **Force-at-max** (`Card.force`) then jumps the queue when its vital is capped.
- **Priority (urgent) decks own the pool:** if any eligible card belongs to a
  deck flagged `priority` (an escape-me state — `job_unemployed`, `home_workhouse`),
  the draw is **restricted to those cards**, so the escape routes aren't drowned
  out by incidental flavour from other still-active decks (childhood/home life).
  You can't spend six years unemployed drawing "a day at the fair"; the job-hunt
  cards surface until you're out. (Falls back to the full pool when no priority
  deck is active — so it costs nothing in normal life and scales to post-18.)
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
- **home_renting** (housing = renting): flat life on top of the rent/health
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

**The `rescue` mechanism (safety nets).** A first-class engine feature: a card
can carry `rescue: <vital>`. When that vital would hit 0, instead of a game-over
the engine floors the vital to **1** and force-draws the rescue card (it jumps
the normal draw queue). A rescue is eligible only while its **deck is active**,
it is **not exhausted**, and its **`conditions` hold** (rescues honour `meets`
just like `force` does — so a net can be age-gated, e.g. the charity hospital
below only catches young children); rescue cards are *never* drawn normally —
only fired by this mechanism. Because only one rescue per vital can be active at
once, deck- and condition-gating let different life stages provide different nets
for the *same* vital (childhood workhouse vs. adult house-sale, below).

**Finances net #1 — the workhouse (childhood only, once).** `child_hunger` is
the childhood finances rescue and is a **`one_time` card**, so it fires **at most
once** — a *second* penniless collapse in childhood is fatal. Run out of money
and you fall into the **workhouse** (safe landing — no money drain, its own
exits) or take to the **streets** (free but harsher). It lives in the childhood
deck, so once adult decks replace it it cannot fire in adult life — the workhouse
catches you *once, as a child*, and never again.

**Health net — the charity hospital (childhood, once).**
`child_charity_hospital` is a **`one_time`** health rescue gated **`ageMax: 13`**
(hence the condition-check above) — it covers the whole childhood window, up until
the move-out card unlocks at 14 and adult life proper begins. When a child's
health would hit 0, a charity hospital takes them in: the vital floors to 1, the
ward mends you further (health `++`), and you **always incur `owesCharity`** (you
used the net; the debt comes due in young adulthood). It's a real choice only in
what small extra you take from the stay — **spirit** (the sisters' care),
**happiness** (a friend on the ward), or **a few coins** (odd jobs for the
sisters). Fires at most once. It's the symmetric twin of the finances net
(previously health had *no* net at all, which is why it was the #1 killer).

So poverty and a child's ill-health both route through a net; **happiness and
spirit remain directly lethal**, and health is directly lethal from age 14 on.
(Adult life has its own finances net — **selling the house** (§17b), now **BUILT**:
a homeowner who would go bankrupt is caught and crashed back to renting instead.)

**Target:** a *thoughtful, prepared* player reaches 18 roughly **70%** of the
time; careless/random play dies far more. The **work path** is a deliberate
high-risk/high-reward gamble (money via drift, but a real chance it kills you);
**school** is the safer route.

## 12. End of run

The run ends when any Vital hits 0, or a hazard's `endGame` fires. The end
screen names the ending and shows a short recap.

**Reaching 18 is no longer an ending** — it's a **coming-of-age transition**
(`child_adult` milestone): it hands off the `childhood` deck and adds the
`young_adult` stage deck, and the run **continues into adult life** on top of your
job/housing decks. **Young adulthood (18–~25) is built** (skeleton pass —
recurring life-event trades). There is **no cap yet**: past 18 the run just keeps
going until a vital fails — deliberately, to see when the draw pool starts to run
thin and needs the next life-stage. Later stages (midlife → old age), the
ageing-drift/natural-death model, and the qualitative epitaph are designed in
§17b and still to build. (The old `grown_up` / "Survived Childhood" ending is
retired; the string lingers unused.)

## 13. Save / resume / reset

Autosave to `localStorage` every turn; resume on load; a **Reset** control wipes
and restarts. A separate **Debug** toggle (persisted) unlocks the debug toolkit.
An **Easy** toggle (persisted, player-facing) previews each choice's vital
changes on the card — the vital symbols (£ ☺ ♥ ✦) and magnitude shown right
under each option's edge label, computed from the outcome that would actually
fire given the current state. Two extra markers:
- A **☠** marks a choice that can end the run. The check **projects the whole
  year** — the card's change (if any) *plus* the turn's passive drift — onto
  every vital, so it warns of death from the *drain* too, even on a vital the
  card doesn't touch (e.g. a card that ignores health while workhouse drift is
  about to zero it). It shows on whichever vital would hit 0.
- A gold **★** marks a **beneficial path change beyond the numbers** — a new
  job/home/education (`setStatus`), a **boon trait** (`setTraits` — vaccinated,
  sporty, a uni fund…), or a life-stage deck swap — so a rewarding option (seize
  the apprenticeship; buy the house; get vaccinated) doesn't look weaker than a
  plain sibling that only moves a stat. The star reads as *good*, so a trait that
  is a **burden** is set via **`setFlaws`** instead of `setTraits` (mechanically
  identical, but flagged bad): `setFlaws` never earns the star, **and suppresses
  it** even when the same outcome also changes status (so selling up → renting, or
  the charity-hospital debt, don't star). Incremental ticks (experience, +1
  sporty) don't qualify either, keeping the star rare. *(Known remaining case: a
  plain demotion like being sacked → unemployed still stars — it's a bare
  `setStatus` with no flaw, and telling a downgrade from an upgrade needs status
  rankings; parked.)*

A **language** toggle switches English/Italian live.

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

Birth → babyhood (unloseable build-up, trait setups — incl. the `baby_disposition`
fork: sporty / bookish / neither) → **school-or-work** at 5 → childhood (shared
events + home / education / occupation decks + hazards, genuinely failable), with
two safety nets — the **workhouse** (finances) and the **charity hospital**
(health, children up to 13, on `owesCharity` credit) → **coming-of-age at 18** (no longer
an ending; hands off into a young-adult life-event stage that continues with **no
cap**). Occupation ladders partly built: dangerous child labour with the **earned
apprenticeship** crossover (spirit/happiness, ages 13–18) onto the skilled trade
(`_day`/bench-job XP → survivable closure → the qualifying trial → journeyman);
factory step within unskilled; criminal entry. Housing ladder (family → move-out
→ renting) with health recovery; the apprenticeship borrows and returns your
housing. Sibling relationship deck. Choice previews (death-from-drift ☠, path
★). **Academic ladder now built**: free basic school → fee-paying **grammar
school** (job=grammar_school, tuition −5) → **university** (job=university,
tuition −5, entry gated on `uniFund` OR savings ≥ 50 via the new `any`
OR-condition), earning the `basic`/`grammar`/`university` credentials that gate
the educated jobs. (Balance: reaching university is currently very rare — the
tuition drain vs the savings gate — see §18.) Full debug toolkit. Deployed and
playable on a phone.

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

## 17b. The adult economy (paper design — NOT yet built)

> **Status.** This whole section is an agreed paper design for adult life. It is
> **not implemented** and, by decision, **the game still ends at the close of the
> childhood deck** ("You Survived Childhood") until we have the childhood content
> written and balanced. All numbers below are **provisional** — expect to tweak
> them during playtest once we actually build this. **Built so far:** the entry
> tier of each path, the `unemployed` hub, and a job-loss card per job.

### The core loop (hedonic treadmill)

Money flows in **one channel only** and is converted into the other three vitals,
so a good life is an *equilibrium* you sustain, not a pile of cash:

- **Money (£):** the **only** source is your **job**. The **only** things that
  spend it are **houses** (buy + upkeep) and **lifestyle** (ongoing).
- **Happiness ☺:** fed mainly by **lifestyle** (a little by the house); **work
  drains it**. Living too frugally *starves* happiness — a slow death by misery,
  so frugality is **not** the safe long-life option.
- **Health ♥ / Spirit ✦:** fed by the **house** (rest, security); drained by
  **work** and by **lavish lifestyle**.

Two ways to die at the top are symmetric — neither is "be boring":
- *Rich miser* (top job + estate + frugal): happiness bleeds out → dies unhappy.
- *Rich hedonist* (top job + estate + lavish): health/spirit bleed out → dies worn out.
The sweet spot is the lifestyle your job + house can **sustain**, and that spot
rises as you earn more — the treadmill.

### Job ladders — paths pay differently; education pays most

Four education levels: **illiterate → basic → grammar → university**. Illiterate
is the shared floor. Each path then has **3 tiers** above the floor (matched
across paths). Education out-earns the others per tier because it is gated behind
~10 childhood years of £0 study — the higher pay compensates the lost earning
years. Criminal earns nearly as much but risks prison; manual is the reliable
middle that grinds health.

**FOUR paths, framed as a 2×2 of "invest early vs earn now".** The old "manual"
ladder is split into **skilled** (trade) and **unskilled** (labour), giving four
distinct identities:

|              | Safe / high ceiling            | Dangerous / capped                         |
|--------------|--------------------------------|--------------------------------------------|
| **Invest early** | **Educated** (study years) | **Skilled** (earned apprenticeship)   |
| **Earn now**     | —                          | **Unskilled** (labour) · **Criminal** (scores) |

Educated and Skilled are the *delayed-gratification* paths — you pay in years up
front (school / a low-paid, time-limited apprenticeship) and reap a high ceiling.
Skilled is "education for the working class": the apprenticeship is the manual
world's equivalent of school. Unskilled and Criminal are *money-now*.

Job income is £/yr drift (except criminal — see below); jobs also carry a
non-financial **cost** that rises with tier. Per-tier cost (spread across ♥/✦/☺,
flavour by path): floor 0 · tier 1 ≈ −5 · tier 2 ≈ −10 · tier 3 ≈ −15.

| Tier | Unskilled | Skilled | Criminal | Educated |
|---|---|---|---|---|
| Floor | **Dangerous child labour** | — | odd-jobs / unemployed | (shared floor) |
| 1 | Factory hand £ +12 | **Apprentice** (time-limited) | Pickpocket £ +14 | Clerk £ +16 |
| 2 | Gang-master £ +18 *(ceiling)* | Foreman £ +18 | Burglar £ +22 | Bookkeeper £ +26 |
| 3 | — *(no tier 3)* | Master tradesman £ +26 | Fence / gang boss £ +34 | Solicitor £ +40 |

- **Unskilled caps at tier 2** — the quietly-tragic honest lot: decent money
  early, but no master-equivalent to rise to. Its identity *is* the low ceiling.
- **Skilled** is entered by an **earned apprenticeship** that crosses you over
  from the unskilled floor (dangerous child labour) onto the high-ceiling ladder.
  *No longer a lucky-break random draw:* a master takes on a labouring child who
  has kept their **spirit** (grit) or **happiness** (favour) up through the mill —
  two cards, each entering the pool at the stat ≥ **70** and **forced** at 100,
  gated to **ages 13–18** (apprentices were bound as minors). Gating on the two
  stats a labourer can actually *build* (not health, which the work drains) makes
  it a reward for perseverance rather than luck. Once bound, the apprenticeship is
  **time-limited**: `_day`/one-shot bench jobs tick **experience**, the workshop
  can close early (`_end` — survivable now: seek another master, or leave), and at
  experience ≥ 4 the **trial** (`_qualify`) forces a resolution — pass (→
  journeyman, if health held up) or fail (→ unemployed). So the break is earned,
  then the trade is a gamble.
- **Dangerous child labour is never a dead-end** — always has exits: the earned
  apprenticeship (→ skilled), a steady factory job (→ up within unskilled), or
  unemployed / crime. You can't get *stuck* there, but you *can* stay if unlucky.
- **Criminal** risk is **arrest → prison** (see below).
- **Educated** tiers gate on the new higher education levels (grammar, university).

**Progression pacing — where a *reasonable* run stands at 18.** These are the
calibration targets for tuning the experience/schooling gates (they fit the real
Victorian ages, so they should hold into the full-life game):

| Path | By age 18, a reasonable run has… |
|---|---|
| **Educated** | finished basic **+** grammar school, about to start **university** (school ~5–13, grammar ~13–18, uni 18+) |
| **Skilled** | **started but not finished** the apprenticeship (indentures ran ~7 yrs from ~14 → qualify ~21) |
| **Unskilled** | *just* climbed out of child labour into the **factory** |

How the gates realise this:
- **Experience ≈ years-in-role** (one work card ≈ one year ≈ +1 exp), so an
  experience threshold is effectively a "years to promote" dial. It's a **noisy**
  proxy (draw luck) — deliberately kept **fuzzy / distributional** for now ("a
  *reasonable* run gets to X", not a guarantee). **No age-gates yet**; if we later
  want reliable age-pacing, add a minimum-age gate *alongside* the experience one.
- **Per-job, independently tweakable thresholds.** Each promotion card carries its
  own `experience` gate, so paths pace differently. Because **unskilled has fewer
  rungs, its steps cost *more* experience** (child labour → factory is now
  `experience ≥ 4`, higher than the tier-1 steps on other paths) — a longer haul
  per rung so the low-ceiling path fills a life rather than topping out early.
- **The educated path paces itself by schooling** (attendance over years, age-
  driven) rather than experience, so it fits the ages automatically.
- **No skipping the grind — but you can resume a career.** The unemployed offer's
  "back to the mill" (factory) option is shown **only if you've *reached* the
  factory before** — a durable `reachedFactory` trait, set by the child-labour →
  factory promotion (not the live `experience` counter, which resets on every job
  change, so a fired factory hand would otherwise read as green). So a green
  worker can't jump straight to a factory job (must grind child labour up to it),
  while a former factory hand who was sacked can pick their career back up without
  re-grinding. For the green worker the option is **hidden entirely** (per-option
  `if` — see below), not a dead/duplicate choice. Green illiterate at the offer
  therefore chooses child-labour (`left`) or hold out (`down`); the factory
  (`right`) only appears once earned.

> **Built.** The four paths are implemented and gated by the `education`
> credential (academic `illiterate→basic→grammar→university` ordered ladder +
> trade `journeyman`/`master` off-ladder credentials). Unskilled: child labour →
> factory → gang-master (ceiling). Skilled: earned apprenticeship (from the
> labour deck, gated on health/spirit) → **time-limited qualifying milestone**
> (experience ≥ 4; pass on health → journeyman job + credential, fail → back to
> unemployed) → journeyman → master. Criminal: pickpocket (no wage) → burglar
> (small wage) → fence. Educated: shophand → clerk → solicitor, the clerk→
> solicitor step gated on `grammar` schooling (dormant until grammar/university
> school content exists, so educated currently tops out at clerk).

**Criminal path plays differently — no wage, big scores (built, tier 1).** Unlike
the wage-drift paths, the criminal tier has **0 drift**: no passive income at all.
Money comes *only* from pulling **"score" cards** in the deck — each a big one-off
haul (finances `++`) at a cost to the spirit — and **only a score grants
experience** toward promotion. It is feast-or-famine: between scores you earn
nothing while the rent (housing drift) bleeds you, so you must keep taking jobs,
each one corroding the spirit and risking arrest. Backing off a score costs
nothing but a clear conscience. (The £ figures in the table above are the
*wage-equivalent* for balancing against the other paths; the criminal earns it in
lumps, not drift.) Currently applied to tier-1 pickpocket; whether tier-2 burglar
keeps a drift or also goes score-only is open. Score size is capped at `++` (+25)
until/unless a `+++` magnitude is added.

### Houses — a `---` purchase behind a rising gate, then cheap upkeep

Buying a house reuses the existing **`---` (halve current Finances)** magnitude,
gated behind a **rising Finances threshold**. Each purchase is therefore a huge,
felt hit (≥50% of your money) but self-scaling (halving always leaves headroom;
you re-accumulate toward the next gate). The rising gate is the "have I made it
yet?" moment, and a bigger job is how you clear it. After purchase, only small
**upkeep** and a permanent **vital bonus**:

| House | Gate | Cost | Upkeep/yr | Gives |
|---|---|---|---|---|
| Renting *(BUILT)* | move out: Finances ≥ 50, age ≥ 14 | `---` | −10 (rent) | ♥ +5 |
| Small house *(BUILT)* | Finances ≥ 75 | `---` | **−8** | ♥ +7, ✦ +3 |
| Large house *(BUILT)* | Finances ≥ 75 | `---` | **−12** | ♥ +9, ✦ +5, ☺ +2 |
| Estate *(BUILT)* | Finances ≥ 75 | `---` | **−18** | ♥ +11, ✦ +7, ☺ +4 |

The **purchase is never forced** — you always choose (right = decline) — but the
offer is **force-DRAWN** (like the move-out card): a filler in the current tier's
home deck, offered from finances ≥ 75, and *guaranteed to surface* when you're
capped at 100 (`force: "finances"`) rather than hiding in the random pool. The
gate is a flat **≥ 75 for every tier** and the
`---` cost keeps ~a third — so each purchase is *rebuild your savings to 75, buy
the next tier up, spend down to ~25, rebuild*. You can only buy the next tier up
(the offer lives in the tier-below's deck), so it's a strict ladder:
renting → small → large → estate.

**Upkeep scales UP with the tier, crossing above the −10 rent for large/estate**
(−8 / −12 / −18): a bigger house needs a bigger wage to run, so houses gate on
*income*, not just savings. Net income while owning, by job:

| Wage | small −8 | large −12 | estate −18 |
|---|---|---|---|
| factory +13 | +5 | +1 *(stuck)* | −5 *(bleeds → sell-up)* |
| clerk +16 | +8 | +4 | −2 |
| journeyman +18 | +10 | +6 | 0 |
| solicitor +20 | +12 | +8 | +2 |
| master +28 | +20 | +16 | +10 |

So a steady worker tops out around a **large** house (owning large nets only ~+1,
too slow to save the ~50 to reach the estate gate); the **estate is a money pit
only a top income sustains** — overreach and the drain pulls you toward the
sell-up rescue. This replaced the earlier *lower-than-rent* upkeep, which made the
ladder self-accelerate (each house cheaper to run than the last → a factory hand
could reach an estate). *(The health bonuses +7/+9/+11 still make owning safe once
you can afford it; that's the "made it" reward, now correctly income-gated.)*

Renting is the built entry rung (the `renting` housing status: −10 rent, **♥ +5**).
The purchasable tiers are re-based so each is strictly better on *vitals* than
renting (more health, then spirit, then happiness) and clearly worth its `---`
lump, but costs more in *upkeep* the grander it is. The lifestyle drain (higher tiers cost ♥/✦) is what
claws these bonuses back into the treadmill equilibrium.

**Finances net #2 — selling the house (adult; reuses `rescue`).** **BUILT** — one
`home_sellup_*` rescue per owned-house deck; both options crash you to renting +
`soldUp`, differing in pride (sell cleanly, happiness− spirit− / cling on,
happiness−− spirit+); proceeds scale by tier (small `+`, large/estate `++`).
Verified: no homeowner dies of finances — the net always catches. The house is
stored wealth and the adult finances net. If **Finances would hit 0 while you own
a house (tier ≥ small)**, a forced **"sell up"** rescue fires. It **crashes you
all the way down to renting in one step** — you liquidate *everything*, not one
rung — restores Finances from the sale proceeds (a **bigger house sells for more**,
so an estate floors you higher than a small house), and costs **☺ + ✦** (the mark
of shame). Set a hidden **"sold up"** flag so the epitaph can record the disgrace
(*"…though you were forced to sell the family home."*).

Crashing straight to renting (rather than one rung) is deliberate: dropping a
single tier would just let a good job bounce you back next year, so you must lose
*all* accumulated housing wealth and re-climb the whole ladder — the shame hit may
well be what finishes you even though you survived the bankruptcy. Implemented as
**one sell-up rescue card per owned-house deck** (small/large/estate), each with
its own proceeds and text, all setting `housing → renting`. Because the card is
eligible only while its house deck is active, it is **repeatable only if you
rebuild**: the moment it fires you are renting and it can't fire again until you
have clawed back up to owning property — losing everything *is* the limiter, no
one-shot flag needed. **Below renting there is no adult net**, so Finances → 0
while renting is game over (nothing left to sell) — the adult mirror of the
workhouse catching you only once.

### Lifestyle — unlocked out of childhood; costs money *and* vitals

Lifestyle is the main **Happiness** source and the main **Money/Health** sink, so
it is the lever of the treadmill. Upgrading a lifestyle tier can be a one-time
`---` "move up in the world"; then an ongoing per-year drain:

| Lifestyle | £/yr | ☺ | ♥ / ✦ |
|---|---|---|---|
| Frugal | 0 | **−4** (joyless) | — |
| Modest | −4 | +2 | ♥ −1 |
| Comfortable | −10 | +6 | ♥ −2 |
| Lavish | −22 | +12 | ♥ −6, ✦ −2 |

Frugal being a *happiness drain* is deliberate: it removes "play boring, live
longest". You must spend **up to** your means to stay content, but not beyond.

### Ending the run (when adulthood ships)

Death stays **choice-driven first** (a vital → 0, at any age). On top of that:
1. **Ageing drift** that grows after ~50 (extra −1 then −2 ♥/✦ per year) — rides
   the existing drift system, no special "death deck".
2. A **hard natural-death ending** around age 75–80 regardless of vitals, so every
   run terminates and reaches the epitaph.
3. A later **twilight/old-age deck** as *flavour* only (illness, a child marries,
   a funeral, retirement) — richer text and bigger swings, but **not** the
   executioner.

**Scoring = a qualitative epitaph**, not a number: the death card states, in
words, the tier of each ladder you reached — e.g. *"Died a solicitor, in your own
estate, having lived comfortably, aged 71."* No arithmetic.

### Cross-cutting mechanics (deferred — decide when we build this)

- **Promotion** up a tier — leaning toward an **experience** counter trait (+1/yr
  in the same job) that fires a promotion milestone at a threshold, so climbing
  costs real game-years. (Alternative considered: promotion offered as an
  untimed choice card. Not yet decided.)
- **Prison** (criminal only) — a survivable heavy-drain status, released to the
  illiterate floor; the `rescue` mechanism can make a first petty arrest "prison,
  then out" rather than fatal. Serious crime could still `endGame` (gallows /
  transportation).
- **Experience trait** — the per-job year counter that drives promotion.
- **Cross-run persistence** (own the house on a later run) — **explicitly out of
  scope for now**; the single-run loop closes without it. Possible future
  meta-progression, related to the legacy/inheritance backlog item.

## 18. Backlog (agreed future work)

Roughly in likely order. None of these are started.

> **Current focus — finish the WORK-side content** (before more education work).
> The four big missing pieces: **(1)** homeless deck & exits, **(2)** house decks
> + purchase triggers + owned-housing cost statuses, **(3)** the lifestyle status
> unlocked at adulthood, **(4)** finish the work-path job decks (the day+loss
> stubs). Each is a bullet below, tagged **[work-side focus]**.

- **Academic careers + education balance** — the grammar/university *school
  flows* are built (decks, tuition, the uniFund-or-savings gate, earning the
  credentials). Still to do: (a) the **university-only top profession** the
  degree unlocks (a new job + deck above solicitor, with pay balanced against
  rent/keep — the whole point of going up), and per-credential entry so a
  graduate doesn't start at shophand; (b) **balance the path so university is
  actually attainable** — a steered sim reaches university only ~0.8% / graduates
  ~0.3%, because tuition (−5 grammar, −5 uni) plus the family keep drains you
  below the `finances ≥ 50` gate, and mortality during the studying years is
  high. Levers: lower/stagger tuition, make the income cards pay more, soften the
  gate, make `uniFund` more common or more powerful, or a scholarship route.
- **Adult economy (§17b)** — the whole post-childhood game: job ladders (4
  education levels; matched 3-tier manual/criminal/educated paths), houses as
  `---` purchases behind rising Finances gates, lifestyle tiers, and the
  ageing-drift + natural-death ending with a qualitative epitaph. Fully paper-
  designed; **deliberately deferred** so childhood content is written and
  balanced first. Starts with the **age-18 leaver branch** (choose first job /
  apprenticeship / further study).
- **Deck-density pass, once the run extends past 18** — a deck-size audit (job/
  home/edu/core) flagged things that can't be judged on a 13-year window and are
  deferred until there's a real runway: (a) **`home_renting` wants ~1 filler** —
  it's all one-time now, so recurring renting life is thin, but adding it too
  early may just clutter the shared draw pool (which the sibling/friend decks
  will also fill); (b) **the terminal-tier job stubs** (`solicitor`, `master`,
  `gang_master`, `fence`) are only 2 cards (day + loss) because they're
  unreachable/unplaytested — flesh them out when a longer run reaches them; and
  (c) job decks are broadly *work-card + loss-card* (~50/50 work-or-sacked across
  the board) — decide whether jobs need more work-event variety and/or rarer
  (gated / lower-weight) loss cards once real careers can play out.
- **Trait naming/hierarchy refactor** — rename every trait to a `group_[subgroup_]name`
  convention and update all references (a big sweep — `experience` alone has ~65),
  then make the debug trait tree nest **recursively on `_`** (it currently groups
  one level, by `_` or camelCase prefix). Target layout:
  - `skill_` → `skill_martialArts`
  - `personality_` → `personality_bookish` / `_sporty` / `_sweetTooth` / `_sociable`
  - `job_` → `job_experience`, `job_strikes`, `job_timesChanged`, and per-path
    highest-tier under a sub-level: `job_unskilled_highestTier`,
    `job_skilled_highestTier`, … (ties into the highest-tier cache item below —
    `reachedFactory` becomes `job_unskilled_highestTier`)
  - `brother_` → `brother_has`, `brother_relationship`, + brother-storyline traits;
    `sister_` likewise (splits the current `has*`/`rel*` pairs into per-sibling groups)
  - `finance_` → `finance_uniFund`
  - top-level singletons stay ungrouped (e.g. `vaccinated`)
  Do it as one focused pass (rename + reference update + recursive tree) rather
  than piecemeal, to avoid mixed conventions.
- **Highest-tier-reached cache (job re-entry)** — `reachedFactory` (bool, set by
  the child-labour→factory promotion) is a stopgap that gates the "back to the
  mill" option so a sacked factory hand can resume without re-grinding. Generalise
  it to a **per-path "highest tier reached"** record (set on entering each job) so
  that being fired from *any* tier (e.g. a tier-3 solicitor) lets you return near
  your former level rather than restarting at the bottom. Real once adult re-entry
  to tier 2/3 jobs exists; fold `reachedFactory` into it then.
- **"Keep your job" / `jobStrikes` mechanic** — *prototyped on the labour deck.* A
  per-job `jobStrikes` counter (resets on any job change) rises when you shirk
  (`job_labour_machine`/`errand` "refuse/dawdle" options) and each time you grovel;
  the sacking card's `down` = "beg to keep your place" (conditional option, shown
  only while `jobStrikes ≤ 1`) lets a worker in good standing save the job at a
  pride cost, and the option vanishes once you've pushed your luck. Softens how
  often a sacking actually lands. **To do:** replicate to the other job decks'
  loss cards if it feels good, and add more shirk→strike moments as those decks
  gain work cards.
- **Disposition counters (`sporty`/`bookish`) — scaffolded, needs fleshing out.**
  These changed from booleans to **0..3 counters**: the merged `baby_disposition`
  card sets one straight to the cap (3), and cards that reward the trait gate on
  `{ min: 3 }` (the loom `job_labour_machine`, `child_accident`, the two
  `edu_basicschool_*` cards). The "build it up in youth if you didn't pick it as a
  baby" path is only **partly** wired: `child_sports` "go all-out" gives `+1
  sporty` (the first source), but it's `one_time`, so youth can currently reach at
  most 1 — not the cap. **To do:** (a) add more `+1` youth sources for *both*
  sporty and bookish (bookish has none yet) so the cap is reachable through effort;
  (b) have more card *results* branch on the counter (e.g. `child_sports`'s own
  results, other physical/scholarly moments), per the "use them in more cards"
  note — right now the counter is mostly checked at the loom/school, not rewarded
  broadly.
- **House decks & an "owned" housing status** — **[work-side focus]** renting →
  **buying**: a purchase **trigger** (a `force`-style offer once you can afford
  it) with an up-front `---` **cost**, new **owned** housing **statuses** (each
  with its own upkeep drift + a health tier — "better house → more health"), and
  home events. Gives something to *own* (prerequisite for inheritance below). Per
  §17b: houses as `---` purchases behind a rising Finances gate, then cheap upkeep.
- **Lifestyle status (unlocked at adulthood)** — **[work-side focus]** the
  `lifestyle` status exists but has only a `default` state and does nothing.
  Unlock it at coming-of-age: spendable tiers (frugal → comfortable → lavish, per
  §17b) that trade money for happiness, each with its own cost/vitals drift — the
  hedonic-treadmill money **sink** that finally gives income somewhere to go.
- **Finish the work-path job decks** — **[work-side focus]** several jobs are
  still just *day + loss* stubs — factory, gang-master, journeyman, master, the
  criminal tiers (burglar/fence), and the educated tiers (clerk/solicitor). Give
  each real work events, promotion moments, and path-appropriate hazards so a
  career actually plays out rather than just ticking experience toward a promotion
  or a sacking. (Supersedes the terminal-tier note in the deck-density item.)
- **Homeless deck & exits** — **[work-side focus]** `homeless` housing (reached by
  begging off the hunger card, or running away from the workhouse) now has its own
  health/happiness drift but **no deck and no way out** — a pure hardship spiral.
  Give it a `home_homeless` deck (begging for coins, finding shelter, a soup
  kitchen) and exits (a benefactor, a doss-house job → renting/apprentice),
  mirroring what the workhouse now has.
- **Eviction rescue — "turned out onto the streets" (adult finances net).**
  *Maybe, if needed — decide from playtest.* The finances rescue (`child_hunger`
  → workhouse) is childhood-only and `one_time`, and the adult net (§17b) is
  *selling the house* — which does nothing for a **renter**. So a poor adult
  renter who can't make rent (rent is −10, so an unemployed renter bleeds toward
  0) currently just dies of bankruptcy with no net. Idea: a `rescue: "finances"`
  card gated to adult renters (deck-/condition-gated, since only one finances
  rescue is active at a time) that, instead of a game-over, **evicts you →
  `homeless`** — alive but in the hardest state. Depends on the homeless deck
  above having exits, and on whether playtest shows the bleed actually kills
  people (raising the wages may be enough). Hold until we see the need.
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
  stories. **Next up: expand the brother/sister decks.** Use `CardOption.if`
  (built) for **"only if you have X"** choices — e.g. a 3rd option on
  `sibling_blame`, *"Blame the other sibling"* (an up/down swipe), shown only when
  `traits: { hasBrother: true, hasSister: true }` — i.e. you have **two siblings**
  (a brother *and* a sister). Any such conditional choice reuses the same feature.
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

## 19. Sharp edges (known rough spots — not yet fixed)

Deliberately-parked rough edges. Recorded so they aren't forgotten; each is
left unfixed on purpose (usually because a later tweak may dissolve it, or the
fix is a design decision we haven't taken).

- **Apprenticeship overwrites an academic credential.** `education` holds one
  value at a time (trade **or** academic — see §17b). Qualifying as a journeyman
  sets `education = journeyman`, erasing a prior `basic`. So a schooled child who
  ends up a labourer/in the workhouse, apprentices, qualifies, and *later* loses
  the job can no longer take the shop assistant job (it gates on `education
  atLeast basic`) — leaving an ex-tradesman *worse off than an illiterate* for
  that one route. Disliked but not fixed: a later change (e.g. making shop work
  accept a trade credential too, or letting `journeyman` imply literacy) may
  dissolve it, so we're holding off rather than special-casing now. Rare in play
  (only labourers/workhouse folk are offered apprenticeships).
- **Positive drift isn't shown on the vital bars.** The top-bar drift preview
  only surfaces *losses* (a negative per-turn drain, e.g. rent/keep eating your
  health/finances). A *positive* passive drift — notably a child labourer's wage
  income (`finances +10`, net +5 with the family keep) — accrues silently, so the
  player can't see the slow build. Backlogged: show positive drift too (a small
  up-arrow / "+" on the bar), so income and any future passive recovery read as
  clearly as the drains do.
