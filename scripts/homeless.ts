// THE STREETS SHOULD BE A TRANSIT STATE. You should not last long out there, and
// the reason should be that you get OUT -- into renting, off the back of whatever
// job you hold, the criminal career included. So: how long is a homeless spell,
// how does it end, and does holding a job actually shorten it?
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

const N = Number(process.argv[2]) || 1500;
const ends = new Map<string, number>();
const arrive: Record<string, number[]> = { finances: [], happiness: [], health: [], spirit: [] };
const killed = new Map<string, number>();
const yrs: number[] = [];
const byJob = new Map<string, {n:number; esc:number; yrs:number[]}>();
let spells = 0, everHomeless = 0;
for (let i = 0; i < N; i++) {
  let s = initGame(gameContent);
  let inS = false, since = 0, jobAt = "";
  let counted = false;
  for (let t = 0; t < 120 && !s.over; t++) {
    const d = drawCard(s); s = d.state;
    if (!d.card) { s = quietYear(s); continue; }
    const ds = dirsFor(d.card, s);
    if (!ds.length) { s = quietYear(s); continue; }
    s = chooseDirection(s, d.card, greedy(d.card, s, ds)).state;
    const h = s.statuses.housing;
    if (!inS && h === "homeless") {
      inS = true; since = s.age; jobAt = s.statuses.job; spells++;
      for (const k of Object.keys(arrive)) arrive[k].push((s.vitals as any)[k]);
      if (!counted) { counted = true; everHomeless++; }
    } else if (inS && (h !== "homeless" || s.over)) {
      const how = s.over ? "DIED on the streets" : `-> ${h}`;
      if (s.over) for (const [k, v] of Object.entries(s.vitals)) if (v <= 0) killed.set(k, (killed.get(k) ?? 0) + 1);
      ends.set(how, (ends.get(how) ?? 0) + 1);
      const n = s.age - since; yrs.push(n);
      if (!byJob.has(jobAt)) byJob.set(jobAt, {n:0, esc:0, yrs:[]});
      const r = byJob.get(jobAt)!; r.n++; r.yrs.push(n); if (h === "renting") r.esc++;
      inS = false;
    }
  }
  if (inS) { ends.set(s.over ? "DIED on the streets" : "still out there", (ends.get(s.over ? "DIED on the streets" : "still out there") ?? 0) + 1); yrs.push(s.age - since); }
}
console.log(`${N} greedy lives — ${everHomeless} (${(100*everHomeless/N).toFixed(0)}%) slept rough at least once, ${spells} spells\n`);
console.log(`  median years on the streets: ${med(yrs)}   (mean ${(yrs.reduce((a,b)=>a+b,0)/Math.max(1,yrs.length)).toFixed(1)})`);
console.log(`  how the spell ended:`);
for (const [k,n] of [...ends].sort((a,b)=>b[1]-a[1])) console.log(`    ${k.padEnd(26)} ${String(n).padStart(5)}  ${(100*n/spells).toFixed(0)}%`);
console.log(`\n  vitals THE DAY YOU HIT THE STREET (median): ` +
  Object.entries(arrive).map(([k,v]) => `${k} ${med(v)}`).join("  "));
console.log(`  the vital that finished them: ` + [...killed].sort((a,b)=>b[1]-a[1]).map(([k,n])=>`${k} ${n}`).join("  "));
console.log(`\n  by the job held when you hit the street (the escape is supposed to come from work):`);
console.log(`    ${"job".padEnd(18)} ${"spells".padStart(7)} ${"-> renting".padStart(11)} ${"median yrs".padStart(11)}`);
for (const [j,r] of [...byJob].sort((a,b)=>b[1].n-a[1].n).slice(0,9))
  console.log(`    ${j.padEnd(18)} ${String(r.n).padStart(7)} ${`${(100*r.esc/r.n).toFixed(0)}%`.padStart(11)} ${String(med(r.yrs)).padStart(11)}`);
