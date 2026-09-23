// Lilly's cooldown: are her gated beats spaced, do the exempt cards (drift,
// lost, idle) still come, and what does it cost the marriage? Played by
// ambition.ts's "Married to Lilly" player, who takes her cards whenever it can.
import { chooseDirection, drawCard, initGame, quietYear, setContent } from "../src/engine/engine.ts";
import { meets } from "../src/engine/conditions.ts";
import { gameContent } from "../src/content/index.ts";
import type { Card, Direction, GameState } from "../src/engine/types.ts";
setContent(gameContent);
const DIRS: Direction[] = ["left","right","up","down"];
const dirsFor = (c: Card, s: GameState) => DIRS.filter((d) => c.options[d] && meets(c.options[d]!.if, s, gameContent));
const ROUTE: [string, string][] = [["family","courting"],["family","married"]];
const reached = (s: GameState) => { let b = -1; ROUTE.forEach(([k,v],i) => { if ((s.statuses as any)[k] === v) b = i; }); return b; };
const num = (v: unknown) => (typeof v === "number" ? v : 0);
const wantOf = (s: GameState) => 6 * num(s.traits.socialWarmth) + 4 * num(s.traits.relLillyWarmth);
const AMB = 20; let mark = -1, wm = 0;
function pick(c: Card, s: GameState, ds: Direction[]): Direction {
  let best = ds[0], key = -Infinity;
  for (const d of ds) { const p = chooseDirection(structuredClone(s), c, d).state; const v = Object.values(p.vitals) as number[];
    const k = p.over ? -1e9 : Math.min(...v)*1000 + v.reduce((a,b)=>a+b,0) + (Math.max(mark, reached(p))*AMB + Math.max(wm, wantOf(p))*(AMB/20))*1000;
    if (k > key) { key = k; best = d; } }
  return best;
}
const EXEMPT = new Set(["rel_lilly_drift","rel_lilly_lost","rel_lilly_idle"]);
const N = Number(process.argv[2]) || 2500;
let met = 0, married = 0; const marriedAt: number[] = [], gaps: number[] = []; const exempt = new Map<string, number>();
for (let i = 0; i < N; i++) {
  let s = initGame(gameContent); mark = -1; wm = 0; let last = -1, didMeet = false;
  for (let t = 0; t < 120 && !s.over; t++) {
    const d = drawCard(s); s = d.state;
    if (!d.card) { s = quietYear(s); continue; }
    const ds = dirsFor(d.card, s);
    if (!ds.length) { s = quietYear(s); continue; }
    if (d.card.deck === "rel_lilly") {
      if (EXEMPT.has(d.card.id)) exempt.set(d.card.id, (exempt.get(d.card.id) ?? 0) + 1);
      else { if (last >= 0) gaps.push(s.age - last); last = s.age; }
    }
    const wasMarried = s.statuses.family === "married";
    s = chooseDirection(s, d.card, pick(d.card, s, ds)).state;
    if (s.traits.relLillyActive) didMeet = true;
    if (!wasMarried && s.statuses.family === "married") { married++; marriedAt.push(s.age); }
    mark = Math.max(mark, reached(s)); wm = Math.max(wm, wantOf(s));
  }
  if (didMeet) met++;
}
marriedAt.sort((a,b)=>a-b);
console.log(`${N} lives aiming to marry Lilly: met her ${(100*met/N).toFixed(0)}%, MARRIED ${(100*married/N).toFixed(1)}% (${(100*married/Math.max(1,met)).toFixed(0)}% of those who met her), median age at the wedding ${marriedAt[Math.floor(marriedAt.length/2)] ?? "-"}`);
console.log(`gaps between her gated beats: min ${gaps.length ? Math.min(...gaps) : "-"}, share under 4 years ${(100*gaps.filter((g)=>g<4).length/Math.max(1,gaps.length)).toFixed(0)}%`);
console.log(`exempt cards dealt: ` + ["rel_lilly_drift","rel_lilly_lost","rel_lilly_idle"].map((k)=>`${k.replace("rel_lilly_","")} ${exempt.get(k) ?? 0}`).join("  "));
