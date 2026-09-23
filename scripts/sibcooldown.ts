// NOTE: written to DECIDE the sibling cooldown, before it existed. The real
// per-sibling 3-year cooldown is now in the content, so the "today" column IS
// that cooldown, and the other two columns emulate a second cooldown stacked on
// top of it. Kept for the method; rerun its comparisons against a pre-cooldown
// build if they are ever needed again.
//
// WOULD A COOLDOWN ON THE SIBLING DECKS BREAK ANY BEATS? Simulated without
// touching the engine: before each draw, a sibling deck on cooldown is hidden
// from the DRAW ONLY (the life keeps it, so its age clock still ticks), unless
// it holds the milestone due this turn -- milestones stay exempt.
//   cooldown N = after a sibling card is played, that deck (or both, "shared")
//   deals nothing more for the next N years.
import { chooseDirection, drawCard, eligibleDraw, initGame, quietYear, setContent } from "../src/engine/engine.ts";
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
const SIB = ["rel_bro", "rel_sis"];
// the childhood trios: exempt from the cooldown, as are milestones
const EXEMPT = new Set(["rel_bro_play","rel_bro_bully","rel_bro_share","rel_sis_dance","rel_sis_mend","rel_sis_slippers"]);
const beats = new Map<string, string>(); // card -> deck
for (const d of gameContent.decks) if (SIB.includes(d.id)) for (const c of d.cards) beats.set(c.id, d.id);

function run(N: number, cool: number, shared: boolean) {
  const fired = new Map<string, number>(); const had = new Map<string, number>();
  const apYears: number[] = [];
  // priority-phase draws: years with a priority deck active, split by sibling decks live
  const pri = new Map<number, { draws: number; sib: number }>();
  const PRI = new Set(gameContent.decks.filter((d) => d.priority).map((d) => d.id));
  for (let i = 0; i < N; i++) {
    let s = initGame(gameContent);
    const last: Record<string, number> = {}; const seen = new Set<string>();
    let apAt = -1;
    for (let t = 0; t < 120 && !s.over; t++) {
      for (const d of SIB) if (s.activeDecks.includes(d)) seen.add(d);
      const due = eligibleDraw(s).milestone?.deck;
      const cooling = (d: string) => {
        const refs = shared ? SIB : [d];
        return refs.some((r) => last[r] !== undefined && s.age - last[r] <= cool) && d !== due;
      };
      // Exempt beats (milestones by construction, plus the childhood trios) are
      // drawn as normal. Emulated by drawing from the full pool and, if a cooling
      // deck's non-exempt card comes up, redrawing from a view without that deck.
      let dr = drawCard(s);
      if (cool > 0 && dr.card && SIB.includes(dr.card.deck ?? "") && cooling(dr.card.deck!) && !EXEMPT.has(dr.card.id)) {
        const view = { ...s, activeDecks: s.activeDecks.filter((d) => !(SIB.includes(d) && cooling(d))) };
        dr = drawCard(view);
        dr = { ...dr, state: { ...dr.state, activeDecks: s.activeDecks } };
      }
      s = dr.state;
      if (!dr.card) { s = quietYear(s); continue; }
      const ds = dirsFor(dr.card, s);
      if (!ds.length) { s = quietYear(s); continue; }
      if (s.activeDecks.some((d) => PRI.has(d))) {
        const live = SIB.filter((d) => s.activeDecks.includes(d)).length;
        if (live > 0) {
          if (!pri.has(live)) pri.set(live, { draws: 0, sib: 0 });
          const r = pri.get(live)!; r.draws++; if (beats.has(dr.card.id)) r.sib++;
        }
      }
      if (beats.has(dr.card.id)) {
        fired.set(dr.card.id, (fired.get(dr.card.id) ?? 0) + 1);
        if (!EXEMPT.has(dr.card.id) && dr.card.kind !== "milestone") last[dr.card.deck!] = s.age;
      }
      s = chooseDirection(s, dr.card, greedy(dr.card, s, ds)).state;
      if (apAt < 0 && s.statuses.job === "apprentice") apAt = s.age;
      if (apAt >= 0 && s.statuses.job !== "apprentice") { apYears.push(s.age - apAt); apAt = -2; }
    }
    for (const d of seen) had.set(d, (had.get(d) ?? 0) + 1);
  }
  return { fired, had, apYears, pri };
}
const med = (a: number[]) => a.length ? [...a].sort((x,y)=>x-y)[Math.floor(a.length/2)] : NaN;
const p90 = (a: number[]) => a.length ? [...a].sort((x,y)=>x-y)[Math.floor(0.9*(a.length-1))] : NaN;

const N = Number(process.argv[2]) || 1500;
const arms: [string, number, boolean][] = [["today", 0, false], ["3y per sibling", 3, false], ["3y shared", 3, true]];
const res = arms.map(([l, c, sh]) => ({ l, ...run(N, c, sh) }));
console.log(`${N} greedy lives per arm. % = share of lives with that sibling who ever saw the beat.\n`);
console.log(`  ${"beat".padEnd(20)}${res.map((r) => r.l.padStart(16)).join("")}`);
for (const [id, deck] of beats) {
  const cells = res.map((r) => `${(100*(r.fired.get(id) ?? 0)/Math.max(1, r.had.get(deck) ?? 0)).toFixed(0)}%`.padStart(16));
  console.log(`  ${id.padEnd(20)}${cells.join("")}`);
}
for (const live of [1, 2]) console.log(`\n  ${`priority draws, ${live} sib`.padEnd(20)}${res.map((r) => { const x = r.pri.get(live); return x ? `${(100*x.sib/x.draws).toFixed(0)}% sibling`.padStart(16) : "".padStart(16); }).join("")}`);
console.log(`\n  ${"apprenticeship yrs".padEnd(20)}${res.map((r) => `med ${med(r.apYears)} / 90th ${p90(r.apYears)}`.padStart(16)).join("")}`);
