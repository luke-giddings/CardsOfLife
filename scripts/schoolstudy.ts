// Can a board-school pupil who ALWAYS studies reach the leaver with the study
// it asks for (eduStudy >= 3)? Plays greedy on vitals, except on a school card,
// where it takes whichever option raises eduStudy most. Counts, per life that
// reaches the leaver, the study banked and the school cards dealt on the way.
import { chooseDirection, drawCard, initGame, quietYear, setContent } from "../src/engine/engine.ts";
import { meets } from "../src/engine/conditions.ts";
import { gameContent } from "../src/content/index.ts";
import type { Card, Direction, GameState } from "../src/engine/types.ts";
// VARIANT=copies|weights|bar2 tries a candidate fix on a copy of the content.
const content = structuredClone(gameContent);
const school = content.decks.find((d) => d.id === "edu_basicschool")!;
const card = (id: string) => school.cards.find((c) => c.id === id)!;
const V = process.env.VARIANT ?? "";
if (V.includes("copies")) card("edu_basicschool_exams").copies = 3;
if (V.includes("weights")) for (const id of ["edu_basicschool_exams", "edu_basicschool_prize", "edu_basicschool_errands"]) card(id).weight = 6;
const BAR = V.includes("bar2") ? 2 : 3;
const LAZY = !!process.env.LAZY; // LAZY=1: a pupil who never takes the study option
setContent(content);
const DIRS: Direction[] = ["left", "right", "up", "down"];
const dirsFor = (c: Card, s: GameState) => DIRS.filter((d) => c.options[d] && meets(c.options[d]!.if, s));
function pick(c: Card, s: GameState, ds: Direction[]): Direction {
  const school = c.deck === "edu_basicschool" || c.id === "baby_schooling";
  let best = ds[0], key = -Infinity;
  for (const d of ds) {
    const p = chooseDirection(s, c, d).state; const v = Object.values(p.vitals) as number[];
    const study = school && LAZY ? -p.traits.eduStudy * 1e7 : school ? (p.statuses.job === "studying" || p.statuses.job === "grammar_school" ? 1e6 : 0) + p.traits.eduStudy * 1e7 : 0;
    const k = p.over ? -1e12 : study + Math.min(...v) * 1000 + v.reduce((a, b) => a + b, 0);
    if (k > key) { key = k; best = d; }
  }
  return best;
}
const N = Number(process.argv[2]) || 3000;
let reached = 0, passed = 0; const studyAt: number[] = [0, 0, 0, 0, 0, 0, 0]; const dealt = new Map<string, number>(); let schoolCards = 0;
for (let i = 1; i <= N; i++) {
  let s = initGame(i);
  let seen = 0;
  for (let t = 0; t < 30 && !s.over; t++) {
    const d = drawCard(s); s = d.state;
    if (!d.card) { s = quietYear(s).state; continue; }
    const ds = dirsFor(d.card, s); if (!ds.length) { s = quietYear(s).state; continue; }
    if (d.card.id === "edu_basicschool_leaver") {
      reached++; studyAt[Math.min(6, s.traits.eduStudy)]++; if (s.traits.eduStudy >= BAR) passed++; schoolCards += seen;
      s = chooseDirection(s, d.card, pick(d.card, s, ds)).state; break;
    }
    if (d.card.deck === "edu_basicschool") { seen++; dealt.set(d.card.id, (dealt.get(d.card.id) ?? 0) + 1); }
    s = chooseDirection(s, d.card, pick(d.card, s, ds)).state;
  }
}
console.log(`${N} lives; ${reached} reached the board-school leaver. Study banked there: ` + studyAt.map((n, k) => `${k}${k === 6 ? "+" : ""}:${n}`).join(" "));
console.log(`PASS (>=3): ${(100 * passed / reached).toFixed(0)}%   school cards dealt before the leaver: mean ${(schoolCards / reached).toFixed(1)}`);
console.log("per leaver-reaching life: " + [...dealt].map(([k, v]) => `${k.replace("edu_basicschool_", "")} ${(v / reached).toFixed(2)}`).join("  "));
