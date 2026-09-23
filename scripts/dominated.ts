// Balance check: finds STRICTLY DOMINATED options — a swipe with no reason to
// ever pick it, because another swipe on the same card is at least as good on
// every individual vital AND every comparable trait, and better on at least one.
//
// This is the cheap, mechanical half of balance. It says nothing about whether a
// card is INTERESTING; it only catches the case where an option is a punishment
// button (it costs you something and buys nothing), which is what a third option
// tends to decay into when it exists to make a story branch reachable rather
// than to be chosen. Vitals are compared per-vital, never summed, so an option
// that trades money for spirit is correctly NOT flagged — the currencies differ
// and a player short of one will want it.
//
// Not flagged, deliberately: path forks (an option that sets a status, a trait,
// a flaw, or adds/removes a deck) and options with conditional outcomes, since
// what those buy is a branch of the story rather than numbers on this card.
// Run: node --experimental-strip-types scripts/dominated.ts
import { content } from "../src/content/index.ts";
import { EN } from "../src/i18n/index.ts";
import type { CardOption } from "../src/engine/types.ts";

const MAGNITUDE: Record<string, number> = {
  "++++": 100, "+++": 50, "++": 25, "+": 10, "-": -10, "--": -25, "---": -40, "/": -25, "//": -40,
};
const VITALS = ["finances", "happiness", "health", "spirit"] as const;

// Every relationship meter reads "higher is better" EXCEPT distance, which counts
// how absent you have been — so a bigger number there is the worse outcome.
const atLeastAsGood = (trait: string, a: number, b: number): boolean =>
  trait.toLowerCase().includes("distance") ? a <= b : a >= b;

interface Reading {
  vitals: Record<string, number>;
  traits: Record<string, number>;
  forksThePath: boolean;
  label: string;
}

function read(opt: CardOption): Reading {
  // The last outcome is the unconditional fallback — the one that always applies.
  const effects = opt.outcomes[opt.outcomes.length - 1].effects ?? {};
  const vitals: Record<string, number> = {};
  for (const key of VITALS) vitals[key] = MAGNITUDE[effects.vitals?.[key] ?? ""] ?? 0;
  return {
    vitals,
    traits: { ...(effects.incTraits ?? {}) } as Record<string, number>,
    forksThePath:
      opt.outcomes.length > 1 ||
      !!(effects.setStatus || effects.setTraits || effects.setTraitsFlaw || effects.addDecks || effects.removeDecks),
    label: (EN as Record<string, string>)[opt.label] ?? opt.label,
  };
}

let found = 0;
for (const deck of content.decks) {
  for (const card of deck.cards) {
    const options = Object.entries(card.options).map(([dir, opt]) => [dir, read(opt as CardOption)] as const);
    for (const [winnerDir, winner] of options) {
      for (const [loserDir, loser] of options) {
        if (winnerDir === loserDir || winner.forksThePath || loser.forksThePath) continue;
        const traits = new Set([...Object.keys(winner.traits), ...Object.keys(loser.traits)]);
        const onVitals = VITALS.every((k) => winner.vitals[k] >= loser.vitals[k]);
        const onTraits = [...traits].every((k) => atLeastAsGood(k, winner.traits[k] ?? 0, loser.traits[k] ?? 0));
        const strictly =
          VITALS.some((k) => winner.vitals[k] > loser.vitals[k]) ||
          [...traits].some((k) => (winner.traits[k] ?? 0) !== (loser.traits[k] ?? 0));
        if (onVitals && onTraits && strictly) {
          found++;
          console.log(
            `${deck.id}/${card.id}: "${loser.label}" (${loserDir}) is dominated by "${winner.label}" (${winnerDir})`,
          );
        }
      }
    }
  }
}
console.log(found ? `\n${found} dominated option(s)` : "\nno strictly dominated options");
