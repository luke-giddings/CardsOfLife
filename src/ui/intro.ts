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
//   FIRST_RUN  — shown ONCE ever (gated on the `cardsoflife.intro` flag): a
//                title screen, a card you practise the swipe on, and the choice
//                between seeing the odds and not.
//   RETURNING  — shown on every later opening: the same title card, carrying a
//                menu. Continue (only with a life saved) or a new life; either
//                goes straight to play.
import type { Direction } from "../engine/types.ts";
import type { StringId } from "../i18n/index.ts";

export interface IntroOption {
  // Absent on a `tap` card, which has nothing to label.
  label?: StringId;
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
  // Append a live sample of the easy-mode preview to the result, rendered by the
  // SAME code the card faces use — so "this is what you will see" is literally
  // what you will see, and cannot drift from it.
  sample?: boolean;
  // Drop this button entirely when there is no life saved. "Continue" on the
  // returning title card: there is nothing to continue to.
  needsSave?: boolean;
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
  // Draw the eye to one of the top-bar controls while this card is up. The
  // easy/hard card names the HARD button, and a named button you cannot find is
  // no better than one that was never mentioned.
  highlight?: "hard";
  // Set only on the title card, and rendered large: it is the game's name, not
  // a line of its prose.
  title?: StringId;
  prompt: StringId;
  chrome: IntroChrome;
  // Same shape as a game card's, minus everything the engine would read.
  // A card has EITHER swipe options or a single button, never both.
  options?: Partial<Record<Direction, IntroOption>>;
  // Centred buttons instead of swipe choices — the first is the primary one. The
  // title cards use these: the swipe has not been taught yet on the first run,
  // and on a return a menu is a menu.
  buttons?: IntroOption[];
  // No choice at all — a tap anywhere on the card moves on. For a card that asks
  // you to LOOK at something rather than answer anything, and that comes before
  // the swipe has been taught.
  tap?: IntroOption;
  // A headed list under the prompt — the about card's "coming soon".
  listHeading?: StringId;
  list?: StringId[];
}

export const PLAY = "play";

// The TITLE CARD, shared by both flows, so the game always opens on its own name
// and a change to it can only be made in one place. Everything but the BUTTONS
// is the same, and the buttons are the one thing that legitimately differs: on a
// first run "New life" falls through to the tutorial behind this card, and on
// every later opening it goes straight to play. Continue is the only button that
// can be absent, and only because there is nothing to continue to.
const WELCOME = {
  id: "intro_welcome",
  title: "intro_welcome.title",
  prompt: "intro_welcome.prompt",
  chrome: "none",
} satisfies Omit<IntroCard, "buttons">;

// Credits, and what is still to come. Reached from the title card and returning
// to it — the only card in either flow that goes BACKWARDS, which `goto` handles
// without knowing it is going back.
// No title on this one: it is reached FROM the title card, so repeating the name
// in full is both redundant and — with a list under it — more than the card can
// hold.
// It belongs to BOTH flows. Someone opening the game for the first time may
// perfectly well want to know whose game it is before they start a life in it,
// and `goto` only resolves within the flow it is standing in (see resolveIntro),
// so the card has to appear in each rather than be shared by reference.
const ABOUT: IntroCard = {
  id: "intro_about",
  prompt: "intro_about.prompt",
  chrome: "none",
  listHeading: "intro_about.soon",
  list: ["intro_about.soon1", "intro_about.soon2", "intro_about.soon3", "intro_about.soon4"],
  buttons: [{ label: "intro_about.back", goto: "intro_welcome" }],
};

export const FIRST_RUN: IntroCard[] = [
  {
    // No result on either button: the title should get out of the way. `fresh`
    // starts the life NOW rather than when the flow ends, so the cards that
    // follow describe the life you are about to play — on a true first run there
    // is nothing to clear, but the debug replay would otherwise tutor you with
    // the bars of the life it is replacing. No `goto` on New life either, so it
    // falls through to the card below and into the tutorial.
    //
    // The returning card's buttons minus Continue: on a true first run there is
    // nothing to continue to, and on a debug replay offering it would skip the
    // very flow you pressed the button to see.
    ...WELCOME,
    buttons: [
      { label: "ui.newLife", fresh: true },
      { label: "intro_about.go", goto: "intro_about" },
    ],
  },
  {
    // THE VITALS, first: what the bars are, before what to do about them. They
    // fade in and pulse as this card arrives (see showIntroCard), so the words
    // point at the thing that just moved. No choice on it at all — a tap
    // anywhere moves on. It asks you to look, not to answer, and the swipe is
    // taught on the NEXT card, so a swipe here would want a gesture nobody has
    // been shown.
    id: "intro_vitals",
    prompt: "intro_vitals.prompt",
    chrome: "bars",
    tap: {},
  },
  {
    // THE GESTURE, once you know what the bars are. All three swipes do the same
    // thing — advance — so there is no wrong move; what differs is the result
    // line, which names the direction back to you. The third option is on `up`
    // because that is where every third option in the game sits, and it is the
    // one players miss.
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
    // The easy/hard fork. The "you can change this later" note lives on the
    // PROMPT, not the results: it is true of both answers, and it is worth
    // knowing before you choose rather than after. The HARD button pulses while
    // this card is up, so the thing the prompt names is the thing you can see.
    id: "intro_mode",
    prompt: "intro_mode.prompt",
    chrome: "bars",
    highlight: "hard",
    // Both answers start a FRESH life. The first-time flow has just explained
    // being born, so it has to end at the birth card — resuming whatever was
    // saved would drop a first-time player into the middle of someone else's
    // life, and drops the debug replay somewhere that is not what it is for.
    options: {
      left: { label: "intro_mode.left", result: "intro_mode.left.r0", setHard: false, goto: PLAY, fresh: true, sample: true },
      right: { label: "intro_mode.right", result: "intro_mode.right.r0", setHard: true, goto: PLAY, fresh: true },
    },
  },
  // Last, so the fall-through order of the tutorial is untouched: nothing runs
  // off the end of the mode card (both its answers `goto` PLAY), and this is
  // reachable only by name from the title.
  ABOUT,
];

// Every opening after the first: the SAME title card, carrying a menu. Continue
// is dropped when there is no life saved, which leaves one button and the card
// the first run opened on — so the game always opens on its own title, and what
// differs is only what you can do from there. Either button goes straight to
// play: the first-time flow is shown once ever, never again.
export const RETURNING: IntroCard[] = [
  {
    // The same card, with the menu a returning player wants: both roads out of
    // it go straight to play, because the first-time flow is shown once ever.
    ...WELCOME,
    buttons: [
      { label: "intro_resume.left", goto: PLAY, needsSave: true },
      { label: "ui.newLife", goto: PLAY, fresh: true },
      { label: "intro_about.go", goto: "intro_about" },
    ],
  },
  ABOUT,
];
