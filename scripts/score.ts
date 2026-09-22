// "The criminal escapes on a score" -- a claim worth checking rather than
// asserting. One `+++` is +50 and the room wants 40, so a single crime clears
// the bar from a floored purse. Where does the 61% actually die? Three gates:
// reach 40, then be dealt the room, then still be alive to take it.
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
const med = (a:number[]) => a.length ? [...a].sort((x,y)=>x-y)[Math.floor(a.length/2)] : NaN;

const N = Number(process.argv[2]) || 800;
let everRich = 0, roofed = 0, died = 0, richThenDied = 0, sawRoom = 0;
const toRich: number[] = [], richToRoof: number[] = [];
const declined = new Map<string, number>();
for (let i = 0; i < N; i++) {
  const s0 = initGame(gameContent);
  s0.age = 17; s0.statuses.age = "young_adult"; s0.statuses.job = "pickpocket";
  s0.statuses.housing = "homeless"; s0.statuses.education = "basic"; s0.statuses.family = "single";
  s0.vitals = { finances: 1, happiness: 16, health: 26, spirit: 65 };
  s0.activeDecks = [...new Set([...s0.activeDecks.filter((d) => !d.startsWith("baby") && !d.startsWith("age_")),
    "home_homeless", "age_young_adult", "job_criminal"])];
  let s = s0; const start = s.age; let richAt = -1, rich = false;
  for (let t = 0; t < 40 && !s.over; t++) {
    if (s.statuses.housing !== "homeless") break;
    const d = drawCard(s); s = d.state;
    if (!d.card) { s = quietYear(s); continue; }
    const ds = dirsFor(d.card, s);
    if (!ds.length) { s = quietYear(s); continue; }
    if (d.card.id === "home_homeless_room") sawRoom++;
    const pick = greedy(d.card, s, ds);
    // did the player TURN DOWN a crime that would have paid?
    const pays = (dir: Direction) => (d.card!.options[dir]?.outcomes ?? []).some((o) =>
      /^\+\+\+/.test(String((o.effects?.vitals as any)?.finances ?? "")));
    if (!rich && ds.some(pays) && !pays(pick)) declined.set(d.card.id, (declined.get(d.card.id) ?? 0) + 1);
    s = chooseDirection(s, d.card, pick).state;
    if (!rich && s.vitals.finances >= 40) { rich = true; everRich++; richAt = s.age; toRich.push(s.age - start); }
  }
  if (s.statuses.housing !== "homeless" && !s.over) { roofed++; if (rich) richToRoof.push(s.age - richAt); }
  if (s.over) { died++; if (rich) richThenDied++; }
}
console.log(`${N} pickpockets put on the pavement at 17 (finances 1, happiness 16, health 26, spirit 65)\n`);
console.log(`  reached 40 on a score      ${`${(100*everRich/N).toFixed(0)}%`.padStart(5)}   median ${med(toRich)} yrs to it`);
console.log(`  got a roof                 ${`${(100*roofed/N).toFixed(0)}%`.padStart(5)}   median ${med(richToRoof)} yrs from score to room`);
console.log(`  died out there             ${`${(100*died/N).toFixed(0)}%`.padStart(5)}   of whom ${richThenDied} HAD the money and died anyway`);
console.log(`  the room card was dealt    ${sawRoom} times across all ${N} lives`);
if (declined.size) console.log(`  crimes TURNED DOWN while still poor: ` + [...declined].map(([k,n])=>`${k} ${n}`).join("  "));
