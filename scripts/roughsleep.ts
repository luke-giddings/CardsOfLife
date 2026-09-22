// Does the wage actually get you off the street, and how fast? The greedy sim
// never produces a homeless man WITH a trade -- it never enrols, so it never
// gets ruined out of school -- so the path has to be started by hand: put a man
// on the pavement holding each job and play him out.
import { chooseDirection, drawCard, initGame, quietYear, setContent } from "../src/engine/engine.ts";
import { meets } from "../src/engine/conditions.ts";
import { gameContent } from "../src/content/index.ts";
import type { Card, Direction, GameState } from "../src/engine/types.ts";
setContent(gameContent);
const DIRS: Direction[] = ["left","right","up","down"];
const dirsFor = (c: Card, s: GameState) => DIRS.filter((d) => c.options[d] && meets(c.options[d]!.if, s, gameContent));
function greedy(c: Card, s: GameState, ds: Direction[]): Direction {
  let best = ds[0], key = -Infinity;
  for (const d of ds) {
    const p = chooseDirection(structuredClone(s), c, d).state;
    const v = Object.values(p.vitals) as number[];
    const k = p.over ? -1e9 : Math.min(...v)*1000 + v.reduce((a,b)=>a+b,0);
    if (k > key) { key = k; best = d; }
  }
  return best;
}
const med = (a:number[]) => a.length ? [...a].sort((x,y)=>x-y)[Math.floor(a.length/2)] : NaN;

// A pupil the ruin net has just put on the street: floored purse, ground-down
// happiness, the vitals the measured median arrives with.
function onThePavement(job: string, deck: string): GameState {
  const s = initGame(gameContent);
  s.age = 17; s.statuses.age = "young_adult"; s.statuses.job = job;
  s.statuses.housing = "homeless"; s.statuses.education = "basic"; s.statuses.family = "single";
  s.vitals = { finances: 1, happiness: 16, health: 26, spirit: 65 };
  s.activeDecks = [...new Set([...s.activeDecks.filter((d) => !d.startsWith("baby") && !d.startsWith("age_")),
    "home_homeless", "age_young_adult", deck])];
  return s;
}

const N = Number(process.argv[2]) || 600;
console.log(`${N} men per row, put on the pavement at 17 with the vitals a ruined pupil actually arrives with`);
console.log(`(finances 1, happiness 16, health 26, spirit 65)\n`);
console.log(`  ${"job held".padEnd(14)} ${"got a roof".padStart(11)} ${"median yrs to it".padStart(17)} ${"died out there".padStart(15)}`);
for (const [job, deck] of [["shophand","job_shop"], ["clerk","job_clerk"], ["labourer","job_labour"], ["pickpocket","job_criminal"], ["unemployed","job_unemployed"]] as [string,string][]) {
  let roofed = 0, died = 0; const yrs: number[] = [];
  for (let i = 0; i < N; i++) {
    let s = onThePavement(job, deck); const start = s.age;
    for (let t = 0; t < 40 && !s.over; t++) {
      if (s.statuses.housing !== "homeless") { roofed++; yrs.push(s.age - start); break; }
      const d = drawCard(s); s = d.state;
      if (!d.card) { s = quietYear(s); continue; }
      const ds = dirsFor(d.card, s);
      if (!ds.length) { s = quietYear(s); continue; }
      s = chooseDirection(s, d.card, greedy(d.card, s, ds)).state;
    }
    if (s.over) died++;
  }
  console.log(`  ${job.padEnd(14)} ${`${(100*roofed/N).toFixed(0)}%`.padStart(11)} ${String(med(yrs)).padStart(17)} ${`${(100*died/N).toFixed(0)}%`.padStart(15)}`);
}
