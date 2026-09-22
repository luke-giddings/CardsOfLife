import { eligibleDraw, initGame, setContent } from "../src/engine/engine.ts";
import { gameContent } from "../src/content/index.ts";
setContent(gameContent);
for (const [job, decks] of [["unemployed", ["job_unemployed"]], ["pickpocket", ["job_criminal"]], ["shophand", ["job_shop"]]] as [string,string[]][]) {
  const s = initGame(gameContent);
  s.age = 25; s.statuses.age = "young_adult"; s.statuses.job = job;
  s.statuses.housing = "homeless"; s.statuses.education = "basic"; s.statuses.family = "single";
  // Drop the babyhood decks: one of them is `noDrift`, which suspends ALL drift
  // and would fail an income gate for a reason that has nothing to do with the job.
  s.activeDecks = [...new Set([...s.activeDecks.filter((d) => !d.startsWith("baby") && !d.startsWith("age_")), "home_homeless", "age_young_adult", ...decks])];
  const { pool, gated } = eligibleDraw(s);
  console.log(`\nhomeless + ${job}:`);
  console.log(`  LIVE  (${pool.length}): ${pool.map(c=>c.id).join(", ")}`);
  console.log(`  gated (${gated.length}): ${gated.map(c=>c.id).join(", ")}`);
}
