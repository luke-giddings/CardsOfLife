import type { GameState } from "./types.ts";

// Bump this whenever GameState's SHAPE changes, so saves written by an older
// build simply do not load (you get a fresh life) instead of loading silently
// into an inconsistent state. This is deliberately NOT migration — there is no
// attempt to carry an old save forward, which is the point: during development a
// restart is cheap, a half-converted state is confusing. (v1 -> v2:
// `housingBeforeApprentice` became the general `suspendedStatuses`, so a v1 save
// mid-apprenticeship had no stash to restore and left you housed "With Master".
// v2 -> v3: `playedFillers` arrived, and a save without it crashes the draw.
// v3 -> v4: `seed` arrived, the life's starting seed, shown in the footer.
// v4 -> v5: the sibling cooldown traits. loadGame does not back-fill traits from
// DEFAULT_TRAITS, and a missing counter fails its `max: 0` gate — so an old save
// would have silently stopped every sibling beat.)
// One number, two keys: the history holds whole GameStates, so it can never be
// read against a save of a different shape. Bumping them separately is the one
// way this scheme breaks, so there is only one place to bump.
const SAVE_VERSION = 5;
const KEY = `cardsoflife.save.v${SAVE_VERSION}`;

// The debug rewind list: the pre-choice snapshot at each card played, so the
// debug panel can list what was drawn and chosen, and jump back to retry one.
export interface HistoryEntry {
  age: number;
  cardId: string;
  choice: string;
  before: GameState;
}

// Kept in its OWN key rather than folded into the save. Every entry carries a
// whole pre-choice GameState, so the history is much the larger of the two blobs
// (a long life is ~100 of them); separating them means a quota failure or a
// corrupt history costs you the rewind list and never the run itself. Versioned
// with the save, since the snapshots inside it ARE GameStates.
const HISTORY_KEY = `cardsoflife.history.v${SAVE_VERSION}`;

export function saveGame(state: GameState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Private mode / storage disabled — the game still plays, just no resume.
  }
}

export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GameState;
  } catch {
    return null;
  }
}

export function saveHistory(history: HistoryEntry[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // Storage disabled, or the history outgrew the quota. The run itself is
    // saved under its own key regardless — only the rewind list is lost.
  }
}

// Only meaningful next to a save that loaded: the entries hold GameStates from
// THIS run, so the caller must drop them when it starts a fresh life instead.
export function loadHistory(): HistoryEntry[] | null {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as HistoryEntry[]) : null;
  } catch {
    return null;
  }
}

// Drops the run AND its history: a new life must never inherit the old one's
// rewind points, which would restore a state the current run never had.
export function clearSave(): void {
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem(HISTORY_KEY);
  } catch {
    // ignore
  }
}
