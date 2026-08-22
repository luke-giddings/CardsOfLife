// Headless playthrough: swipe randomly until game over (or a cap), a few times.
// Run: node --experimental-strip-types scripts/sim.ts
import {
  chooseDirection,
  drawCard,
  initGame,
  quietYear,
  setContent,
} from "../src/engine/engine.ts";
import { gameContent } from "../src/content/index.ts";
import type { Direction } from "../src/engine/types.ts";

setContent(gameContent);

function playOne(): void {
  let s = initGame(gameContent);
  let turns = 0;
  while (!s.over && turns < 500) {
    const d = drawCard(s);
    s = d.state;
    if (!d.card) {
      s = quietYear(s).state;
      turns++;
      continue;
    }
    const dirs = (["left", "right", "up", "down"] as Direction[]).filter(
      (k) => d.card!.options[k],
    );
    const dir = dirs[Math.floor(Math.random() * dirs.length)];
    s = chooseDirection(s, d.card, dir).state;
    turns++;
  }
  console.log(
    JSON.stringify({
      over: s.over,
      reason: s.endReason,
      age: s.age,
      turns,
      vitals: s.vitals,
      job: s.statuses.job,
      housing: s.statuses.housing,
      education: s.statuses.education,
      changedJob: s.traits.numTimesChangedJob,
    }),
  );
}

for (let i = 0; i < 8; i++) playOne();
