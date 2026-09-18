// AMBITIOUS PLAYERS: how often can a life that is TRYING to get somewhere get
// there?
//
// Every other sim here plays greedy — maximise the weakest vital one year ahead.
// That is a stable yardstick for comparing two versions of the content, and it is
// useless for asking whether a PATH is achievable, because it declines on
// principle anything that costs now and pays later. It scores 0% journeymen where
// a player who grafts at the bench scores 17%, and it sits in a schoolroom in
// 0.8% of lives because a child labourer's wage beats a pupil's nothing every
// single turn. Numbers about careers taken from it are numbers about it.
//
// So: give the player a ROUTE and let it spend vitals to walk one.
//
//   route   an ordered list of statuses. Your progress is the furthest you have
//           EVER reached, so leaving school for the job school was for counts as
//           going forward. Reaching the last one is success.
//   wants   counters the route is gated behind, priced in "points of your weakest
//           vital". This is the player knowing that experience earns promotions
//           and that a university fund pays for university.
//
// `ambition` scales BOTH — what a route step is worth and what the enablers are
// worth — because a player who wants something more also works harder for the
// things it is gated behind. It is the strategy dial, and the whole reason every
// goal is reported at two settings: a result that holds across them is about the
// game, one that moves is about the player. Read them as a pair, never alone.
//
// The dial matters most where a gate is tight. Measured while building this: at
// a low setting the median apprentice reaches the qualifying trial with jobSkill
// 2 and needs 3, and almost nobody passes; at a high one the median is exactly 3
// and most do. That is not the sim being unreliable — it is the apprenticeship
// working as designed, as a check on how hard you actually tried. Any goal whose
// two columns differ sharply is a goal with a gate like that in it, and worth
// looking at rather than averaging away.
//
// "Three score years" carries no route at all, so it IS the greedy player, and is
// here as the control: any goal scoring worse than it on lifespan is telling you
// what the ambition cost.
// Run: node --experimental-strip-types scripts/ambition.ts [runs]
import { chooseDirection, drawCard, initGame, quietYear, setContent } from "../src/engine/engine.ts";
import { meets } from "../src/engine/conditions.ts";
import { gameContent } from "../src/content/index.ts";
import type { Card, Direction, GameState, StatusKind } from "../src/engine/types.ts";
setContent(gameContent);

type Step = [StatusKind, string];
interface Goal {
  name: string;
  route: Step[];
  wants?: [string, number][];
  win?: (s: GameState) => boolean; // defaults to "finished the route"
}

const GOALS: Goal[] = [
  {
    name: "Consulting physician",
    route: [["job", "studying"], ["education", "basic"], ["job", "grammar_school"], ["education", "grammar"],
            ["job", "university"], ["education", "university"], ["job", "physician_junior"],
            ["job", "physician"], ["job", "physician_eminent"]],
    wants: [["eduStudy", 10], ["eduUniFund", 25], ["jobExperience", 6], ["persBookish", 8]],
  },
  {
    name: "Solicitor",
    route: [["job", "studying"], ["education", "basic"], ["job", "grammar_school"], ["education", "grammar"],
            ["job", "clerk"], ["job", "chief_clerk"], ["job", "solicitor"]],
    wants: [["eduStudy", 10], ["jobExperience", 6], ["persBookish", 8]],
  },
  {
    name: "Merchant",
    route: [["job", "studying"], ["education", "basic"], ["job", "shophand"], ["job", "shopkeeper"], ["job", "merchant"]],
    wants: [["eduStudy", 10], ["jobExperience", 6], ["persBookish", 8]],
  },
  {
    name: "Master craftsman",
    route: [["job", "apprentice"], ["job", "journeyman"], ["job", "master"]],
    wants: [["jobSkill", 30], ["jobExperience", 6]],
  },
  {
    name: "A house of your own",
    route: [["housing", "renting"], ["housing", "owned_small"], ["housing", "owned_large"], ["housing", "owned_estate"]],
  },
  {
    name: "Married to Lilly",
    route: [["family", "courting"], ["family", "married"]],
    wants: [["socialWarmth", 6], ["relLillyWarmth", 4]],
  },
  { name: "Three score years", route: [], win: (s) => s.age >= 60 },
];

const DIRS: Direction[] = ["left", "right", "up", "down"];
const dirsFor = (c: Card, s: GameState) =>
  DIRS.filter((d) => c.options[d] && meets(c.options[d]!.if, s, gameContent));

// The furthest route entry currently satisfied, or -1. Route order is the
// player's belief about the road, not something the engine knows.
const reached = (s: GameState, route: Step[]): number => {
  let best = -1;
  route.forEach(([kind, value], i) => { if (s.statuses[kind] === value) best = i; });
  return best;
};

const num = (v: unknown): number => (typeof v === "number" ? v : v === true ? 1 : 0);

const wantOf = (s: GameState, g: Goal): number =>
  (g.wants ?? []).reduce((a, [k, w]) => a + w * num((s.traits as any)[k]), 0);

// Wants are scored on a HIGH-WATER MARK, exactly as route progress is, and for
// exactly the same reason: several of them are SPENT by the step they pay for.
// `eduStudy` is stamped back to 0 on entering the school it bought, and
// `jobExperience` is zeroed by the promotion it earned. Scoring the live value
// made the player hoard — a scholar holding 3 study refused the grammar school in
// 100% of lives, because entering it lost more want than the step was worth.
//
// Capping the want instead was the first fix and it was wrong: it suppressed the
// goals where the want IS the road rather than a means to it (Lilly's warmth is
// never reset and has to reach 50), and it took her from 7.5% to 1.8%. A
// high-water mark fixes the hoarding without ever penalising accumulation.
function score(s: GameState, g: Goal, mark: number, wantMark: number, ambition: number): number {
  if (s.over) return -1e9;
  const v = Object.values(s.vitals) as number[];
  const survival = Math.min(...v) * 1000 + v.reduce((a, b) => a + b, 0);
  const step = Math.max(mark, reached(s, g.route));
  const want = Math.max(wantMark, wantOf(s, g));
  // Both terms scale with ambition: wanting the end more means working harder for
  // what it is gated behind. 20 is the reference setting the weights are written in.
  return survival + (step * ambition + want * (ambition / 20)) * 1000;
}

function run(g: Goal, ambition: number, N: number) {
  const ages: number[] = [];
  let won = 0;
  const depth = new Array(g.route.length + 1).fill(0);
  for (let i = 0; i < N; i++) {
    let s = initGame(gameContent);
    let mark = -1, wantMark = 0;
    for (let t = 0; t < 120 && !s.over; t++) {
      const d = drawCard(s); s = d.state;
      if (!d.card) { s = quietYear(s); continue; }
      const ds = dirsFor(d.card, s);
      if (!ds.length) { s = quietYear(s); continue; }
      let best = ds[0], key = -Infinity;
      for (const dir of ds) {
        const k = score(chooseDirection(structuredClone(s), d.card, dir).state, g, mark, wantMark, ambition);
        if (k > key) { key = k; best = dir; }
      }
      s = chooseDirection(s, d.card, best).state;
      mark = Math.max(mark, reached(s, g.route));
      wantMark = Math.max(wantMark, wantOf(s, g));
    }
    ages.push(s.age);
    depth[mark + 1]++;
    if (g.win ? g.win(s) : mark === g.route.length - 1) won++;
  }
  const mean = ages.reduce((a, b) => a + b, 0) / N;
  return { won: (100 * won) / N, mean, depth: depth.map((n) => (100 * n) / N) };
}

const N = Number(process.argv[2]) || 2000;
const LEVELS = [20, 60];
console.log(`${N} lives per goal per ambition level — a route step is worth N points of your weakest vital\n`);
console.log(`  ${"goal".padEnd(22)} ${LEVELS.map((l) => `succeeds@${l}`.padStart(12)).join("")}${"mean age".padStart(11)}   furthest step reached (% of lives)`);
for (const g of GOALS) {
  const rs = LEVELS.map((l) => run(g, l, N));
  const d = rs[rs.length - 1].depth;
  const trail = g.route.length
    ? d.map((p, i) => `${i === 0 ? "none" : g.route[i - 1][1]} ${p.toFixed(0)}%`).join(" · ")
    : "—";
  console.log(`  ${g.name.padEnd(22)} ${rs.map((r) => `${r.won.toFixed(1)}%`.padStart(12)).join("")}` +
    `${rs[rs.length - 1].mean.toFixed(1).padStart(11)}   ${trail}`);
}
