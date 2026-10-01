import type { GameState } from "./types.ts";

// Bump this whenever GameState's SHAPE changes — a field added, renamed or
// reshaped, or a trait added (loadGame does not back-fill traits from their
// defaults, and a missing counter silently fails its gates) — so saves written
// by an older build simply do not load (you get a fresh life) instead of
// loading into an inconsistent state. Deliberately NOT migration: during
// development a restart is cheap, a half-converted state is confusing.
// One number, two keys: the history holds whole GameStates, so it can never be
// read against a save of a different shape.
const SAVE_VERSION = 9;
// The game names its own storage: every key is `<prefix>.save.v<N>` etc.
let PREFIX = "game";
export function setSavePrefix(prefix: string): void {
  PREFIX = prefix;
}
const key = (): string => `${PREFIX}.save.v${SAVE_VERSION}`;

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
const historyKey = (): string => `${PREFIX}.history.v${SAVE_VERSION}`;

// localStorage, guarded: private mode, disabled storage or a full quota must
// never break the game, only lose what would have been kept. Shared with the
// UI's own small settings.
export function storageAvailable(): boolean {
  try {
    void localStorage.length; // throws where storage is unavailable
    return true;
  } catch {
    return false;
  }
}
export function readStore(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
export function writeStore(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage disabled or over quota: the game still plays, it just isn't kept.
  }
}
export function removeStore(...keys: string[]): void {
  try {
    for (const k of keys) localStorage.removeItem(k);
  } catch {
    // ignore
  }
}

function readJson(key: string): unknown {
  const raw = readStore(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveGame(state: GameState): void {
  writeStore(key(), JSON.stringify(state));
}

export function loadGame(): GameState | null {
  return readJson(key()) as GameState | null;
}

// Storage disabled, or the history outgrew the quota: the run itself is saved
// under its own key regardless — only the rewind list is lost.
export function saveHistory(history: HistoryEntry[]): void {
  writeStore(historyKey(), JSON.stringify(history));
}

// Only meaningful next to a save that loaded: the entries hold GameStates from
// THIS run, so the caller must drop them when it starts a fresh life instead.
export function loadHistory(): HistoryEntry[] | null {
  const parsed = readJson(historyKey());
  return Array.isArray(parsed) ? (parsed as HistoryEntry[]) : null;
}

// Drops the run AND its history: a new life must never inherit the old one's
// rewind points, which would restore a state the current run never had.
export function clearSave(): void {
  removeStore(key(), historyKey());
}
