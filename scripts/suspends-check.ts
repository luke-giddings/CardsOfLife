// Content check: an outcome that sets a status AND, in the same effect, a status
// whose state SUSPENDS it.
//
// A suspension stashes whatever the suspended status holds at the moment it
// fires, and hands it back when you leave. So if the explicit set lands first,
// the stash captures the value the suspension was about to force, and leaving
// "restores" you into the suspended state permanently. home_workhouse_apprentice
// did exactly this: setting housing="apprentice" alongside job="apprentice"
// meant qualifying as a journeyman left you living with your old master for
// good. The fix is always the same — drop the explicit set and let `suspends` do
// its job, which is what it is for.
// Run: node --experimental-strip-types scripts/suspends-check.ts
import { content } from "../src/content/index.ts";
for (const d of content.decks) for (const c of d.cards) for (const [dir, o] of Object.entries(c.options as any)) {
  for (const out of (o as any).outcomes) {
    const set = out.effects?.setStatus;
    if (!set) continue;
    for (const [kind, value] of Object.entries(set)) {
      const susp = (content.statuses as any)[kind]?.states?.[value as string]?.suspends;
      if (!susp) continue;
      for (const other of Object.keys(susp)) {
        if (other in set) console.log(`${c.id}.${dir}: sets ${other}="${(set as any)[other]}" AND ${kind}="${value}", whose state suspends ${other}`);
      }
    }
  }
}

console.log("checked every outcome for a poisoned suspension stash");
