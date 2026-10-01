import { eligibleDraw, initGame, setContent } from "../src/engine/engine.ts";
import { gameContent } from "../src/content/index.ts";
setContent(gameContent);
for (const [job, decks] of [["unemployed", ["job_unemployed"]], ["pickpocket", ["job_criminal"]], ["shophand", ["job_shop"]]] as [string,string[]][]) {
  const s = initGame();
  s.age = 25; s.statuses.age = "young_adult"; s.statuses.job = job;
  s.statuses.housing = "homeless"; s.statuses.education = "basic"; s.statuses.family = "single";
  // Swap the babyhood decks for a young adult's. (The age status set above also
  // ends the baby grace period, so drift — and any income gate — reads as an adult's.)
  s.activeDecks = [...new Set([...s.activeDecks.filter((d) => !d.startsWith("baby") && !d.startsWith("age_")), "home_homeless", "age_young_adult", ...decks])];
  const { pool, gated } = eligibleDraw(s);
  console.log(`\nhomeless + ${job}:`);
  console.log(`  LIVE  (${pool.length}): ${pool.map(c=>c.id).join(", ")}`);
  console.log(`  gated (${gated.length}): ${gated.map(c=>c.id).join(", ")}`);
}
