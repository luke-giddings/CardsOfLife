import type { Condition, GameState, NumberMatch, StatusKind, Traits, VitalKey } from "./types.ts";
import { CONTENT, totalDrift } from "./content.ts";

function matchNumber(value: number, m: NumberMatch): boolean {
  if (typeof m === "number") return value === m;
  if (m.min !== undefined && value < m.min) return false;
  if (m.max !== undefined && value > m.max) return false;
  return true;
}

// Every {min,max} in a record of ranges holds for the matching value.
function matchRanges(values: Partial<Record<string, number>>, ranges: Partial<Record<string, NumberMatch>>): boolean {
  return Object.entries(ranges).every(([k, m]) => m === undefined || matchNumber(values[k] ?? 0, m));
}

function statusRank(kind: StatusKind, value: string): number {
  const levels = CONTENT.statuses[kind]?.levels;
  if (!levels) return -1;
  return levels.indexOf(value);
}

// True when every clause present in the condition holds. An absent clause is
// simply not checked, so `{}` (or undefined) always matches.
export function meets(cond: Condition | undefined, state: GameState): boolean {
  if (!cond) return true;

  if (cond.ageMin !== undefined && state.age < cond.ageMin) return false;
  if (cond.ageMax !== undefined && state.age > cond.ageMax) return false;

  if (cond.vitals && !matchRanges(state.vitals, cond.vitals)) return false;

  // What is coming IN each year, rather than what you have. `totalDrift` is the
  // same sum the turn applies and the UI previews, so a gate written here cannot
  // drift out of step with the number the player is shown.
  if (cond.drift && !matchRanges(totalDrift(state) as Partial<Record<VitalKey, number>>, cond.drift)) return false;

  if (cond.status) {
    for (const [k, match] of Object.entries(cond.status)) {
      const kind = k as StatusKind;
      const current = state.statuses[kind];
      if (typeof match === "string") {
        if (current !== match) return false;
      } else {
        // { atLeast } / { atMost } — compare on the status's ordered levels
        const have = statusRank(kind, current);
        if (match.atLeast !== undefined) {
          const need = statusRank(kind, match.atLeast);
          if (need < 0 || have < 0 || have < need) return false;
        }
        if (match.atMost !== undefined) {
          const cap = statusRank(kind, match.atMost);
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
  if (cond.any && !cond.any.some((c) => meets(c, state))) return false;

  return true;
}
