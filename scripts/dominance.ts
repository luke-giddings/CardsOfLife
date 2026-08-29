// Static "no-brainer" sweep: within each card, flag an option that is strictly
// dominated by a sibling — i.e. they carry the SAME non-vital payload (same
// setStatus / setTraits / incTraits / decks / endGame / restoreHousing) yet one
// option's vital deltas are >= the other's on every vital and > on at least one.
// Those are the choices a player would never pick the worse side of.
//
// Heuristic, meant to be eyeballed: it compares each option's DEFAULT (last)
// outcome, so conditional-outcome cards are approximated; `---` (halve) is scored
// as a nominal large loss. Run: node --experimental-strip-types scripts/dominance.ts
import { gameContent } from "../src/content/index.ts";

const PTS: Record<string, number> = { "++": 25, "+": 10, "-": -10, "--": -25, "---": -50 };
const VITALS = ["finances", "happiness", "health", "spirit"] as const;

// The non-vital payload of an outcome, as a stable string — two options are only
// comparable as a pure no-brainer when these match exactly.
function sig(eff: any): string {
  if (!eff) return "{}";
  const norm = (o: any) => (o ? JSON.stringify(Object.entries(o).sort()) : "");
  return JSON.stringify({
    setStatus: norm(eff.setStatus),
    setTraits: norm(eff.setTraits),
    incTraits: norm(eff.incTraits),
    addDecks: (eff.addDecks ?? []).slice().sort(),
    removeDecks: (eff.removeDecks ?? []).slice().sort(),
    endGame: eff.endGame ?? "",
    restoreHousing: !!eff.restoreHousing,
  });
}
function vitalPts(eff: any): Record<string, number> {
  const out: Record<string, number> = {};
  for (const k of VITALS) {
    const mag = eff?.vitals?.[k];
    out[k] = mag ? (PTS[mag] ?? 0) : 0;
  }
  return out;
}
// Does A dominate B? Same everywhere-or-better on vitals, strictly better once.
function dominates(a: Record<string, number>, b: Record<string, number>): boolean {
  let strict = false;
  for (const k of VITALS) {
    if (a[k] < b[k]) return false;
    if (a[k] > b[k]) strict = true;
  }
  return strict;
}

let flagged = 0;
for (const deck of gameContent.decks) {
  for (const card of deck.cards) {
    const dirs = Object.keys(card.options ?? {});
    const info = dirs.map((d) => {
      const opt = (card.options as any)[d];
      const eff = opt.outcomes[opt.outcomes.length - 1].effects; // default outcome
      return { d, sig: sig(eff), pts: vitalPts(eff), conditional: opt.outcomes.length > 1 || !!opt.if };
    });
    for (const a of info) {
      for (const b of info) {
        if (a.d === b.d) continue;
        if (a.sig !== b.sig) continue;
        if (dominates(a.pts, b.pts)) {
          const note = a.conditional || b.conditional ? "  (has conditional outcomes/vis — verify)" : "";
          const fmt = (p: Record<string, number>) => VITALS.filter((k) => p[k]).map((k) => `${k}${p[k] > 0 ? "+" : ""}${p[k]}`).join(" ") || "—";
          console.log(`${(deck.id + " / " + card.id).padEnd(46)} ${b.d} is dominated by ${a.d}${note}`);
          console.log(`${" ".repeat(48)}${a.d}: ${fmt(a.pts)}   vs   ${b.d}: ${fmt(b.pts)}`);
          flagged++;
        }
      }
    }
  }
}
console.log(`\n${flagged} dominated option(s) flagged.`);
