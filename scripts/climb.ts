// Where does a climb actually break? This one follows the unskilled ladder's
// only rung — casual labour up to the factory floor — through four gates in
// order, because "the card is too rare" can mean two completely different
// things and they want different levers:
//
//   not reaching the counter   -> the DECK needs a bigger share of the draw
//   reaching it and never being offered the card -> THAT CARD needs the weight,
//                                 which is nearly free: it changes which card of
//                                 the deck you draw, not how often the deck wins
//
// Here it was overwhelmingly the second. Run it after touching either weight.
// Run: node --experimental-strip-types scripts/climb.ts [runs]
//
// The four gates, in order:
//   on the rung -> reached experience 3 while still on it -> the card was DRAWN
//   in the years that followed -> you took it.
// Whichever step loses the most is the one worth a lever.
import { chooseDirection, drawCard, initGame, quietYear, setContent } from "../src/engine/engine.ts";
import { meets } from "../src/engine/conditions.ts";
import { gameContent } from "../src/content/index.ts";
import type { Card, Direction, GameState } from "../src/engine/types.ts";
setContent(gameContent);
const DIRS: Direction[] = ["left", "right", "up", "down"];
const dirsFor = (c: Card, s: GameState) => DIRS.filter((d) => c.options[d] && meets(c.options[d]!.if, s, gameContent));
function greedy(c: Card, s: GameState, ds: Direction[]) {
  let best = ds[0], key = -Infinity;
  for (const d of ds) {
    const p = chooseDirection(structuredClone(s), c, d);
    const v = Object.values(p.state.vitals) as number[];
    const k = p.state.over ? -1e9 : Math.min(...v) * 1000 + v.reduce((a, b) => a + b, 0);
    if (k > key) { key = k; best = d; }
  }
  return best;
}
const N = Number(process.argv[2]) || 6000;
const onRung = (s: GameState) => s.statuses.job === "child_labourer" || s.statuses.job === "labourer";
let rung = 0, gated = 0, drawn = 0, taken = 0;
let windowYears = 0, windowDraws = 0, windowLabourDraws = 0;
const leftFor = new Map<string, number>();     // why the window closed, for those who qualified but never saw it
for (let i = 0; i < N; i++) {
  let s = initGame(gameContent);
  let was = false, qualified = false, sawCard = false, took = false, yrs = 0, dr = 0, labDr = 0, exit = "";
  for (let t = 0; t < 120 && !s.over; t++) {
    const here = onRung(s);
    if (here) {
      was = true;
      if (((s.traits as any).jobExperience ?? 0) >= 3) qualified = true;
      if (qualified) yrs++;
    }
    const d = drawCard(s); s = d.state;
    if (!d.card) { s = quietYear(s); continue; }
    if (here && qualified) { dr++; if (d.card.deck === "job_labour") labDr++; }
    if (here && qualified && d.card.id === "job_labour_factory") sawCard = true;
    const ds = dirsFor(d.card, s);
    if (!ds.length) { s = quietYear(s); continue; }
    const before = s.statuses.job;
    s = chooseDirection(s, d.card, greedy(d.card, s, ds)).state;
    if (s.statuses.job === "factory" && before !== "factory") took = true;
    if (here && !onRung(s) && qualified && !exit) exit = s.over ? "died" : s.statuses.job;
  }
  if (!was) continue;
  rung++;
  if (!qualified) continue;
  gated++; windowYears += yrs; windowDraws += dr; windowLabourDraws += labDr;
  if (sawCard) drawn++; else leftFor.set(exit || (s.over ? "died" : "still on the rung"), (leftFor.get(exit || (s.over ? "died" : "still on the rung")) ?? 0) + 1);
  if (took) taken++;
}
const pc = (n: number, d: number) => `${(100 * n / d).toFixed(1)}%`;
console.log(`${rung} lives spent time on the labour rung`);
console.log(`  reached experience 3 while still on it   ${gated}  (${pc(gated, rung)} of them)`);
console.log(`  ...and then saw the mill card            ${drawn}  (${pc(drawn, gated)} of those)`);
console.log(`  ...and took it                           ${taken}  (${pc(taken, drawn || 1)} of those)`);
console.log(`\n  after qualifying they stayed on the rung ${(windowYears / gated).toFixed(1)} more years,`);
console.log(`  drawing ${(windowDraws / gated).toFixed(1)} cards in that window, ${(windowLabourDraws / gated).toFixed(1)} of them from job_labour`);
console.log(`\n  qualified but never saw it — the window closed because they went to:`);
console.log(`    ${[...leftFor].sort((a, b) => b[1] - a[1]).map(([j, n]) => `${j} ${n}`).join(", ")}`);
console.log(`SUMMARY saw ${pc(drawn, gated)} of qualifiers · mill reached by ${pc(taken, rung)} of labour lives · job_labour was ${pc(windowLabourDraws, windowDraws)} of the draws in that window`);
