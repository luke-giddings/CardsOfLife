// Does the greedy player die young because the game is hard, or because greedy
// is bad at HOUSING? Buying is a big visible hit to finances now for a permanent
// health/spirit gain later, which is exactly the trade a one-turn optimiser
// declines — the same blind spot that made it score 0% journeymen.
//
// ANSWER, over 3,000 lives each: it is not the algorithm. The settler gains half
// a year (mean 34.1 -> 34.6, reaching 60 1.7% -> 2.4%) and still only owns a home
// in 8.2% of lives against 6.0%. WANTING a house barely gets you one, because
// home_buy_small needs finances >= 75 and costs a third of it.
//
// What does kill you is drift rather than cards: happiness 49.7% of deaths
// (median age 33) and health 46.0% (median 34), and the killing blow was the
// YEAR'S DRIFT in 63.7% of them. The game is not killing you with hard choices,
// it is bleeding you between them — so the lifespan work belongs in the drift
// table and in reliable sources of happiness and health, not in smarter play.
//
// The "settler" plays greedily EXCEPT that it takes any swipe which improves
// housing, provided the resulting finances drift still stands up: it will not
// buy a house its wage cannot keep. It never deliberately dies. Everything else
// is identical, so the difference between the two columns is housing alone.
// Run: node --experimental-strip-types scripts/housing-ab.ts [runs]
import { chooseDirection, drawCard, initGame, quietYear, setContent, totalDrift } from "../src/engine/engine.ts";
import { meets } from "../src/engine/conditions.ts";
import { gameContent } from "../src/content/index.ts";
import type { Card, Direction, GameState } from "../src/engine/types.ts";
setContent(gameContent);

const DIRS: Direction[] = ["left", "right", "up", "down"];
const dirsFor = (c: Card, s: GameState) => DIRS.filter((d) => c.options[d] && meets(c.options[d]!.if, s, gameContent));
// Worst-to-best, so "did this swipe move me up the ladder" is a comparison.
const LADDER = ["prison", "homeless", "workhouse", "apprentice", "family", "renting", "owned_small", "owned_large", "owned_estate"];
const rung = (s: GameState) => LADDER.indexOf(s.statuses.housing);
const score = (s: GameState) => {
  const v = Object.values(s.vitals) as number[];
  return s.over ? -1e9 : Math.min(...v) * 1000 + v.reduce((a, b) => a + b, 0);
};

function pick(c: Card, s: GameState, ds: Direction[], settle: boolean): Direction {
  let best = ds[0], bestKey = -Infinity, bestUp = -Infinity;
  for (const d of ds) {
    const probe = chooseDirection(structuredClone(s), c, d).state;
    const key = score(probe);
    if (settle && !probe.over) {
      // An upgrade you can afford to KEEP: the rung goes up and the new drift
      // does not bleed money. Ranked above anything greedy would rather do.
      const up = rung(probe) - rung(s);
      const affordable = (totalDrift(probe, gameContent).finances ?? 0) >= 0;
      if (up > 0 && affordable) {
        if (up > bestUp) { bestUp = up; best = d; bestKey = Infinity; }
        continue;
      }
    }
    if (bestUp <= 0 && key > bestKey) { bestKey = key; best = d; }
  }
  return best;
}

function run(settle: boolean, N: number) {
  const ages: number[] = [];
  let owned = 0, renting = 0, everMoved = 0;
  for (let i = 0; i < N; i++) {
    let s = initGame(gameContent);
    let wasOwner = false, wasRenter = false, left = false;
    for (let t = 0; t < 120 && !s.over; t++) {
      const d = drawCard(s); s = d.state;
      if (!d.card) { s = quietYear(s); continue; }
      const ds = dirsFor(d.card, s);
      if (!ds.length) { s = quietYear(s); continue; }
      s = chooseDirection(s, d.card, pick(d.card, s, ds, settle)).state;
      if (s.statuses.housing.startsWith("owned")) wasOwner = true;
      if (s.statuses.housing === "renting") wasRenter = true;
      if (s.statuses.housing !== "family") left = true;
    }
    ages.push(s.age);
    if (wasOwner) owned++;
    if (wasRenter) renting++;
    if (left) everMoved++;
  }
  ages.sort((a, b) => a - b);
  const pc = (n: number) => `${(100 * n / N).toFixed(1)}%`;
  const share = (f: (n: number) => boolean) => pc(ages.filter(f).length);
  console.log(`  mean age ${(ages.reduce((a, b) => a + b, 0) / N).toFixed(1)}  ·  median ${ages[N >> 1]}  ·  p90 ${ages[Math.floor(N * 0.9)]}`);
  console.log(`  reached 40 ${share((a) => a >= 40)}   reached 60 ${share((a) => a >= 60)}   died under 18 ${share((a) => a < 18)}`);
  console.log(`  ever rented ${pc(renting)}   ever owned ${pc(owned)}   ever left home ${pc(everMoved)}`);
}
const N = Number(process.argv[2]) || 3000;
console.log(`GREEDY (${N} lives)`); run(false, N);
console.log(`SETTLER — takes housing it can keep`); run(true, N);
