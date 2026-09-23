// How long does an apprenticeship last, and what does it spend while it lasts?
// A real indenture ran about seven years. The apprentice deck is `priority`, but
// the two sibling decks are `neverSuppressed`, so their story beats share the
// pool with the trade -- and each year spent apprenticed is a year of a
// sibling's arc played out while the life itself stands still.
import { chooseDirection, drawCard, initGame, quietYear, setContent } from "../src/engine/engine.ts";
import { meets } from "../src/engine/conditions.ts";
import { gameContent } from "../src/content/index.ts";
import type { Card, Direction, GameState } from "../src/engine/types.ts";
const DIRS: Direction[] = ["left","right","up","down"];
const dirsFor = (c: Card, s: GameState) => DIRS.filter((d) => c.options[d] && meets(c.options[d]!.if, s, gameContent));
// The player who WANTS the trade: ambition.ts's "Master craftsman" goal. Greedy
// is the wrong instrument here -- it never qualifies, it walks out through
// job_apprentice_end, so it measures time-until-quitting, not time-to-finish.
const ROUTE: [string, string][] = [["job","apprentice"],["job","journeyman"],["job","master"]];
const reached = (s: GameState) => { let b = -1; ROUTE.forEach(([k,v],i) => { if ((s.statuses as any)[k] === v) b = i; }); return b; };
const wantOf = (s: GameState) => 30 * (s.traits.jobSkill as number) + 6 * (s.traits.jobExperience as number);
const AMB = 20;
let mark = -1, wm = 0;
function greedy(c: Card, s: GameState, ds: Direction[]): Direction {
  let best = ds[0], key = -Infinity;
  for (const d of ds) {
    const p = chooseDirection(structuredClone(s), c, d).state;
    const v = Object.values(p.vitals) as number[];
    const k = p.over ? -1e9 : Math.min(...v)*1000 + v.reduce((a,b)=>a+b,0)
      + (Math.max(mark, reached(p))*AMB + Math.max(wm, wantOf(p))*(AMB/20))*1000;
    if (k > key) { key = k; best = d; }
  }
  return best;
}
const pct = (a: number[], q: number) => a.length ? [...a].sort((x,y)=>x-y)[Math.floor(q*(a.length-1))] : NaN;

function run(N: number, label: string) {
  setContent(gameContent);
  const yrs: number[] = [], relDraws: number[] = [], tradeDraws: number[] = [];
  const lateY: number[] = [], lateRel: number[] = [];
  // split by how many sibling decks were live on the day of the indenture
  const bySibs = new Map<number, { y: number[]; r: number[]; q: number }>();
  const how = new Map<string, number>();
  for (let i = 0; i < N; i++) {
    let s = initGame(gameContent); let at = -1, rel = 0, trade = 0, startAge = 0, sibs = 0; mark = -1; wm = 0;
    for (let t = 0; t < 120 && !s.over; t++) {
      const d = drawCard(s); s = d.state;
      if (!d.card) { s = quietYear(s); continue; }
      const ds = dirsFor(d.card, s);
      if (!ds.length) { s = quietYear(s); continue; }
      const inIt = s.statuses.job === "apprentice";
      if (inIt) { if (d.card.deck?.startsWith("rel_")) rel++; if (d.card.deck === "job_apprentice") trade++; }
      s = chooseDirection(s, d.card, greedy(d.card, s, ds)).state;
      mark = Math.max(mark, reached(s)); wm = Math.max(wm, wantOf(s));
      if (at < 0 && s.statuses.job === "apprentice") { at = s.age; startAge = s.age;
        sibs = ["rel_bro","rel_sis"].filter((d) => s.activeDecks.includes(d)).length; }
      if (at >= 0 && (s.statuses.job !== "apprentice" || s.over)) {
        yrs.push(s.age - at); relDraws.push(rel); tradeDraws.push(trade);
        if (startAge >= 18) { lateY.push(s.age - at); lateRel.push(rel); }
        if (!bySibs.has(sibs)) bySibs.set(sibs, { y: [], r: [], q: 0 });
        const b = bySibs.get(sibs)!; b.y.push(s.age - at); b.r.push(rel); if (s.statuses.job === "journeyman") b.q++;
        const k = s.over ? "died" : s.statuses.job;
        how.set(k, (how.get(k) ?? 0) + 1);
        at = -2; // one spell per life
        if (at === -2) break;
      }
    }
  }
  const n = yrs.length;
  console.log(`\n${label}: ${n} apprenticeships`);
  console.log(`  years apprenticed   median ${pct(yrs,.5)}   75th pct ${pct(yrs,.75)}   90th pct ${pct(yrs,.9)}`);
  console.log(`  draws during it     trade cards median ${pct(tradeDraws,.5)}   SIBLING cards median ${pct(relDraws,.5)} (90th pct ${pct(relDraws,.9)})`);
  console.log(`  indentured at 18+   ${lateY.length} of them: years median ${pct(lateY,.5)} (90th ${pct(lateY,.9)}), sibling cards median ${pct(lateRel,.5)} (90th ${pct(lateRel,.9)})`);
  for (const [k, b] of [...bySibs].sort((a,b)=>a[0]-b[0]))
    console.log(`  ${k} sibling deck(s) live: ${String(b.y.length).padStart(4)} spells   years median ${pct(b.y,.5)} 90th ${pct(b.y,.9)}   sibling cards median ${pct(b.r,.5)} 90th ${pct(b.r,.9)}   qualified ${(100*b.q/b.y.length).toFixed(0)}%`);
  console.log(`  ended as            ` + [...how].sort((a,b)=>b[1]-a[1]).map(([k,v])=>`${k} ${(100*v/n).toFixed(0)}%`).join("  "));
}

const N = Number(process.argv[2]) || 3000;
run(N, "AS BUILT (apprentice one-shots weight 1)");
// In-memory variant only -- the content files are not touched.
const deck = gameContent.decks.find((d) => d.id === "job_apprentice")!;
for (const c of deck.cards) if (c.kind === "one_time" && c.id !== "job_apprentice_end") (c as any).weight = 3;
run(N, "VARIANT (apprentice one-shots weight 3, the house style for work decks)");
