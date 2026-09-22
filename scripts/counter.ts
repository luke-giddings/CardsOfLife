// A CLEAN A/B ON THE RUIN SWIPES. Comparing "lives of people who chose the
// streets" against "lives of people who chose home" compares two different
// POPULATIONS — the scorer picks each one in different circumstances, so the gap
// is mostly selection. Instead: when the net fires, clone the state and play BOTH
// swipes to the end under the same policy. Same person, same year, same deck.
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

// play a state out to the end, returning the final age
function playOut(s: GameState, amb: number): number {
  let m = reached(s), wm = wantOf(s);
  for (let t=0;t<120 && !s.over;t++) {
    const d = drawCard(s); s = d.state;
    if (!d.card) { s = quietYear(s); continue; }
    const ds = dirsFor(d.card, s);
    if (!ds.length) { s = quietYear(s); continue; }
    let best=ds[0], key=-Infinity;
    for (const dir of ds) { const k = score(chooseDirection(structuredClone(s), d.card, dir).state, m, wm, amb); if (k>key){key=k;best=dir;} }
    s = chooseDirection(s, d.card, best).state;
    m = Math.max(m, reached(s)); wm = Math.max(wm, wantOf(s));
  }
  return s.age;
}

function run(N:number, amb:number) {
  const streets:number[]=[], home:number[]=[]; let n=0; let picked={l:0,r:0};
  for (let i=0;i<N;i++) {
    let s = initGame(gameContent); let m=-1, wm=0; let done=false;
    for (let t=0;t<120 && !s.over;t++) {
      const d = drawCard(s); s = d.state;
      if (!d.card) { s = quietYear(s); continue; }
      const ds = dirsFor(d.card, s);
      if (!ds.length) { s = quietYear(s); continue; }
      let best=ds[0], key=-Infinity;
      for (const dir of ds) { const k = score(chooseDirection(structuredClone(s), d.card, dir).state, m, wm, amb); if (k>key){key=k;best=dir;} }
      if (RUIN.has(d.card.id) && !done) {
        done = true; n++; if (best === "left") picked.l++; else picked.r++;
        streets.push(playOut(chooseDirection(structuredClone(s), d.card, "left").state, amb));
        home.push(playOut(chooseDirection(structuredClone(s), d.card, "right").state, amb));
      }
      s = chooseDirection(s, d.card, best).state;
      m = Math.max(m, reached(s)); wm = Math.max(wm, wantOf(s));
    }
  }
  return { n, streets, home, picked };
}

const N = Number(process.argv[2]) || 300;
for (const amb of [20, 60]) {
  const r = run(N, amb);
  const win = r.streets.filter((a,i) => a > r.home[i]).length;
  console.log(`\n=== ${N} lives, ambition ${amb} — ${r.n} ruins, BOTH swipes played from the same state ===`);
  console.log(`  take to the streets    median final age ${String(med(r.streets)).padStart(3)}   (scorer picked it ${r.picked.l})`);
  console.log(`  go home to your people median final age ${String(med(r.home)).padStart(3)}   (scorer picked it ${r.picked.r})`);
  console.log(`  the streets outlived home in ${(100*win/Math.max(1,r.n)).toFixed(0)}% of the SAME lives`);
}
