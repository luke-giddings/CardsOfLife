import type { GameState } from "./types.ts";

// Bump this whenever GameState's SHAPE changes, so saves written by an older
build simply do not load (you get a fresh life) instead of loading silently into
an inconsistent state. This is deliberately NOT migration — there is no attempt
to carry an old save forward, which is the point: during development a restart is
cheap, a half-converted state is confusing. (v1 -> v2: `housingBeforeApprentice`
became the general `suspendedStatuses`, so a v1 save mid-apprenticeship had no
stash to restore and left you housed "With Master" forever.)
const KEY = "cardsoflife.save.v2";

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

export function clearSave(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
