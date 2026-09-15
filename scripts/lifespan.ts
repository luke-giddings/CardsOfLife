// The blunt regression check for any balance edit: how long does a good player
// live, and how many lives reach the content gated on living long?
//
// The player here is GREEDY — each year it takes the swipe that leaves the
// weakest vital highest, breaking ties on the total, and never willingly dies.
// That is an optimist's ceiling rather than a real player, but it is stable
// between runs, so the DIFFERENCE between two content versions is the signal.
//
// It is also, by construction, a player who can never learn a rule it cannot
// see: an option that costs vitals now to raise a hidden counter later is one it
// declines every single time. So this says nothing useful about content gated on
// such a counter — it scores 0% journeymen where a player who grafts at the
// bench scores 17% — and a low number there is a fact about THIS player, not
// about the game. Sim the player who knows the rule before calling that content
// unreachable.
//
// Read "reached 60" as a content-reachability number, not just a difficulty one:
// the sibling finales are gated on Tom or Sarah turning 59, so a life that ends
// at 40 never sees the end of the story it has been telling all game.
//
// Measured cost of one magnitude step on ONE early card (grandma's treat, drawn
// near-universally at about age three): mean 38.8 -> 33.0, reaching 60 10.4% ->
// 2.1%. Early cards compound; re-run this after touching one.
// Run: node --experimental-strip-types scripts/lifespan.ts [runs]
import { chooseDirection, drawCard, initGame, quietYear, setContent } from "../src/engine/engine.ts";
import { meets } from "../src/engine/conditions.ts";
import { gameContent } from "../src/content/index.ts";
import type { Card, Direction, GameState } from "../src/engine/types.ts";
setContent(gameContent);

const DIRS: Direction[] = ["left", "right", "up", "down"];
const dirsFor = (c: Card, s: GameState): Direction[] =>
  DIRS.filter((d) => c.options[d] && meets(c.options[d]!.if, s, gameContent));

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

const N = Number(process.argv[2]) || 2500;
const ages: number[] = [];
for (let i = 0; i < N; i++) {
  let s = initGame(gameContent);
  for (let turn = 0; turn < 120 && !s.over; turn++) {
    const d = drawCard(s); s = d.state;
    if (!d.card) { s = quietYear(s); continue; }
    const ds = dirsFor(d.card, s);
    if (!ds.length) { s = quietYear(s); continue; }
    s = chooseDirection(s, d.card, greedy(d.card, s, ds)).state;
  }
  ages.push(s.age);
}
ages.sort((a, b) => a - b);
const share = (f: (n: number) => boolean) => (100 * ages.filter(f).length / N).toFixed(1) + "%";
const mean = ages.reduce((a, b) => a + b, 0) / N;
console.log(`${N} greedy lives`);
console.log(`  mean age        ${mean.toFixed(1)}   (median ${ages[N >> 1]}, p90 ${ages[Math.floor(N * 0.9)]})`);
console.log(`  died under 13   ${share((a) => a < 13)}`);
console.log(`  died under 18   ${share((a) => a < 18)}`);
console.log(`  reached 40      ${share((a) => a >= 40)}`);
console.log(`  reached 60      ${share((a) => a >= 60)}   <- the sibling finales live up here`);
