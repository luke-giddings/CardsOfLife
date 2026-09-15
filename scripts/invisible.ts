// Balance check: options that are DOMINATED ON THE CARD FACE — worse than a
// sibling swipe on every vital the player can see, with nothing visible to
// explain why anyone would take them.
//
// The sister check, scripts/dominated.ts, compares traits too, so an option
// paying in a relationship meter is (correctly) not flagged there. But the
// player cannot see relationship meters: `incTraits` draws NO chip and no star
// on the card face. So on a relationship card the whole real payload is
// invisible, and an option that trades 10 happiness for 12 of a brother's love
// looks to the player exactly like a punishment button. That is what this
// script finds: the gap between what the card IS and what it LOOKS like.
//
// Rules, to keep the output honest:
//   - Vitals compared per-vital, never summed: money for spirit is a real trade.
//   - An option showing a MARKER (★ for a status/trait/deck change, ⚠ for a flaw
//     or a grim status) is exempt both ways — the marker is the visible reason.
//   - Conditional options are flagged only when EVERY outcome is dominated by
//     EVERY outcome of the sibling, so a branch that can come out ahead is safe.
// Run: node --experimental-strip-types scripts/invisible.ts
import { content } from "../src/content/index.ts";
import { EN } from "../src/i18n/index.ts";
import type { CardOption, Effect } from "../src/engine/types.ts";

const MAGNITUDE: Record<string, number> = {
  "++++": 100, "+++": 50, "++": 25, "+": 10, "-": -10, "--": -25, "---": -40, "/": -25, "//": -40,
};
const VITALS = ["finances", "happiness", "health", "spirit"] as const;

const grim = (kind: string, value: string): boolean =>
  !!(content.statuses as any)[kind]?.states?.[value]?.grim;

// Mirrors the card face (see vitalChips in src/ui/app.ts): these are the changes
// that DRAW something the player can read, beyond the four vital chips.
function marked(e?: Effect): boolean {
  if (!e) return false;
  if (e.setFlaws && Object.keys(e.setFlaws).length) return true;
  if (e.setStatus && Object.entries(e.setStatus).some(([k, v]) => grim(k, v as string))) return true;
  return !!(e.setStatus || e.setTraits || e.addDecks || e.removeDecks);
}

const vitals = (e?: Effect): number[] =>
  VITALS.map((v) => MAGNITUDE[(e?.vitals as any)?.[v] ?? ""] ?? 0);

// a is at least as good as b on every vital, and better on one.
function dominates(a: number[], b: number[]): boolean {
  return a.every((n, i) => n >= b[i]) && a.some((n, i) => n > b[i]);
}

const txt = (id?: string): string => (id && (EN as any)[id]) || id || "?";
let found = 0;
for (const deck of content.decks) {
  for (const card of deck.cards) {
    const entries = Object.entries(card.options) as [string, CardOption][];
    for (const [dir, opt] of entries) {
      // Anything the option can show is a reason in itself.
      if (opt.outcomes.some((o) => marked(o.effects))) continue;
      const mine = opt.outcomes.map((o) => vitals(o.effects));
      for (const [other, rival] of entries) {
        if (other === dir) continue;
        if (rival.outcomes.some((o) => marked(o.effects))) continue;
        const theirs = rival.outcomes.map((o) => vitals(o.effects));
        // Flagged only when no branch of mine ever beats any branch of theirs.
        if (theirs.every((t) => mine.every((m) => dominates(t, m)))) {
          found++;
          console.log(`${deck.id} / ${card.id}`);
          console.log(`  ${dir}: "${txt(opt.label)}"  ${JSON.stringify(mine)}`);
          console.log(`  is beaten on every visible vital by ${other}: "${txt(rival.label)}"  ${JSON.stringify(theirs)}`);
          break;
        }
      }
    }
  }
}
console.log(found ? `\n${found} option(s) dominated on the card face.` : "\nNo option is dominated on the card face.");
