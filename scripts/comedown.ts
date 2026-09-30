// Coming down early from university (quitting, or ruin): back to the rung you
// held on the clerk ladder, with your years -- not the bottom of it.
import { applyEffect, chooseDirection, initGame, setContent } from "../src/engine/engine.ts";
import { gameContent } from "../src/content/index.ts";
import type { Card, Direction, GameState } from "../src/engine/types.ts";
setContent(gameContent);
const card = (id: string) => gameContent.decks.flatMap((d) => d.cards).find((c) => c.id === id) as Card;
function student(age: number, fromJob: string | null, exp: number): GameState {
  const s = initGame(gameContent, 1);
  s.age = age; s.statuses.age = age < 18 ? "child" : "adult"; s.statuses.education = "grammar"; s.statuses.housing = "renting";
  s.activeDecks = [];
  if (fromJob) { applyEffect(s, { setStatus: { job: fromJob } } as any, gameContent); s.traits.jobExperience = exp; }
  applyEffect(s, { setStatus: { job: "university" } } as any, gameContent);
  return s;
}
const cases: [string, number, string | null][] = [["young student, never worked", 19, null], ["grown man, was a clerk", 35, "clerk"], ["grown man, was chief clerk", 35, "chief_clerk"], ["grown man, was solicitor", 45, "solicitor"]];
console.log(`${"student".padEnd(30)} ${"quits (leaver)".padEnd(34)} ${"ruin: streets".padEnd(22)} ruin: home`);
for (const [name, age, from] of cases) {
  const cell = (id: string, dir: Direction) => { const r = chooseDirection(student(age, from, 3), card(id), dir);
    return `${r.state.statuses.job} exp ${r.state.traits.jobExperience}${id === "edu_university_leaver" || dir === "right" ? " [" + r.result.split(".").pop() + "]" : ""}`; };
  console.log(`${name.padEnd(30)} ${cell("edu_university_leaver", "right").padEnd(34)} ${cell("edu_university_ruin", "left").padEnd(22)} ${cell("edu_university_ruin", "right")}`);
}
