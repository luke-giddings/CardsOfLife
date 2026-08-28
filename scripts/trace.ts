// Trace how lives enter and leave the unskilled floor, and how often the
// apprenticeship escape actually fires. Run: node --experimental-strip-types scripts/trace.ts [runs]
import { chooseDirection, drawCard, initGame, quietYear, setContent } from "../src/engine/engine.ts";
import { meets } from "../src/engine/conditions.ts";
import { gameContent } from "../src/content/index.ts";
import type { Direction, GameState } from "../src/engine/types.ts";

setContent(gameContent);
const DIRS: Direction[] = ["left", "right", "up", "down"];
const RUNS = Number(process.argv[2]) || 20000;
const avail = (card: any, s: GameState) => DIRS.filter((d) => card.options[d] && meets(card.options[d].if, s, gameContent));

let babyRight = 0, babyLeft = 0;                 // age-5 school-vs-work fork
let everChild = 0, childReached13 = 0, childEverEligible = 0;
let apprOffered = 0, apprAccepted = 0;           // job_labour_apprenticeship milestone
let bornWorkerDied = 0, bornWorkerReached30 = 0; // among everChild

for (let r = 0; r < RUNS; r++) {
  let s = initGame(gameContent);
  let child = false, reached13 = false, eligible = false, offered = false, accepted = false;
  let guard = 0;
  while (!s.over && s.age < 30 && guard < 400) {
    guard++;
    const d = drawCard(s); s = d.state;
    if (!d.card) { s = quietYear(s).state; continue; }
    const dirs = avail(d.card, s);
    if (dirs.length === 0) { s = quietYear(s).state; continue; }
    if (d.card.id === "baby_schooling") { /* counted after choice */ }
    if (d.card.id.startsWith("job_labour_apprenticeship")) offered = true;
    const dir = dirs[Math.floor(Math.random() * dirs.length)];
    const before = s.statuses.job;
    s = chooseDirection(s, d.card, dir).state;
    if (d.card.id === "baby_schooling") { if (s.statuses.job === "child_labourer") babyRight++; else babyLeft++; }
    if (d.card.id.startsWith("job_labour_apprenticeship") && s.statuses.job === "apprentice") accepted = true;
    if (s.statuses.job === "child_labourer") {
      child = true;
      // New gate: age >= 13 and EITHER spirit or happiness high enough to catch
      // a master's eye (>= 70 unlocks the offer; 100 forces it).
      if (s.age >= 13) { reached13 = true; if (s.vitals.spirit >= 70 || s.vitals.happiness >= 70) eligible = true; }
    }
  }
  if (child) {
    everChild++;
    if (reached13) childReached13++;
    if (eligible) childEverEligible++;
    if (s.age >= 30) bornWorkerReached30++; else bornWorkerDied++;
  }
  if (offered) apprOffered++;
  if (accepted) apprAccepted++;
}

const p = (n: number) => `${((100 * n) / RUNS).toFixed(1)}%`;
console.log(`\n=== ${RUNS} random lives ===`);
console.log(`baby_schooling fork:  work→child_labourer ${p(babyRight)}   school→studying ${p(babyLeft)}`);
console.log(`ever a child_labourer:            ${everChild}  (${p(everChild)})`);
console.log(`  ...reached age 13 alive:        ${childReached13}  (${(100 * childReached13 / everChild).toFixed(1)}% of them)`);
console.log(`  ...ever apprentice-ELIGIBLE     ${childEverEligible}  (${(100 * childEverEligible / everChild).toFixed(1)}% of them)  [age≥13 & (spirit≥70 or happiness≥70)]`);
console.log(`  ...reached 30:                  ${bornWorkerReached30}  (${(100 * bornWorkerReached30 / everChild).toFixed(1)}% of them)`);
console.log(`apprenticeship milestone OFFERED: ${apprOffered}  (${p(apprOffered)})`);
console.log(`apprenticeship ACCEPTED:          ${apprAccepted}  (${p(apprAccepted)})`);
