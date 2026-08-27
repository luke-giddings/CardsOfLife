// Choice-success heatmap: play many random lives; for every (card, direction)
// choice, record whether the run went on to reach age 30 ("success"). Comparing
// directions WITHIN a card is fair (same eligibility window), so it shows which
// choice on each card correlates with a successful life.
// Run: node --experimental-strip-types scripts/heatmap.ts [runs] [--json]
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

const RUNS = Number(process.argv[2]) || 4000;
const asJson = process.argv.includes("--json");
const greedy = process.argv.includes("--greedy"); // survival-focused player

// Greedy pick: try each available direction on a clone, keep the one whose
// resulting state has the highest minimum vital (tie-break: highest total).
function greedyDir(card: any, s: GameState, dirs: Direction[]): Direction {
  let best = dirs[0];
  let bestKey = -1;
  for (const d of dirs) {
    const r = chooseDirection(s, card, d).state;
    const v = r.vitals;
    const key = Math.min(v.finances, v.happiness, v.health, v.spirit) * 1000 +
      (v.finances + v.happiness + v.health + v.spirit) - (r.over ? 1e6 : 0);
    if (key > bestKey) { bestKey = key; best = d; }
  }
  return best;
}

// key `${cardId}|${dir}` -> [timesChosen, timesRunSucceeded]
const choice = new Map<string, [number, number]>();
const deaths: Record<string, number> = {};
const ages: number[] = [];
let successes = 0;

function availDirs(card: { options: any }, s: GameState): Direction[] {
  return DIRS.filter((d) => {
    const o = card.options[d];
    return o && meets(o.if, s, gameContent);
  });
}

for (let r = 0; r < RUNS; r++) {
  let s = initGame(gameContent);
  const picks: string[] = [];
  let guard = 0;
  while (!s.over && s.age < SUCCESS_AGE && guard < 400) {
    guard++;
    const d = drawCard(s);
    s = d.state;
    if (!d.card) {
      s = quietYear(s).state;
      continue;
    }
    const dirs = availDirs(d.card, s);
    if (dirs.length === 0) {
      s = quietYear(s).state;
      continue;
    }
    const dir = greedy ? greedyDir(d.card, s, dirs) : dirs[Math.floor(Math.random() * dirs.length)];
    picks.push(`${d.card.id}|${dir}`);
    s = chooseDirection(s, d.card, dir).state;
  }
  const success = s.age >= SUCCESS_AGE; // reached 30 alive
  if (success) successes++;
  else {
    deaths[s.endReason ?? "?"] = (deaths[s.endReason ?? "?"] ?? 0) + 1;
    ages.push(s.age);
  }
  // Attribute the run's outcome to each DISTINCT choice it made.
  for (const k of new Set(picks)) {
    const e = choice.get(k) ?? [0, 0];
    e[0]++;
    if (success) e[1]++;
    choice.set(k, e);
  }
}

function pct(n: number, d: number): number {
  return d === 0 ? 0 : Math.round((100 * n) / d);
}

// Aggregate per card: dir -> {n, winRate}, and a "swing" = max-min winRate over
// dirs with enough samples, to surface the most decisive choices.
const MIN_N = Math.max(20, RUNS / 200);
type Row = { card: string; dirs: Partial<Record<Direction, [number, number]>>; swing: number };
const byCard = new Map<string, Row>();
for (const [k, [n, w]] of choice) {
  const [card, dir] = k.split("|") as [string, Direction];
  const row = byCard.get(card) ?? { card, dirs: {}, swing: 0 };
  row.dirs[dir] = [n, w];
  byCard.set(card, row);
}
const rows = [...byCard.values()].map((row) => {
  const rates = DIRS.filter((d) => (row.dirs[d]?.[0] ?? 0) >= MIN_N).map((d) => pct(row.dirs[d]![1], row.dirs[d]![0]));
  row.swing = rates.length >= 2 ? Math.max(...rates) - Math.min(...rates) : 0;
  return row;
});

if (asJson) {
  console.log(JSON.stringify({ runs: RUNS, successRate: pct(successes, RUNS), deaths, rows }, null, 0));
} else {
  ages.sort((a, b) => a - b);
  const med = ages.length ? ages[Math.floor(ages.length / 2)] : SUCCESS_AGE;
  console.log(`\n=== ${RUNS} random lives · reached ${SUCCESS_AGE} = success ===`);
  console.log(`Overall success: ${pct(successes, RUNS)}%   median age at death: ${med}`);
  const dl = Object.entries(deaths).sort((a, b) => b[1] - a[1]).map(([c, n]) => `${c} ${pct(n, RUNS - successes)}%`);
  console.log(`Deaths by cause: ${dl.join(" · ")}`);
  console.log(`\nMost decisive choices (win% by direction, [n]; swing desc, min ${MIN_N} samples):`);
  rows.filter((r) => r.swing > 0).sort((a, b) => b.swing - a.swing).slice(0, 28).forEach((r) => {
    const cells = DIRS.filter((d) => r.dirs[d]).map((d) => `${d[0].toUpperCase()} ${pct(r.dirs[d]![1], r.dirs[d]![0])}% [${r.dirs[d]![0]}]`).join("   ");
    console.log(`  Δ${String(r.swing).padStart(2)}  ${r.card.padEnd(26)} ${cells}`);
  });
}
