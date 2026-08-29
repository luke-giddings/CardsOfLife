// Choice-success heatmap, split by career stream. Plays many random lives; for
// every (card, direction) choice records whether the life reached age 30
// ("success"), and buckets each life by the career stream(s) it touched:
//   educated · skilled · unskilled · criminal · switched (2+ streams) · none.
// Comparing directions WITHIN a card is fair (same eligibility window).
// Run: node --experimental-strip-types scripts/heatmap.ts [runs] [--json] [--greedy]
import {
  chooseDirection,
  drawCard,
  initGame,
  quietYear,
  setContent,
} from "../src/engine/engine.ts";
import { meets } from "../src/engine/conditions.ts";
import { gameContent } from "../src/content/index.ts";
import type { Direction, GameState } from "../src/engine/types.ts";

setContent(gameContent);
const DIRS: Direction[] = ["left", "right", "up", "down"];
const SUCCESS_AGE = 30;
const RUNS = Number(process.argv[2]) || 20000;
const asJson = process.argv.includes("--json");
const greedy = process.argv.includes("--greedy");
// --work: force the age-5 school-or-work fork onto WORK (baby_schooling right →
// child_labourer), so the whole population is the non-education path. Lets us
// judge the work side without the (still-stubbed) school/education branch.
const workOnly = process.argv.includes("--work");

const STREAM: Record<string, string> = {
  shophand: "educated", clerk: "educated", bookkeeper: "educated", solicitor: "educated",
  apprentice: "skilled", journeyman: "skilled", master: "skilled",
  child_labourer: "unskilled", factory: "unskilled", gang_master: "unskilled",
  pickpocket: "criminal", burglar: "criminal", fence: "criminal",
};
const COHORTS = ["all", "educated", "skilled", "unskilled", "criminal", "switched", "none"];

function greedyDir(card: any, s: GameState, dirs: Direction[]): Direction {
  let best = dirs[0], bestKey = -Infinity;
  for (const d of dirs) {
    const v = chooseDirection(s, card, d).state;
    const vt = v.vitals;
    const key = Math.min(vt.finances, vt.happiness, vt.health, vt.spirit) * 1000 +
      (vt.finances + vt.happiness + vt.health + vt.spirit) - (v.over ? 1e6 : 0);
    if (key > bestKey) { bestKey = key; best = d; }
  }
  return best;
}
function availDirs(card: { options: any }, s: GameState): Direction[] {
  return DIRS.filter((d) => card.options[d] && meets(card.options[d].if, s, gameContent));
}

// cohort -> { n, succ, choice: Map<`${card}|${dir}`, [n,w]> }
const agg: Record<string, { n: number; succ: number; choice: Map<string, [number, number]> }> = {};
for (const c of COHORTS) agg[c] = { n: 0, succ: 0, choice: new Map() };
const deaths: Record<string, number> = {};
const deathAges: number[] = [];
// Which card the run ended on (the proximate cause). "(quiet year)" = drift
// killed you on a yearless turn, not a card.
const deathCards: Record<string, number> = {};

for (let r = 0; r < RUNS; r++) {
  let s = initGame(gameContent);
  const picks: string[] = [];
  const streams = new Set<string>();
  let guard = 0;
  let deathCard = "?";
  while (!s.over && s.age < SUCCESS_AGE && guard < 400) {
    guard++;
    const d = drawCard(s); s = d.state;
    if (!d.card) { s = quietYear(s).state; if (s.over) deathCard = "(quiet year)"; continue; }
    const dirs = availDirs(d.card, s);
    if (dirs.length === 0) { s = quietYear(s).state; if (s.over) deathCard = "(quiet year)"; continue; }
    let dir = greedy ? greedyDir(d.card, s, dirs) : dirs[Math.floor(Math.random() * dirs.length)];
    if (workOnly && d.card.id === "baby_schooling" && dirs.includes("right")) dir = "right"; // right → child_labourer
    picks.push(`${d.card.id}|${dir}`);
    s = chooseDirection(s, d.card, dir).state;
    if (s.over) deathCard = d.card.id; // the card whose resolution (or its post-turn drift) killed you
    const st = STREAM[s.statuses.job];
    if (st) streams.add(st);
  }
  const success = s.age >= SUCCESS_AGE;
  if (!success) {
    deaths[s.endReason ?? "?"] = (deaths[s.endReason ?? "?"] ?? 0) + 1;
    deathAges.push(s.age);
    deathCards[deathCard] = (deathCards[deathCard] ?? 0) + 1;
  }
  const cohort = streams.size === 0 ? "none" : streams.size === 1 ? [...streams][0] : "switched";
  for (const co of ["all", cohort]) {
    const a = agg[co];
    a.n++; if (success) a.succ++;
    for (const k of new Set(picks)) {
      const e = a.choice.get(k) ?? [0, 0]; e[0]++; if (success) e[1]++; a.choice.set(k, e);
    }
  }
}

const pct = (n: number, d: number) => (d === 0 ? 0 : Math.round((100 * n) / d));
const MIN_N = 30;
function rowsFor(co: string) {
  const byCard = new Map<string, Record<string, [number, number]>>();
  for (const [k, nw] of agg[co].choice) {
    const [card, dir] = k.split("|");
    const row = byCard.get(card) ?? {}; row[dir] = nw; byCard.set(card, row);
  }
  return [...byCard.entries()].map(([c, d]) => ({ c, d }));
}

// Death cards ranked most-lethal first, as [cardId, count] pairs.
const deathCardsRanked = Object.entries(deathCards).sort((a, b) => b[1] - a[1]);
const totalDeaths = deathCardsRanked.reduce((n, [, c]) => n + c, 0);

if (asJson) {
  const sorted = deathAges.sort((a, b) => a - b);
  const out = {
    runs: RUNS, greedy, deaths,
    medianDeath: sorted.length ? sorted[Math.floor(sorted.length / 2)] : SUCCESS_AGE,
    deathCards: deathCardsRanked.map(([card, n]) => ({ card, n })),
    cohorts: COHORTS.map((c) => ({ name: c, n: agg[c].n, succ: pct(agg[c].succ, agg[c].n) })),
    rows: Object.fromEntries(COHORTS.map((c) => [c, rowsFor(c)])),
  };
  console.log(JSON.stringify(out));
} else {
  console.log(`\n=== ${RUNS} ${greedy ? "greedy" : "random"} lives · reached ${SUCCESS_AGE} = success · by career stream ===`);
  for (const c of COHORTS) {
    const a = agg[c];
    console.log(`  ${c.padEnd(10)} n=${String(a.n).padStart(6)}  reached 30: ${String(pct(a.succ, a.n)).padStart(2)}%  (${((100 * a.n) / RUNS).toFixed(0)}% of lives)`);
  }
  console.log(`\n=== deadliest cards (${totalDeaths} deaths before ${SUCCESS_AGE}) ===`);
  for (const [card, n] of deathCardsRanked.slice(0, 15)) {
    console.log(`  ${card.padEnd(28)} ${String(n).padStart(6)}  ${pct(n, totalDeaths)}% of deaths`);
  }
}
