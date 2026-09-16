// How reachable is the stage? Sarah's arc ends at an audition that reads
// `relSisterPromise`, a counter fed only by the moments you stepped in and spent
// — and a playtester who did that at every turn but one still missed the ending,
// so the question is how much promise is actually BANKABLE rather than how much
// exists on paper.
//
// Two players: "devoted" takes the option that pleases her most on every card of
// her deck (most promise, love as the tie-break) and plays greedily elsewhere;
// "greedy" is the plain optimiser, and is here as the control — if it reaches
// the stage too, the ending has stopped meaning anything. It does not: it sends
// her to the needle at the crossroads for the wage and almost never sees the
// audition at all, which is what really makes the ballerina rare.
//
// The output to watch is the SPREAD of promise at the audition, not the mean:
// it is lumpy, because three of the six promise cards are one_time and gated to
// her ages 0-4 and most lives never draw any of them.
// Run: node --experimental-strip-types scripts/ballerina.ts [runs] [devoted|greedy]
import { chooseDirection, drawCard, initGame, quietYear, setContent } from "../src/engine/engine.ts";
import { meets } from "../src/engine/conditions.ts";
import { gameContent } from "../src/content/index.ts";
import type { Card, Direction, GameState } from "../src/engine/types.ts";
setContent(gameContent);
const DIRS: Direction[] = ["left", "right", "up", "down"];
const dirsFor = (c: Card, s: GameState) => DIRS.filter((d) => c.options[d] && meets(c.options[d]!.if, s, gameContent));
const prom = (s: GameState) => ((s.traits as any).relSisterPromise ?? 0) as number;
function greedy(c: Card, s: GameState, ds: Direction[]) {
  let best = ds[0], key = -Infinity;
  for (const d of ds) {
    const p = chooseDirection(structuredClone(s), c, d);
    const v = Object.values(p.state.vitals) as number[];
    const k = p.state.over ? -1e9 : Math.min(...v) * 1000 + v.reduce((a, b) => a + b, 0);
    if (k > key) { key = k; best = d; }
  }
  return best;
}
// Devoted: most promise, then most love. The player who is trying to please her.
function devoted(c: Card, s: GameState, ds: Direction[]) {
  let best = ds[0], key = -Infinity;
  for (const d of ds) {
    const p = chooseDirection(structuredClone(s), c, d).state;
    const k = (prom(p) - prom(s)) * 100 + (((p.traits as any).relSisterLove ?? 0) - ((s.traits as any).relSisterLove ?? 0));
    if (k > key) { key = k; best = d; }
  }
  return best;
}
const MODE = process.argv[3] ?? "devoted";
const N = Number(process.argv[2]) || 4000;
const CHILDHOOD = new Set(["rel_sis_dance", "rel_sis_mend", "rel_sis_slippers"]);
let sisters = 0, auditions = 0, stage = 0;
const atAudition: number[] = []; const childSeen = new Map<number, number>(); const seenCard = new Map<string, number>();
for (let i = 0; i < N; i++) {
  let s = initGame(gameContent);
  let hasSis = false, kids = 0, sawAudition = false, gotStage = false, promiseThen = 0;
  const seenHere = new Set<string>();
  for (let t = 0; t < 120 && !s.over; t++) {
    const d = drawCard(s); s = d.state;
    if (!d.card) { s = quietYear(s); continue; }
    if (d.card.deck === "rel_sis") { seenHere.add(d.card.id); if (CHILDHOOD.has(d.card.id)) kids++; }
    if (d.card.id === "rel_sis_audition") { sawAudition = true; promiseThen = prom(s); }
    const ds = dirsFor(d.card, s);
    if (!ds.length) { s = quietYear(s); continue; }
    const pick = (MODE === "devoted" && d.card.deck === "rel_sis") ? devoted(d.card, s, ds) : greedy(d.card, s, ds);
    const after = chooseDirection(s, d.card, pick);
    if (d.card.id === "rel_sis_audition" && /r0$/.test(after.result)) gotStage = true;
    s = after.state;
    if ((s.traits as any).relSisterActive) hasSis = true;
  }
  if (!hasSis) continue;
  sisters++;
  for (const id of seenHere) seenCard.set(id, (seenCard.get(id) ?? 0) + 1);
  childSeen.set(kids, (childSeen.get(kids) ?? 0) + 1);
  if (sawAudition) { auditions++; atAudition.push(promiseThen); if (gotStage) stage++; }
}
atAudition.sort((a, b) => a - b);
const pc = (n: number, d: number) => `${(100 * n / Math.max(1, d)).toFixed(1)}%`;
console.log(`[${MODE}] ${sisters} lives with a sister · ${auditions} reached the audition (${pc(auditions, sisters)})`);
console.log(`  promise at the audition: median ${atAudition[atAudition.length >> 1]}, min ${atAudition[0]}, max ${atAudition[atAudition.length - 1]}`);
const hist = new Map<number, number>(); for (const v of atAudition) hist.set(v, (hist.get(v) ?? 0) + 1);
console.log(`  spread: ${[...hist].sort((a, b) => a[0] - b[0]).map(([v, n]) => `${v}:${pc(n, auditions)}`).join("  ")}`);
console.log(`  reached the stage (>= 9): ${stage} (${pc(stage, auditions)} of auditions, ${pc(stage, sisters)} of lives with a sister)`);
console.log(`  childhood cards seen (of dance/mend/slippers): ${[...childSeen].sort((a, b) => a[0] - b[0]).map(([k, n]) => `${k}:${pc(n, sisters)}`).join("  ")}`);
console.log(`  each card seen: ${[...seenCard].sort((a, b) => b[1] - a[1]).map(([id, n]) => `${id.replace("rel_sis_", "")} ${pc(n, sisters)}`).join(", ")}`);

for (const g of [9, 8, 7, 6, 5]) {
  const n = atAudition.filter((v) => v >= g).length;
  console.log(`  gate ${g}: ${pc(n, auditions)} of auditions reach the stage`);
}
