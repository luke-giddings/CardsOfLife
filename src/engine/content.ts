import type { Card, Content, Deck, GameState, StatusKind, StatusStateDef, Vitals, VitalKey } from "./types.ts";

// The engine reads content through this single binding, set once at startup.
// Everything derived from content that the turn would otherwise rebuild on
// every draw (the deck-tagged card list, lookups by id, the decks flagged for
// the draw's special rules) is built here, once, when it is set.
export let CONTENT: Content;

interface ContentIndex {
  cards: Card[]; // every card, tagged with its deck, in content order
  byId: Map<string, Card>;
  decks: { deck: Deck; cards: Card[] }[]; // content order, cards tagged
  priority: Set<string>; // decks whose cards take over the draw (Deck.priority)
  spared: Set<string>; // decks never pushed out by them (Deck.neverSuppressed)
  noDrift: string[]; // decks that suspend status drift while active
}
let INDEX: ContentIndex;

export function setContent(content: Content): void {
  CONTENT = content;
  const decks = content.decks.map((deck) => ({
    deck,
    cards: deck.cards.map((card) => ({ ...card, deck: deck.id })),
  }));
  const cards = decks.flatMap((d) => d.cards);
  INDEX = {
    cards,
    byId: new Map(cards.map((c) => [c.id, c])),
    decks,
    priority: new Set(content.decks.filter((d) => d.priority).map((d) => d.id)),
    spared: new Set(content.decks.filter((d) => d.neverSuppressed).map((d) => d.id)),
    noDrift: content.decks.filter((d) => d.noDrift).map((d) => d.id),
  };
}

// Every card, tagged with the deck it belongs to, in content order. Shared:
// callers must not mutate it.
export function allCards(): readonly Card[] {
  return INDEX.cards;
}

export function cardById(id: string): Card | undefined {
  return INDEX.byId.get(id);
}

export function deckIndex(): ContentIndex {
  return INDEX;
}

// The definition of the state a status kind is currently in.
export function currentState(state: GameState, kind: StatusKind): StatusStateDef | undefined {
  return CONTENT.statuses[kind]?.states[state.statuses[kind]];
}

// Sum of every active status state's per-turn drift. While a `noDrift` deck is
// active (babyhood — the unloseable grace period), status drift is suspended,
// so living costs etc. don't bite before the game proper begins — EXCEPT kinds
// flagged `ignoreNoDrift` (the age status), whose life-stage drift is always
// felt. The single source of truth for the turn, for `Condition.drift`, and for
// the UI's previews.
export function totalDrift(state: GameState): Partial<Vitals> {
  const noDrift = INDEX.noDrift.some((id) => state.activeDecks.includes(id));
  const drift: Partial<Vitals> = {};
  for (const kind of Object.keys(state.statuses) as StatusKind[]) {
    if (noDrift && !CONTENT.statuses[kind]?.ignoreNoDrift) continue;
    for (const [k, v] of Object.entries(currentState(state, kind)?.drift ?? {})) {
      const key = k as VitalKey;
      drift[key] = (drift[key] ?? 0) + (v ?? 0);
    }
  }
  return drift;
}
