// THE GOLDEN HASH: proof that a refactor changed nothing. Plays a fixed set of
// seeded lives with two deterministic players (greedy on vitals, and one that
// picks by a hash of the turn) and hashes every turn: the card dealt, the
// direction taken, the resulting state, and what the debug panel's
// eligibleDraw would show. A behaviour-preserving change must print the same
// hash; anything else is a behaviour change, intended or not.
//   node --experimental-strip-types scripts/golden.ts [lives]   (or npx tsx)
import { createHash } from "node:crypto";
import { chooseDirection, drawCard, eligibleDraw, initGame, quietYear, setContent } from "../src/engine/engine.ts";
import { meets } from "../src/engine/conditions.ts";
import { gameContent } from "../src/content/index.ts";
import type { Card, Direction, GameState } from "../src/engine/types.ts";
setContent(gameContent);
// Key order is not behaviour: hash a canonical form, so a refactor that builds
// the state in a different order still matches. Undefined fields drop out too.
const canon = (v: unknown): string => JSON.stringify(v, (_k, x) =>
  x && typeof x === "object" && !Array.isArray(x) ? Object.fromEntries(Object.entries(x).filter(([, y]) => y !== undefined).sort(([a], [b]) => (a < b ? -1 : 1))) : x);
const DIRS: Direction[] = ["left", "right", "up", "down"];
const dirsFor = (c: Card, s: GameState) => DIRS.filter((d) => c.options[d] && meets(c.options[d]!.if, s, gameContent));
function greedy(c: Card, s: GameState, ds: Direction[]): Direction {
  let best = ds[0], key = -Infinity;
  for (const d of ds) {
    const p = chooseDirection(s, c, d).state; const v = Object.values(p.vitals) as number[];
    const k = p.over ? -1e9 : Math.min(...v) * 1000 + v.reduce((a, b) => a + b, 0);
    if (k > key) { key = k; best = d; }
  }
  return best;
}
const N = Number(process.argv[2]) || 300;
const h = createHash("sha256");
const t0 = performance.now();
let turns = 0;
for (const player of ["greedy", "spread"]) {
  for (let i = 1; i <= N; i++) {
    let s = initGame(gameContent, i * 7919);
    for (let t = 0; t < 130 && !s.over; t++) {
      if (t % 5 === 0) {
        const e = eligibleDraw(s);
        h.update(`E${e.milestone?.id}|${e.pool.map((c) => c.id).join(",")}|${e.gated.length}|${e.held.map((c) => c.id).join(",")}`);
      }
      const d = drawCard(s); s = d.state;
      if (!d.card) { s = quietYear(s).state; h.update("Q" + canon(s)); continue; }
      const ds = dirsFor(d.card, s);
      if (!ds.length) { s = quietYear(s).state; h.update("Q" + canon(s)); continue; }
      const dir = player === "greedy" ? greedy(d.card, s, ds) : ds[(i * 31 + t * 17) % ds.length];
      const r = chooseDirection(s, d.card, dir);
      s = r.state; turns++;
      h.update(`${d.card.id}:${dir}:${r.result}:${canon(s)}`);
    }
  }
}
console.log(`golden ${h.digest("hex").slice(0, 16)}  (${2 * N} lives, ${turns} turns, ${((performance.now() - t0) / 1000).toFixed(1)}s)`);
