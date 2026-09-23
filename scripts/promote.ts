// Does a qualified worker actually get promoted? For each ladder, follow every
// spell in the job that reaches its promotion gate and see how it ends: the
// promotion, the sack, death, or still waiting when the life ends -- and how
// many years the qualified wait took. Compared at the promotion card's current
// weight and at 6, the weight job_labour_factory already carries for the
// reason given in its comment (in memory only; content untouched).
import { chooseDirection, drawCard, initGame, quietYear, setContent } from "../src/engine/engine.ts";
import { meets } from "../src/engine/conditions.ts";
import { gameContent } from "../src/content/index.ts";
import type { Card, Direction, GameState } from "../src/engine/types.ts";
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
// job -> [its deck's promotion card, the experience gate]
const LADDERS: Record<string, [string, number]> = {
  factory: ["job_factory_promote", 3], labourer: ["job_labour_factory", 3],
  shophand: ["job_shop_promote", 3], clerk: ["job_clerk_promote", 3], journeyman: ["job_journeyman_promote", 4],
};
const card = (id: string) => gameContent.decks.flatMap((d) => d.cards).find((c) => c.id === id)!;
const med = (a: number[]) => a.length ? [...a].sort((x,y)=>x-y)[Math.floor(a.length/2)] : NaN;

function run(N: number) {
  setContent(gameContent);
  const r: Record<string, { n: number; up: number; sacked: number; died: number; waiting: number; yrs: number[] }> = {};
  for (let i = 0; i < N; i++) {
    let s = initGame(gameContent);
    let job = "", since = -1; // since = age the gate was met in this job
    const close = (how: "up" | "sacked" | "died" | "waiting") => {
      if (since < 0) return; const x = (r[job] ??= { n: 0, up: 0, sacked: 0, died: 0, waiting: 0, yrs: [] });
      x.n++; x[how]++; if (how === "up") x.yrs.push(s.age - since); since = -1;
    };
    for (let t = 0; t < 120 && !s.over; t++) {
      const d = drawCard(s); s = d.state;
      if (!d.card) { s = quietYear(s); continue; }
      const ds = dirsFor(d.card, s);
      if (!ds.length) { s = quietYear(s); continue; }
      const before = s.statuses.job;
      s = chooseDirection(s, d.card, greedy(d.card, s, ds)).state;
      const now = s.statuses.job;
      if (since >= 0 && (now !== job || s.over)) close(s.over ? "died" : now === "unemployed" || now === "pauper" ? "sacked" : "up");
      if (LADDERS[now] && since < 0 && (s.traits.jobExperience as number) >= LADDERS[now][1] && !s.over) { job = now; since = s.age; }
      void before;
    }
    close(s.over ? "died" : "waiting");
  }
  return r;
}
function report(label: string, r: ReturnType<typeof run>) {
  console.log(`\n${label}`);
  console.log(`  ${"job".padEnd(11)} ${"qualified".padStart(9)} ${"PROMOTED".padStart(9)} ${"sacked".padStart(7)} ${"died".padStart(6)} ${"median yrs".padStart(11)}`);
  for (const j of Object.keys(LADDERS)) { const x = r[j]; if (!x) { console.log(`  ${j.padEnd(11)} ${"0".padStart(9)}`); continue; }
    const p = (k: number) => `${(100*k/x.n).toFixed(0)}%`;
    console.log(`  ${j.padEnd(11)} ${String(x.n).padStart(9)} ${p(x.up).padStart(9)} ${p(x.sacked).padStart(7)} ${p(x.died).padStart(6)} ${String(med(x.yrs)).padStart(11)}`); }
}
const N = Number(process.argv[2]) || 3000;
const weights: Record<string, number | undefined> = {};
for (const [, [id]] of Object.entries(LADDERS)) weights[id] = card(id).weight;
// The four ladders' promotion cards now carry weight 6 in the content; this
// reruns the before/after by putting them back to 1 in memory.
report("AS BUILT (promotion cards at weight 6)", run(N));
for (const id of ["job_factory_promote","job_shop_promote","job_clerk_promote","job_journeyman_promote"]) (card(id) as any).weight = 1;
report("FOR COMPARISON: those four back at weight 1", run(N));
