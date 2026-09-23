**PASSING SCHOOL IS A PRICE, NOT A GATE — and the gate version was a trap.**
`eduStudy` rises only when you choose the work over the easier thing, and each
schooling state stamps it back to 0 on entry, so every tier is its own test.
`persBookish` earns 3 from the cards it already softened where everyone else earns
2 — quicker, not excused — and a determined bookish pupil banks 3+ in 56% of lives
against a plain one's 31%.

What that buys is no longer ADMISSION but a DISCOUNT. Win the place on merit and
it costs nothing; short of the bar you still go up, and your people buy you in:
half of everything they have at the board school (`finances: "/"`, plus happiness
and spirit), and at matriculation the uni fund entire, or two thirds of all you
own (`finances: "//"`, plus happiness and health).

It was a gate first, and that was wrong in a way worth keeping written down.
**Failing sent you to `shophand` — which is exactly where the other swipe goes.**
The losing branch was strictly worse than its sibling with an identical
destination: not a hard choice but no choice, and a trap for anyone who read the
card hopefully. The matriculation gate had the same fault, failing you to `clerk`
where its own sibling already went. **A gate you can fail has to fail you
somewhere the other option does not already go, or it should not be a gate.**

The prices are on the card face, so an idle pupil sees exactly what the place will
cost and can take the shop position with his eyes open:

```
eduStudy=0   Try for the grammar school £−− ☺−− ✦−   |   Take a position ✦+
eduStudy=4   Try for the grammar school ✦+           |   Take a position ✦+
```

**Measured, and it is a real trade rather than a free win.** The road reopens —
grammar-school entries go 582 → 2,414 of 4,000 and university 95 → 693 — and the
consulting physician becomes the most reachable it has ever been at **1.4%**. But
mean age on that route falls from **48.9 back to 32.2**, and **55% of grammar
schoolings now END IN `child_hunger`** — meaning the SCHOOLING ends, not the life.
Both of that card's swipes set a new `job` (`pauper` or `unemployed`), and `job` is
the field carrying `grammar_school`, so being caught by the net marches you out of
the classroom. The pupils are alive; they are simply no longer pupils. Deaths on
this path are counted separately and are small. Greedy lifespan is unmoved (34.8)
since greedy never enrols.

The gate was not making the academic path survivable. It was keeping people out of
a path that costs more than they have, and this change stops hiding that.

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
| **Trait** | Hidden state — booleans, enums, counters (e.g. `skillVaccinated`, `gender`, `relBrotherLove`). |
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
so every bar move is a clearly-perceptible size (no muddy +10-vs-+15). Two families:

**Flat steps** (a fixed number of points):

| Token | Points |
|---|---|
| `++++` | +100 — a **life-changing sum** (~a whole bar), e.g. the sale of an estate. |
| `+++` | +50 — a **huge one-off swing** (~4 turns of a typical wage). The criminal path's rare big scores. |
| `++` | +25 |
| `+` | +10 |
| `-` | −10 |
| `--` | −25 |
| `---` | −40 — the **biggest flat loss**, a grievous blow (a childhood hazard you weren't ready for): fatal only if the vital was already low. |

**Proportional steps** (a fraction of the *current* value — for costs that scale
with what you have). Written with **slashes** so they read as "divide" and are
never confused with a flat loss; floored at 1, so a floor-gated card can't
game-over:

| Token | Effect |
|---|---|
| `/` | keep ~½ (lose half) — *reserved; unused so far* |
| `//` | keep ~⅓ (lose two thirds) — the "big purchase" cost (moving out, buying a house). |

(A `*` "times" family is reserved for a future proportional **gain**; none exists
yet.) **The player only ever sees `+`/`−` bars** — the slash tokens render as minus
bars in the card preview, and status chips use `+`/`−` (`driftShown`) directly.

Point values live in one place (`MAGNITUDE_POINTS`, `types.ts`) — balancing is a
single table, and more levels can be added later. Relationship
nudges and drift use raw numbers (they're not player-facing bar moves).

## 6. Statuses

A Status does two jobs: **drift** (a fixed per-turn effect on Vitals) and
**gating/deck-ownership** (a state can `addDecks`). Drift is shown to the player
on the status chip as **icon + a 1–4-symbol strength**, in the same `+/++/+++`
vocabulary as the cards. **The displayed strength is authored, not computed** —
each state gives `driftShown` per vital, completely decoupled from the raw drift
number, so tuning values never nudges a symbol count and silently flips the
visual. The convention is **ladder position, not magnitude**: each rung up a
progression shows one more symbol, so a ladder reads as clean single steps —
housing finances renting *£−* → small *£−−* → large *£−−−* → estate *£−−−−* (and
the owned-home comforts step up the same way); each career's wage *£+* / *£++* /
*£+++* by tier; old age *♥−−* one step past adulthood *♥−*. A vital whose value
is constant across a ladder's tiers (e.g. the factory/gang health drain) stays a
single pip; the escalation is in the number. A vital with no `driftShown`
override falls back to deriving the strength from the magnitude (|v| ≥ 16 → 3,
≥ 8 → 2, else 1).

| Status | States (so far) | Notes |
|---|---|---|
| **Age / life stage** | baby · child · young_adult · adult · old_age | **Built.** A **visible, passive** status that moves you through the ages — handed over by the same life-stage milestones that swap the life-stage decks (start = baby; `baby_schooling` → child at 5; `child_adult` → young_adult at 18; `ya_adult` → adult at 25; `adult_oldage` → old_age at 50). Its **drift is the passive tax/dividend of your age**: baby a small bonus to **☺ / ♥ / ✦** (not finances) (and flagged `ignoreNoDrift`, so it lands even inside the babyhood grace period — the one status that drifts there), child a touch of ☺, young adult neutral, then a **health decline that starts in adulthood (♥ −3) and steepens in old age (♥ −8)**. Ordered, so cards can gate on `atLeast/atMost` by stage. Always shown (even in babyhood). All values are starter knobs. |
| **Job / occupation** | infant · child_labourer · labourer · studying · apprentice · unemployed · shophand · factory · pickpocket | Start = infant (no drain). Child labourer: **finances +10 / health −5**, opens `job_labour` — with an identical grown-up twin, **labourer** (same wage, same toll, same deck, same ways out), which exists only so an unlettered adult taking whatever work he can find is not labelled a *child* labourer. Coming of age turns a child labourer into a `labourer` (a rename, not a promotion — see §13), so the childhood rung never outlives childhood; the unemployment deck's unlettered fallback used to hand the child rung out at any age, and a man of 26 wore "Child labourer" for the rest of his working life — the wage is a real net income now (+5 after the family keep), so the work path can save toward moving out (→ renting → health recovery) instead of just treading water. Studying: spirit −5, opens `edu_basicschool`. Going UP from board school is now a TRIAL, not a choice (`eduStudy ≥ 3` — see §7). **Grammar school: spirit −10 and nothing else** — the same total toll as the old spirit −5 / tuition −5, taken entirely out of the spirit, because the money side of schooling already lives on the housing status (your keep, which a pupil has no wage to offset) and charging tuition on top taxed the same choice twice. University keeps its tuition: it is the one credential meant to be bought as well as earned. Apprentice: finances +5. **Unemployed** (school-leaver, no work): **happiness −5 / spirit −5** — a grim state you want out of fast; opens `job_unemployed`. First jobs: **shophand** (finances +12, safe — **needs education ≥ school**), **factory** (finances +13 / health −5), or **pickpocket** (finances +10 / spirit −5 — the criminal life). Wages are tuned so every advancement out-earns the −10 rent line: unskilled child-labour/factory ≈ subsistence, the skilled ladder (apprentice +5 *housed*, journeyman +18, master +28) and the **three educated ladders** pay clearly more, so a promotion is a real raise. The educated paths are now **one distinct ladder per credential** (not a single ladder with a higher cap): **Commerce** (basic) shop assistant +12 → shopkeeper +18 → merchant +28; **Clerkly/Law** (grammar) clerk +16 → chief clerk +22 → solicitor +28; **Medicine** (university) junior physician +14 → physician +30 → **consulting physician +42** (the highest wage in the game — the rare degree's payoff). Your credential sets which ladder you enter (school leaver / graduation / the unemployed job-offer all route by it) and you climb within it by experience. All wages tunable. |
| **Housing** | family · workhouse · renting · owned_small/large/estate · homeless · apprentice | Start = family: finances −5 drift (your keep — offset by a wage, not by studying), opens `home_family`; a well-off teen can **move out → renting**. Workhouse: health −5 / happiness −5, opens `home_workhouse`; **entering it also sets `job = pauper`** (a no-drift, no-deck occupation) so the institution cancels any schooling or job — the `home_workhouse` deck owns workhouse life and its exits, including a **"back to school"** route (a 3rd option on both the apprentice and runaway exits — so the window is ~7–13, not just 10–13 — shown only while school-age (≤13) and recovered enough — finances ≥ 40 and vitals off the floor — so you don't relapse straight into ruin). **renting** (moved out / bought out): **finances −10** rent but health +5 (your own place, better conditions — the childhood preview of the adult better-house→health ladder). Rent is set to **swallow the base child-labour wage** (+10), so a labourer renting nets ~0 money — you buy health recovery, not continued free savings; getting ahead again needs a better wage or the renting deck's income cards. **homeless** (ran away): health −5 / happiness −5, no deck yet. **apprentice** ("with a master"): safe, paired with job=apprentice. Entering it **remembers your prior housing** (`housingBeforeApprentice`); leaving the apprenticeship (qualify, fail, or the workshop closing) **returns you there** via the `restoreHousing` effect — the job ladder never silently grants or strips a home, so job and housing progress stay orthogonal. Drift is **suspended in babyhood** (the baby deck's `noDrift`), so the family cost doesn't bite the unloseable phase. |
| **Education** | illiterate · basic · grammar · university (+ trade: journeyman/master) | Ordered (levels), a persisting **record** of the level reached (for later `atLeast` gating, e.g. grammar school). The *activity* of studying lives on `job = studying`. The credential (`school`) is earned by **effort** — studying hard at exams or winning the prize (you know your stuff even if you leave early) — or, failing that, granted at the **end-of-school leaver** (age 14) as the fallback. Drop out for work/the workhouse before earning it either way and you stay `none` (Illiterate). |
| **Family** | infant · single · courting · married · parent · widowed | **Partly built** — the status and `fam_single` and `rel_lilly` exist; `parent` and `widowed` are declared and unreached. Starts at `infant` exactly as `job` does and is moved to `single` by the school/work choice at ~5, so the unattached deck is live all through childhood — but `show: { ageMin: 18 }`, so the chip stays hidden until the player has any reason to care. **NO DRIFT on any state**, like `education`: a record that owns decks and gates cards without touching the ledger. Each state owns its deck, so marrying swaps your social life for your married life with no bespoke wiring. |
| **Lifestyle** | (default →) frugal · modest · comfortable · lavish | **Built.** The money↔happiness lever, unlocked at coming-of-age (§17b). Ordered; each tier trades £ for ☺ (and, high up, ♥/✦). Frugal is a ☺ *drain* on purpose. Changed via the `lifestyle` deck's live-better / economize cards. |

**Deck naming:** decks owned by a status are prefixed by that status's kind —
`age_*` (life stage: `age_baby`, `age_childhood`, `age_young_adult`,
`age_adult`, `age_old_age`), `edu_*` (education), `home_*` (housing), `job_*`
(occupation) — so the growing set of small per-status decks stays legible and
leaves room for siblings like `edu_grammar`. Cross-cutting decks that aren't
owned by a status keep plain names (`sibling`). Changing a status hands its
decks over automatically (leaving `family` for `workhouse` swaps `home_family`
out for `home_workhouse`); the life-stage decks are handed over the same way by
their age milestones (`age_baby` → `age_childhood` → … → `age_old_age`).

Statuses are **ordered or unordered** (Education is ordered for `≥` checks;
Job/Housing are named states).

## 7. Traits (hidden state)

Arbitrary persistent variables, set by effects and read by conditions **and
results**:
Traits carry **sensible prefixes** so the debug panel can group them:
`pers*` (personality/disposition), `skill*` (learned abilities), `edu*`
(education), `job*` (work life), `flaw*` (burdens, set via `setFlaws`), and
`rel<Sibling>*` (relationships, nested per sibling — Brother `relBrother*`,
Sister `relSister*`).
- **Booleans:** `persSporty`, `persBookish`, `skillMartialArts`, `skillVaccinated`, `eduUniFund`,
  `eduWasUndergraduate` (took up a uni place — lets a dropout return to finish),
  `persSweetTooth`, `persSociable`, `relBrotherActive`, `relSisterActive` (whether
  you have that sibling), `jobReachedFactory`, and the burdens `flawOwesCharity`,
  `flawSoldUp`.
- **Enum:** `gender` (boy/girl), chosen on the birth card — currently unused, so
  left ungrouped until it has a purpose.
- **Counters:** `relBrotherLove`/`relSisterLove` (bond warmth, can go negative =
  rivalry), `relBrotherGrit` (his backbone), `relBrotherDistance` (how present
  you've been — ticked UP each year, pulled DOWN when you engage a Tom card; high =
  drifted apart), `relBrotherAge` (Tom's own age — ticked up by the rel_bro deck from the year he's
  born, so his beats fire at his age not yours; e.g. the crossroads at 5),
  `jobExperience` (years in the current job), `jobSkill` (apprentice
  craftsmanship), `jobStrikes`, `jobTimesChanged`; `petCatAge`/`petDogAge` (years
  you've kept that pet — tick up via the pet status, drive its old-age passing) and
  `petCatLove`/`petDogLove` (how well you treat it — neglect sends it running);
  **`eduStudy`** (how hard you have applied yourself at the school you are at —
  the exact twin of `jobSkill` at the bench, stamped back to 0 by each schooling
  state's `enterTraits`, so every tier is its own test).
  (`persSporty`/`persBookish` were counters here and are booleans now — see below.)

**Relationships are just Traits.** Character decks can later branch on
thresholds (e.g. high `relBrotherLove` → a loyal-sibling arc). Baby-deck "setups"
(skillVaccinated, sporty, eduUniFund…) exist to **pay off later** — notably as what
keeps you alive through childhood hazards.

**GRAMMAR SCHOOL AND UNIVERSITY ARE `priority` DECKS**, alongside the workhouse
and unemployment — not because they are grim, but because they are SHORT. A
scholar spends 2.4 years at grammar school and 2.2 at university, and the decks
were dealing 1.20 and 0.95 of their own cards in that time, the rest of the draw
going to home life and the street. Three years cannot both be shared out and carry
a trial at the end of them. As priority decks they deal **1.84** and **1.16**, and
the share of scholars arriving at the leaver having banked NOTHING falls from
**47% to 7%**. Self-limiting: the cards are `one_time`, so once they are spent
nothing of the deck is eligible and the pool reopens.

That is what makes a second trial possible. **`edu_grammar_leaver` now checks
`eduStudy ≥ 3` FIRST**, before any of the three means branches, so no amount of
money buys a place you have not earned:

| gate | plain scholar passes | bookish passes |
|---|---|---|
| 2 | 87% | 89% |
| **3 (chosen)** | **50%** | **60%** |
| 4 | 32% | 36% |

Nominally the same bar as the board school's, and materially a looser one — 50%
clear it here against 30% there — which is the "grammar is short so keep it low"
instinct honoured against the supply as it now is rather than as it was. At 2 it
would pass nearly everyone and not distinguish a bookish scholar at all.

**WHAT THE TWO SCHOOL GATES ACTUALLY COST** — one A/B, same instrument, content
at `6eef20f` (before the scholarship paper) against content with both gates and
the priority decks. The goals with no schooling on their route match across the
pair (master craftsman 37.6 → 37.5, a house 36.6 → 36.7, Lilly 6.4% → 6.3%,
control 34.9 → 34.3), which is what says the academic differences are real:

| goal | succeeded before → after | mean age before → after |
|---|---|---|
| Consulting physician | 1.9% → 1.0% | **29.7 → 48.9** |
| Solicitor | 1.2% → 0.4% | 44.2 → 39.6 |
| Merchant | 1.6% → 1.2% | 51.2 → 43.3 |

**The gates roughly halve the success rates and stop the academic path being a
death sentence.** Pursuing medicine used to kill you at 29.7 — below a life that
was not trying at all — and now you live to 48.9, because failing the scholarship
at 14 puts you behind a shop counter with a wage instead of grinding through seven
unpaid years and dying of it. The route depth says the same: 32% of lives used to
stall *at university*, and now 27% stop at the `grammar` credential. People fail
earlier and survive it.

Whether that trade is the right one is a judgement, not a measurement. The gates
exist to give `persBookish` something to be for, and they do (56% against 31% at
the board school, 60% against 50% at matriculation). If the top of the ladder
should be commoner, the matriculation bar is the cheapest dial —
`eduStudy: { max: 1 }` takes it from 50% to 87% — but the starvation problem below
is worth more than the bar is.

**THE ACADEMIC PATH'S REAL PROBLEM IS NOT ITS GATES.** Measured over 4,000 lives:

```
why grammar_school ended: edu_grammar_leaver 294   child_hunger 214   died 14
why university ended:     child_hunger 26          edu_university_grad 17
```

**These are SCHOOLINGS ending, not lives.** Of the 522 grammar schoolings above,
14 were deaths — 2.7%. The other 214 were children who were alive at their desk and
then alive in the workhouse. Read the row as "how this schooling finished".

**AND THE 41% IS STALE.** It predates the leaver becoming a price rather than a
gate. Re-measured on the current build, the workhouse takes **18%** of grammar
schoolings and "on to university" is the commonest ending. Do not quote the 41%.

**WHAT THE ROW ACTUALLY SHOWS IS A CLASS GATE.** Sorted by whether the pupil held
`eduUniFund` walking in:

```
how the schooling ended        spells   % of spells   held fund on entry   had SOLD the fund
on to university                 1163        41.6%                  55%          593 (51%)
left for clerk                   1083        38.7%                  47%          677 (63%)
the workhouse (child_hunger)      494        17.6%                   1%           58 (12%)
died                               37         1.3%                  51%           15 (41%)
```

**55% of the pupils who reach university held a fund; 1% of the pupils the
workhouse takes did.** Having one is very nearly the whole difference between
finishing and being marched out, and 88% of those marched out never sold a fund
because 87% never had one. At ambition 60 the effect sharpens rather than washing
out — university 64%, the clerk's counter 15%, and the workhouse UNCHANGED at 20%:
the signature of a floor that effort cannot buy past.

The fund has exactly one source, `baby_uncle`, a `one_time` card in the ages 2–4
window that you must be dealt AND choose over `happiness ++` and `health ++`. **A
card at age three decides whether you can finish grammar school**, which is why
studying harder never moves the workhouse number.

**THE SCHOLAR'S LAST RESORT.** A finances safety net only a pupil with something
to sell can reach: `edu_basicschool_fund` / `edu_grammar_fund`, gated on
`eduUniFund`, one shot, sharing one card body and one set of strings the way the
prison deck's two "do your time" copies do (the fund is false after the first use,
so a twin in each tier cannot pay out twice). Break into the university pot for
`finances +++` and stay at your desk, or keep it whole and let the ordinary net —
the workhouse or the streets, and your schooling with them — take you next. It
wears ⚠ rather than ★ because the only thing you can see changing is the money;
the asset you spent is hidden. Declining is survivable rather than suicide: the
vital is floored at 1 and this card is spent, so the next collapse finds
`child_hunger` still unused.

Measured over 6,000 lives of a player who wants school AND wants to keep the fund:
the net fired 1,425 times, 726 lives liquidated it, and **all 726 were still at
school afterwards**. `child_hunger` fired 1,504 times, unchanged, and 39% of lives
reaching the grammar leaver still hold the fund.

It needed one engine change. **`findRescue` now picks the highest-`priority` net**,
exactly as `dueMilestone` picks between due milestones; before, it was whichever
deck happened to be earlier in `content.decks`, so a schoolboy with an asset to
sell was caught by the childhood hunger card purely because `childhoodDecks` is
listed above `educationDecks`. Deck order still breaks ties and no existing rescue
card carries a priority, so every old net keeps its exact behaviour.

**EVERY TIER HAS A DOOR OUT NOW, AND EACH ONE OPENS ONTO WORK.** The board
school's leaver drops you to `shophand`, grammar's to `clerk`, and — new —
`edu_university_leaver` drops a quitting undergraduate to `clerk` as well, the
work the grammar credential he already holds has always earned him. He keeps
`eduWasUndergraduate`: he went up, he simply did not finish.

Until that card, **university had no exit but graduation**. Between matriculation
and the degree at 21 no swipe in the deck changed your job, so an undergraduate
whose purse ran dry survived the drift or died of it, and a measured third died of
it. The card is a `filler`, not a `one_time`, on purpose: giving it up is a
temptation that returns every year you are still poor, not an offer made once and
withdrawn — and the deck's `one_time`s are spent in the first years, so a one-shot
leaver declined at nineteen would leave behind the very trap it was written to
remove. Leaving wears the ★ every new job wears; it is a step taken, not a
punishment suffered.

It bought agency, not safety. Measured, 13–16% of undergraduates now walk out to a
clerk's stool — but deaths moved only 32% → 26–30%, because the scholar it was
meant to save is the one who never draws it. A door in the pool is not a floor
under the feet: `eligibleDraw` filters on `!c.rescue`, so **a card is either
drawable or a safety net and can never be both**, which is why the fund cards are
separate cards from the leavers rather than extra swipes on them.

**RUIN: THE PUPIL'S NET, AND WHY IT IS NOT THE WORKHOUSE.** `edu_grammar_ruin` and
`edu_university_ruin` (one card body, one set of `edu_ruin.*` strings, a copy in
each deck, as the fund cards do) fire when a pupil's purse would empty. **A
schoolboy has PEOPLE.** The destitute child's net offers the workhouse or the
streets because he has nowhere else; a grammar-school boy or an undergraduate can
go home and be fed, and what he loses is his education and his face, not his
shelter. So the swipes are **the streets or home** — the streets proud and free of
the keep entirely (`homeless` drifts health and happiness, never money), home
paying `finances ++` because your people settle what is owed, at `happiness --`
because they do it without a word of reproach.

**There is no choice to stay, and that is the point.** The leaver is the door you
walk out of on your own feet with a position waiting; this is the one you are
carried out of. Both swipes set `job` for the reason `child_hunger` does — the
rescue floors the vital at 1, and an occupation still charging tuition would empty
it again next year with the one-shot net spent. Both wear ⚠: you have lost
something that took years, and no status change should dress that as momentum.

`priority: 50` sits below the scholar's fund (100) and above `child_hunger`
(unset, so 0), which is exactly the order the three should be offered in — sell the
university money first if you still hold it, failing that be sent down to your
family, and only someone with neither, who is not in this deck at all, meets the
workhouse. `findRescue` takes the highest priority, so the ordering is automatic.

**YOU LAND AT THE LEVEL OF THE SCHOOLING YOU ALREADY HOLD.** A grammar pupil holds
`basic` (the board school leaver grants it on BOTH swipes) so ruin drops him to
`shophand`; an undergraduate holds `grammar` so he drops to `clerk` — the same tier
drop the leavers use, because **ruin does not unteach you your letters**. The first
cut sent both to `unemployed`, which was wrong twice over: `unemployed` pays no
wage at all AND is `grim: true`, so a qualified pupil was being dropped BELOW the
uneducated child the workhouse catches. `child_hunger` keeps the workhouse and
keeps it for the people it is for — children ruined during BASIC school, who have
no credential to fall back on. Every pupil in these two decks has one.

**NO MONEY CHANGES HANDS ON EITHER SWIPE.** Both once paid finances, because both
once landed in a wageless status. The wage of the job you are falling into pays now
(`shophand +12`, `clerk +16`), so the whole card is **pride against safety**: the
streets buy `spirit ++`, home costs `happiness −−`, and that is the entire face of
it. The shelter is not paid out on the card at all — **it is the ABSENCE of the
streets' drift.** The family keep drains money a wage replaces; the streets drain
health and happiness, five a year, that nothing does. The asymmetry is carried by
the statuses, where a player reads it, not by numbers on the face.

## Do not balance to the sim's taste

**A `health −` on the streets and a `health +` on home were briefly added for one
reason: to change which swipe the scorer picked.** That is not a reason, and the
rule is worth stating plainly because it is an easy and seductive mistake.

The sims are a **measuring instrument, not a player whose preferences matter.**
They score one year ahead, so anything whose cost or benefit is structural and
deferred — a housing drift, a credential, a deck that opens — is invisible to them
by construction. Tuning a card face until the scorer picks "correctly" does not
balance the card; it papers over the instrument's blind spot, and it pays for that
with numbers a human player will read as noise. If an option looks unattractive to
the sim and right to you, **the sim is what is wrong**, and the finding is about
the player model.

**What the sims CAN be trusted to answer is survivability**, which is a fact about
the game rather than a preference: *does this option leave you a life?* That is a
real question and it caught a real bug here. The first cut of the streets charged
`health −` on top of the `homeless` drift and paid only `spirit +`, against a home
that paid `finances ++` and kept a roof on you — better in every direction.
Measured, pupils who took the streets lived a median of **one** more year against
home's **eight**. That is the board school gate's fault wearing new clothes: an
option whose sibling beats it on every axis is not an option. Fixing it was right.
Going further, to make the scorer *prefer* home, was not.

**And measure it with a counterfactual, because uptake comparisons lie.** Comparing
"lives that chose the streets" against "lives that chose home" compares two
POPULATIONS — the scorer takes each in different circumstances — and made the
streets look as though they granted 39 further years against home's 24, which is
nonsense. `scripts/counter.ts` clones the state when the net fires and plays BOTH
swipes to the end under the same policy: same person, same year, same deck.

So the shipped card is the plain one — `spirit ++` against `happiness −−`, no
health on either side — and the streets are the harsher road because they leave you
homeless, which is punishment enough and legible without help.

Measured overall: **university deaths 26–30% → 6–8%**, and the funnel runs
**83% → 57% → 8%** of all lives across the three tiers.

**PASSING SCHOOL IS A TRIAL NOW, and it is the apprenticeship's trial in a
gown.** `eduStudy` rises only when you choose the work over the easier thing, each
schooling state stamps it back to 0 on entry so every tier is its own test, and
`edu_basicschool_leaver`'s "sit for the grammar school" reads it: **3 or you fail
the scholarship paper** and take the shop counter with a spirit and happiness
blow. `persBookish` earns 3 from the cards it already softened where everyone else
earns 2 — the bookish child is quicker, not excused — and that is the whole reason
to be bookish:

| | passes a bar of 2 | **of 3** | of 4 |
|---|---|---|---|
| determined plain pupil | 74% | **31%** | 23% |
| determined bookish pupil | 72% | **56%** | 26% |

Three things had to be true before a bar of 3 was fair, and none of them were:

1. **The school decks were not being dealt.** Measured, a grammar pupil saw any
   given grammar card in about 10% of lives. Every non-milestone school card is
   `weight: 3` now, which gives the deck 32% of the draw during board school and
   42–52% during grammar and university. While you are a pupil, school is your
   life.
2. **The exam only ran from 11.** Nine years of board school were delivering one
   study card to most pupils — the prize — so the study banked at the leaver piled
   up at exactly 2 and nowhere else (`0:26% 1:5% 2:48% 3:6% 4:13%`), and any bar
   above it failed four pupils in five for want of a card to earn it on. From 9 it
   is `0:22% 1:4% 2:43% 3:8% 4:20%`, which a bar of 3 can sit in.
3. **Only this step can carry a trial.** Grammar school lasts three years and
   delivers a measured **1.7** draws, university **1.1**. There is no room to bank
   anything there, and a bar you cannot reach is not a test, so going up to
   university stays gated on the MEANS — which is its own trial. If the spans are
   ever lengthened, the second gate becomes possible.

The option is deliberately NOT hidden when you are short, and the failing
outcome's chips are on the card face, so an idle pupil sees the exam is beyond him
before he swipes. Hiding it was tried on the university leaver and turned the card
into an announcement and a taunt. Failing costs more than never trying, exactly as
it does at the bench.

**WHAT GRAMMAR SCHOOL'S TUITION WAS COSTING** (`scripts/ambition.ts`, 2,500
lives per goal per setting, before and after moving its drift from spirit −5 /
finances −5 to spirit −10 — the same total toll, all of it on the spirit):

| goal | succeeded before → after | mean age before → after |
|---|---|---|
| Solicitor | 3.9% → **6.8%** | 38.2 → **46.4** |
| Consulting physician | 0.1% → 0.3% | 33.0 → **36.6** |
| Merchant (no grammar school on its route) | 7.2% → 6.8% | 53.7 → 52.8 |
| Three score years (control) | 1.4% → 2.0% | 34.4 → 35.2 |

The route depth says what happened: lives stalling *at* grammar school fell from
43% to 24%, and lives getting through it to the `grammar` credential rose from 21%
to 32%. The tuition was not making the path expensive, it was making it a trap —
you entered at about 14, with the least money you will ever have and no wage, and
then could not afford to finish. Greedy lifespan is unmoved (34.9 → 34.8), because
greedy never enters a schoolroom; the control row moving is noise at this n.

**THE GREEDY SIM CANNOT ANSWER A QUESTION ABOUT A PATH**, and
`scripts/ambition.ts` is the answer to that. Greedy play maximises the weakest
vital one year ahead, which makes it a stable yardstick for comparing two versions
of the content and useless for asking whether a CAREER is achievable: it declines
on principle anything that costs now and pays later. It sits in a schoolroom in
0.8% of lives, because a child labourer's wage beats a pupil's nothing every
single turn, and it scores 0% journeymen where a grafting player scores 17%. Every
career number taken from it is a number about it.

So give the player a ROUTE — an ordered list of statuses, with progress measured
as the furthest ever reached — plus `wants`, the counters that route is gated
behind, priced in points of your weakest vital. One dial, `ambition`, scales both,
because a player who wants the end more also works harder at what it is gated
behind. **Every goal is reported at two settings and they are read as a pair:** a
result that holds across them is about the game, one that moves is about the
player. "Three score years" carries no route, so it IS the greedy player, and sits
in the table as the control.

The dial bites hardest where a gate is tight, which is a feature. At a low setting
the median apprentice reaches the qualifying trial with `jobSkill` 2 and needs 3,
and almost nobody passes; at a high one the median is exactly 3 and most do. That
is the apprenticeship working as designed — a check on how hard you actually
tried — and it is why a goal whose two columns differ sharply is a goal worth
looking at rather than averaging.

**A LEVEL NEEDS A LADDER AND A VIEW.** `persSporty` and `persBookish` were 0..3
with every reader gated at `{ min: 3 }`, on the idea that a baby who leaned in
started at the cap and everyone else climbed to it. Nothing climbed: `persBookish`
had one writer that set it straight to 3, and `persSporty` had a second worth +1
which cannot reach 3 from 0 by any route in the game — over 6,000 lives it ended
on 0 or 1 and never on 3, and the football card's +1 failed to carry a life across
the gate **1,399 times out of 1,399**. Before writing a trait as a level, check
there is a stream of sources to climb it AND some way for the player to see where
they stand. Otherwise write a boolean: one card makes you it, that card wears a ★,
and the moment is legible, which is the whole of what a threshold was trying to
say.

**WHAT A DISPOSITION IS WORTH** (`scripts/disposition.ts`, 8,000 lives per arm,
greedy play with only the `baby_disposition` swipe forced). The card offers a
lasting trait plus a small bonus, or no trait and a large one — 10 points of
visible vitals against 60 — and it is a fair trade, which the card face cannot
show and the greedy sim cannot see:

| forced swipe | mean age | reached 40 | risky swipe taken | **maimed** |
|---|---|---|---|---|
| "Out to play" (sporty) | 34.8 | 27.6% | 5,164 | **0.4%** |
| "Nose in a book" (bookish) | 32.5 | 21.7% | 3,590 | 0.6% |
| "A bit of both" | 34.7 | 27.9% | 2,602 | **4.4%** |

`persSporty` is read by `child_accident` and `job_labour_machine`, both of which
deal `---` (−40 health) and are often fatal on a failed check. Passing turns each
from a maiming into a gain, so a sporty life takes the risky swipe **twice as
often** and is maimed **eleven times less**. It buys an option, not just safety.

`persBookish`'s four payoffs — the exam, the prize, the debate, the lecture hall,
up to 20 points each — all sit behind the schoolroom, and only ~0.8% of greedy
lives ever sit in one, because the sim takes the child-labourer wage at
`baby_schooling` every time. So the bookish arm measuring worst is a fact about
**the sim's career choice**, not about the trait or the card: a player who means
to go to school collects all of it. Same blindness that scores 0% journeymen where
a grafting player scores 17%. **Do not "rebalance" this card off these numbers.**

## 7c. The streets are a transit state

**You should not last long out there, and the reason should be that you GET OUT —
into renting, off the back of whatever job you hold.** Measured before this was
built, that was not what happened:

```
1500 greedy lives — 41% slept rough at least once, 676 spells
  DIED on the streets   538   80%
  -> renting             84   12%
  -> prison              52    8%
```

**Four in five homeless spells ended in a grave and one in eight in a room.** The
streets were short-lived for exactly the wrong reason.

**The cause was a door shut against the people standing at it.**
`home_homeless_room`, the only way into `renting`, wants **forty pounds saved** —
because a rented room drifts `finances −10` and a lump sum was the only way the
card could prove you would carry it. But the two statuses that actually fill the
streets are `unemployed` and `pickpocket`, and **neither has a wage to accumulate
with.** The one exit was gated on the one thing that population cannot get.

**`home_homeless_lodging`** is the second door: a room let week by week out of your
pay, no deposit. Its gate is not what you HAVE but what is coming IN —

```ts
conditions: { drift: { finances: { min: 10 } } }   // your wage covers the rent
```

**The two doors are deliberately different shapes, and that is the design: THE
WAGED ESCAPE ON INCOME, THE CRIMINAL ESCAPES ON A SCORE.** A pickpocket has no
drift at all and never satisfies the income gate; he gets out through
`home_homeless_room` instead, on forty pounds taken at once, which is exactly how
that life is supposed to work. Taking the lodging costs no finances at all,
deliberately — the rescue that put you there floors the vital at 1, and charging
even a `−` would kill the man the card was written to save.

Put a man on the pavement at 17 with the vitals a ruined pupil actually arrives
with (finances 1, happiness 16, health 26, spirit 65) and play him out:

```
  job held        got a roof  median yrs to it  died out there
  shophand              100%                 1              0%
  clerk                 100%                 1              0%
  labourer              100%                 1              0%
  pickpocket             56%                 3             44%
  unemployed             33%                 3             67%
```

**A man with a trade is off the street in a year, every time.**

**THE CRIMINAL'S ESCAPE IS REAL, AND THE PURSE WAS NEVER THE GATE.** Both
`job_criminal_job.left` and `job_criminal_score.left` pay `finances +++` = **+50**,
against a room that wants 40 — so a single crime clears the bar outright from a
purse the rescue floored at 1. Traced (`scripts/score.ts`):

```
800 pickpockets on the pavement at 17
  reached 40 on a score        85%   median 1 yr to it
  got a roof                   42%
  died out there               58%   of whom 342 HAD the money and died anyway
  the room card was dealt      316 times across all 800 lives
```

**342 of 464 deaths were men with the money in their pocket**, dying while they
waited for the card that would let them spend it. `home_homeless_room` sat at the
default `weight: 1` while the criminal deck's two earners were `weight: 3` apiece,
so the way out was dealt about once in twelve draws to men who live two or three.

Weighted to **3**, matching `home_homeless_lodging` — **the two doors out should be
equally findable.** Pickpocket escapes **39% → 56%**, deaths **61% → 44%**, men
dying with money **342 → 204**. Across all greedy lives, street deaths **80% →
75%** and escapes **12% → 18%**.

This is the third time in this document one rare card has been the whole
difficulty: `edu_university_stipend` (weight 1 against three weight-3s, a 10%
survival coin-flip at university), the lower-tier job one-shots that could not
deliver enough draws to promote, and now this. **When a deck has exactly one card
that resolves the situation it is about, check its weight before concluding
anything about the situation.**

The jobless still mostly die out there (33% roofed), which is the point — the
streets are meant to be survivable by WORK, of whatever kind, and no other way.

**WHY THE HEADLINE NUMBER BARELY MOVED, and why that is not a failure.** Rerunning
the greedy sim after this card shipped, escapes went 12% → 14% and deaths 80% →
78%. That is because **greedy never enrols**, so it never gets ruined out of school
and never produces a homeless man holding a trade — the population this card is
for. The path had to be started by hand (`scripts/roughsleep.ts`). A sim that
cannot reach a situation cannot measure it, and a flat headline from one is not
evidence of nothing happening.

**What the streets do to you is mostly done before you arrive.** Median vitals on
the day you hit the pavement: **finances 11, happiness 16, health 26**, spirit 65 —
against a `homeless` drift of `health −5, happiness −5`. Happiness finishes 222 of
542 street deaths and health another 133. The streets are lethal, but they are
chiefly receiving the already-broken.

### `Condition.drift` — a new engine primitive

```ts
drift?: Partial<Record<VitalKey, { min?: number; max?: number }>>;
```

Matches the per-turn drift the current statuses sum to, exactly as `vitals` matches
what you hold. **Where `vitals` asks what you HAVE, this asks what is coming IN** —
income, upkeep, a wasting illness — without the card needing to know which statuses
produce it. It reads `totalDrift`, the same sum the turn applies and the UI
previews, so a gate written against it cannot fall out of step with the number the
player is shown.

It is deliberately general rather than a job lookup: **a new job that pays satisfies
an income gate the day it is written, with no gate to go back and update.** The
alternative — an `any` list of every waged job — would rot on the next job added,
and `status: { job: { atLeast } }` cannot work because jobs have no `levels` and
never will, being several parallel ladders rather than one.

## 7d. The gang-master, and what a terminal deck is for

`job_gangmaster` was the last **day+loss stub** on a job anyone actually reaches —
two cards, the routine and the sack, held by 5.2% of lives for a measured nine
years apiece. Everything above it on the census is a terminal tier nobody gets to.

**A ceiling needs different cards from a rung.** Gang-master is the unskilled
CEILING: the best wage an unlettered man can reach (`finances +15`, `health −5`),
promoted into from `job_factory_promote`, with nothing above it. Every other job
deck trades your own body or spirit for wages, and that works because you are
climbing. Here there is nothing left to climb toward, so the cards are about **the
men under you** — you were one of them last year:

- `job_gangmaster_stand` — forty men at the hiring stand for twenty places. Take
  the strongest (`finances +`, `spirit −`) or split the day so everyone eats
  (`spirit +`, `finances −`, `socialWarmth +2`).
- `job_gangmaster_squeeze` — the contractor's bonus for finishing short-handed.
  Drive them through it (`finances ++`, `health −`, `spirit −−`) or tell him it
  cannot be done (`finances −`, `spirit +`).
- `job_gangmaster_old` — the man who taught you the work, too slow now. Carry him
  out of your own end, or let him go for a few shillings and `happiness −−`.

**`jobExperience` on every swipe, and it is NOT dead state on a terminal job.**
`unemployed` carries `keepExperience`, so a sacked gang-master takes his years into
whatever he finds next, where they still count toward a promotion. The kind swipes
pay `socialWarmth` through `incTraits` following `job_labour_mate` — a counter, so
no ★; those are for life events.

**Checked, and NOT tuned to.** The greedy player takes the kind swipe on `old`
98:7 and refuses the `squeeze` 100:14, because the cruel options carry `−−` spirit
and happiness costs that a survival scorer will not pay. Per §"do not balance to
the sim's taste" that is not a reason to change anything. The check that DOES
matter is dominance, and it passes: no swipe here is beaten by its sibling on every
axis. All three cards are dealt about 0.6 times per gang-master.

**One pre-existing smell, left alone deliberately.** `job_gangmaster_day` pays
`spirit +` for nothing on the right and `finances +` at `health −` on the left, so
the right is free upside — played 66:1. But that is the HOUSE PATTERN for every
`*_day` card in every job deck, not a gang-master fault, and changing it would
touch the whole job layer. Recorded, not fixed.

## 8. Cards: front and back

- **Front:** a prompt + 2–4 options mapped to swipe directions (left/right
  always; up/down optional). The player sees **only the labels** — never the
  numbers. By convention the **third option is always `up`**: a bottom label is
  easy to miss on a phone, where the thumb and the browser chrome sit over it, so
  every third choice in the game is authored as `up`. `down` remains supported
  (the UI renders all four) but no card uses it.
- **Back:** the **result** — outcome text + effects. An option carries an
  ordered list of **outcomes**; the engine picks the **first whose conditions
  match** (author the last one unconditional as the fallback). So the same swipe
  can read/behave differently by Trait/Status (e.g. the bully card's
  `skillMartialArts` branch).

**Effects** an outcome can carry: vital magnitudes, set/clear Status, add/remove
decks, and set/inc Traits. There is no out-of-band "end the run" effect: death is
ALWAYS a vital hitting 0 (checkGameOver), so it's uniformly caught by the rescue
nets. A hazard that should be dangerous deals the `"---"` **grievous blow** (−40)
to a vital — fatal only if that vital was already low, which then dies or is netted
like any other collapse.

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
- Otherwise a **random** eligible non-milestone card is drawn — a **weighted**
  random pick: a card's `Card.weight` (default 1) scales its share of the draw, so
  a few essential cards can surface often **without excluding the rest of the pool**
  (the middle ground between `priority`, which is exclusive, and a flat pool, which
  dilutes). Used for the criminal's *score* and *promote* cards: the pickpocket has
  no wage, so the scores **are** the income yet compete with ~15 other cards; at
  `weight: 3` they come up ~1 turn in 5 and the path is livable again
  (see `scripts/sim.ts`-style tuning). Weight biases only the final pick —
  eligibility, `chance`, milestones and priority decks all resolve first.
- **No card repeats twice in a row** (when alternatives exist). NOTE this rule
  filters by card **id** and ignores `weight`, so it can starve a small
  `priority` pool: with a deck of one heavy repeatable + two one-offs, the year
  after every repeat was *guaranteed* to be a one-off (nothing else was left),
  bypassing the weight entirely on alternate turns. The fix is a **duplicate
  card under a second id** sharing one options body and one set of strings —
  see the prison deck's two `prison_time` copies, which also doubles the
  repeatable's share against the one-offs.
- **Draw-and-discard:** a played card is consumed, unless it's **filler**
  (returns to the pool). `one_time` cards carry `copies` = max occurrences.
- **Fillers queue (`GameState.playedFillers`).** Returning to the pool is not the
  same as returning to the front of it. A played filler goes to a **discard pile**
  and stays out of the draw while any *unplayed* filler is still in the pool; only
  when the pile is all that is left does it shuffle back in — minus the filler
  dealt most recently, which would otherwise be free to come straight round again.
  A filler is recorded when it is **played**, beside `usedCards`, so a filler
  *forced* by a capped vital counts as played exactly like one dealt from the pool.
  The pile is scoped to the fillers *currently in* the pool, both for the "all
  seen" test and for the reshuffle: the childhood decks running dry must not also
  forget the working-life fillers you have not reached yet.
  **Why:** "no repeats twice in a row" only moved the repeat one card along, so a
  filler routinely came back with a single card between it and itself — the game
  reading as though it had run out of things to say. Measured over 4,000 greedy
  lives (`scripts/filler-repeats.ts`): a filler repeating within two turns fell
  **11.3% → 6.0%** of filler draws, and the mean gap between repeats went 8.0 →
  10.3 turns. The cost — the worry that so few fillers would make the reshuffle
  routine — did not materialise: it fires on **2.7% of draws, ~1 per life**, and
  **69% of lives never reach one**; the first averages age 37, i.e. late, when the
  decks genuinely have thinned. The repeats that remain cluster in the small
  `priority` pools (unemployed, homeless) where there is nothing else to draw, and
  on `home_family_moveout`, which is a `force` card and *meant* to be insistent.
  A filler high on that script's "still repeating soonest" list is a place to
  **write another filler**, not a bug in the rule.

Per-turn order: pick card → resolve outcome → apply effects (raw) → age +1 →
apply Status **drift** (raw) → **clamp all vitals once** → check game-over.
The single clamp is deliberate: the card's change and the turn's drift are summed
onto the raw value and clamped together, so a card gain isn't capped to 100 before
a negative drift eats it (otherwise a **force-at-max** spend — move out / buy a
house at a full purse — can never trigger, because housing drift always pulls
finances back below the cap the same turn), and symmetrically a mortal blow isn't
floored to 0 and then quietly undone by positive drift.

## 10. Decks & progression

- **baby** (ages 0–5): tutorial + build-up. **Impossible to lose** (positive
  effects only). Teaches the swipe directions, the vitals, and seeds Traits. Ends at
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
- **rel_bro** (BROTHER, Tom — unlocked by the baby-brother card): a story-driven
  arc, not repeatable flavour. See the "Sibling story arc" spec in §18.
- **sibling** (SISTER placeholder — unlocked by the baby-sister card): the old
  shared fillers, now sister-only; to be rebuilt as `rel_sis` with her own story.

**Deck-per-status:** occupation/education/housing choices pull in the matching
deck, so what you *are* determines what cards you *see*, and a status change
hands its decks over. First-time deck unlocks show a "new chapter"
announcement (the shared `childhood` deck and the `workhouse` carry one; the
rest are silent to avoid double interstitials).

**A JOB DECK MUST BE SIZED TO THE JOB'S LENGTH, AND MOSTLY IN ONE-SHOTS.**
`jobExperience` ticks on BOTH swipes of any work card — it is years served, not a
reward — so a promotion gated at 3 asks only that the deck be dealt three times.
It was not being dealt. Measured over 4,000 lives, per year spent in the job:

| job | deck cards | pool | deck's share | dealt/yr | **held back/yr** | **exp/yr** |
|---|---|---|---|---|---|---|
| labourer | 8 | 19.4 | 22% | 0.15 | **0.96** | 0.11 |
| factory | 3 | 15.4 | 12% | 0.09 | 0.60 | **0.03** |
| shophand | 3 | 16.1 | 13% | 0.09 | 0.74 | 0.04 |
| **apprentice** | 7 | **5.2** | **91%** | **0.74** | 0.09 | **0.50** |

A factory hand worked **ten years and banked 0.4 experience** against a gate of 3.
Three causes compound, and the third is the one that is easy to miss:

1. **Too few cards** — one work card for a ten-year job.
2. **Pool dilution** — the deck is a tenth of a fifteen-card pool, where the
   apprenticeship is 91% of five (it suspends housing, so `home_family` is gone).
3. **The filler discard pile** — every `_day` card was a `filler`, so once played
   it is held out while ANY unplayed filler sits in the pool. A labourer had
   **0.96 of his own cards held back every year**, of a deck of eight.

That third is why the fix is ONE-SHOTS rather than more fillers: `one_time` cards
are not subject to the pile at all. It is exactly why the apprentice deck works.
Three weighted one-shots went into `job_factory`, `job_shop`, `job_clerk` and
`job_journeyman`:

| | mean exp | reached exp≥3 | **promoted** |
|---|---|---|---|
| factory | 0.4 → **1.9** | 0% → **40%** | 0% → **19%** |
| shophand | 1.0 → **2.6** | 7% → **65%** | 4% → **37%** |

**Then the entry rung, which is where it actually pays.** `job_labour` got the
same three one-shots — and a BUG came out from under them. Coming of age is
documented as "a rename, not a promotion", but the engine wipes `jobExperience`
on any job change without `keepExperience`, and only `unemployed` had it. Measured
over 359 transitions, a boy arrived at eighteen with **1.25 years served before
the rename and 0.00 after**, every time, and then needed three more for a
promotion he had already earned twice over. `labourer` carries `keepExperience`
now.

| | mean exp | reached exp≥3 | promoted |
|---|---|---|---|
| child_labourer | 1.5 → **2.5** | 16% → **53%** | 66% → 72% |
| labourer | 1.0 → **3.1** | 11% → **61%** | 7% → **33%** |

Because labourers now promote, the factory goes from 437 spells in 6,000 lives to
**1,839** — the rung above fills up from below. And the chain finally moves:

| | before | after |
|---|---|---|
| lives that rise above the entry rung | 2,139 (27%) | **3,504 (44%)** |
| of those, ever housed / mean age | 69.7% / 39.4 | **77.7% / 40.9** |
| of those who don't, ever housed / mean age | 57.2% / 33.0 | 51.3% / 31.8 |
| **mean age, all lives** | 34.7 | **35.9** |
| **reached 60** | 2.1% | **4.7%** |

That is the "live past thirty" item moving for the first time, and it moved
because of a promotion ladder, not because anything was made kinder.

**Childhood got deadlier, and the fix is a counter-weight.** Deaths under 18 went
**7.5% → 10.4%** when the deck got heavier, because `job_labour_machine` came up
with it. Dropping that one card to `weight: 1` takes it back to **8.8%** and costs
the ladder nothing — mean age 35.9 → 36.1, reaching 60 unchanged at 4.7% — because
it is a hazard, not a rung.

**Do not attribute a death to the last card held.** `job_labour_machine` killed 81
per 10,000 lives before the change and 81 after, which read as "not the culprit"
and was wrong. Surviving its `---` leaves a child weak enough for the fever or the
runaway cart to finish months later: `child_accident` rose from 195 to 249 with
nothing about that card changed. **A maiming card kills mostly under someone
else's name**, so the test of a hazard is the whole under-18 rate, not its own
tally.

The obvious alternative — no factory work under 14, since 33% of promotions were
going to children — was measured and rejected. It fixes the deaths (8.6%) and
hands back the entire prize: reaching 60 falls **4.7% → 2.2%**. Children reaching
the factory early is part of what drives the ladder.

`job_criminal` is deliberately untouched. Its 0% promotion rate looks like the
same supply problem, but a thief weighted to value the work still spent 31 years
as a burglar across 5,000 lives against 30 for an indifferent one — and weighting
experience changes his earlier choices too (3,594 thieves down to 1,525), so the
test does not separate the deck from the sim. It needs a player model that is
about crime rather than about experience.

## 11. Mortality & hazards

Childhood carries real, **earned** risk — never a pure random rug-pull. A hazard
appears at random, but **survival depends on prior preparation**:
- **Fever** → survive if `skillVaccinated`, or you can afford a doctor; else the
  `"---"` grievous blow (−40 health) — fatal only if your health was already low.
- **Runaway cart** → clean escape if `persSporty` (the leap); else the grievous
  blow. The "throw yourself aside" dodge is a smaller `"--"` hit from a lower floor.
- **Factory loom** (workers only) → clean if `persSporty`; refusing is safe but
  costs pay; else the grievous blow.

The blow simply drops health, so the "am I hardy enough?" check *is* the size of the
hit vs. your current health — no separate health-threshold branch needed. And
because the fail is a vital hitting 0, the **childhood charity-hospital net catches
it** just like an ill-health collapse: a child taken
by the fever, run over, or caught in the loom is carried to the ward (survives once,
owes the debt), while past 13 — the net gone — the same blow is fatal.

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
ward mends you further (health `++`), and you **always incur `flawOwesCharity`** (you
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

**A SAFETY NET MUST NOT KILL YOU.** `RESCUE_FLOOR` is 1 — destitute but alive —
and the net hands you its card on the NEXT turn, which drifts like any other. So
every point of drain still on you is charged against a bar holding 1, and if
anything survives the card's own status change you die answering the net, with the
net already spent. Reported from play: a child of eleven with a dog
(`finances: -3`) caught by `child_hunger`, which moves you out of the family home
but not away from the animal. 1 − 3, and no second net. Both swipes showed the
skull and both were fatal.

`chooseDirection` now floors the rescued vital AGAIN after the year's drift, so
answering a net cannot kill you by the thing it caught. That is one year of grace
— the year you spend answering — which is the whole of what a net promises: not
that you will live, but that you get a turn to act. The card is one-shot, so it
cannot repeat.

Measured over 8,000 lives of a player who keeps a pet: deaths caused by the net
that caught you go **19 → 0**, every one of the nineteen having had an animal to
feed. And the grace is a real chance rather than a stay of execution — of the
lives `child_hunger` catches, the median lives **6** more years, 68% live five or
more, and **none** die within a year (with a pet: median 5, half live five or
more).

The card face had to learn the same rule in the same breath. `vitalChips` projects
the coming year's drift to decide on ☠, so it went on promising death over a swipe
you now survive — the same lie the other way up. It exempts the vital a card is
the net FOR.

## 12. End of run

The run ends when any Vital hits 0 (a hazard's mortal blow drops one there like
anything else) and no rescue net catches it. The end screen names the ending
(by the vital that gave out) and shows a short recap.

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

**THE RUN REPORT (`copy run` / `save .txt`, in the debug panel).** The whole run
as plain text, for pasting into a conversation: build SHA and timestamp, then
every card with the four vitals as they stood, the choice taken, and a change line
whenever a status, a non-clock trait or a deck moved. Then `NOW` — age, vitals,
every status, every non-default trait, the active decks and the memorable-events
log — and `POOL`, the live / held / gated cards by name.

The pool is the half of the state nothing else can tell you. Statuses and traits
say where a life IS; the pool says what the game can still deal it, and the gap
between those two is where the traps live. A life stuck on the streets reads
perfectly healthily in the lines above and has one card left to draw. Which doors
are SHUT is the diagnosis, so the gated ones are named rather than counted.

## 13. Save / resume / reset

**Seeds and replay.** Every random thing in the engine comes from one seeded
generator (`state.rng`, mulberry32); `Math.random` is used once, to choose a
starting seed. So a life is fully determined by **its starting seed plus the
swipes taken**. `rng` overwrites itself on every draw, so the starting seed is
kept separately as `GameState.seed` (save v4).

- **The engine takes any seed.** `initGame(content, seed?)` uses a supplied seed
  exactly as given and draws a full 32-bit one when none is passed. The headless
  sims pass none, which matters: a small seed range in the engine would quietly
  cap every measurement at that many distinct lives.
- **The app narrows it for people.** A played life gets a seed from 1–999
  (`UI_SEED_MAX` in `src/ui/app.ts`, the one number to widen later), shown in the
  footer beside the build and in the run report's first line.
- **Replay:** the debug panel's Seed section is pre-filled with the current life's
  seed; "New life with this seed" (or Enter) starts again from it. Out-of-range
  input is refused and marked, never clamped into a different life. Keys typed in
  the box go to the box, not to the swipe handler.
- **What replay does and does not promise.** Same seed + same swipes + same build
  = the same life, card for card (checked for all 999 seeds). After a content
  change the deals diverge from the first draw whose pool differs — which is the
  point when checking a change, but means an old seed is not a fixed script.

Autosave to `localStorage` every turn; resume on load; a **Reset** control wipes
and restarts. A separate **Debug** toggle (persisted) unlocks the debug toolkit.
An **Easy** toggle (persisted, player-facing) previews each choice's vital
changes on the card — the vital symbols (£ ☺ ♥ ✦) and magnitude shown right
under each option's edge label, computed from the outcome that would actually
fire given the current state. Two extra markers:
- A **☠** marks a choice that can end the run. The check **projects the whole
  year** by simulating the choice on a throwaway clone — the card's change (if
  any) *plus* the turn's passive drift — onto every vital, so it warns of death
  from the *drain* too, even on a vital the card doesn't touch (e.g. a card that
  ignores health while workhouse drift is about to zero it). Crucially the drift
  is the drift of the status you'd be **in after the choice**: a card that moves
  you to a harsher status (homeless, workhouse, a pricier lifestyle) previews
  *that* status's drains, not your current ones. It shows on whichever vital
  would hit 0. A **skull inside a shield** is shown instead when a **one-shot
  safety net would catch that 0** — the projection runs `findRescue` on the
  post-choice state (advanced one turn, so age-gated nets like the charity
  hospital's `ageMax` resolve correctly), so you can tell "real death" from
  "you'd be floored but survive, this once". The shield is **steel** (`--steel`)
  and the skull inside it **red** — all one colour it read as a single blob of
  alarm, where the whole point is that something is standing between you and the
  skull. Both parts are coloured from the stylesheet rather than by SVG
  attributes, since a presentation attribute cannot hold a `var()` and both must
  follow the theme. That mark is **drawn** (an inline SVG, `RESCUE_ICON`) rather
  than set as an emoji: 🛡 and ☠ render differently on
  every platform and cannot be composed — stacked, two emoji clash in colour and
  weight — and the eye sockets must be *holes*, punched with `fill-rule="evenodd"`
  so the card shows through, or they are wrong in one of the two themes.
  Crossbones were drawn and dropped: below ~20px they merge into the skull, and
  this mark is drawn at 13.
- A gold **★** marks a **beneficial path change beyond the numbers** — a new
  job/home/education (`setStatus`), a **boon trait** (`setTraits` — skillVaccinated,
  sporty, a uni fund…), or a life-stage deck swap — so a rewarding option (seize
  the apprenticeship; buy the house; get vaccinated) doesn't look weaker than a
  plain sibling that only moves a stat. The star reads as *good*, so a trait that
  is a **burden** is set via **`setFlaws`** instead of `setTraits` (mechanically
  identical, but flagged bad): `setFlaws` never earns the star, **and suppresses
  it** even when the same outcome also changes status (so selling up → renting, or
  the charity-hospital debt, don't star). Incremental ticks (experience, +1
  sporty) don't qualify either, keeping the star rare.
- A red **⚠** is its opposite, and fires on either of two things: a **lasting
  burden** (`setFlaws` — the charity-hospital ledger, the sold-up disgrace, a
  warrant, a sweet tooth), or a **fall into a setback status**
  (`StatusStateDef.grim` — unemployed, pauper, convict, the workhouse, the
  street, gaol). Suppressing the star was not enough on its own: a burden then
  showed *nothing*, so the charity hospital's "health ++, spirit +" read as a
  clean gift when it was also writing your name in a ledger that falls due in
  young adulthood — and a sacking, being a bare `setStatus` like any promotion,
  wore the reward star. The two marks are mutually exclusive and the burden
  wins, because the mark is the part you would otherwise miss.
  - `grim` is **declared by content, not ranked by the UI**: only the content
    knows that `unemployed` is a fall and `apprentice` is a start. The engine
    never reads it — it is purely a display fact.
  - It marks a **fall**, not any move between bad places: a grim target only
    counts when the status you are LEAVING wasn't itself grim. So being sacked,
    evicted or gaoled warns, while being released from gaol onto the street,
    running from the workhouse, or taking the workhouse over the street does
    not — you were already there, and the warning would be telling you
    something you cannot act on. *(This replaces the parked "telling a
    downgrade from an upgrade needs status rankings" item: one boolean per
    state turned out to be all the UI needed.)*

## Opening flow (`src/ui/intro.ts`)

The cards you see **before a life starts**. They look like game cards — same
face, same swipe, same flip — but the engine never sees them: they draw from no
deck, cost no year and move no vital. That is why they live in `src/ui` and not
`src/content`; a deck of them would have to be excluded from every draw pool,
every milestone check and every stat script, and would buy nothing for it.

What opens, in order of precedence:

1. **First run** (`cardsoflife.intro` unset) — four cards, once ever, each with
   one job. A **title screen**; a card that **introduces the vital bars**, which
   arrive with it; a card you *practise the swipe on* (all three directions work,
   each naming back what you did, and the third is on `up` because that is where
   every third option in the game sits and it is the one players miss); then the
   easy/hard fork, which sets the same flag the HARD button does. The flow has
   just explained being born, so it has to END at the birth card: `fresh` on the
   title card's button **starts the new life at the moment you ask for one**,
   not when the flow finishes. Both matter. Without `fresh` at all the flow
   exits by resuming whatever was saved, dropping a first-time player into a life
   already under way; with it only at the end, every card in between describes
   the life being replaced — the vitals card tutors you on a stranger's bars.
   Neither shows on a true first run, where there is nothing saved to leak; both
   showed on the debug replay, which is the only place the flow meets a life in
   progress. What the bars
   ARE comes before what to do about them, so the gesture card is the last thing
   before play and the lesson nearest the first real choice.
2. **Every later opening** — the SAME title card, carrying a menu: **Continue**
   (dropped when there is no life saved), **New life** (which clears the save and
   its rewind history, exactly as RESET does), and **About**. Either of the first
   two goes straight to play; the first-time flow is shown once ever and never
   again. So the game always opens on its own title, and what differs between a
   first run and a thousandth is only what you can do from there.
3. **About** — credits, the version, and a short "still to come" list drawn from
   the top of this backlog. Reached from the title card and returning to it, via
   the same `goto` that moves the flow forwards.

A **finished** life still goes straight to its end screen — there is nothing to
continue, and the epilogue is worth more than a menu.

Mechanics worth knowing:

- The first-run flag is latched when the flow **finishes**, not when it starts,
  so closing the tab half-way through shows it again next time. It is not part
  of the save: wiping a life must not re-run the tutorial.
- An option with no `result` acts at once with no flip, which is what a menu
  wants; the tutorial card keeps its results precisely *because* the flip is one
  of the things it is teaching.
- The easy/hard card's "you can change this later" note is on the **prompt**,
  not the results: it is true of either answer, and it is worth knowing *before*
  you choose rather than after. While that card is up, the HARD button pulses
  (`IntroCard.highlight`), so the control the prompt names is one you can see.
- Choosing to see the costs shows a **worked example** of the preview on the
  result — two mock choices' worth of chips, built by running invented options
  through `vitalChips`, the very code the card faces use, so "this is what you
  will see" cannot drift from what you will actually see — followed by a
  **legend for the four marks that are not a plus or a minus** (★ ⚠ ☠ and the
  shield), each with a line saying what it means. Those are the ones that need
  saying: nothing about a ★ tells you what it is the first time you meet one.
  All four are defined once as `MARK_*` constants shared by `vitalChips` and the
  legend, for the same reason the chips are generated rather than mocked up. The
  legend is only ever shown on the easy answer, because hard mode draws no chips
  at all and a legend for symbols you will never see is worse than none. It is rendered against
  a *comfortable* fabricated state: against the real starting vitals a sample
  "health −−" is fatal and the preview — rightly — draws a death's head on it,
  which is true of the live state but wrong as an example.
- **The status coach.** The status chips first appear on the first GAME card of
  a first run — they are hidden through the whole opening flow — so that card
  carries one extra line saying what they are, and the chips pulse while it is
  up. It rides on the birth card rather than taking a shell card of its own,
  because the chips are only there to be pointed at once play has started. Set
  as the first-run flow latches, spent the moment that card is answered: once in
  a life, never on a later run. The card gives up its bottom gutter while the
  coach is on it (`.front.coached`), which is what keeps the pair on a short
  phone.
- The vitals card carries **no choice at all**: a tap anywhere moves on. That is
  precisely what a **result face** already is — something to look at, dismissed
  by tapping — so it reuses that state rather than growing a second one that
  merely looks the same: `armAdvance` for the tap and the pointer cursor, the
  `"back"` phase for the keyboard dismiss, the same `.tap-cue`, and `advance`
  handing back to `resolveIntro` because `introPending` is set. It has to be a
  tap and not a swipe, since the swipe is taught on the card *after* it.
- The title card has **no swipe choices at all** — a `button` instead of
  `options`, and no drag attached. The swipe has not been taught yet at that
  point, so offering swipe choices there would want a gesture nobody has been
  shown; and a card that tilts toward an answer it will not take is a promise
  broken on the very first screen. Its `title` is rendered as a real heading
  rather than as the first line of the prompt, so the game's name can be the
  biggest thing on the screen, with the prompt beneath it as a one-line hook.
- **Chrome is per card** (`IntroCard.chrome`), not per flow. `"none"` is bare —
  no age, no status chips, no vital bars — and covers both the title card and
  the gesture card; `"bars"` brings the four bars in on the card that explains
  them; `"full"` is everything, which the resume card wants, because the age and
  bars of the life you left are exactly what you need in order to decide. The
  age and chips stay hidden throughout the first run: they describe a life that
  hasn't started.
- The bars' **arrival is animated** rather than cut in: they drop in one after
  another and each fill pulses once just after it lands (`.vitals-reveal`),
  so the eye is on them exactly as the card names them. It opens with **about a
  second of stillness** — movement at the top of the screen pulls the eye off
  the words you are meant to be reading, so the card gets read first and the
  bars arrive into an audience. The three timings are named custom properties
  (`--reveal-lead`, `--reveal-in`, `--reveal-step`) rather than a column of
  magic delays, so the feel can be tuned from one place. It is restarted by hand
  (remove class, force reflow, re-add) because the same element is reused and an
  already-present class replays nothing, and it is skipped under
  `prefers-reduced-motion`.
- Intro prompts carry far more text than any game prompt (the longest of those is
  ~160 characters), so they get their own smaller type scale, and a shell card
  with no `down` option reclaims the gutter that would clear one. Giving the
  gesture and the vitals a card each, rather than one card explaining both, also
  halved the longest of them: **every** shell card now fits in both languages at
  every size tested, 360×640 included — which no earlier draft managed.
- The birth card no longer says "swipe to choose": the tutorial has just taught
  that, and a player who skipped it said they already knew.
- `attachDrag` takes `(has, pick)` callbacks rather than a `Card`, which is what
  lets the flow reuse the real swipe, tilt, tap-region and flip behaviour instead
  of a second copy of it.
- **Debug: the INTRO button** (top-left, visible only with the debug panel on)
  forgets the flag and replays the flow immediately.

**Status reveal timing:** when a choice both changes a status and unlocks a new
titled deck (a "new chapter"), the visible **status-chip** change is **held until
the chapter card appears**, so the two land together instead of the chips moving a
beat early on the result reveal. The chips render from a lagging *display
snapshot* (of `statuses` + `activeDecks`) that the UI advances only at the chapter
card; the **vital bars still move immediately** on the result. As a bonus, the
core Job/Housing/Education chips (first shown at coming-of-school) and the
lifestyle chip (at coming-of-age) now *appear* alongside their chapter card. A
status change with **no** chapter card (e.g. a lifestyle up/down) updates
immediately — there's nothing to sync it to (until lifestyle gets its own decks).

A **language** toggle switches English/Italian live.

## 14. Tech & architecture

- **Static client-side web app** — TypeScript + **Vite**, deployed to **GitHub
  Pages** by a GitHub Action on every push. No server.
- **Hard engine/content split.** Engine = draw model, condition/effect/trait
  evaluation, Vitals/Statuses/drift, result resolution, save/load, rendering,
  input. Content = decks & cards as **typed data** (`satisfies Content`), so a
  misspelled trait/stat/magnitude is a **compile error**.
- **Content file layout.** `src/content/index.ts` holds only the `start` state,
  the `statuses` blocks (job / housing / education / lifestyle), and the final
  assembly. The decks themselves are **domain-grouped**, one file per area under
  `src/content/decks/`: `baby`, `childhood`, `adult`, `home`, `education`,
  `jobs`, `sibling` — each exporting a `<domain>Decks` array typed
  `satisfies Deck[]`. A barrel (`decks/index.ts`) re-exports them and
  `index.ts` spreads them into the `decks` array. Player text is **not** split
  out — every string stays central in `src/i18n`, so `StringId` type-safety and
  the single translation table are preserved unchanged.
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

**ASK BEFORE ANYTHING SWEEPING.** Deck `priority`, deck or card
`neverSuppressed`, a card's `kind` (filler / one_time / milestone) — these change
how whole swathes of the game compete for the draw, and they are the owner's call,
not a detail to be inferred from a measurement. Narrow the fix to the case that is
actually broken and check before widening it: `neverSuppressed` went onto all
nineteen job decks when the pickpocket alone needed it, and the other eighteen
were worth 39 escapes in 6,000 lives. A measurement that says a broad change
*works* is not a reason to make it; the question is whether the narrow one would
have done.

- **Card ids:** `<deck>_<name>` (e.g. `baby_vaccine`, `child_bully`,
  `study_exams`). Ids are display keys only — nothing references a card by id —
  so they rename freely; **decks** are referenced by their own id.
- **No dominant options:** within a card, no option should be strictly better
  than another on every axis — trade a gain in one dimension for a cost/less in
  another. A future-positive trait means slightly less "now"; a future-liability
  trait (e.g. `persSweetTooth`) can ride a bigger boost now.
- **Childhood options touch 2–3 vitals** (never just one), forcing balance.
- **Baby is unloseable:** positive/neutral effects only.
- **Magnitudes only** for player-facing vital moves (`+`/`++`/`-`/`--`).
- **`remember` for the epitaph:** when an outcome marks a *memorable, transient*
  life event (a status change the final state won't reveal — the workhouse, running
  away, moving out, a promotion), add `remember: "log.<name>"` to its effects and a
  short past-tense `log.<name>` string (EN+IT). It's stamped with the card's age
  and shown on the end-of-run "milestones". Durable facts (final trade/home,
  vaccinated, sold up…) are read from end-state — don't `remember` those.
- **`tick` for time-based state:** a status STATE — or a whole DECK — may carry
  `tick: { <trait>: n }`, which increments that counter every turn it's active
  (drift's counterpart for traits). Status-tick ages a pet (`pet="cat"` ticks
  `petCatAge`, `pet="dog"` ticks `petDogAge`); deck-tick ages something tied to a
  deck's lifetime rather than a status — the `rel_bro` deck ticks `relBrotherAge`
  from the year Tom is born (the deck is added then and never removed), so his beats
  can fire at his age (the school-or-work crossroads at 5) instead of the player's.
  Both run every turn the state/deck is active, babyhood grace included. Reach for it
  whenever something needs to happen "so many years after X" — record the counter
  with `tick`, gate the payoff card on it.
- **`chance` for rare cards:** a card may carry `chance: 0..1` — even once its
  `conditions` hold, it only enters the draw pool on a fresh per-year roll. It sits
  at the very bottom of the draw order (milestones and `force` still jump ahead), so
  it only thins ordinary flavour. Pair it with `one_time` for a rare once-a-life
  surprise (the pet litters, `pet_cat_kittens`/`pet_dog_puppies`, gated to mid-life
  ages 4–7). The real rarity is `chance × (1 / pool size)` per eligible year, so it's
  much rarer than `chance` alone — `scripts/sim.ts` now reports draw-pool size by
  life stage (mean ~13–14 in child/adult) precisely so this can be tuned. The roll
  consumes RNG threaded through the draw, so a save resumes the same sequence; the
  debug draw-pile does NOT roll it (a chance card shows there whenever eligible).
## 16. Current scope (built)

Birth → babyhood (unloseable build-up, trait setups — incl. the `baby_disposition`
fork: sporty / bookish / neither) → **school-or-work** at 5 → childhood (shared
events + home / education / occupation decks + hazards, genuinely failable), with
two safety nets — the **workhouse** (finances) and the **charity hospital**
(health, children up to 13, on `flawOwesCharity` credit) → **coming-of-age at 18** (no longer
an ending; hands off into a young-adult life-event stage that continues with **no
cap**) → **adulthood at 25** → **old age at 50**, each a life-event stage of its
own. A **visible Age status** rides these transitions and applies the passive
**life-stage drift** (baby bonus → neutral young adult → a health decline that
starts at adulthood and steepens in old age — §6). Occupation ladders partly built: dangerous child labour with the **earned
apprenticeship** crossover (spirit/happiness, ages 13–18) onto the skilled trade
(`_day`/bench-job XP → survivable closure → the qualifying trial → journeyman).
The **trial is judged on a `jobSkill` trait**. The course is **5 one-shot bench
cards**; each ticks a year of `jobExperience` (time served) but only the *work-hard*
option also builds skill, and the trial passes on **skill ≥ 3** — so you must work
hard on 3 of the 5, and coasting leaves you unready. The **trial is a plain
(filler) card that unlocks at experience ≥ 3** and then sits in the draw pool — no
milestone forcing: because the bench cards are one-shots, the trial is simply
what's left to draw as they deplete, so it comes round on its own. An unready
apprentice can **beg for more time** (a 3rd option, shown only while bench cards
remain (experience < 5) and you're not up to standard (skill ≤ 2)) — a no-op
decline, so the trial just comes round again another year once you've done more
work. Leaving (sit the trial, or give up) changes your job and removes the deck, so
the trial only repeats if you beg. **Giving up the trade** is milder than a botched
trial. The `apprentice_end` misfortune (workshop closes) is also one-shot and
grants no experience/skill. `jobSkill` resets on each (re-)entry to the
apprenticeship. (Pacing: sharing the draw pool with life-event cards, and with the
trial no longer forced, the course runs long — a ~14-year median — with life
variety throughout; tightening it would mean making the deck `priority` or forcing
the trial again.)
factory step within unskilled; criminal entry. Housing ladder (family → move-out
→ renting) with health recovery; the apprenticeship borrows and returns your
housing. Sibling relationship deck. Choice previews (death-from-drift ☠, path
★). **Academic ladder now built**: free basic school → **grammar
school** (job=grammar_school, spirit −10 and no tuition — see §18) → **university** (job=university,
tuition −5, and the way is always *paid* for, in one of three ways: the family
fund covers it and is spent (`eduUniFund` → false), your own savings foot a heavy
tuition bill (finances −−), or — with neither — you go up as a **servitor**,
waiting at the wealthy men's tables for your fees (happiness −−, health −). That
last road exists because the option used to *hide* when you could not afford it,
which left the leaver card a single swipe under a prompt about the university
beckoning: an announcement, not a choice, and a taunt for the poor scholar it hit
most often. It is not
charity — the price is paid up front and the university's own drift follows),
earning the `basic`/`grammar`/`university` credentials — each of
which opens its **own distinct career ladder** (Commerce / Clerkly-Law / Medicine
— see §6), so the level of schooling changes *which* profession you enter, not
just how high you can climb. (Balance: reaching university is currently very rare
— the tuition drain vs the savings gate — see §18.) Full debug toolkit. Deployed and
playable on a phone.

## 17. Settled decisions (quick reference)

- **THE ENGINE IS GAME-AGNOSTIC.** `src/engine` knows about cards, decks, pools,
  statuses, traits and vitals. It knows nothing about Victorians, childhood,
  apprenticeships or marriage. If a rule needs the word "childhood" to explain
  itself, it belongs in `src/content` — as a number the content chooses, not a
  name the engine understands. (Caught adding a `"fromChildhood"` case to
  `StatusShow`: the same thing is said by `{ ageMin: 5 }`, and the 5 is content's
  to know.) This is why `StatusDef.show` is required rather than defaulted — a
  default would be the engine holding a view about which statuses matter when.
- Four Vitals; any at 0 = game over; only Health's ending is "death".
- Victorian setting; childhood mortality, earned by preparation (~70% careful).
- Magnitude steps (`+`/`++`) with a single tunable point table.
- Engine/content split; typed content; TypeScript + Vite on GitHub Pages.
- Virtual-pool draw; milestone priority; filler; no immediate repeats, and no
  filler repeat at all while an unplayed one is left.
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
- **Nothing on this ladder is given for a birthday.** Coming of age turns a
  *child* labourer into a `labourer` — the same rung under an honest name — and
  no more. It used to hand out the **factory**, which made surviving to eighteen
  worth a better job than a grown man's work gets him from the unemployment deck,
  and let the factory's own earn-gate be skipped by simply living.
  Removing it exposed that the earn-gate had never worked. `job_labour_factory`
  is a `filler` at an experience gate, and measured over 4,000 greedy lives a
  labourer spends **11.3 years** on the rung while drawing only **2.8** cards from
  its deck (home, childhood and the siblings crowd the pool), so 72% peaked at one
  or two experience and **1.7%** ever reached the old gate of 4 — the card
  surfaced in **0.4%** of lives. *Every* factory hand in the game was made by the
  birthday. The whole deck now carries **`weight: 2`** and the gate is **3**.
- **"The card is too rare" is two different faults, and they take different
  levers.** Either you never reach the counter that unlocks it, or you reach it
  and are never dealt it. `scripts/climb.ts` splits them. For the mill it was
  overwhelmingly the second: **27.2%** of labourers reach experience 3, and of
  those only **22.9%** were ever offered the card — they stay on the rung about
  six more years after qualifying but draw their own deck just **1.5 times** in
  them. (Of the qualifiers who never saw it, half go off to an apprenticeship,
  which is the better exit anyway.) So the two weights do different jobs: the
  deck's `weight: 2` is what gets you to the gate (10.9% → 27.2% reach it), and
  `job_labour_factory`'s own **`weight: 6`** is what puts the card in front of you
  once you are there (22.9% → 42.9%). Together, **8.2%** of labour lives reach the
  mill against the **9.4%** the coming-of-age promotion used to hand out.
- **Weighting one card inside a deck is nearly free; weighting a whole deck is
  not.** A card's weight decides *which* card of the deck you draw, not how often
  the deck beats its neighbours — so it buys reachability without starting the
  arms race where every deck has to be weighted to keep its place. An
  eligibility-gated card is cheaper still, because it carries no weight at all
  until it qualifies: over the six years this one is live the labour deck's share
  of the draw goes from **24.2% to 28.7%**, and the moment the card is taken the
  window closes behind it. Reach for the card's weight first, and the deck's only
  when the counter itself is out of reach.
- **What weighting a deck actually buys, and what it does not.** Doubling every
  card in `job_labour` moves its share of a labourer's draws from **25% to 30%**,
  not the 48% the arithmetic suggests (5 of 21 weighted cards → 10 of 26): three
  of its five cards are `one_time` and are consumed in the first few years, so for
  most of the rung the deck is really **two** cards and extra weight mostly buys
  repeats of the same payday. The sibling beats barely move (1.1 → 1.0 per life),
  so the crowding cost is small — but so is the gain. Reaching the mill: **9.4%**
  of labour lives under the old birthday promotion, **0.5%** with it gone and
  nothing else changed, **4.3%** at weight ×2 and gate 3. The two dials, measured
  over 2,500 lives each: ×2/gate 2 → 14.1%, ×3/gate 3 → 7.7%, ×4/gate 3 → 10.9%,
  ×2/gate 4 → 0.7%. Gate 2 was rejected on flavour rather than on the number: it
  fires at a median age of **13**, and a promotion to the factory floor should not
  land on an early teenager. More cards would help the first half of the funnel,
  but the second half was the real fault — see the two items above.
  **The general lesson:** a card gated behind a counter that only its own deck
  ticks is only as reachable as that deck's share of the draw — and a deck that
  runs dry cannot be weighted back into relevance. Check a new gate against the
  deck's real draw rate, not against how many ticks it "should" take.
- **A declined filler does not really come back.** Turning the mill down is
  supposed to be reversible — it is a `filler`, so it returns to the pool — but
  measured over 3,000 lives it was offered a second time in **0 of the 182** lives
  that saw it at all. The filler discard pile is why: a played filler stays out
  while any *unplayed* filler remains in the pool, and the pool is drawn from the
  whole of a life, so a labour card that goes into the pile in childhood is still
  waiting there when the life ends. The rule is doing exactly what it was built
  for (no filler repeats while anything fresh is left) and the cost is invisible
  until you look: for a career card, filler and one-shot are the same thing in
  practice. Anything that must be *re-offerable* needs either its own escape from
  the pile or a second card id.
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
  own `jobExperience` gate, so paths pace differently. Because **unskilled has fewer
  rungs, its steps cost *more* experience** (child labour → factory is now
  `experience ≥ 4`, higher than the tier-1 steps on other paths) — a longer haul
  per rung so the low-ceiling path fills a life rather than topping out early.
- **The educated path paces itself by schooling** (attendance over years, age-
  driven) rather than experience, so it fits the ages automatically.
- **No skipping the grind — but you can resume a career.** The unemployed offer's
  "back to the mill" (factory) option is shown **only if you've *reached* the
  factory before** — a durable `jobReachedFactory` trait, set by the child-labour →
  factory promotion (not the live `jobExperience` counter, which resets on every job
  change, so a fired factory hand would otherwise read as green). So a green
  worker can't jump straight to a factory job (must grind child labour up to it),
  while a former factory hand who was sacked can pick their career back up without
  re-grinding. For the green worker the option is **hidden entirely** (per-option
  `if` — see below), not a dead/duplicate choice. Green illiterate at the offer
  therefore chooses child-labour (`left`) or hold out (`up`); the factory
  (`right`) only appears once earned.

> **Built.** The four paths are implemented and gated by the `education`
> credential (academic `illiterate→basic→grammar→university` ordered ladder +
> trade `journeyman`/`master` off-ladder credentials). Unskilled: child labour →
> factory → gang-master (ceiling). Skilled: earned apprenticeship (from the
> labour deck, gated on health/spirit) → **time-limited qualifying milestone**
> (experience ≥ 4; pass on health → journeyman job + credential, fail → back to
> unemployed) → journeyman → master. Criminal: pickpocket (no wage) → burglar
> (small wage) → fence. Educated: **three separate ladders, one per credential** —
> Commerce (basic): shop assistant → shopkeeper → merchant; Clerkly/Law (grammar):
> clerk → chief clerk → solicitor; Medicine (university): junior physician →
> physician → consulting physician (the highest pay in the game). Your credential
> decides which ladder you enter; you climb within it by experience.

**Coming of age ends child labour.** The age-18 milestone moves a `child_labourer`
onto the adult unskilled rung (`factory`) whatever their experience — the
experience-gated `job_labour_factory` card is the *early* route there, turning
eighteen is the other — so nobody is still a *child* labourer at 25. It lives on the milestone CARD as a conditional outcome gated on
`job = child_labourer`, so it can never overwrite a job you already climbed to
(a pupil, an apprentice, an early factory promotion) and it gets its own result
line. It also stamps `jobReachedFactory`, or a later spell of unemployment could
not offer the factory back.

**Criminal path plays differently — no wage, big scores (built, tier 1).** Unlike
the wage-drift paths, the criminal tier has **0 drift**: no passive income at all.
Money comes *only* from pulling **"score" cards** in the deck — each a big one-off
haul (finances `++`) at a cost to the spirit — and **only a score grants
experience** toward promotion. It is feast-or-famine: between scores you earn
nothing while the rent (housing drift) bleeds you, so you must keep taking jobs,
each one corroding the spirit and risking arrest. Backing off a score costs
nothing but a clear conscience. (The £ figures in the table above are the
*wage-equivalent* for balancing against the other paths; the criminal earns it in
lumps, not drift.) Each score now pays `+++` (+50) — a big enough lump that the
rare, random score cards actually cover the dry spells between them (a normal wage
is ~+12/turn, so a score ≈ 4 turns' pay). Applied to every score card across
pickpocket / burglar / fence. Score cards are `weight: 3` so they surface often
enough to live on despite the fat adult draw pool (see §9).

The spirit cost is the path's real killer — a committed criminal mostly dies of
**despair**, since crimes drain spirit and nothing on the path restores it. So
every score card carries a third swipe, **"Give up the life of crime"**: a big
spirit boost (`+++`) and back to honest unemployment, but it latches
`jobRenouncedCrime` — a **one-way door** that hides the Fagin offer forever, so
you can leave the life but can't dabble back into it.

**Crime, arrest & prison.** Every crime you pull (a score card's left swipe, and
joining the gang) ticks a **`jobCriminality`** counter — your accumulated heat —
and it scales with the TIER of the crime: pickpocket **+1**, burglar **+2**,
fence **+3**. Climbing the criminal ladder therefore builds heat two or three
times faster per job, so the big earners draw the long sentences. The arrest
results **name the term** ("sends you down for 5 years"): result strings are
rendered through `tf` with a small set of live state values (see `resultVars`),
so any result can interpolate `{braces}` — `{sentence}` is pre-formatted per
language so the singular reads "a single year", not "1 years". The
**arrest** cards — one per criminal tier (pickpocket "nicked", burglar "nicked",
fence "raid") — then offer the same two roads: *evade* ("bolt and run" / "bribe your
way out" / "bribe your way clear") keeps you in the trade at a heavier cost —
dropped loot and a battering, or a fortune in bribes — while *submit* ("come
quietly" / "take the sentence" / "take the fall") sends you to **gaol**: a new `housing: prison` + `job: convict` state
that also **strips your pet** and **suspends your lifestyle** (nobody keeps a
lavish household from a cell — it stows the tier and drops you to the neutral
`default`, restoring exactly what you had on release). The suspend/restore lives in
`changeStatus` (via `StatusStateDef.suspends`), not on the cards, so every route
in and out — sentence served or break-out — behaves identically. **`suspends` is a
general primitive, declared in content**: a state lists which other status KINDS
it overrides and what they collapse to (gaol: `suspends: { lifestyle: "default" }`).
The engine stashes what you had and hands it back on leaving, so it never has to
know a status VALUE — that keeps content rules out of `changeStatus`.
**A card must never set a status that the same effect's other status suspends.**
The stash is taken when the suspension fires, so an explicit set landing first
stashes the value the suspension was about to force, and leaving restores you
*into* the suspended state — permanently. `home_workhouse_apprentice` set
`housing: "apprentice"` beside `job: "apprentice"`, so taking the indenture out
of the workhouse left you living with your old master for the rest of your life,
journeyman or not. The fix is always to drop the explicit set and let `suspends`
do the work. `scripts/suspends-check.ts` finds any recurrence. Prison is a `priority` deck of three cards: **"do
your time"** (weight ×5) counts `jobCriminality` down a year at a time and, on the
last year, **releases you onto the streets** (homeless + unemployed, counter
cleared). Gaol also bleeds money slowly (−5: fines, nothing coming in), so "do your
time" carries a third swipe — **prison labour** — that only appears once you're
skint (finances ≤ 20) and pays `+` (+10) against that −5. Taking it nets +5 and
lifts you back over the gate, which hides the option again: the result is a soft
**floor** rather than an income, so inside — where you can't earn any other way —
your money oscillates in a low, non-lethal band instead of bleeding to 0 — so the more crimes you profited from, the longer the reckoning; a
one-shot **break-out** (frees you but latches `flawWanted`); and a one-shot **meet
your cellmate**. The `jobCriminality`-as-sentence loop means a prolific career ends in
a long stretch, while a small-timer serves a year or two.

Total time inside is tallied in **`flawYearsInGaol`**, ticked by the prison housing
state and by nothing else. The bookkeeping is self-balancing: the turn you are
ARRESTED ticks (`applyEffect` gaols you before `applyTick` runs) and the turn you
are RELEASED does not (it moves you out first), so the ticks total exactly the
years between. Serve an uninterrupted sentence and the tally equals the term the
judge named; lose a year to something else — the cellmate one-shot, a declined
break-out, an age milestone firing through — and it counts that too, which is the
point: it reports time SERVED, not the sentence. It accumulates across every
stretch and is read out in the closing epilogue. (Do not add an explicit +1 on the
release: that double-counts the arrest year and reported a 4-year stretch as 5.)

Backlog on the prison system: **`flawWanted`** now colours the epilogue, but is
still not used mechanically — it should make honest work harder to land and carry
a re-arrest risk. And **"meet your cellmate"** should open a dedicated **cellmate
relationship deck** (to be designed) rather than the one-off comfort it grants now.

### Houses — a `---` purchase behind a rising gate, then cheap upkeep

Buying a house reuses the proportional **`//` (keep ~⅓ of current Finances)** magnitude,
gated behind a **rising Finances threshold**. Each purchase is therefore a huge,
felt hit (≥50% of your money) but self-scaling (halving always leaves headroom;
you re-accumulate toward the next gate). The rising gate is the "have I made it
yet?" moment, and a bigger job is how you clear it. After purchase, only small
**upkeep** and a permanent **vital bonus**:

| House | Gate | Cost | Upkeep/yr | Gives |
|---|---|---|---|---|
| Renting *(BUILT)* | move out: Finances ≥ 50, age ≥ 14 | `---` | −10 (rent) | ♥ +5 |
| Small house *(BUILT)* | Finances ≥ 75 | `---` | **−10** *(= rent)* | ♥ +7, ✦ +3 |
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
`flawSoldUp`, differing in pride (sell cleanly, happiness− spirit− / cling on,
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

### Lifestyle — **BUILT** (unlocked at coming-of-age; the money↔happiness lever)

Lifestyle is the main **Happiness** source and the main **Money/Health** sink — the
treadmill's lever. Unlocked at `child_adult` (starts **frugal**), an ordered status
`frugal → modest → comfortable → lavish` with an ongoing per-year drift per tier.
Two cards move you between tiers (in the `lifestyle` deck): **live_better** (up one,
offered with spare cash ≥ 40 and while not lavish) and **life_economize** (down one,
offered when short ≤ 25) — so you adapt as income rises and falls; conditional
outcomes do the per-tier maths, gated with the new `atMost`/`atLeast` status match.

| Lifestyle | £/yr | ☺ | ♥ / ✦ |
|---|---|---|---|
| Frugal | 0 | **−4** (joyless) | — |
| Modest | −3 | +2 | — |
| Comfortable | −8 | +5 | ♥ −1 |
| Lavish | −15 | +9 | **♥ −8, ✦ −4** |

*(Re-based for this session's economy; heavier lavish vital hit so a hedonist can
genuinely burn out, not just go broke. **All values are actively being tuned** —
first sim shows frugal's ☺−4 driving a lot of happiness deaths, likely to soften.)*

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
  then out" rather than fatal. Serious crime could still be fatal — a heavy `"---"`
  grievous blow (gallows / transportation), caught only if a net applies.
- **Experience trait** — the per-job year counter that drives promotion.
- **Cross-run persistence** (own the house on a later run) — **explicitly out of
  scope for now**; the single-run loop closes without it. Possible future
  meta-progression, related to the legacy/inheritance backlog item.

## 18. Backlog (agreed future work)

- **MARRIAGE HAS NO CONTENT — deferred by the user, not forgotten.** Only
  `family: "single"` adds a deck (`fam_single`); `courting`, `married`, `parent`
  and `widowed` add none. Lilly is the ONLY road to marriage (`rel_lilly_courting`
  and `rel_lilly_propose` are the only setters), and `rel_lilly_propose` sets
  `relLillyStoryDone: true`, which every card in `rel_lilly` requires to be false —
  so the deck stays active but empty after the wedding. Nothing in the game is
  about the marriage except `adult_family` and `adult_children`, and those reach it
  only because they were gated to `married`/`parent` after a playtest found them
  dealt to single men. `family: "parent"` is set by nothing at all.

  Proposed shape, NOT agreed: a married-life deck (either a new `fam_married`
  added by `married`, or a continuation of `rel_lilly` past the wedding), with
  `adult_family` and `adult_children` moved into it and `adult_children` becoming
  the card that sets `family: "parent"`; later a small `fam_parent` deck. Open
  questions for the user before building: (1) are children a CHOICE or something
  that simply arrives (a milestone after some years married)? (2) a new
  `fam_married` deck, or Lilly's deck continued? (3) first-cut size — roughly four
  cards was suggested.

Roughly in likely order. None of these are started.

- **RELATIONSHIPS: friends, lovers and the `family` status — agreed shape, PART
  BUILT.** A set of person-decks that can go two ways, and a household status that
  owns the rest of your life. Agreed in full; recorded here so it survives.

  **Built so far:** the `show` rule that lets a status hide until 18; the `family`
  status with all six states; `fam_single` with four warmth-earning cards and
  Lilly's intro; the warmth feeds on the common decks; **`rel_lilly`, the first
  person-deck**; `ya_courting` and `adult_wed` deleted. **Still to do:** the other
  person-decks, `fam_attached` and the affair intros, the cross-person deck, the
  `scandal` counter, and `family: "parent"` (nothing sets it — `adult_children`
  is still the old stub).

  **Why the feeds had to come first** (`scripts/social.ts`, 2,000 lives). With
  `fam_single` as its only source a life banked a **mean 2.2** warmth — and a
  player actively paying vitals for warmth banked **2.3**, which was the whole
  finding. The supply was limited not by what the player would spend but by **how
  rarely the cards were offered**: `fam_single` is 1.4 draws of a life's ~35. The
  sibling lesson again — a currency fed by one deck is only as reachable as that
  deck.

  **The feeds, and the rule they follow.** `incTraits` draws *nothing* on the card
  face, so warmth may never be the only reason to take a swipe: it rides an option
  that already reads as the open-handed one. The nursery (`persSociable`'s own
  card), the street football, the pew, the fair, the schoolroom desk, "pay fair and
  be liked" at the market, Fagin's gang, the public house, the friend at the door,
  the cellmate. Chosen off `scripts/drawn.ts` rather than by theme, so the feed
  follows the cards lives actually see.

  **What that buys, and what an intro should cost.** Three players, because any one
  of them would lie:

  | | mean warmth | median | p90 |
  |---|---|---|---|
  | **cold** (pays a step to avoid company) | 2.7 | 2 | 6 |
  | **greedy** (indifferent — warmth is invisible to it) | 6.6 | 6 | 12 |
  | **sociable** (pays a step for company) | 7.6 | 7 | 13 |

  So **price an intro at about 5**: a cold life affords nobody and dies alone as
  agreed, an ordinary life affords one, and a warm one affords two or three at the
  p90. The count is never capped — it falls out of this table. Lifespan is
  unmoved (mean 34.1), so the feeds are free.

  **`socialWarmth` is a CURRENCY, not a threshold.** Earned in small amounts from
  options on cards most lives already draw — a payday you stand a round on, a
  shift you cover, the fair, church, the tavern, plus one-shots in the school and
  work decks — and **spent** when you take someone up. Total earnable across a
  life is therefore the cap on how many people you can have: a warm, sociable
  life banks enough for three, a cold one for one. `persSociable` raises what each
  moment is worth, so it buys more people rather than a discount. **Nothing caps
  the count explicitly — the cap falls out of the economy.**

  **A `family` status** (`infant` → `single` → `courting` → `married` → `family`
  (married with children) → `widowed`), starting at `infant` exactly as `job`
  does, moved to `single` by the school/work choice. Each state carries its own
  drift and owns its deck, so marrying swaps your social life for your married
  life with no bespoke wiring — the pattern `job` and `housing` already use. A
  separate `children` count, so a widow with three at home reads differently from
  one alone. The status is **active from ~5 but not SHOWN until 18** (see the
  visibility item below).

  **Two shared decks.** `fam_single` is your unattached social life: a few generic
  social cards plus one **intro card per potential partner**, each eligible once
  you can afford it. `fam_attached` is added by all three attached states at once
  (the engine allows several states to add the same deck), and holds the affair
  intros — so an affair is structurally a different kind of relationship, open
  only to the spoken-for. A third shared deck, live whenever two or more people
  are, holds the cross-person cards: being seen, the forced choice between two
  named people, the scandal. With five people, pairwise cards inside each person's
  deck would be N²; a shared deck is one copy.

  **Per person: three counters, and the second one is the point.**
  `warmth` (how much THEY care — built by showing up and by choosing them over
  something), `ardour` (how hard YOU push it past friendship), and `distance`
  (the presence clock, as the siblings use it). Four outcomes from two axes:

  | | low ardour | high ardour |
  |---|---|---|
  | **high warmth** | a friend for life | the marriage |
  | **low warmth** | you drifted | **you pushed, and they didn't — and it is spoiled** |

  That bottom-right is the friend-zone as a RISK THE PLAYER TAKES rather than a
  state they are assigned: pushing costs you the friendship you had. Plus one
  **global** `scandal` counter, so being caught is known beyond the person you
  wronged and a new person starts warier. Cheating spends the wronged person's
  warmth; no separate "faith" axis is needed.

  **The intro card is "you made a friend", NOT "you started courting"** — so it
  carries no age gate at all and can fire in childhood. Best friends who become
  lovers is the arc the ardour axis exists for, and an age gate on the intro would
  block it. Only the DATING cards inside a person's deck are age-gated. The intro
  branches on your status when taken and records **where you met** —
  `job: studying` → a schoolroom desk, `university` → lectures, labourer/factory →
  the mill floor, else the street — in a per-person `met` trait, read later by the
  deck for flavour and by the epilogue. **That is also what makes it reachable**:
  measured over 6,000 greedy lives, only **0.8%** ever sit in a schoolroom and
  `edu_basicschool_friend` is drawn in **0.1%**, so hanging a door off school would
  hide the whole feature. The schoolroom becomes flavour on a door everyone has.

  **Sizing.** The draw pool is ~8.6 cards in young adulthood and ~12.6 in
  adulthood, so three live person-decks could be half of your twenties. Start with
  **`chance: 0.2`** on the person-deck cards (the existing per-year re-roll, so a
  miss is re-rolled next year rather than lost — unlike a window, which is what
  killed the sibling late beats) and tune from measurement. A wrapping-tick phase
  counter was considered and rejected as needing engine work for the same effect.

  **Settled details:** romance open to any pairing (the historical criminality is
  deliberately out of scope — wrong tone for this game); a gendered set of people,
  a couple of lads and a couple of lasses, which also sidesteps Italian's gender
  agreement far better than an ambiguous name would; **no consolation match** —
  `ya_courting` and `adult_wed` are deleted rather than absorbed, and an
  unsociable life dies alone; marriage does **not** close the other person-decks,
  which is what makes the ardour axis and the scandal counter matter.
- **RELATIONSHIPS, part two: what the first person-deck measured.** `rel_lilly` is
  built and is the template. Three players (`scripts/lilly.ts`, 3,000 lives each):

  | | met her | her warmth (median / p90) | said it | ended courting | married | lost her |
  |---|---|---|---|---|---|---|
  | **cold** | 8.3% | 10 / 20 | 0.4% | 0.0% | 0.0% | 0.6% |
  | **greedy** (indifferent) | 62.8% | 10 / 26 | 2.4% | 1.5% | 0.3% | 6.9% |
  | **devoted** | 68.1% | 16 / 40 | 6.2% | 4.0% | 1.4% | 4.2% |

  Her deck is 4.0–4.7% of a life's draws. Lifespan is unmoved (34.3). Reach looks
  high only because she is the **only** thing there is to spend warmth on; with
  five decks priced at 5 each, an ordinary life buys two of the five and each
  deck's own reach falls to roughly this number divided among them.

  Four things this cost, all of them general:

  **1. `focusPool` is the biggest single fact about any non-priority deck.** While
  a `priority` deck (unemployment, workhouse, gaol) has an eligible card, the pool
  is restricted to it, and a life spends a great many years there. Sparing
  `fam_single` and `rel_lilly` (as the sibling decks are spared) moved the intro
  from a median age of 23 to 16 and reach from 47% to 83% — and cost the escape
  routes their focus: reaching 60 fell 1.5% → 0.9%. **The call was that the
  suppression is correct** — a state you should be escaping owns the draw — so
  neither deck is spared, and the reach was bought back with `weight` instead.
  This is also why the sibling decks' late beats are so rarely read.

  **2. A card about a `priority` state is unreachable by construction unless you
  spare it.** The first version of Lilly's disappointment card was gated on
  `job: "unemployed"`, and so could never be dealt: being out of work is exactly
  when her deck is switched off. Two fixes, and it wants both.

  A COUNTER the status ticks (`jobYearsIdle`, as gaol ticks `flawYearsInGaol`),
  so the card judges a *spell* rather than a moment — which is what "unemployed
  for ages" meant in the first place, and lets the card land after the spell as
  well as during it.

  And **`neverSuppressed` on the CARD**, the card-sized version of the deck flag
  the siblings use. A deck spares all of itself, which is right when every beat
  is on a clock the draw cannot pause; it is wrong when a deck has one beat about
  the urgent state and the rest can wait. Measured (4,000 lives), sparing this one
  card took it from being drawn in 32.1% of lives that met her to **59.1%**, and
  from **0%** dealt while still out of work to **50%** — landing at a median age of
  28 rather than 31. At n=16,000 it costs the escape routes nothing measurable
  (reaching 60 is 1.4% either way), where sparing the two whole decks cost 1.5% →
  0.9%. **Prefer the card.**

  **3. Author a relationship clock with `incTraits`, never `setTraits`.** The
  card-face ★ fires on any `setTraits`/`addDecks`/`removeDecks`, so resetting a
  presence clock with `setTraits: { …Distance: 0 }` put a reward star on every
  swipe in the deck — including "tell her to mind her own business". The sibling
  decks' `incTraits: { …Distance: -6 }` earns no mark and reads better anyway: a
  visit buys you six years, it does not stop time. Likewise an outcome that ENDS
  a relationship latches its flags in `setFlaws`, not `setTraits`, so it wears ⚠
  rather than ★.

  **4. A status does not have to drift, and this one does not.** Each family state
  was first given its own drift, from the agreed shape. It was wrong twice over:
  married's happiness +8 would have been the largest single faucet in the game,
  opened in the middle of a drift table nobody has rebalanced — and a standing
  dividend for *courting* is a reason to sit still, which is the opposite of what
  a relationship deck wants. `education` is the precedent for the alternative: a
  status that is a record, owns decks and gates cards, and never touches the
  ledger. **The household's feelings belong on the cards**, paid once and tunable
  one at a time. Removing the drift moved marriage from 1.4% of devoted lives to
  2.1% and the proposal's acceptance from 33% to 40%, at no cost to lifespan. The
  whole drift table gets decided in one pass with the live-past-thirty work.

  **5. A card-face mark must be authored, not derived.** ★ and ⚠ were computed
  from which fields an outcome writes, and the fields say MECHANISM where the mark
  means MEANING. Any `setTraits` starred, so latching "her story is over" or
  winding a pet's age back to zero wore a reward mark; only a `grim` status
  burdened, so losing your cat — `pet` moving to `none`, a state nothing is wrong
  with, since every life starts there — wore a reward mark too. An outcome can now
  declare `mark: "none" | "special" | "burden"`, and the declaration wins.

  **The rule for when a mark is earned**, which the marked cards were then swept
  against:

  > A mark is for a life event, not for a number moving. **Booleans and named
  > states tend to be life events; counters tend not to be.** Sharper still, and
  > what the code half-implemented already: `setTraits` says *a thing you now
  > are* and can earn a mark, `incTraits` says *a number went up* and never does.
  >
  > And ★ is about MOMENTUM, not about whether the choice is wise. A new job is a
  > life event even when taking it is a mistake, so `job_unemployed_fagin`'s "join
  > the gang" keeps its star: it moves you out of unemployment and into an
  > occupation, and what it costs you arrives later, through `jobCriminality` and
  > the gaol cards, where the game can charge you for it properly. The mark is not
  > the game's opinion of you.

  Measured against every marked outcome (`persSporty`-style counters aside, all 32
  boolean writes and 6 enum writes are real life events and keep their star:
  vaccination, boxing, the nursery, the trust fund, settling the charity debt,
  both sibling crossroads, the reckonings, the fates, the estrangements, gender,
  and what Sarah becomes). **Only the pets were wrong**, and all ten are now
  authored: getting an animal is a life event (★ — the pet-shop cards, "take it
  in", and taking in a kitten after the old one dies), losing one is a bad event
  (⚠ — both passing cards' "let them rest" and both runaways, which lose the
  animal whichever way you swipe), and carrying the line on with one of the litter
  is neither (no mark — the chip still says Cat, and the star was firing on the
  age going back to zero).

  The one counter that kept its star under protest — `baby_disposition` writing
  `setTraits: { persSporty: 3 }`, a disposition rather than a tally — stopped being
  an exception when **the disposition counters became plain booleans**. They had
  been 0..3 with every reader gated at `{ min: 3 }`, on the idea that a baby who
  leaned in started at the cap and everyone else climbed to it. Nothing climbed.
  `persBookish` had one writer, which set it straight to 3. `persSporty` had a
  second worth +1, which cannot reach 3 from 0 by any route — measured over 6,000
  lives it ended on 0 or 1 and **never** on 3, and the football card's +1 failed to
  carry a life across the gate **1,399 times out of 1,399**.

  A level needs a stream of sources to climb and some way for the player to see
  where they stand on it, and there was neither. A boolean has one card that makes
  you it, and that card wears a ★ — which is the whole of what a threshold
  crossing was trying to say, said legibly. As booleans the football card is a real
  second route to being sporty rather than dead weight: `persSporty` goes from
  reaching its gate in **0%** of lives to being true in **24.4%**, and because it
  is read by the childhood accident and the loom, mean life goes **34.3 → 34.9**
  and reaching 40 **25.5% → 28.7%**. Unblocking dead content, not a balance tweak.

  `persBookish` is still false in ~100% of GREEDY lives, but that is the sim, not
  the card: its payoffs all sit behind the schoolroom and the sim never enters one.
  See "what a disposition is worth" in §7.

  **What is still thin, and why it is not a content fault.** Courting happens at a
  median age of **35** and marriage lands in 1.4% of devoted lives. The arc is
  four cards deep, the deck is off during priority years, and the life ends at 34.
  This is the live-past-thirty item below wearing a different hat; do not tune it
  out by inflating her weights.
- **THE ACADEMIC PATH IS A RETENTION PROBLEM, NOT AN INCOME ONE.** This item
  previously read "the academic path starves you out" and that was wrong twice
  over; both errors are worth keeping on the record.

  **First error: the money is there.** A dozen cards pay a child, often —
  `baby_grandma` (346 times in 600 lives), `child_charity_hospital`,
  `home_family_market/fair/pet/dog/chores/relative/sweets/scrump`,
  `child_martialarts`, `edu_basicschool_fund`. The diagnosis came from measuring
  the MEDIAN purse by age, which is flat at 20–25 — and a flat median is exactly
  what you get when every life spikes and decays. Measuring the PEAK instead:

  ```
   amb  thrift   reached grammar   PEAK by 13   kept to school   eaten by keep
    20       0               434           35               11              24
    20     200               386           40               15              20
    60       0               451           35               13              22
  ```

  **The median child earns their way to £35 and arrives at grammar school with
  £11. The family keep eats £24 of it** — two-thirds of everything earned, at −5 a
  year for nine years. Trying harder does not help: at thrift 200 the peak rises
  35 → 40 and arrival 11 → 15, because the drain scales with the YEARS, not with
  the effort. (A real playthrough confirmed it card for card: +25 earned at the
  errand round aged eight, £35 at nine, £10 by seventeen, no spending choice made.)

  **Second error: it was a measurement artefact all along.** Money in this game is
  a VITAL, and a vital cannot be saved — only spent down by drift. There is no
  container. `eduUniFund` is the only thing in the game that holds value across
  years, which is exactly why it is the strongest predictor of finishing school.

  **A money box** — an earnable asset the keep cannot drain, the working sibling
  of the uncle's fund — was proposed and **declined**: the intended answer to the
  academic path's costs is the inheritance meta (see the curve below), not a new
  childhood mechanic. Do not re-propose it without asking.

- **THE AUTHORED DIFFICULTY CURVE (decided, build to it).** Board school **easy**
  to complete, grammar school **medium**, university **very hard but NEVER
  impossible on a first run**. University is deliberately the top tier and is meant
  to be the INHERITANCE-RUN tier — a starting purse of ~50, or the uni fund granted
  at birth, is the intended way in, once that meta exists. **Its difficulty is not
  a defect and should not be tuned away.** What is a defect is dying in it.

  Measured against the curve on the current build:

  ```
  tier            entered   COMPLETED  left for work  thrown out  DIED IN IT
  board school        800         84%             0%         14%          2%
  grammar             566         80%             0%         19%          1%
  university          227         23%            16%         49%         11%
  ```

  ("thrown out" is the net firing — the workhouse or the streets for a child, the
  streets or home for a pupil. It is not a death; the life goes on.)

  **University is no longer lethal** — the ruin net took it from a quarter-to-a-third
  dying to 6–8%, at 18–22% completion. Very hard, never impossible: done.

  **THE CURVE IS NOT FLAT, AND THE TABLE ABOVE CANNOT TELL YOU WHETHER IT IS.**
  Per-tier completion is measured CONDITIONAL ON ENTRY, which throws the funnel
  away: the 562 who reach grammar are already a filtered population, so 80% of
  them passing is not the same difficulty as 84% of everybody. Measured as a share
  of ALL lives:

  ```
  tier            ever entered   COMPLETED   (share of all 800 lives)
  board school            100%         82%
  grammar                  69%         55%
  university               28%          6%
  ```

  **82% → 55% → 6%.** The ladder rises exactly as the curve asks. An earlier
  version of this section called it "flat where it should rise" and listed it as a
  gap; that was an artefact of conditioning on entry and is retracted. **When
  judging the curve, always read the cumulative column.**

- **NO ADULT FINANCES NET, outside the schoolroom.** `child_hunger` lives in
  `age_childhood`, and `findRescue` only considers cards in ACTIVE decks, so the
  moment you come of age the game's only general finances net leaves with your
  childhood — and 346 of 350 adult finance deaths never touched a net.

  **A blanket adult twin of `child_hunger` was proposed and DECLINED.** The pupil's
  case was carved out instead and is now built (`edu_grammar_ruin` /
  `edu_university_ruin`, above), which was the right call: it cut university deaths
  from 26–30% to 10–11% without giving every adult in the game a floor. The rest of
  adult life still has none, deliberately. Do not re-propose a general net without
  asking.
- **THE PICKPOCKET STILL CANNOT PROMOTE** (0% in 4,200 spells of nine years). His
  two work cards only tick experience if he COMMITS the crime, so a cautious thief
  serves no years at all. Whether that is the deck or the sim is genuinely open —
  see §11. It needs a player model built around crime, not around experience,
  before anything is changed.
- **THE DRIFT TABLE, decided in one pass.** Not just the family status (stripped
  to nothing above, deliberately) — the whole table. Drift is what kills you (the
  killing blow in 63.7% of deaths) and it is currently the sum of four
  independent authors: age, job, housing and lifestyle. Decide together what a
  year is supposed to cost and what it can pay, then reissue all of them. Blocked
  on, and blocking with, the item below.
- **LET A LIFE RUN PAST THIRTY. This is the blocking item for most of the
  written content.** A greedy life ends at ~35 and **2.3% reach 60**, and the
  decks are written for a whole life, so the back half of several of them is
  never read. Measured over 8,000 lives, of the lives that HAVE that sibling:

  | | brother | sister |
  |---|---|---|
  | cards in the deck | 13 | 14 |
  | **cards seen per life** | **2.94** | **3.61** |
  | the crossroads (a milestone) | 96.9% | 96.2% |
  | the mid-life reckoning | 14.7% | — |
  | the settled years | 2.8% | 4.1% |
  | **the finale** | **0.1%** | **0.3%** |

  **What is actually killing you is DRIFT, not cards** (`scripts/housing-ab.ts`,
  and 4,000 greedy lives): happiness accounts for **49.7%** of deaths at a median
  age of 33 and health for **46.0%** at 34 — 96% between them, against finances
  3.0% and spirit 1.3% — and **the killing blow was the year's passive drift in
  63.7%** of them, the card you had just answered in only 36%. The cards most
  often holding the knife are the ones that keep you in a draining status:
  `home_homeless_beg` 14.5%, `home_renting_eviction` 9.3%, `job_unemployed_pawn`
  6.4%. So the fix is not kinder cards: **happiness and health have no reliable
  sources to match their drains once childhood ends.** Housing is one such source,
  which is why it matters that only 6% of lives ever own a home.
  It is also **not the sim being a poor player**: a "settler" that takes any
  housing upgrade whose upkeep its wage can carry gains half a year (mean 34.1 →
  34.6, reaching 60 1.7% → 2.4%) and still owns a home in only 8.2% of lives.
  Wanting a house barely gets you one, because `home_buy_small` wants finances ≥ 75
  and costs a third of it.

  The sibling's clock stops at 25 (median), 37 at p90, because you die at 35.
  Every window above their 26 is content written for a part of life the game
  does not deliver — four of thirteen cards in Tom's deck, including the finale
  that the whole love × distance mechanic exists to pay off.
  **The fix is lifespan, not the windows.** Compressing the arcs into the life we
  currently give would fit the story to the bug: the arcs are the right shape for
  a life, and it is the life that is too short. Treat this as the prerequisite for
  the late-life decks, the love-interest arc's married years, and the epilogue's
  richer endings — all of them will hit the same wall.
  *(Two smaller findings from the same run, for whoever picks this up: the
  sibling stage-0 beats are seen only ~17–25% each, because they compete in the
  fattest part of the childhood pool; and the sister's whole school road —
  lessons, recital, audition — is reached by ~6% of sister-lives under
  self-interested play, since the crossroads is deliberately the expensive
  choice. Neither is a lifespan problem.)*

> **Current focus — finish the WORK-side content** (before more education work).
> Of the four big pieces: **house decks/purchase/owned statuses ✅ BUILT** and
> **lifestyle ✅ BUILT** (both actively being balanced). Remaining: **(1)** homeless
> deck & exits, **(2)** finish the work-path job decks (the day+loss stubs). Tagged
> **[work-side focus]** below.

- **Academic careers + education balance** — the grammar/university *school
  flows* are built (decks, tuition, the eduUniFund-or-savings gate, earning the
  credentials), and **(a) is now DONE:** each credential opens its own distinct
  ladder — Commerce (basic) / Clerkly-Law (grammar) / Medicine (university, top
  pay) — with per-credential entry (leaver / graduation / job-offer all route by
  credential), so a graduate no longer starts at shophand (see §6). **(b)
  attainability — likely a NON-ISSUE:** an old *steered* sim reached university
  only ~0.8%, but in real playtest you can get to and through university fairly
  consistently if you aim for it, so that sim was pessimistic/naive. Keep an eye on
  it, but no rebalance planned. Levers if it ever does need softening: tuition,
  income cards, the `finances ≥ 50` gate, `eduUniFund` frequency, a scholarship.
- **Adult economy (§17b)** — the whole post-childhood game: job ladders (4
  education levels; matched 3-tier manual/criminal/educated paths), houses as
  `---` purchases behind rising Finances gates, lifestyle tiers, and the
  ageing-drift + natural-death ending with a qualitative epitaph. Fully paper-
  designed; **deliberately deferred** so childhood content is written and
  balanced first. Starts with the **age-18 leaver branch** (choose first job /
  apprenticeship / further study).
- **Sarah — the sister arc (`rel_sis`)** — mirrors Tom's SHAPE (love + distance,
  beats in windows of her own life, a crossroads milestone, a weighted finale, an
  estrangement) but inverts his mechanics and temperament. Tom's second axis is
  `relBrotherGrit`, his backbone, which grows when you make him **stand alone**;
  hers is `relSisterPromise`, how far her gift has been nurtured, which only grows
  when you **step in and spend** — lessons, ribbon slippers, a day's lost pay to sit
  in the front row. He hardens by your absence, she rises by your presence.
  She WANTS the schoolroom, so her crossroads is deliberately not the even trade
  his is: the needle pays you a wage and costs you her (love −12). From there:
  **school** → lessons → recital → the audition, which reads `promise` (≥9) and
  decides between the stage (**ballerina**) and the back row (**chorus**); **work**
  → the sweatshop → the dressmaker, landing her a **seamstress**, skilled and
  steady with the dream folded away. Her outcome is recorded in `relSisterCalling`
  and named in the epilogue. The recital card is the one place the two axes are
  split by hand: paying for her costume but missing the night gives `promise`
  without pulling `distance` down.
- **Both-siblings cards** — four cards that exist only when you have Tom AND Sarah,
  two per deck, in two flavours. **Scarcity**: one purse, two children
  (`rel_sis_purse` at her age 10, `rel_bro_purse` at his 18 — deliberately at
  different moments so they do not read as one card twice); backing one moves the
  OTHER sibling's traits down, so the arcs genuinely interfere, and splitting it
  helps neither enough. **Loyalty**: they quarrel and whoever reaches you first
  gets a hearing (`rel_sis_quarrel`, `rel_bro_quarrel`); refusing to judge costs a
  little of both.
- **`job_criminal` IS `neverSuppressed`, and it is the only job deck that is.**
  `focusPool` is right when a priority state's own deck HOLDS the way out — the
  workhouse's exits, unemployment's job offers. It is wrong for the streets, whose
  only real exit (`home_homeless_room`) wants finances 40 and whose own cards
  cannot raise it. Measured over 6,000 lives, a homeless pickpocket saw **0.00** of
  his own job cards live in every one of 3,791 years, with four shut out — while
  this deck's own comment says pulling a job is the only way a criminal earns
  anything. He could not beg his way to forty and could not work, so he begged
  until he died.

  **The pickpocket is the only occupation with no wage** (his status carries no
  finances drift at all). Every other job pays passively, so a homeless labourer
  reaches forty on his wage alone without drawing a single job card: suppressing
  his deck on the streets costs him flavour, not the way out.

  | | before | **criminal spared** | all 19 job decks spared |
  |---|---|---|---|
  | pickpocket's own job cards live | 0.00 | **3.00** | 3.00 |
  | longest spell on the streets | 16 yrs | **9 yrs** | 10 yrs |
  | got off the streets | 291 | **495** | 534 |

  Sparing all nineteen was tried and bought **39 extra escapes in 6,000 lives** over
  sparing the one — nearly nothing, for a sweeping change to how every occupation
  competes in every priority state. Dropping `priority` from the streets instead
  was also measured and is worse in both directions (133 escapes, a 17-card pool):
  it does not free the criminal's cards, it just drowns the exit among everything
  else.

- **`neverSuppressed` — exemption from priority suppression, on a DECK or on a
  single CARD.** `Deck.neverSuppressed` spares all of a deck and is right when
  every one of its beats is on a clock the draw cannot pause: the sibling arcs are
  gated on SOMEONE ELSE'S age, so a stretch in gaol, the workhouse or unemployment
  does not delay a window, it closes one for good. `Card.neverSuppressed` spares
  one card and is right when a deck has a single beat ABOUT the urgent state and
  the rest can wait — `rel_lilly_idle`, which is Lilly's opinion of your being out
  of work and was therefore unreachable while you were out of work. **Reach for
  the card first**: it costs the escape routes one slot in the pool where the deck
  costs them the whole deck (measured, n=16,000: the card costs nothing you can
  see, sparing two decks took reaching 60 from 1.5% to 0.9%).
  Measured with `scripts/suppression-ab.ts` over 4000 greedy lives, off vs on:

  | | off | on |
  |---|---|---|
  | Tom's beats seen per life | 1.00 | **1.42** |
  | Tom's arc concluded | 5.8% | **8.4%** |
  | Sarah's beats seen per life | 1.27 | **1.48** |
  | Sarah's arc concluded | 16.2% | **18.8%** |
  | draws taken by a sibling card while urgent | 1.0% | **11.3%** |
  | mean pool size while urgent | 3.6 | 4.3 |
  | urgent years per life | 8.3 | **9.2** |

  So it works — half again as many of Tom's beats land — and it is **not free**:
  about one urgent year in nine now goes to a sibling card instead of an escape
  card, and a life spends ~11% more of itself in urgent states. The dilution is
  large in proportion because the urgent pool is tiny (3.6 cards), so one extra
  card is a sixth of it. Levers if that proves too much in play: weight the
  spared cards down while an urgent deck is up, or spare only cards whose window
  is actually about to close rather than the whole deck.
  *(The absolute arc-completion figures are low in both columns because a greedy
  life ends at ~41 and the finales are gated on the sibling reaching old age —
  read the beats-per-life row, not the conclusion row, as the signal.)*
- **A gate must not equal the supply that reliably reaches the player.** Sarah's
  audition read `relSisterPromise` ≥ **9**, and 9 was exactly the sum of the three
  promise cards a player actually draws: the crossroads (+2, in 100% of lives),
  the lessons (+4, 76%) and the recital (+3, 68%). So the stage demanded all three
  *and* a perfect answer on each, with no margin — and everything above that was
  draw luck, since the three little-girl cards carrying the rest of the promise
  are `one_time` and gated to her ages 0–4, and **53% of lives never see any of
  them**. Measured with `scripts/ballerina.ts` over 4,000 lives, a player taking
  the most-pleasing option on every card of her deck reached the stage **38.4%**
  of the time; our playtester did exactly that bar one cold swipe at the
  flagstones card, finished on 8, and lost the ending by a single point.
  The gate is now **6** — "you put her in the schoolroom and paid for the
  lessons", the two commitments that actually cost you — which that devoted player
  clears **70.2%** of the time. **Lowering it gives nothing away**, and that is
  the part worth remembering: the control run says a self-interested player sees
  this card in **1.6%** of lives at all, because the crossroads sends her to the
  needle for a wage. What makes an ending rare is the expensive *choice* upstream
  of it, not the size of the number at the end — so the number's only job is to
  leave room for one bad day. Check any threshold against what the draw actually
  delivers before trusting it.
  Her three childhood cards have also been widened from her ages **0–4 to 0–7**:
  four years inside *your* childhood, where the pool is at its fattest, delivered
  none of the three to **53.7%** of lives; 0–7 brings that to **39.0%** and the
  median promise banked by the audition from 6 to 8. That is story coverage, not
  the balance fix — widening alone moves the ballerina rate only 38.9% → 40.8% at
  the old gate. **A narrow window inside a crowded stage is barely a window at
  all.** Tom's three stage-0 beats are gated the same way and are untouched: his
  arc has no threshold to miss, so a missed beat bends his story rather than
  costing an ending.
- **Where a card LIVES decides how often it is seen, and moving it is not always
  a gain — and the headline rate is usually the wrong thing to move it by.** The
  two "a sibling has arrived" cards sat in `age_baby` and unlock the two biggest
  story decks in the game. Over 6,000 lives they gave 39.7% a brother, 40.9% a
  sister, 8.9% both, 28.3% neither. Moving them to `home_family` (your ages 5–14)
  *lowered* those rates — 26% / 27% / 4.9% / 53% — because the childhood pool
  they now compete in is twice the size of the baby deck. They are left there
  unweighted anyway, and the reason is the interesting part:
  **the arrival rate and the arc's depth are separate dials, and only one of them
  is about the story.** Weighting them up to 54% / 54% / 26% both changes how
  many runs have a sibling; it barely touches how developed that sibling's arc
  is when there is one — **2.86 beats against 3.09**. So the weight buys more
  runs with a sibling in, not a better sibling story, and a brother is worth more
  as something a run turns out to have. Before reaching for a card's weight, ask
  which of those two you actually wanted.
  **The move's real prize was not the window — it was emptying the baby deck.**
  `age_baby` is ten cards over a five-draw stage, and it holds the cards that set
  almost every disposition the rest of the life reads: `baby_disposition`
  (persBookish / persSporty), `baby_vaccine`, `baby_uncle` (the university fund),
  `baby_nursery` (persSociable). Each was seen in **38%** of lives. Taking two
  cards out of that deck lifted every one of them to **60%**.
  And that is why weighting them *where they were* — the obvious cheaper fix, and
  the one to reach for by reflex — is the wrong answer even though it scores
  better on the headline: `weight: 3` inside `age_baby` gives 65.2% a brother and
  35.4% both, but drops those same disposition cards to **26%**. It buys siblings
  by spending the trait economy. **In a small deck with a short stage, weight is
  not a free lever — it is a transfer.** Move the card to a bigger pool first,
  then weight it there.
- **A `force` bar at the vital's MAX is a bar most lives never touch.** `Card.force`
  is now `{ vital, at? }`, and all six force cards sit at **90** rather than 100.
  The top of a bar is not where a life rests: drift nibbles at it every turn, so
  the state the card exists to answer is "in the nineties", not "capped". Measured
  over 3,000–4,000 lives: of those still at home past 14, **75.3% reach 90+
  finances but only 52.3% ever touch 100**, and the move-out card came up in
  **27%** of the years spent at 90+. The same gap on every other one —
  `job_labour_apprenticeship_grit` spent 3,040 eligible years above spirit 90 and
  1,719 at 100, `_favour` 1,349 against 569, `home_buy_small` 737 against 260.
  Each is now drawn in **72–83%** of the years it is at its bar. What it moves:
  moving out 46.7% → 64.4% of those lives, owning a home 4.2% → 5.9%. Lifespan is
  unchanged (33.9 → 34.0).
  **The two apprenticeship cards sit at 95, not 90**, because that bar is the one
  that really moves the shape of a life — it is the crossover from the capped
  unskilled floor onto the skilled ladder. Share of lives ever apprenticed over
  10,000 greedy lives: **100 → 59.0%, 95 → 63.6%, 90 → 67.4%.** 95 buys most of
  the fix while keeping the indenture a break rather than the default road. It
  also leaves room for the FAVOUR route, which the lower bar crowded out:
  `cards.find` returns the first match and the grit card is declared first, so a
  grit card forcing more often simply takes the slot (favour seen 10.0% / 9.8% /
  7.7% at 100 / 95 / 90). **When two cards answer the same state, lowering one
  card's bar quietly spends the other's share** — check the sibling, not just the
  card you changed.
- **Balance rule for the relationship decks — the cold swipe pays best.** A
  third option that only *costs* you something is not a choice, it is a
  punishment button; nobody picks it twice. In Sarah's deck the cruel swipe is
  the one with the best immediate return (money, and the hours her dancing was
  eating), bought with the currency the deck scores you on — her love, and the
  `promise` that decides the audition. That makes estrangement a *strategy* you
  can be tempted into rather than a self-harm button, which is what it was
  meant to be. `prison_cellmate`'s "keep to yourself" is still dominated — left
  alone pending the cellmate relationship deck. A strict-dominance check (an
  option that is no better than a sibling option on *every* vital and every
  comparable trait) is the cheap way to find these: `scripts/dominated.ts`.
- **…and the trade has to be VISIBLE.** Love, grit and distance are `incTraits`,
  and `incTraits` draws nothing on the card face — no chip, and not even the
  star (which fires on `setStatus`/`setTraits`/`addDecks`, see `vitalChips`). So
  on a relationship card the entire real payload is invisible, and whatever
  vitals the option happens to carry are all the player has to go on. Tom's deck
  failed that badly: on the bully card you could *gain* spirit for teaching him
  to fight, or *lose* health for defending him, or *lose* happiness for walking
  away, and nothing on the card hinted those were the same size of decision —
  one free option and two punishments. Every option in `rel_bro` now shows a
  gain **and** a cost, and two options never share a shape unless they are
  genuinely the same trade (the two sides of a quarrel). **`scripts/invisible.ts`**
  is the check: it compares options on the vitals alone and exempts anything
  showing a marker, so it finds exactly the options that are dominated *on the
  card face*. Still flagged, and not yet passed: nine options across `rel_sis`
  and `prison_cellmate`.
- **Two kinds of deck, and the check does not apply the same way to both.**
  It also flags three `job_apprentice` cards, where "graft at it" costs health
  and spirit and buys only the invisible `jobSkill` that decides whether you
  qualify. That one is **deliberate and stays**: a CAREER deck is allowed a right
  answer, and finding it is what makes a second run worth playing. The hidden
  counter is the lesson, not a bug. A RELATIONSHIP deck is the opposite — Tom and
  Sarah have stories rather than solutions, and there is no path through them you
  are supposed to work out — so there the visible trade has to be honest on the
  first reading, which is what the `rel_bro` pass was for.
- **But a failure must always say WHY.** A deck may hide the rule; it may never
  hide the verdict. Sitting the guild trial half-taught used to read "clumsy and
  half-taught, your piece fails inspection", which names the state and not the
  cause, and worse, three of the five bench cards told you the easy option taught
  you something ("still a lesson learned", "you learn a trick or two") when the
  counter that decides your trade had not moved at all. That is not a lesson a
  player can learn from, it is a lie they can only be caught by. The bench results
  now say plainly when your hands learned nothing, the trial names the evenings
  you rested on both the pass and the fail, and the two `persSporty` checks (the
  runaway cart, the loom) say "you were never quick on your feet" rather than
  leaving the wound unexplained.
- **Do not read a hidden-counter deck off the greedy player.** `scripts/lifespan.ts`
  and its siblings pick the swipe that leaves the weakest vital highest, which is
  exactly the player who can never learn a counter it cannot see: it takes "take
  it steady" every time, so it qualified as a journeyman in **0%** of lives and
  made the skilled ladder look broken. A player who grafts at the bench reaches
  `jobSkill` ≥ 3 in **40%** of apprenticeships and qualifies in **17%**. The
  greedy model measures reachability of things the player can *see*; for anything
  behind a hidden counter, sim the player who knows the rule as well.
- **Value is not the same as a trade.** The first version of that pass gave
  *every* option a cost, including the ones that already had a gain, and the
  deck stopped paying: mean life fell from 38.7 to 33.1 over 1,500 greedy lives
  because ~10 cards a life each lost 10 points. The rule is only that no option
  may be a pure cost or a lookalike — so a cost is added where an option had no
  visible gain, and an option that already read as a fair trade is left alone.
  The corrected pass is value-neutral (38.7 → 38.7); check it after any balance
  edit, because a per-card change of one magnitude step is worth years of life.
- **`Content.vars`** — the cast's names live in content as substitutable constants
  (`{brother}` / `{sister}`), not written into ~60 card strings. Every player-facing
  string — prompt, option label, result, and the epilogue prose — is rendered
  through `tf` so renaming a sibling is one line. Not a trait (constant for the
  run) and not engine (content); content-level rather than per-deck because the
  epilogue names them and belongs to no deck.
- **Balance numbers tuned in old age are provisional.** The old-age draw pool is
  currently ~6 cards against adulthood's ~14 (late-life content is thin — see the
  deck-density item). Anything measured there is flattered by the sparse pool: a
  weighted card looks far likelier to land than it will once the stage is filled
  out. `rel_bro_fate`'s `weight: 25` is deliberately sized against the pool old
  age *will* have, not today's. Re-check any late-life weight, `chance` or gate
  when that content lands.
- **`Deck.tickWhile`** — a deck's `tick` can be gated on a condition, suspending it
  while the condition fails (the deck stays active). Added because the sibling
  deck's `relBrotherDistance` ticked up every year forever: once Tom's arc had
  concluded there was nothing left to show up FOR, so a long life drifted away
  from him however devoted you had been. A player always choosing the kindest
  option read CLOSE 98% of the time if they died before 40 and **0%** if they
  reached 75. With `tickWhile: { traits: { relBrotherStoryDone: false } }` the
  counter freezes when the story ends. `rel_bro_fate` is also heavily **weighted**
  (25) so the finale actually lands — unweighted it was missed in most lives that
  reached it, leaving the arc open and the counter running. Weight rather than a
  milestone, so it stays near-certain to happen without fixing exactly when. Distance now measures PRESENCE, not lifespan: break-even
  is catching ~5 of his ~10 beats (4 beats reads close 7% of the time, 5 reads 91%).
- **Two-choice vs three-choice sweep** — the game is currently **178 two-swipe
  cards to 18 three-swipe** ones, and the third swipe has been added ad hoc where a
  card needed it (the criminal "give up the life", the apprentice "beg for more
  time", prison labour, Tom's cold childhood options). Worth a deliberate pass
  asking which cards *want* a third option and which are honest binaries — the up
  swipe is the natural home for the costly escape hatch, the cowardly way out, or
  the choice that trades a relationship for a vital. Note the distribution is very
  uneven by deck: `adult`, `education` and `pet` have **none** at all, while `jobs`
  has 8. Not urgent; a texture/consistency question rather than a balance one.
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
  convention and update all references (a big sweep — `jobExperience` alone has ~65),
  then make the debug trait tree nest **recursively on `_`** (it currently groups
  one level, by `_` or camelCase prefix). Target layout:
  - `skill_` → `skill_martialArts`
  - `personality_` → `personality_bookish` / `_sporty` / `_sweetTooth` / `_sociable`
  - `job_` → `job_experience`, `job_strikes`, `job_timesChanged`, and per-path
    highest-tier under a sub-level: `job_unskilled_highestTier`,
    `job_skilled_highestTier`, … (ties into the highest-tier cache item below —
    `jobReachedFactory` becomes `job_unskilled_highestTier`)
  - `brother_` → `brother_has`, `brother_relationship`, + brother-storyline traits;
    `sister_` likewise (splits the current `has*`/`rel*` pairs into per-sibling groups)
  - `finance_` → `finance_uniFund`
  - top-level singletons stay ungrouped (e.g. `gender`)
  Do it as one focused pass (rename + reference update + recursive tree) rather
  than piecemeal, to avoid mixed conventions.
- **Highest-tier-reached cache (job re-entry)** — `jobReachedFactory` (bool, set by
  the child-labour→factory promotion) is a stopgap that gates the "back to the
  mill" option so a sacked factory hand can resume without re-grinding. Generalise
  it to a **per-path "highest tier reached"** record (set on entering each job) so
  that being fired from *any* tier (e.g. a tier-3 solicitor) lets you return near
  your former level rather than restarting at the bottom. Real once adult re-entry
  to tier 2/3 jobs exists; fold `jobReachedFactory` into it then.
- **"Keep your job" / `jobStrikes` mechanic** — *prototyped on the labour deck.* A
  per-job `jobStrikes` counter (resets on any job change) rises when you shirk
  (`job_labour_machine`/`errand` "refuse/dawdle" options) and each time you grovel;
  the sacking card's `up` = "beg to keep your place" (conditional option, shown
  only while `jobStrikes ≤ 1`) lets a worker in good standing save the job at a
  pride cost, and the option vanishes once you've pushed your luck. Softens how
  often a sacking actually lands. **To do:** replicate to the other job decks'
  loss cards if it feels good, and add more shirk→strike moments as those decks
  gain work cards.
- **Disposition counters (`persSporty`/`persBookish`) — scaffolded, needs fleshing out.**
  These changed from booleans to **0..3 counters**: the merged `baby_disposition`
  card sets one straight to the cap (3), and cards that reward the trait gate on
  `{ min: 3 }` (the loom `job_labour_machine`, `child_accident`, the two
  `edu_basicschool_*` cards, and now the higher-ed study cards `edu_grammar_debate`
  and `edu_university_lectures` — a bookish scholar pays a gentler cost there too).
  The "build it up in youth if you didn't pick it as a
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
- **Pets — two childhood strays.** Both routes onto a pet are mirrored: a stray
  **cat** (happiness companion) and a stray **dog** (spirit companion) can each
  turn up while you live with family, and the adult/young-adult pet shop offers
  the same pair plus "keep your shillings" — which pays back the animal's price
  (finances `+` against the pets' `-`), since a pet is otherwise a pure gain and
  declining had nothing to offer. Every acquisition card is gated `pet: none`, so
  you can never stack two animals — take either stray and the other drops out of
  the pool; decline one and the other may still come. A found stray seeds love 2
  against the pet shop's 3 (a chosen animal bonds better). Refusing a stray costs
  the very vital that animal embodies — happiness for the cat, spirit for the dog.
- **Homeless deck & exits** — **BUILT** (`home_homeless`, a `priority` deck owned
  by `homeless` housing). Grim daily life (a charity meal to recover; a little
  begged income so even the jobless inch toward a deposit) plus **four gated
  exits**, once your vitals have recovered: rent a room again (finances ≥ 40 →
  renting); **back to your books** to the rung your credential+age allow
  (illiterate→board school ≤13, basic→grammar ≤18, and a **former undergraduate**
  — `eduWasUndergraduate`, since the uni fund was already spent getting in —
  **returns to university** to finish, 18–25); the **workhouse** (a child's
  shelter of last resort, ≤ 13 only); and **crawl home** (a teen 14–18 with no
  rent money → family). You also keep/seek work via `job_unemployed` (also
  `priority`), so a wage builds toward the rent. All gates/values are tunable.
  *(Possible follow-up: a benefactor event.)*
- **Eviction rescue — "turned out onto the streets" (adult finances net).**
  **BUILT** (`home_renting_eviction`, `rescue: "finances"`, `ageMin 18`): an adult
  renter who would go bankrupt is instead **evicted → `homeless`** (rescue floors
  finances to 1, then you choose how you go). The **homeless deck & exits** above
  now give the streets a real way out rather than just a slower death.
- **Renting deck** — first-pass `home_renting` deck is in (lodger, landlord,
  furnish, neighbour, quiet). Still wants: the step up to **buying** a place
  (toward the inheritance thread), and possibly a lodger as a persistent income
  status. The **apprentice/master** life still wants its own deck. Part of the
  broader **house decks** work below.
- **Owned-home life decks** — `home_owned_small` now has a first couple of life
  cards (`home_small_hearth`, `home_small_neighbour`) alongside the buy-up offer;
  `home_owned_large` and `home_owned_estate` are still **stubs** (only the buy-up
  offer + the sell-up net), so owning grand homes has little to *do*. Each wants
  its own set of station-appropriate life events (servants, society, upkeep,
  scandal).
- **Later-life content density** — **first fleshing pass DONE.** All the life-stage
  decks are now one-shots: `age_adult` has 11 events (family, duty, friend, ail,
  society, wed, children, drink, chapel, quarrel, legacy-windfall), `age_old_age`
  has 8 (rest, legacy, grandchildren, will, tales, ailment, peace, charity — the
  old fillers converted to one-shots), `age_young_adult` has 4 + the charity-debt
  filler. That covers a normal run comfortably. Still wants: **more** for very long
  lives, a top-up for `age_young_adult` (thin at 4), and — the bigger idea —
  **housing- and station-aware variety** (events that read differently for a
  labourer vs a merchant, a renter vs an estate-owner) so the middle years feel
  shaped by your station, not generic.
- **Sweet tooth — now a flaw that actually bites.** `flawSweetTooth` (latched in
  babyhood by grandma's second helpings) was read by exactly ONE card, and was
  set via `setTraits`, so the option that inflicted it wore the reward ★. It is
  now a `setFlaws` burden (⚠ on the card face) and is read by **five** cards
  spanning the whole life: `home_family_sweets`, `_market` and `_fair` in
  childhood, `ya_thrift` in the green years, and `old_grandchildren` at the end,
  where grandma's habit comes full circle and you are the one with the tin. It
  drains nothing by itself — it **amplifies both ways**: indulging is sweeter and
  dearer (in money and teeth), going without costs more happiness and hardens you
  for it. That is the shape to copy for any future disposition trait: a trait
  that only gates one card is indistinguishable from no trait at all.
- **…and the card that grants it now has to be *bought*.** Grandma's three
  answers were happiness ++ (with the flaw), health +, and finances ++ — so the
  big prize was available with no flaw attached, and the flaw was a trap rather
  than a temptation. The pudding is now the only "++" on the card and the other
  two each take a happiness dip for forgoing the spoiling. **This is the single
  most leveraged card measured so far**: it is drawn in nearly every life at
  about age three, and it was quietly handing out +25 points of vitals at the
  moment they compound hardest. Removing that costs, over 2,500 greedy lives,
  **mean life 38.8 → 33.0, deaths under 18 6.8% → 10.7%, and reaching 60
  10.4% → 2.1%** — which puts the ~59+ sibling finales close to unreachable. The
  lesson is the measurement, not the card: an early card's magnitude step is
  worth years, so re-run **`scripts/lifespan.ts`** after any babyhood edit.
- **Adult-at-home vs childhood family life** — **BUILT (first pass).** The
  childhood `home_family` cards (sweets, pet, fair, scrump, chores, market) are
  gated `ageMax 17`; a grown-adult-under-the-parental-roof set (`home_family_keep`,
  `_nag`, `_roof` — the friction of still living at home) is gated `ageMin 18`.
  Wants: more of each, and maybe the same age-split treatment applied elsewhere.
- **Non-work vs job separation** — life-stage decks should stay *non-work*
  (`adult_toil`, a push-hard-at-the-job card, became `adult_friend`); recurring
  *work* flavour belongs on the per-job decks. Backlog: seed more one-shot work
  events into the individual `job_*` decks (each currently leans on its promotion
  + a day-in-the-life card).
- **"New pupil" → a school-friendship relationship deck** — the
  `edu_basicschool` "new pupil looking to share a desk" card should open a small
  friendship arc/deck (a schoolmate you keep or drift from), à la the sibling
  thread, rather than being a one-off vitals trade.
- **Relationships told through their own cards + a life-story recap** — the epitaph
  now carries a **relationship strand** (a line on how things stood with your
  brother Tom / your sister at the end, by their love axis). Extend this: give the
  key relationships (Tom, the sister, a spouse/friend later) their own occasional
  *story* cards through the middle years — not just the childhood beats — so the
  bond keeps developing into adulthood, and so the recap can draw on richer
  moments (a reconciliation, a falling-out, a death) rather than only the final
  love value. Related to the sibling arc + the school-friendship deck above.
- **Pets** — **BUILT (first pass): cat & dog.** A `pet` status (`none`/`cat`/`dog`),
  one at a time, each with its own small positive deck. The **cat** (`pet_cat`) leans
  on **happiness** (drift ☺+ £−); the **dog** (`pet_dog`) leans on **spirit** (✦+ £−,
  a touch dearer to keep). Acquired via the childhood **stray cat**, or the **pet
  shop** — a shared 3-option card (cat / dog / walk away) offered once each in young
  adulthood, adulthood and old age, all gated `pet="none"`. Each ages a year at a
  time (`tick petCatAge`/`petDogAge`) and, at ~12 years, the **passing** milestone
  fires — grieve (big hit, pet gone) or carry on with a kitten/pup (smaller hit +
  cost, clock resets). Neglect (chiefly refusing the **vet**) drives its love down
  until it **runs away** first (a lesser loss, and it can't then reach old age). A
  rare mid-life **litter** (`chance`-gated, ages 4–7) offers coin (sell) or a reset
  clock (keep one). A pet kept to the end gets a line in the epitaph. **Balance
  note:** in random play almost no one reaches `old_age` (see `scripts/sim.ts`), so
  the 12-year passing and the litter window are seldom hit — revisit pet lifespan or
  overall survivability if pets should feel more present. **To do:** more pets (a
  caged bird; a horse for the well-off), richer per-pet content, and station-gated
  pets (an estate-owner's hounds). Lifespan/values all tunable (cat & dog = 12y;
  litter `chance` = 0.5, most of the rarity coming from pool competition).
- **Legacy / inheritance across runs** — if you owned a house *and* had an heir,
  the **next run starts in that house** (and maybe with some money/traits).
  Implemented as a shim: on the end screen write an `inheritance` record to
  `localStorage`; on `New life`, override `content.start` before the first card.
  The engine needn't change (start is already pure data). A natural lever here is
  **seeding `eduUniFund`** (or starting savings) from a well-off forebear — the
  intended way to make the deliberately-rare university path reachable more often
  in a *later* run, without cheapening it within a single life. Related: the
  deferred **"continue as your child"** thread.
- **Sibling story arc (rel_bro = Tom; rel_sis later)** — a *story-driven*
  relationship deck meant to make you feel the bond. **No cursor:** beats live in
  non-overlapping WINDOWS of Tom's own life (`relBrotherAge`, ticked by the deck) and
  are drawn organically, so which you catch — and when — varies run to run. Three
  hidden axes carry it: **`relBrotherLove`** (bond warmth, from your choices),
  **`relBrotherGrit`** (his backbone, from your choices), and **`relBrotherDistance`**
  (how present you've been — the deck ticks it UP every year and every Tom card you
  engage pulls it DOWN). The key move: **a missed beat isn't a dead end, it's drift.**
  Distance climbs while you're away, so the beats you *do* catch (and the finale) read
  colder — "you drifted apart" is a distinct outcome from "you fell out". Beats branch
  on love + distance so the same choice lands warmer when you've been present and
  colder when you haven't. **Flow:** Stage 0 childhood fillers → **Beat 1** school/work
  crossroads (a milestone at his age 5, the same fork you faced; matching *your own*
  path deepens Love; sets `relBrotherSchooled`) → **Beat 2** an adolescent rift
  (distance-branched) → **Beat 3** he makes his way (grit) → **Beat 4** the reckoning,
  *reciprocal* — comfortable, you shelter him; destitute, a well-loved Tom comes for
  *you* (`relBrotherReckoned` de-dupes the two housing forms) → **Beat 5** settled
  years (distance-branched) → **Beat 6** his fate in old age (a **Love × Distance**
  grid of endings, from a life shared to the last, through a bittersweet reunion after
  drifting, to a cold farewell). Plus **estrangement**: if love collapses (≤ −25) from
  your own cruel choices — never bad luck — a milestone ends the arc coldly. Terminal
  beats set `relBrotherStoryDone` (the deck goes dormant); the end-of-run epitaph reads
  love × distance (close / drifted / peace / estranged). **Built: Tom's full arc.**
  Still to come: **both-siblings** interplay via `CardOption.if` on
  `relBrotherActive && relSisterActive` (a "share the burden" / "take sides" beat), and
  the sister's own story (`rel_sis`), not a reskin. Distance branches on more beats
  (crisis, way) are an easy future add.
- **Work path tuning** — child-labour drift is deliberately harsh (−5); decide
  whether to soften to −3 to make the gamble more tempting.
- **Richer end-of-run epitaph** — **BUILT (first pass).** The end screen shows the
  cause/framing (ending), age reached, and **"a life in brief"** written as **short
  prose** (two little paragraphs, not a bullet/stat list — deliberately). **No
  number score** (dropped — felt reductive). The prose is composed from end-state +
  the transient life-log, so *how* a fact reads depends on where you ended — the
  headline case being the **fortune arc**: `flawSoldUp` + still owning at the end →
  "…clawed your way back to a home of your own"; `flawSoldUp` + not → "…lost it all
  to your debts". Para 1 = station (born, schooling if grammar/uni, trade, final
  home, fortune arc); para 2 = colour (workhouse / streets / a criminal spell from
  the log; a **relationship strand** — how things stood with your brother Tom / your
  sister by their love axis; and marks like handling yourself in a scrap or dying
  owing the charity). Routine every-game beats (moving out, going up to university)
  aren't spelled out — they're implied by the station. `remember` effect → `state.log`
  (see §15) still supplies the non-derivable darkness.
  **To do:** more story-aware combinations as content grows (a "rose from the
  workhouse to …" line; job-peak / reaching the top of a trade; marriage/children
  when they exist); richer prose; maybe a shareable summary.
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

- **`family: "parent"` IS UNREACHABLE.** The state exists (with `infant`,
  `single`, `courting`, `married`, `widowed`) but no card anywhere sets it.
  `adult_family` and `adult_children` are gated on `married` OR `parent`, so today
  they are reached by marriage alone and the `parent` branch waits. The natural
  fix is for `adult_children` itself to be the moment a married life becomes a
  parent — but that makes it a status-changing card, which is the user's call.
  Now on the Backlog as part of "marriage has no content".
  (Found when both cards turned out to be dealt, ungated, to single adults: "the
  household looks to you — mouths to feed" to a man renting a room with a cat.)

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
