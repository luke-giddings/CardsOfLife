// Adult school, played end to end from a realistic entry: a man out of work
// takes "better yourself" at the offer and is then played to the end of his
// schooling. How does it end, how long does it take, and does a man who walks
// out go back to his old rung with his years? Played greedy (short-sighted),
// and by a player who wants the education -- read them as a pair.
import { chooseDirection, drawCard, initGame, quietYear, setContent } from "../src/engine/engine.ts";
import { meets } from "../src/engine/conditions.ts";
import { gameContent } from "../src/content/index.ts";
import type { Card, Direction, GameState } from "../src/engine/types.ts";
setContent(gameContent);
const DIRS: Direction[] = ["left","right","up","down"];
const dirsFor = (c: Card, s: GameState) => DIRS.filter((d) => c.options[d] && meets(c.options[d]!.if, s, gameContent));
const offer = gameContent.decks.flatMap((d) => d.cards).find((c) => c.id === "job_unemployed_offer") as Card;
const EDU = ["illiterate", "basic", "grammar"];
function pick(c: Card, s: GameState, ds: Direction[], keen: boolean): Direction {
  let best = ds[0], key = -Infinity;
  for (const d of ds) { const p = chooseDirection(structuredClone(s), c, d).state; const v = Object.values(p.vitals) as number[];
    let k = p.over ? -1e9 : Math.min(...v)*1000 + v.reduce((a,b)=>a+b,0);
    if (keen && !p.over) k += 30000 * EDU.indexOf(p.statuses.education) + 3000 * (p.traits.eduStudy as number);
    if (k > key) { key = k; best = d; } }
  return best;
}
let MONEY = 60;
function man(seed: number, education: string, job: string, rung: Record<string, number>, exp: number): GameState {
  const s = initGame(gameContent, seed);
  s.age = 30; s.statuses.age = "adult"; s.statuses.education = education; s.statuses.housing = "renting";
  s.statuses.family = "single"; s.vitals = { finances: MONEY, happiness: 50, health: 50, spirit: 50 };
  s.activeDecks = ["age_adult", "home_renting", "fam_single"];
  Object.assign(s.traits, rung); s.statuses.job = job; (s as any).experienceJob = job; s.traits.jobExperience = exp;
  s.statuses.job = "unemployed"; s.activeDecks.push("job_unemployed");
  return chooseDirection(s, offer, "right").state; // takes adult school
}
const N = Number(process.argv[2]) || 1500;
// argv[3] = "proportional": put back the first cut's two-thirds price ("//") to compare.
// (The shipped price is a flat 40, offered from 80.) argv[4] = entry money list, argv[5] = "keen".
if (process.argv[3] === "proportional") for (const o of offer.options.right!.outcomes) if ((o.effects as any)?.setStatus?.job === "adult_school") (o.effects as any).vitals.finances = "//";
const MONIES = (process.argv[4] ?? "60").split(",").map(Number);
for (const m of MONIES) { MONEY = m;
for (const [label, edu, job, rung] of [["unlettered factory hand", "illiterate", "factory", { jobRungLabour: 2 }], ["basic shopkeeper", "basic", "shopkeeper", { jobRungShop: 2 }]] as [string,string,string,Record<string,number>][]) {
  for (const keen of (process.argv[5] === "keen" ? [true] : [false, true])) {
    const end = new Map<string, number>(); const yrs: number[] = []; let keptExp = 0, walked = 0, entered = 0, cashOnEntry = 0;
    for (let i = 0; i < N; i++) {
      let s = man(i + 1, edu, job, rung, 2);
      if (s.statuses.job !== "adult_school") continue; entered++; cashOnEntry += s.vitals.finances;
      const start = s.age;
      for (let t = 0; t < 30 && !s.over && s.statuses.job === "adult_school"; t++) {
        const d = drawCard(s); s = d.state;
        if (!d.card) { s = quietYear(s); continue; }
        const ds = dirsFor(d.card, s); if (!ds.length) { s = quietYear(s); continue; }
        s = chooseDirection(s, d.card, pick(d.card, s, ds, keen)).state;
      }
      const how = s.over ? "died" : s.statuses.education !== edu ? `passed -> ${s.statuses.education}, ${s.statuses.job}` : `left -> ${s.statuses.job}${s.statuses.housing === "homeless" ? " (on the streets)" : ""}`;
      end.set(how, (end.get(how) ?? 0) + 1); yrs.push(s.age - start);
      if (!s.over && s.statuses.education === edu && s.statuses.job === job) { walked++; if (s.traits.jobExperience === 2) keptExp++; }
    }
    yrs.sort((a, b) => a - b);
    console.log(`\n${label}, ${keen ? "KEEN player" : "greedy player"}, arriving with ${MONEY}: ${entered} entered, money after year one ${(cashOnEntry/entered).toFixed(0)}, median ${yrs[yrs.length >> 1]} years there`);
    for (const [k, n] of [...end].sort((a, b) => b[1] - a[1])) console.log(`  ${k.padEnd(42)} ${(100*n/entered).toFixed(0)}%`);
    if (walked) console.log(`  back at his old rung: ${walked}, experience kept in ${keptExp}`);
  }
}
}
