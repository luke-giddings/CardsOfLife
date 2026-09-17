// How much socialWarmth does a life actually bank, and how often are the cards
// that pay it even offered?
//
// socialWarmth is the currency the relationship decks are bought with: an intro
// card costs some of it, and how many people a life comes to know falls out of
// the balance rather than out of a cap. So the two numbers that matter are the
// SUPPLY (how much a life can bank if it wants to) and the FLOOR (what a life
// banks when it is not trying) — the gap between them is the room an intro gate
// has to sit in.
//
// Two players, because one would lie:
//   greedy   — maximises the weakest vital one year ahead. socialWarmth is an
//              `incTraits` payload and draws nothing on the card face, so this
//              player declines it on principle. This is the FLOOR.
//   sociable — same, but breaks ties towards warmth and pays up to one
//              magnitude step of vitals for it. This is the SUPPLY.
// Run: node --experimental-strip-types scripts/social.ts [runs]
import { chooseDirection, drawCard, initGame, quietYear, setContent } from "../src/engine/engine.ts";
import { meets } from "../src/engine/conditions.ts";
import { gameContent } from "../src/content/index.ts";
import type { Card, Direction, GameState } from "../src/engine/types.ts";
setContent(gameContent);

const DIRS: Direction[] = ["left", "right", "up", "down"];
const dirsFor = (c: Card, s: GameState): Direction[] =>
  DIRS.filter((d) => c.options[d] && meets(c.options[d]!.if, s, gameContent));

const vitalScore = (s: GameState): number => {
  const v = Object.values(s.vitals) as number[];
  return Math.min(...v) * 1000 + v.reduce((a, b) => a + b, 0);
};

// `warm` weights a point of socialWarmth against vitals. 0 is the greedy player.
function pick(c: Card, s: GameState, ds: Direction[], warm: number): Direction {
  let best = ds[0], key = -Infinity;
  for (const d of ds) {
    const probe = chooseDirection(structuredClone(s), c, d);
    const gained = probe.state.traits.socialWarmth - s.traits.socialWarmth;
    const k = probe.state.over ? -1e9 : vitalScore(probe.state) + warm * gained;
    if (k > key) { key = k; best = d; }
  }
  return best;
}

const N = Number(process.argv[2]) || 2000;
const FAM = new Set(
  (gameContent.decks.find((d) => d.id === "fam_single")?.cards ?? []).map((c) => c.id),
);

function run(warm: number) {
  const warmth: number[] = [], ages: number[] = [];
  const seen = new Map<string, number>();  // fam_single card -> lives it was drawn in
  let famDraws = 0, draws = 0;
  for (let i = 0; i < N; i++) {
    let s = initGame(gameContent);
    const mine = new Set<string>();
    for (let turn = 0; turn < 120 && !s.over; turn++) {
      const d = drawCard(s); s = d.state;
      if (!d.card) { s = quietYear(s); continue; }
      draws++;
      if (FAM.has(d.card.id)) { famDraws++; mine.add(d.card.id); }
      const ds = dirsFor(d.card, s);
      if (!ds.length) { s = quietYear(s); continue; }
      s = chooseDirection(s, d.card, pick(d.card, s, ds, warm)).state;
    }
    for (const id of mine) seen.set(id, (seen.get(id) ?? 0) + 1);
    warmth.push(s.traits.socialWarmth);
    ages.push(s.age);
  }
  warmth.sort((a, b) => a - b);
  const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
  console.log(`  mean warmth     ${mean(warmth).toFixed(1)}   (median ${warmth[N >> 1]}, p90 ${warmth[Math.floor(N * 0.9)]}, max ${warmth[N - 1]})`);
  console.log(`  mean age        ${mean(ages).toFixed(1)}`);
  console.log(`  fam_single      ${(famDraws / N).toFixed(2)} draws per life, ${(100 * famDraws / draws).toFixed(1)}% of all draws`);
  for (const c of gameContent.decks.find((d) => d.id === "fam_single")?.cards ?? [])
    console.log(`    ${c.id.padEnd(22)} seen in ${(100 * (seen.get(c.id) ?? 0) / N).toFixed(1)}% of lives`);
}

console.log(`${N} lives — greedy (the floor: socialWarmth is invisible to it)`);
run(0);
console.log(`\n${N} lives — sociable (the supply: pays up to a step for warmth)`);
run(12);
