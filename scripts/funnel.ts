// TWO QUESTIONS.
// (1) Is the curve really flat? Completion measured CONDITIONAL ON ENTRY hides
//     the funnel: if fewer people reach each tier, the ladder is already getting
//     harder even when the per-tier pass rate holds. Measure the CUMULATIVE share
//     of all lives instead.
// (2) Is "take to the streets" a real choice, or strictly worse than going home?
//     Count which swipe the ruin net actually gets, and what it costs afterwards.
import { chooseDirection, drawCard, initGame, quietYear, setContent } from "../src/engine/engine.ts";
import { meets } from "../src/engine/conditions.ts";
import { gameContent } from "../src/content/index.ts";
import type { Card, Direction, GameState, StatusKind } from "../src/engine/types.ts";
setContent(gameContent);
const ROUTE: [StatusKind,string][] = [["job","studying"],["education","basic"],["job","grammar_school"],["education","grammar"],
  ["job","university"],["education","university"],["job","physician_junior"],["job","physician"],["job","physician_eminent"]];
const WANTS: [string,number][] = [["eduStudy",10],["eduUniFund",25],["jobExperience",6],["persBookish",8]];
const DIRS: Direction[] = ["left","right","up","down"];
const dirsFor = (c: Card, s: GameState) => DIRS.filter((d) => c.options[d] && meets(c.options[d]!.if, s, gameContent));
const reached = (s: GameState) => { let b=-1; ROUTE.forEach(([k,v],i)=>{ if (s.statuses[k]===v) b=i; }); return b; };
const num = (v: unknown) => (typeof v==="number"?v:v===true?1:0);
const wantOf = (s: GameState) => WANTS.reduce((a,[k,w])=>a+w*num((s.traits as any)[k]),0);
function score(s: GameState, m:number, wm:number, amb:number) {
  if (s.over) return -1e9;
  const v = Object.values(s.vitals) as number[];
  return Math.min(...v)*1000 + v.reduce((a,b)=>a+b,0) + (Math.max(m,reached(s))*amb + Math.max(wm,wantOf(s))*(amb/20))*1000;
}
const RUIN = new Set(["edu_grammar_ruin", "edu_university_ruin"]);
const med = (a:number[]) => a.length ? [...a].sort((x,y)=>x-y)[Math.floor(a.length/2)] : NaN;

function run(N:number, amb:number) {
  const ever = {studying:0, grammar:0, uni:0};
  const done = {studying:0, grammar:0, uni:0};
  let streets=0, home=0;
  const afterStreets:number[]=[], afterHome:number[]=[];
  for (let i=0;i<N;i++) {
    let s = initGame(gameContent); let m=-1, wm=0;
    const seen = new Set<string>(); const fin = new Set<string>();
    let ruinAt: {age:number; dir:Direction} | null = null;
    for (let t=0;t<120 && !s.over;t++) {
      const d = drawCard(s); s = d.state;
      if (!d.card) { s = quietYear(s); continue; }
      const ds = dirsFor(d.card, s);
      if (!ds.length) { s = quietYear(s); continue; }
      let best=ds[0], key=-Infinity;
      for (const dir of ds) { const k = score(chooseDirection(structuredClone(s), d.card, dir).state, m, wm, amb); if (k>key){key=k;best=dir;} }
      const wasJob = s.statuses.job;
      if (RUIN.has(d.card.id)) ruinAt = { age: s.age, dir: best };
      s = chooseDirection(s, d.card, best).state;
      const j = s.statuses.job;
      if (j === "studying") seen.add("studying");
      if (j === "grammar_school") { seen.add("grammar"); if (wasJob === "studying") fin.add("studying"); }
      if (j === "shophand" && wasJob === "studying") fin.add("studying");
      if (j === "university") { seen.add("uni"); if (wasJob === "grammar_school") fin.add("grammar"); }
      if (j === "clerk" && wasJob === "grammar_school") fin.add("grammar");
      if (j === "physician_junior" && wasJob === "university") fin.add("uni");
      m = Math.max(m, reached(s)); wm = Math.max(wm, wantOf(s));
    }
    for (const k of ["studying","grammar","uni"] as const) { if (seen.has(k)) (ever as any)[k]++; if (fin.has(k)) (done as any)[k]++; }
    if (ruinAt) {
      const lived = s.age - ruinAt.age;
      if (ruinAt.dir === "left") { streets++; afterStreets.push(lived); } else { home++; afterHome.push(lived); }
    }
  }
  return { ever, done, streets, home, afterStreets, afterHome };
}

const N = Number(process.argv[2]) || 800;
for (const amb of [20, 60]) {
  const r = run(N, amb);
  console.log(`\n=== ${N} lives, ambition ${amb} ===`);
  console.log(`  THE FUNNEL (share of ALL ${N} lives, not of those who turned up)`);
  console.log(`    ${"tier".padEnd(14)} ${"ever entered".padStart(13)} ${"COMPLETED".padStart(11)}`);
  for (const [k, lbl] of [["studying","board school"],["grammar","grammar"],["uni","university"]] as const) {
    console.log(`    ${lbl.padEnd(14)} ${`${(100*(r.ever as any)[k]/N).toFixed(0)}%`.padStart(13)} ${`${(100*(r.done as any)[k]/N).toFixed(0)}%`.padStart(11)}`);
  }
  const tot = r.streets + r.home;
  console.log(`  THE RUIN NET fired ${tot} times`);
  console.log(`    take to the streets  ${String(r.streets).padStart(4)} (${(100*r.streets/Math.max(1,tot)).toFixed(0)}%)   median years lived after: ${med(r.afterStreets)}`);
  console.log(`    go home to your people ${String(r.home).padStart(2)} (${(100*r.home/Math.max(1,tot)).toFixed(0)}%)   median years lived after: ${med(r.afterHome)}`);
}
