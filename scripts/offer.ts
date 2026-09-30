// The out-of-work offer as a truth table: build a state for each case, play
// each swipe, report where it lands. Checks the three rules -- work never gives
// a lower rung than you have earned on your education's ladder; better-yourself
// is offered exactly when it should be; experience survives going back to the
// same job.
import { applyEffect, chooseDirection, initGame, setContent } from "../src/engine/engine.ts";
import { meets } from "../src/engine/conditions.ts";
import { gameContent } from "../src/content/index.ts";
import type { Card, GameState } from "../src/engine/types.ts";
setContent(gameContent);
const offer = gameContent.decks.flatMap((d) => d.cards).find((c) => c.id === "job_unemployed_offer") as Card;

function out(age: number, education: string, rungs: Record<string, number>, finances = 30, fund = false): GameState {
  const s = initGame(gameContent, 1);
  s.age = age; s.statuses.age = age < 18 ? "child" : "adult"; s.statuses.education = education; s.statuses.job = "unemployed";
  s.vitals.finances = finances; Object.assign(s.traits, rungs, { eduUniFund: fund });
  s.activeDecks = s.activeDecks.filter((d) => !d.startsWith("baby") && !d.startsWith("age_"));
  return s;
}
const rows: [string, GameState][] = [
  ["unlettered man, never worked", out(30, "illiterate", {})],
  ["unlettered boy, never worked", out(15, "illiterate", {})],
  ["unlettered, was factory hand", out(30, "illiterate", { jobRungLabour: 2 })],
  ["unlettered, was gang-master", out(30, "illiterate", { jobRungLabour: 3 })],
  ["basic, was gang-master", out(30, "basic", { jobRungLabour: 3 })],
  ["basic, was shopkeeper", out(30, "basic", { jobRungShop: 2 })],
  ["grammar, was chief clerk", out(40, "grammar", { jobRungClerk: 2 })],
  ["grammar, never worked, poor", out(25, "grammar", {}, 30)],
  ["grammar, with the uni fund", out(25, "grammar", {}, 30, true)],
  ["grammar, can pay the fees", out(25, "grammar", {}, 60)],
  ["university, was physician", out(40, "university", { jobRungMedic: 2 })],
  ["journeyman", out(30, "journeyman", { jobRungLabour: 2 })],
  ["master craftsman", out(45, "master", {})],
  ["unlettered child of 9", out(9, "illiterate", {})],
  ["unlettered 14, can pay premium", out(14, "illiterate", {}, 45)],
  ["unlettered 14, too poor", out(14, "illiterate", {}, 20)],
  ["basic, 15", out(15, "basic", {}, 30)],
  ["unlettered man of 30, saved 85", out(30, "illiterate", { jobRungLabour: 2 }, 85)],
  ["unlettered man of 30, saved 60", out(30, "illiterate", { jobRungLabour: 2 }, 60)],
  ["basic man of 35, saved 85", out(35, "basic", { jobRungShop: 2 }, 85)],
];
console.log(`${"case".padEnd(32)} ${"WORK ->".padEnd(18)} BETTER YOURSELF ->`);
for (const [name, s] of rows) {
  const work = chooseDirection(structuredClone(s), offer, "left").state.statuses.job;
  const offered = meets(offer.options.right!.if, s, gameContent);
  const better = offered ? chooseDirection(structuredClone(s), offer, "right").state.statuses.job : "(not offered)";
  console.log(`${name.padEnd(32)} ${work.padEnd(18)} ${better}`);
}
// experience: a gang-master with two years, sacked, then back to work
const g = out(30, "illiterate", {});
applyEffect(g, { setStatus: { job: "gang_master" } } as any, gameContent); g.traits.jobExperience = 2;
applyEffect(g, { setStatus: { job: "unemployed" } } as any, gameContent);
const back = chooseDirection(structuredClone(g), offer, "left").state;
console.log(`\nsacked gang-master with 2 years' experience -> ${back.statuses.job}, experience ${back.traits.jobExperience}`);
