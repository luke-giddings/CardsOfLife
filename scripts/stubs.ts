// A CENSUS OF THE WORK DECKS. A "day + loss" stub is a deck with only its routine
// card and its way of losing the job -- nothing to DO, so no one-shots to earn
// experience on and no way to promote. Cross-referenced with how often the job is
// actually held, because a thin deck on a job nobody reaches is cheap and a thin
// deck on a common one is what people play.
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
// which job status each deck belongs to
const jobOf = new Map<string, string>();
for (const [job, def] of Object.entries(gameContent.statuses.job.states as any))
  for (const d of ((def as any).addDecks ?? [])) jobOf.set(d, job);

const N = Number(process.argv[2]) || 2000;
const held = new Map<string, number>(), yrs = new Map<string, number>();
for (let i = 0; i < N; i++) {
  let s = initGame(gameContent); const mine = new Set<string>();
  for (let t = 0; t < 120 && !s.over; t++) {
    mine.add(s.statuses.job); yrs.set(s.statuses.job, (yrs.get(s.statuses.job) ?? 0) + 1);
    const d = drawCard(s); s = d.state;
    if (!d.card) { s = quietYear(s); continue; }
    const ds = dirsFor(d.card, s);
    if (!ds.length) { s = quietYear(s); continue; }
    s = chooseDirection(s, d.card, greedy(d.card, s, ds)).state;
  }
  for (const j of mine) held.set(j, (held.get(j) ?? 0) + 1);
}

const rows: any[] = [];
for (const deck of gameContent.decks) {
  const job = jobOf.get(deck.id);
  if (!job) continue;
  const cards = deck.cards ?? [];
  const ones = cards.filter((c) => c.kind === "one_time").length;
  const promotes = cards.some((c) => DIRS.some((d) => (c.options[d]?.outcomes ?? []).some((o) => (o.effects as any)?.setStatus?.job)));
  rows.push({ deck: deck.id, job, n: cards.length, ones, promotes,
    pct: 100*(held.get(job) ?? 0)/N, yrs: (yrs.get(job) ?? 0)/N });
}
rows.sort((a,b) => b.pct - a.pct || b.yrs - a.yrs);
console.log(`${N} greedy lives. A deck needs ONE-SHOTS to earn a promotion on, and a WAY OUT.\n`);
console.log(`  ${"deck".padEnd(20)} ${"cards".padStart(6)} ${"1-shots".padStart(8)} ${"exit?".padStart(6)} ${"held by".padStart(8)} ${"yrs/life".padStart(9)}  verdict`);
for (const r of rows) {
  // A DAY+LOSS STUB is a two-card deck: the routine and the way you lose it.
  // "No one-shots" is a weaker finding -- job_criminal has four fillers that
  // include two earners and a promote, so it is thin, not a stub. Do not collapse
  // the two: an earlier version of this script called the criminal deck a stub on
  // the one-shot count alone and that was simply wrong.
  const stub = r.n <= 2;
  const verdict = stub && r.pct >= 1 ? "DAY+LOSS STUB, and people live here"
    : stub ? "day+loss stub (unreached)"
    : r.ones === 0 ? "thin: no one-shots to earn on"
    : "";
  console.log(`  ${r.deck.padEnd(20)} ${String(r.n).padStart(6)} ${String(r.ones).padStart(8)} ${(r.promotes?"yes":"NO").padStart(6)} ${`${r.pct.toFixed(1)}%`.padStart(8)} ${r.yrs.toFixed(2).padStart(9)}  ${verdict}`);
}
