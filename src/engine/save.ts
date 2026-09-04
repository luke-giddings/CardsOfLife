import { DEFAULT_TRAITS, type GameState, type Traits } from "./types.ts";

const KEY = "cardsoflife.save.v1";

// Trait key renames, applied on load so a game already in progress on someone's
// phone survives a rename (old persisted key on the left → current key on the
// right). Add an entry here whenever a trait is renamed in types.ts.
const TRAIT_RENAMES: Record<string, keyof Traits> = {
  hasBrother: "relBrotherActive",
  hasSister: "relSisterActive",
  uniFund: "eduUniFund",
  experience: "jobExperience",
  skill: "jobSkill",
  reachedFactory: "jobReachedFactory",
  numTimesChangedJob: "jobTimesChanged",
};

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
    const state = JSON.parse(raw) as GameState;
    // Migrate an older save's traits: rename any old keys, then backfill any
    // traits added since the save was written so nothing reads as undefined.
    if (state.traits) {
      const t = state.traits as unknown as Record<string, unknown>;
      for (const [oldK, newK] of Object.entries(TRAIT_RENAMES)) {
        if (oldK in t && !(newK in t)) {
          t[newK] = t[oldK];
          delete t[oldK];
        }
      }
      state.traits = { ...DEFAULT_TRAITS, ...(state.traits as Partial<Traits>) };
    }
    return state;
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
