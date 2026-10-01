// The board-school study rule INVERTED (a proposal, modelled outside the
// content): you start school at 3; working on a study card keeps what you have;
// slacking costs what working would have earned a plain pupil (exams/prize 2,
// errands 1), one less if bookish; you go up if you end above 0. So a pupil
// the draw never tests passes by default, and only slacking can fail you.
// PLAYER=study|lazy|coin (coin: a fair coin on each study card).
// VARIANT=weights doubles the three study cards' weights.
import { chooseDirection, drawCard, initGame, quietYear, setContent } from "../src/engine/engine.ts";
import { meets } from "../src/engine/conditions.ts";
import { gameContent } from "../src/content/index.ts";
import type { Card, Direction, GameState } from "../src/engine/types.ts";
const content = structuredClone(gameContent);
const school = content.decks.find((d) => d.id === "edu_basicschool")!;
const STUDY: Record<string, number> = { edu_basicschool_exams: 2, edu_basicschool_prize: 2, edu_basicschool_errands: 1 };
if ((process.env.VARIANT ?? "").includes("weights")) for (const c of school.cards) if (STUDY[c.id]) c.weight = 6;
setContent(content);
const PLAYER = process.env.PLAYER ?? "study";
const START = Number(process.env.START ?? 3);
const DIRS: Direction[] = ["left", "right", "up", "down"];
const dirsFor = (c: Card, s: GameState) => DIRS.filter((d) => c.options[d] && meets(c.options[d]!.if, s));
const greedy = (c: Card, s: GameState, ds: Direction[]) => {
  let best = ds[0], key = -Infinity;
  for (const d of ds) {
    const p = chooseDirection(s, c, d).state; const v = Object.values(p.vitals) as number[];
    const k = p.over ? -1e12 : (c.id === "baby_schooling" && p.statuses.job === "studying" ? 1e9 : 0) + Math.min(...v) * 1000 + v.reduce((a, b) => a + b, 0);
    if (k > key) { key = k; best = d; }
  }
  return best;
};
// The option that WORKS on a study card: the one that raises eduStudy today.
const works = (c: Card, s: GameState, d: Direction) => chooseDirection(s, c, d).state.traits.eduStudy > s.traits.eduStudy;
const N = Number(process.argv[2]) || 2500;
let reached = 0, passed = 0, tested = 0; const ends = new Map<number, number>();
for (let i = 1; i <= N; i++) {
  let s = initGame(i); let study = START; let coin = Math.imul(i, 2654435761) >>> 0;
  for (let t = 0; t < 30 && !s.over; t++) {
    const d = drawCard(s); s = d.state;
    if (!d.card) { s = quietYear(s).state; continue; }
    const ds = dirsFor(d.card, s); if (!ds.length) { s = quietYear(s).state; continue; }
    if (d.card.id === "edu_basicschool_leaver") {
      reached++; if (study > 0) passed++; ends.set(study, (ends.get(study) ?? 0) + 1); break;
    }
    let dir = greedy(d.card, s, ds);
    const cost = STUDY[d.card.id];
    if (cost) {
      tested++;
      const work = ds.find((x) => works(d.card!, s, x)), slack = ds.find((x) => !works(d.card!, s, x));
      coin = (Math.imul(coin, 1103515245) + 12345) >>> 0;
      const wantWork = PLAYER === "study" || (PLAYER === "coin" && (coin >>> 16) % 2 === 0);
      dir = (wantWork ? work : slack) ?? dir;
      if (!works(d.card, s, dir)) study -= Math.max(0, cost - (s.traits.persBookish ? 1 : 0));
    }
    s = chooseDirection(s, d.card, dir).state;
  }
}
const dist = [...ends].sort((a, b) => a[0] - b[0]).map(([k, v]) => `${k}:${v}`).join(" ");
console.log(`player=${PLAYER} ${process.env.VARIANT ?? "today's weights"} start=${START}: ${reached} reached the leaver, PASS ${(100 * passed / reached).toFixed(0)}%  (study cards per pupil ${(tested / reached).toFixed(1)}; ends ${dist})`);
