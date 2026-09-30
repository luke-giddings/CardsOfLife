// The presence clocks (rel*Distance): what they read at the cards that branch on
// them, and which branch each life got. Played by a "caring" player: greedy on
// vitals, but on a relationship card it takes whatever raises that person's
// love/warmth most — the player these clocks are meant to reward. Run before
// and after a change to the clocks, and compare.
import { chooseDirection, drawCard, initGame, quietYear, setContent } from "../src/engine/engine.ts";
import { meets } from "../src/engine/conditions.ts";
import { gameContent } from "../src/content/index.ts";
import type { Card, Direction, GameState } from "../src/engine/types.ts";
setContent(gameContent);
const DIRS: Direction[] = ["left","right","up","down"];
const dirsFor = (c: Card, s: GameState) => DIRS.filter((d) => c.options[d] && meets(c.options[d]!.if, s, gameContent));
const num = (v: unknown) => (typeof v === "number" ? v : 0);
const love = (s: GameState) => num(s.traits.relBrotherLove) + num(s.traits.relSisterLove) + num(s.traits.relLillyWarmth);
function pick(c: Card, s: GameState, ds: Direction[]): Direction {
  const rel = (c.deck ?? "").startsWith("rel_") || c.id === "fam_single_lilly";
  let best = ds[0], key = -Infinity;
  for (const d of ds) {
    const p = chooseDirection(structuredClone(s), c, d).state; const v = Object.values(p.vitals) as number[];
    const k = p.over ? -1e12 : (rel ? love(p) * 1e6 : 0) + Math.min(...v) * 1000 + v.reduce((a, b) => a + b, 0);
    if (k > key) { key = k; best = d; }
  }
  return best;
}
const WATCH: Record<string, string> = {
  rel_bro_rift: "relBrotherDistance", rel_bro_settled: "relBrotherDistance", rel_bro_fate: "relBrotherDistance",
  rel_sis_settled: "relSisterDistance", rel_sis_fate: "relSisterDistance",
  rel_lilly_drift: "relLillyDistance", rel_lilly_lost: "relLillyDistance",
};
const N = Number(process.argv[2]) || 2000;
const seen = new Map<string, number[]>(); const res = new Map<string, Map<string, number>>();
let married = 0, metLilly = 0;
for (let i = 0; i < N; i++) {
  let s = initGame(gameContent, i + 1);
  for (let t = 0; t < 120 && !s.over; t++) {
    const d = drawCard(s); s = d.state;
    if (!d.card) { s = quietYear(s); continue; }
    const ds = dirsFor(d.card, s);
    if (!ds.length) { s = quietYear(s); continue; }
    const w = WATCH[d.card.id];
    if (w) { (seen.get(d.card.id) ?? seen.set(d.card.id, []).get(d.card.id)!).push(num(s.traits[w as keyof typeof s.traits])); }
    const r = chooseDirection(s, d.card, pick(d.card, s, ds));
    if (w) { const m = res.get(d.card.id) ?? res.set(d.card.id, new Map()).get(d.card.id)!; const key = String((r as any).result ?? (r as any).outcome?.result ?? "?"); m.set(key, (m.get(key) ?? 0) + 1); }
    const wasMarried = s.statuses.family === "married";
    s = r.state;
    if (!wasMarried && s.statuses.family === "married") married++;
  }
  if (s.traits.relLillyActive || s.traits.relLillyStoryDone) metLilly++;
}
const q = (a: number[], p: number) => { const b = [...a].sort((x, y) => x - y); return b[Math.floor(p * (b.length - 1))]; };
console.log(`${N} lives (caring player). married ${(100 * married / N).toFixed(1)}%, met Lilly ${(100 * metLilly / N).toFixed(0)}%`);
for (const id of Object.keys(WATCH)) {
  const a = seen.get(id) ?? [];
  const r = [...(res.get(id) ?? new Map()).entries()].sort().map(([k, v]) => `${k.replace(id + ".", "")} ${v}`).join(", ");
  console.log(`${id.padEnd(16)} dealt ${String(a.length).padStart(5)}  distance p10/50/90 ${a.length ? `${q(a, .1)}/${q(a, .5)}/${q(a, .9)}` : "-"}  | ${r}`);
}
