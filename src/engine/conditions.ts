import type {
  Condition,
  Content,
  GameState,
  NumberMatch,
  StatusKind,
  Traits,
} from "./types.ts";

function matchNumber(value: number, m: NumberMatch): boolean {
  if (typeof m === "number") return value === m;
  if (m.min !== undefined && value < m.min) return false;
  if (m.max !== undefined && value > m.max) return false;
  return true;
}

function statusRank(content: Content, kind: StatusKind, value: string): number {
  const levels = content.statuses[kind]?.levels;
  if (!levels) return -1;
  return levels.indexOf(value);
}

// True when every clause present in the condition holds. An absent clause is
// simply not checked, so `{}` (or undefined) always matches.
export function meets(
  cond: Condition | undefined,
  state: GameState,
  content: Content,
): boolean {
  if (!cond) return true;

  if (cond.ageMin !== undefined && state.age < cond.ageMin) return false;
  if (cond.ageMax !== undefined && state.age > cond.ageMax) return false;

  if (cond.vitals) {
    for (const [key, range] of Object.entries(cond.vitals)) {
      const v = state.vitals[key as keyof typeof state.vitals];
      if (range.min !== undefined && v < range.min) return false;
      if (range.max !== undefined && v > range.max) return false;
    }
  }

  if (cond.status) {
    for (const [k, match] of Object.entries(cond.status)) {
      const kind = k as StatusKind;
      const current = state.statuses[kind];
      if (typeof match === "string") {
        if (current !== match) return false;
      } else {
        // { atLeast } / { atMost } — compare on the status's ordered levels
        const have = statusRank(content, kind, current);
        if (match.atLeast !== undefined) {
          const need = statusRank(content, kind, match.atLeast);
          if (need < 0 || have < 0 || have < need) return false;
        }
        if (match.atMost !== undefined) {
          const cap = statusRank(content, kind, match.atMost);
          // An unranked current value (rank -1) — e.g. the pre-adult `default`
          // lifestyle, which is off the ordered ladder — counts as BELOW every
          // ranked level, so it satisfies any atMost cap. (atLeast above still
          // fails it, which is correct: default is beneath the lowest tier.)
          if (cap < 0 || have > cap) return false;
        }
      }
    }
  }

  if (cond.traits) {
    for (const [k, expected] of Object.entries(cond.traits)) {
      const key = k as keyof Traits;
      const actual = state.traits[key];
      if (typeof actual === "number") {
        if (!matchNumber(actual, expected as NumberMatch)) return false;
      } else if (actual !== expected) {
        return false;
      }
    }
  }

  // OR-gate: at least one sub-condition must hold (AND-ed with the clauses above).
  if (cond.any && !cond.any.some((c) => meets(c, state, content))) return false;

  return true;
}
