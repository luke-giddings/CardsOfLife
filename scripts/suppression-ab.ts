// A/B for Deck.neverSuppressed: does exempting the sibling arcs from priority
// suppression actually save their age-gated beats, and what does it cost the
// urgent decks it dilutes? Plays the same number of greedy lives with the flag
// off and on — it is toggled on the live content in one process, so the only
// difference between the two halves is the flag itself.
//
// Read it as a trade. "beats seen / life" is the benefit: windows gated on a
// SIBLING's age that would otherwise have closed unseen. "drawn from a sibling
// deck" while urgent is the cost: draws taken away from the cards that get you
// out of gaol, the workhouse or unemployment. The urgent pool is small (~3.6
// cards), so even one extra card in it is a large proportional dilution.
// Run: node --experimental-strip-types scripts/suppression-ab.ts [runs]
import { chooseDirection, drawCard, eligibleDraw, initGame, quietYear, setContent } from "../src/engine/engine.ts";
import { meets } from "../src/engine/conditions.ts";
import { gameContent } from "../src/content/index.ts";
import type { Direction, GameState } from "../src/engine/types.ts";
setContent(gameContent);

const RUNS = Number(process.argv[2]) || 3000;
const DIRS: Direction[] = ["left", "right", "up", "down"];
const REL = new Set(["rel_bro", "rel_sis"]);
const PRIORITY = new Set(gameContent.decks.filter((d) => d.priority).map((d) => d.id));

function availDirs(card: any, s: GameState): Direction[] {
  return DIRS.filter((d) => card.options[d] && meets(card.options[d].if, s, gameContent));
}
// Greedy: lift the weakest vital, never willingly die. The realistic player.
function greedyDir(card: any, s: GameState, dirs: Direction[]): Direction {
  let best = dirs[0], bestKey = -Infinity;
  for (const d of dirs) {
    const probe = chooseDirection(structuredClone(s), card, d);
    const v = probe.state.vitals;
    const key = probe.state.over ? -1e9 : Math.min(...Object.values(v)) * 1000 + Object.values(v).reduce((a, b) => a + b, 0);
    if (key > bestKey) { bestKey = key; best = d; }
  }
  return best;
}

function run() {
  const t = { lives: 0, broSeen: 0, broDone: 0, sisSeen: 0, sisDone: 0,
              urgentYears: 0, relDrawsWhileUrgent: 0, drawsWhileUrgent: 0,
              urgentPool: 0, urgentPoolN: 0, yearsInPriority: 0, age: 0 };
  for (let i = 0; i < RUNS; i++) {
    let s = initGame(gameContent);
    let broBeats = 0, sisBeats = 0;
    for (let turn = 0; turn < 120 && !s.over; turn++) {
      const { pool } = eligibleDraw(s);
      const urgentActive = pool.some((c) => c.deck && PRIORITY.has(c.deck));
      const d = drawCard(s); s = d.state;
      if (!d.card) { s = quietYear(s); continue; }
      if (urgentActive) {
        t.drawsWhileUrgent++;
        t.urgentPool += pool.length; t.urgentPoolN++;
        if (d.card.deck && REL.has(d.card.deck)) t.relDrawsWhileUrgent++;
      }
      if (d.card.deck === "rel_bro") broBeats++;
      if (d.card.deck === "rel_sis") sisBeats++;
      const dirs = availDirs(d.card, s);
      if (!dirs.length) { s = quietYear(s); continue; }
      s = chooseDirection(s, d.card, greedyDir(d.card, s, dirs)).state;
    }
    t.lives++; t.age += s.age;
    const tr: any = s.traits;
    if (tr.relBrotherActive) { t.broSeen += broBeats; t.broDone += tr.relBrotherStoryDone ? 1 : 0; }
    if (tr.relSisterActive) { t.sisSeen += sisBeats; t.sisDone += tr.relSisterStoryDone ? 1 : 0; }
  }
  return t;
}

const set = (on: boolean) => { for (const d of gameContent.decks) if (REL.has(d.id)) (d as any).neverSuppressed = on; };
const pct = (a: number, b: number) => b ? (100 * a / b).toFixed(1) + "%" : "—";

for (const on of [false, true]) {
  set(on);
  const t = run();
  console.log(`\n=== neverSuppressed ${on ? "ON " : "OFF"} · ${t.lives} greedy lives ===`);
  console.log(`  mean age at death        ${(t.age / t.lives).toFixed(1)}`);
  console.log(`  Tom  beats seen / life   ${(t.broSeen / t.lives).toFixed(2)}   arc concluded ${pct(t.broDone, t.lives)}`);
  console.log(`  Sarah beats seen / life  ${(t.sisSeen / t.lives).toFixed(2)}   arc concluded ${pct(t.sisDone, t.lives)}`);
  console.log(`  years with an urgent deck up   ${t.drawsWhileUrgent}`);
  console.log(`  ... of those, drawn from a sibling deck  ${pct(t.relDrawsWhileUrgent, t.drawsWhileUrgent)}`);
  console.log(`  mean pool size while urgent    ${(t.urgentPool / (t.urgentPoolN || 1)).toFixed(1)}`);
}
