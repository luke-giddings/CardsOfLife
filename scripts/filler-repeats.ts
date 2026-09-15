// A/B for the filler discard pile (drawCard): how badly did fillers repeat, how
// much does holding played ones back fix it, and — the worry that prompted it —
// how often does the pile have to shuffle back in because the game deliberately
// keeps filler counts low?
//
// The OFF arm empties state.playedFillers before every draw, which is exactly
// the old behaviour: an empty pile filters nothing and can never be "all that's
// left", so the rule never fires. Same content, same greedy player, same number
// of lives; the only difference is the pile.
//
// Read: "sandwiched" is the complaint itself — the same filler again with at
// most one card between. "reshuffle" is the cost: draws where the eligible
// fillers had all been seen and repeats were allowed back in.
// Run: node --experimental-strip-types scripts/filler-repeats.ts [runs]
import { chooseDirection, drawCard, eligibleDraw, initGame, quietYear, setContent } from "../src/engine/engine.ts";
import { meets } from "../src/engine/conditions.ts";
import { gameContent } from "../src/content/index.ts";
import type { Direction, GameState } from "../src/engine/types.ts";
setContent(gameContent);

const RUNS = Number(process.argv[2]) || 3000;
const DIRS: Direction[] = ["left", "right", "up", "down"];

function availDirs(card: any, s: GameState): Direction[] {
  return DIRS.filter((d) => card.options[d] && meets(card.options[d].if, s, gameContent));
}
function greedyDir(card: any, s: GameState, dirs: Direction[]): Direction {
  let best = dirs[0], bestKey = -Infinity;
  for (const d of dirs) {
    const probe = chooseDirection(structuredClone(s), card, d);
    const v = probe.state.vitals;
    const key = probe.state.over ? -1e9 : Math.min(...Object.values(v)) * 1000 + Object.values(v).reduce((a, b) => a + b, 0);
    if (key > bestKey) { bestKey = key; best = d; }
  }
  return best;
}

function run(pile: boolean) {
  const t = { lives: 0, age: 0, draws: 0, fillerDraws: 0, backToBack: 0, sandwiched: 0,
              gapSum: 0, gapN: 0, reshuffles: 0, poolAtReshuffle: 0, firstReshuffleAge: 0,
              livesWithReshuffle: 0, distinctSum: 0, worst: new Map<string, number>() };
  for (let i = 0; i < RUNS; i++) {
    let s = initGame(gameContent);
    const seq: (string | null)[] = [];   // filler id per turn, null for anything else
    const lastAt = new Map<string, number>();
    const distinct = new Set<string>();
    let firstReshuffle = -1;
    for (let turn = 0; turn < 120 && !s.over; turn++) {
      if (!pile) s.playedFillers = [];     // the OFF arm: no memory, so the rule never fires
      const before = s.playedFillers;
      // The eligible fillers at this draw, for the pool size at a reshuffle.
      const fillersHere = eligibleDraw(s).pool.filter((c) => c.kind === "filler").length;
      const d = drawCard(s); s = d.state;
      if (!d.card) { s = quietYear(s); seq.push(null); continue; }
      const isFiller = d.card.kind === "filler";
      // A reshuffle is visible from out here: it is the only thing that REMOVES
      // an id from the pile. (Length alone would not do — the rescue, milestone
      // and force paths return before the pile is appended to at all.)
      const after = new Set(s.playedFillers);
      if (before.some((id) => !after.has(id))) {
        t.reshuffles++;
        t.poolAtReshuffle += fillersHere;
        if (firstReshuffle < 0) firstReshuffle = s.age;
      }
      t.draws++;
      seq.push(isFiller ? d.card.id : null);
      if (isFiller) {
        t.fillerDraws++;
        distinct.add(d.card.id);
        const prev = lastAt.get(d.card.id);
        if (prev !== undefined) {
          const gap = turn - prev;           // 1 = back to back, 2 = one card between
          t.gapSum += gap; t.gapN++;
          if (gap === 1) t.backToBack++;
          if (gap <= 2) { t.sandwiched++; t.worst.set(d.card.id, (t.worst.get(d.card.id) ?? 0) + 1); }
        }
        lastAt.set(d.card.id, turn);
      }
      const dirs = availDirs(d.card, s);
      if (!dirs.length) { s = quietYear(s); continue; }
      s = chooseDirection(s, d.card, greedyDir(d.card, s, dirs)).state;
    }
    t.lives++; t.age += s.age; t.distinctSum += distinct.size;
    if (firstReshuffle >= 0) { t.livesWithReshuffle++; t.firstReshuffleAge += firstReshuffle; }
  }
  return t;
}

const pct = (n: number, d: number) => d ? (100 * n / d).toFixed(1) + "%" : "-";
const per = (n: number, d: number) => d ? (n / d).toFixed(2) : "-";
for (const pile of [false, true]) {
  const t = run(pile);
  console.log(`\n--- discard pile ${pile ? "ON " : "OFF"} (${t.lives} lives, mean age ${per(t.age, t.lives)}) ---`);
  console.log(`  filler draws            ${t.fillerDraws} (${pct(t.fillerDraws, t.draws)} of draws), ${per(t.fillerDraws, t.lives)}/life`);
  console.log(`  distinct fillers seen   ${per(t.distinctSum, t.lives)}/life`);
  console.log(`  back to back            ${t.backToBack} (${pct(t.backToBack, t.fillerDraws)} of filler draws)`);
  console.log(`  sandwiched (gap <= 2)   ${t.sandwiched} (${pct(t.sandwiched, t.fillerDraws)} of filler draws)`);
  console.log(`  mean gap between repeats ${per(t.gapSum, t.gapN)} turns`);
  console.log(`  reshuffles              ${t.reshuffles} (${per(t.reshuffles, t.lives)}/life, ${pct(t.reshuffles, t.draws)} of draws)`);
  if (t.reshuffles) console.log(`    eligible fillers at reshuffle ${per(t.poolAtReshuffle, t.reshuffles)}; first at age ${per(t.firstReshuffleAge, t.livesWithReshuffle)} in ${pct(t.livesWithReshuffle, t.lives)} of lives`);
  // Where a repeat still lands: a filler high on this list is one whose pool is
  // too thin to hold it back, i.e. a place to WRITE another filler.
  const worst = [...t.worst].sort((a, b) => b[1] - a[1]).slice(0, 6);
  console.log(`  still repeating soonest  ${worst.map(([id, n]) => `${id} ${per(n, t.lives)}`).join(", ")}`);
}
