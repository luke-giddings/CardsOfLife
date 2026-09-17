// What is a disposition actually WORTH over a whole life?
//
// `baby_disposition` offers a lasting trait plus a small bonus, or no trait and a
// large one. On the card face that reads as 10 points against 60, and the greedy
// sim takes the 60 every time — which is the sim's documented blindness to
// anything invisible, not a verdict on the card. So force each swipe and play the
// life out, and let the sixty years answer instead of the one turn.
//
// The traits are read by hard checks, not flavour:
//   persSporty   child_accident and job_labour_machine — pass and you walk away,
//                fail and it is health "---" (-40), fatal often enough to matter.
//   persBookish  the exam, the prize, the debate and the lecture hall — each one
//                turns a cost into a gain (up to 20 points a card).
// Run: node --experimental-strip-types scripts/disposition.ts [runs]
import { chooseDirection, drawCard, initGame, quietYear, setContent } from "../src/engine/engine.ts";
import { meets } from "../src/engine/conditions.ts";
import { gameContent } from "../src/content/index.ts";
import type { Card, Direction, GameState } from "../src/engine/types.ts";
setContent(gameContent);

const DIRS: Direction[] = ["left", "right", "up", "down"];
const dirsFor = (c: Card, s: GameState) =>
  DIRS.filter((d) => c.options[d] && meets(c.options[d]!.if, s, gameContent));

function greedy(c: Card, s: GameState, ds: Direction[]): Direction {
  let best = ds[0], key = -Infinity;
  for (const d of ds) {
    const p = chooseDirection(structuredClone(s), c, d).state;
    const v = Object.values(p.vitals) as number[];
    const k = p.over ? -1e9 : Math.min(...v) * 1000 + v.reduce((a, b) => a + b, 0);
    if (k > key) { key = k; best = d; }
  }
  return best;
}

const N = Number(process.argv[2]) || 8000;
const EDU = ["basic", "grammar", "university"];

function run(label: string, forced: Direction | null) {
  const ages: number[] = [];
  let lettered = 0, maimed = 0, accident = 0, loom = 0;
  for (let i = 0; i < N; i++) {
    let s = initGame(gameContent);
    for (let t = 0; t < 120 && !s.over; t++) {
      const d = drawCard(s); s = d.state;
      if (!d.card) { s = quietYear(s); continue; }
      const ds = dirsFor(d.card, s);
      if (!ds.length) { s = quietYear(s); continue; }
      let dir = greedy(d.card, s, ds);
      if (d.card.id === "baby_disposition" && forced && ds.includes(forced)) dir = forced;
      const before = s.vitals.health;
      s = chooseDirection(s, d.card, dir).state;
      // The two checks the sporty trait exists for, and what failing them cost.
      if (d.card.id === "child_accident" && dir === "left") { accident++; if (s.vitals.health < before - 30) maimed++; }
      if (d.card.id === "job_labour_machine" && dir === "left") { loom++; if (s.vitals.health < before - 30) maimed++; }
    }
    ages.push(s.age);
    if (EDU.includes(s.statuses.education)) lettered++;
  }
  ages.sort((a, b) => a - b);
  const mean = ages.reduce((a, b) => a + b, 0) / N;
  const pc = (n: number, of = N) => `${(100 * n / of).toFixed(1)}%`;
  console.log(`  ${label.padEnd(26)} mean ${mean.toFixed(1)}   reached 40 ${pc(ages.filter((a) => a >= 40).length).padStart(6)}` +
    `   lettered ${pc(lettered).padStart(6)}   took the risky swipe ${accident + loom}, maimed ${pc(maimed, Math.max(accident + loom, 1)).padStart(6)}`);
}

console.log(`${N} lives per arm — greedy play, only the disposition swipe forced`);
run('left  "Out to play"', "left");
run('right "Nose in a book"', "right");
run('up    "A bit of both"', "up");
run("(unforced — greedy picks)", null);
