// Headless playthrough harness. Plays many random lives and reports the DRAW-POOL
// SIZE by life stage — the number of ordinary (non-milestone) cards eligible each
// year, i.e. the draw pile the debug panel shows. Pool size is the dial that
// governs how rare a `chance`-gated card really is: a card competes 1-in-pool the
// years it rolls in, so a rare event in a fat pool is rarer still. It also prints
// a few sample life summaries. By default the player swipes at RANDOM; pass
// --greedy for a competent player (maximise the weakest vital, never suicide),
// which survives longer and so reaches the later stages far more often — the more
// realistic pool profile for a real player.
// Run: node --experimental-strip-types scripts/sim.ts [runs] [--samples N] [--greedy]
import {
  chooseDirection,
  drawCard,
  eligibleDraw,
  initGame,
  quietYear,
  setContent,
} from "../src/engine/engine.ts";
import { meets } from "../src/engine/conditions.ts";
import { gameContent } from "../src/content/index.ts";
import type { Direction, GameState } from "../src/engine/types.ts";

setContent(gameContent);

const RUNS = Number(process.argv[2]) || 5000;
const sampleArg = process.argv.indexOf("--samples");
const SAMPLES = sampleArg >= 0 ? Number(process.argv[sampleArg + 1]) || 0 : 4;
const GREEDY = process.argv.includes("--greedy");
const DIRS: Direction[] = ["left", "right", "up", "down"];

// Directions actually offered this turn (present AND not hidden by their `if`).
function availDirs(card: { options: Record<string, unknown> }, s: GameState): Direction[] {
  return DIRS.filter((d) => (card.options as any)[d] && meets((card.options as any)[d].if, s, gameContent));
}

// Greedy heuristic (mirrors scripts/heatmap.ts): take the swipe that leaves the
// best vitals — lift the WEAKEST vital first (survival), then the total, and never
// willingly end the run.
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

const STAGES = ["baby", "child", "young_adult", "adult", "old_age"] as const;

// Per-stage histogram of pool sizes: hist[stage][size] = count of years seen at
// that pool size. Pool sizes are small integers, so an array indexed by size is
// flat in memory however many lives we run (no per-year list to blow up).
const histByStage: Record<string, number[]> = {};
for (const st of STAGES) histByStage[st] = [];

function playOne(sample: boolean): void {
  let s = initGame(gameContent);
  let turns = 0;
  while (!s.over && turns < 500) {
    // Record the draw-pool size for the CURRENT year, bucketed by life stage.
    // eligibleDraw mirrors drawCard's pool but does NOT roll `chance`, so a
    // chance card counts as present whenever its conditions hold — a tiny
    // over-count, negligible for pool-size stats.
    const stage = s.statuses.age;
    const hist = histByStage[stage];
    if (hist) {
      const sz = eligibleDraw(s).pool.length;
      hist[sz] = (hist[sz] ?? 0) + 1;
    }

    const d = drawCard(s);
    s = d.state;
    if (!d.card) {
      s = quietYear(s).state;
      turns++;
      continue;
    }
    const dirs = availDirs(d.card, s);
    if (dirs.length === 0) {
      s = quietYear(s).state;
      turns++;
      continue;
    }
    const dir = GREEDY ? greedyDir(d.card, s, dirs) : dirs[Math.floor(Math.random() * dirs.length)];
    s = chooseDirection(s, d.card, dir).state;
    turns++;
  }
  if (sample) {
    console.log(
      JSON.stringify({
        over: s.over,
        reason: s.endReason,
        age: s.age,
        turns,
        vitals: s.vitals,
        job: s.statuses.job,
        housing: s.statuses.housing,
        education: s.statuses.education,
        pet: s.statuses.pet,
        jobTimesChanged: s.traits.jobTimesChanged,
      }),
    );
  }
}

for (let i = 0; i < RUNS; i++) playOne(i < SAMPLES);

// --- pool-size report ------------------------------------------------------
function stats(h: number[]): { n: number; mean: number; min: number; max: number; p50: number; p90: number } {
  let n = 0, sum = 0, min = Infinity, max = 0;
  for (let sz = 0; sz < h.length; sz++) {
    const c = h[sz] ?? 0;
    if (!c) continue;
    n += c;
    sum += sz * c;
    if (sz < min) min = sz;
    if (sz > max) max = sz;
  }
  const pctile = (p: number): number => {
    const target = (p / 100) * n;
    let cum = 0;
    for (let sz = 0; sz < h.length; sz++) {
      cum += h[sz] ?? 0;
      if (cum >= target) return sz;
    }
    return max;
  };
  return { n, mean: n ? sum / n : 0, min: n ? min : 0, max, p50: pctile(50), p90: pctile(90) };
}

console.log(`\n=== draw-pool size by life stage · ${RUNS} ${GREEDY ? "greedy" : "random"} lives ===`);
console.log(`stage         years     mean   min   p50   p90   max`);
for (const st of STAGES) {
  const h = histByStage[st];
  const s = stats(h);
  if (s.n === 0) {
    console.log(`${st.padEnd(12)}  (never reached)`);
    continue;
  }
  console.log(
    `${st.padEnd(12)}  ${String(s.n).padStart(6)}  ${s.mean.toFixed(1).padStart(6)}  ` +
      `${String(s.min).padStart(4)}  ${String(s.p50).padStart(4)}  ${String(s.p90).padStart(4)}  ${String(s.max).padStart(4)}`,
  );
}

// Compact per-stage histogram (share of years at each pool size), so you can see
// the whole distribution, not just the summary — the "heatmap" of the draw pile.
console.log(`\n=== pool-size distribution (share of years at each size) ===`);
for (const st of STAGES) {
  const h = histByStage[st];
  const s = stats(h);
  if (s.n === 0) continue;
  const cells: string[] = [];
  for (let sz = 0; sz <= s.max; sz++) {
    const share = (100 * (h[sz] ?? 0)) / s.n;
    if (share >= 0.5) cells.push(`${sz}:${share.toFixed(0)}%`);
  }
  console.log(`${st.padEnd(12)}  ${cells.join("  ")}`);
}
