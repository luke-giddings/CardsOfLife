// The SHELL FLOW: the cards you see before a life starts.
//
// These look like game cards — same face, same swipe, same flip — but they are
// not game content and the engine never sees them. They draw from no deck, cost
// no year, and touch no vital. That is why they live here in the UI rather than
// in src/content: a deck of these would have to be excluded from every draw pool,
// every milestone check and every stat script, to buy nothing.
//
// Each card says how much chrome shows behind it (see IntroChrome), so the
// title card can be a bare title screen and the next card can BRING the vital
// bars in as it explains them.
//
// Two flows:
//   FIRST_RUN  — shown ONCE ever (gated on the `cardsoflife.intro` flag): what
//                the game is, a card you practise the swipe on, and the choice
//                between seeing the odds and not.
//   RESUME     — shown on every later opening WITH a life in progress: continue
//                it, or start again.
// With the intro seen and no life saved, there is no card at all — a new life
// just begins.
import type { Direction } from "../engine/types.ts";
import type { StringId } from "../i18n/index.ts";

export interface IntroOption {
  label: StringId;
  // Shown on the back of the card, as a game card's result is. OMIT it to make
  // the swipe act at once with no flip — right for a menu ("Continue"), where a
  // line of text and a second tap would only be in the way. The tutorial card
  // keeps its results precisely because the flip is one of the things it teaches.
  result?: StringId;
  // Where the swipe leads: a card id in the same flow, or "play" to leave the
  // flow. Omitted means the next card in the list.
  goto?: string;
  // Applied as the swipe is taken.
  setHard?: boolean;  // the easy/hard fork
  fresh?: boolean;    // start a NEW life rather than resuming the saved one
}

// How much of the game's chrome shows behind a shell card.
//   "none" — a title screen: no age, no status chips, and no vital bars either.
//   "bars" — the four vital bars appear, but still no age or chips. The tutorial
//            card uses this, and their ARRIVAL is the point: they show up on the
//            same card that explains what they are.
//   "full" — everything, as in play. The resume card wants this: the age and
//            bars of the life you left are exactly what you need to decide.
export type IntroChrome = "none" | "bars" | "full";

export interface IntroCard {
  id: string;
  prompt: StringId;
  chrome: IntroChrome;
  // Same shape as a game card's, minus everything the engine would read.
  options: Partial<Record<Direction, IntroOption>>;
}

export const PLAY = "play";

export const FIRST_RUN: IntroCard[] = [
  {
    // No `result` on either swipe: the first card should get out of the way.
    id: "intro_welcome",
    prompt: "intro_welcome.prompt",
    chrome: "none",
    options: {
      left: { label: "intro_welcome.left" },
      right: { label: "intro_welcome.right", goto: "intro_mode" },
    },
  },
  {
    // The tutorial. All three swipes do the same thing — advance — so there is
    // no wrong move; what differs is the result line, which names the direction
    // back to you. The third option is on `up` because that is where every third
    // option in the game sits, and it is the one players miss.
    id: "intro_swipe",
    prompt: "intro_swipe.prompt",
    chrome: "bars",
    options: {
      left: { label: "intro_swipe.left", result: "intro_swipe.left.r0" },
      right: { label: "intro_swipe.right", result: "intro_swipe.right.r0" },
      up: { label: "intro_swipe.up", result: "intro_swipe.up.r0" },
    },
  },
  {
    id: "intro_mode",
    prompt: "intro_mode.prompt",
    chrome: "bars",
    options: {
      left: { label: "intro_mode.left", result: "intro_mode.left.r0", setHard: false, goto: PLAY },
      right: { label: "intro_mode.right", result: "intro_mode.right.r0", setHard: true, goto: PLAY },
    },
  },
];

export const RESUME: IntroCard[] = [
  {
    id: "intro_resume",
    prompt: "intro_resume.prompt",
    chrome: "full",
    options: {
      left: { label: "intro_resume.left", goto: PLAY },
      right: { label: "intro_resume.right", goto: PLAY, fresh: true },
    },
  },
];
