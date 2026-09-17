// Does anybody actually meet Lilly, and how far does her story get?
//
// Three players, because the deck is scored on counters none of them can see on
// the card face:
//   cold    — greedy, and pays a magnitude step to avoid warmth of any kind.
//   greedy  — greedy, indifferent. What a player who hasn't worked it out lands on.
//   devoted — greedy, but values socialWarmth AND Lilly's own warmth. The ceiling.
// Reports reach (did you meet her), depth (how far the arc ran), and pool
// pressure (what share of a life's draws her deck took), because a person-deck
// that half the pool is is a person-deck that has crowded out the rest of the game.
// Run: node --experimental-strip-types scripts/lilly.ts [runs]
import { chooseDirection, drawCard, initGame, quietYear, setContent } from "../src/engine/engine.ts";
import { meets } from "../src/engine/conditions.ts";
import { gameContent } from "../src/content/index.ts";
import type { Card, Direction, GameState } from "../src/engine/types.ts";
setContent(gameContent);

const DIRS: Direction[] = ["left", "right", "up", "down"];
const dirsFor = (c: Card, s: GameState) =>
  DIRS.filter((d) => c.options[d] && meets(c.options[d]!.if, s, gameContent));

const score = (s: GameState, warm: number): number => {
  const v = Object.values(s.vitals) as number[];
  if (s.over) return -1e9;
  const hers = s.traits.relLillyWarmth + s.traits.socialWarmth;
  return Math.min(...v) * 1000 + v.reduce((a, b) => a + b, 0) + warm * hers;
};

function pick(c: Card, s: GameState, ds: Direction[], warm: number): Direction {
  let best = ds[0], key = -Infinity;
  for (const d of ds) {
    const k = score(chooseDirection(structuredClone(s), c, d).state, warm);
    if (k > key) { key = k; best = d; }
  }
  return best;
}

const N = Number(process.argv[2]) || 2000;
const HERS = new Set((gameContent.decks.find((d) => d.id === "rel_lilly")?.cards ?? []).map((c) => c.id));

function run(label: string, warm: number) {
  let met = 0, offered = 0, courted = 0, married = 0, lost = 0, pushed = 0, spoiled = 0, ownplace = 0;
  const where = new Map<string, number>();
  const warmths: number[] = [], ages: number[] = [];
  let hers = 0, all = 0;
  for (let i = 0; i < N; i++) {
    let s = initGame(gameContent);
    let sawIntro = false;
    for (let t = 0; t < 120 && !s.over; t++) {
      const d = drawCard(s); s = d.state;
      if (!d.card) { s = quietYear(s); continue; }
      all++;
      if (HERS.has(d.card.id)) hers++;
      if (d.card.id === "fam_single_lilly") sawIntro = true;
      const ds = dirsFor(d.card, s);
      if (!ds.length) { s = quietYear(s); continue; }
      const before = s.traits.relLillyWarmth;
      const dir = pick(d.card, s, ds, warm);
      s = chooseDirection(s, d.card, dir).state;
      if (d.card.id === "rel_lilly_more" && dir === "left") {
        pushed++; if (s.traits.relLillyWarmth < before) spoiled++;
      }
      if (d.card.id === "rel_lilly_ownplace" && dir === "left") ownplace++;
    }
    if (sawIntro) offered++;
    if (s.traits.relLillyMet !== "none") {
      met++;
      where.set(s.traits.relLillyMet, (where.get(s.traits.relLillyMet) ?? 0) + 1);
      warmths.push(s.traits.relLillyWarmth);
    }
    if (s.statuses.family === "courting") courted++;
    if (s.statuses.family === "married") married++;
    if (s.log.some((e) => e.id === "log.lillylost")) lost++;
    ages.push(s.age);
  }
  const pc = (n: number) => `${(100 * n / N).toFixed(1)}%`;
  warmths.sort((a, b) => a - b);
  console.log(`\n${label}`);
  console.log(`  intro offered   ${pc(offered)}    met her ${pc(met)}   [${[...where].map(([k, v]) => `${k} ${(100 * v / Math.max(met, 1)).toFixed(0)}%`).join(", ") || "—"}]`);
  if (warmths.length)
    console.log(`  her warmth      median ${warmths[warmths.length >> 1]}, p90 ${warmths[Math.floor(warmths.length * 0.9)]}, max ${warmths[warmths.length - 1]}  (of those who met her)`);
  console.log(`  said it         ${pc(pushed)}  of which spoiled ${pushed ? (100 * spoiled / pushed).toFixed(0) : 0}%     showed her the new place ${pc(ownplace)}`);
  console.log(`  ended courting  ${pc(courted)}    married ${pc(married)}    lost her ${pc(lost)}`);
  console.log(`  pool pressure   ${(100 * hers / all).toFixed(1)}% of all draws     mean age ${(ages.reduce((a, b) => a + b, 0) / N).toFixed(1)}`);
}

console.log(`${N} lives each`);
run("cold (pays a step to avoid company)", -12);
run("greedy (indifferent — none of it is on the card face)", 0);
run("devoted (values her, and the warmth that buys her)", 12);
