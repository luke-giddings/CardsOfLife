// Which cards does a life actually SEE? Prints the most-drawn cards under
// greedy play, by share of lives and by draws per life.
//
// The question it exists to answer is where to hang something that has to reach
// most players — a currency feed, a tutorial beat, a door into new content. A
// card drawn in 0.1% of lives is not a door, however well written; hanging
// `socialWarmth` off the schoolroom alone would have hidden the whole
// relationship system behind a 0.8% status.
// Run: node --experimental-strip-types scripts/drawn.ts [runs] [top N]
import { chooseDirection, drawCard, initGame, quietYear, setContent } from "../src/engine/engine.ts";
import { meets } from "../src/engine/conditions.ts";
import { gameContent } from "../src/content/index.ts";
import type { Card, Direction, GameState } from "../src/engine/types.ts";
setContent(gameContent);
const DIRS: Direction[] = ["left", "right", "up", "down"];
const dirsFor = (c: Card, s: GameState) => DIRS.filter((d) => c.options[d] && meets(c.options[d]!.if, s, gameContent));
function greedy(c: Card, s: GameState, ds: Direction[]): Direction {
  let best = ds[0], key = -Infinity;
  for (const d of ds) {
    const probe = chooseDirection(structuredClone(s), c, d);
    const v = Object.values(probe.state.vitals) as number[];
    const k = probe.state.over ? -1e9 : Math.min(...v) * 1000 + v.reduce((a, b) => a + b, 0);
    if (k > key) { key = k; best = d; }
  }
  return best;
}
const N = Number(process.argv[2]) || 3000;
const lives = new Map<string, number>(), draws = new Map<string, number>();
for (let i = 0; i < N; i++) {
  let s = initGame(gameContent); const mine = new Set<string>();
  for (let t = 0; t < 120 && !s.over; t++) {
    const d = drawCard(s); s = d.state;
    if (!d.card) { s = quietYear(s); continue; }
    mine.add(d.card.id); draws.set(d.card.id, (draws.get(d.card.id) ?? 0) + 1);
    const ds = dirsFor(d.card, s);
    if (!ds.length) { s = quietYear(s); continue; }
    s = chooseDirection(s, d.card, greedy(d.card, s, ds)).state;
  }
  for (const id of mine) lives.set(id, (lives.get(id) ?? 0) + 1);
}
const rows = [...lives].sort((a, b) => b[1] - a[1]).slice(0, Number(process.argv[3]) || 45);
for (const [id, n] of rows)
  console.log(`${(100 * n / N).toFixed(1).padStart(5)}% of lives  ${(draws.get(id)! / N).toFixed(2).padStart(5)} draws  ${id}`);
