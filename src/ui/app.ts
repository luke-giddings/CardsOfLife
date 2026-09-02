import { gameContent as content } from "../content/index.ts";
import {
  applyEffect,
  chooseDirection,
  drawCard,
  eligibleDraw,
  findRescue,
  initGame,
  quietYear,
  resolveOutcome,
  setContent,
  totalDrift,
} from "../engine/engine.ts";
import { meets } from "../engine/conditions.ts";
import { clearSave, loadGame, saveGame } from "../engine/save.ts";
import {
  ENDINGS,
  STATUS_KINDS,
  VITAL_KEYS,
  VITAL_MIN,
  type Card,
  type CardOption,
  type Condition,
  type Direction,
  type Effect,
  type GameState,
  type StatusKind,
  type Vitals,
  type VitalKey,
} from "../engine/types.ts";
import { t, tf, getLocale, setLocale, LOCALES, type StringId } from "../i18n/index.ts";

import { APP_VERSION, BUILD_DESC } from "../version.ts";

const DEBUG_KEY = "cardsoflife.debug";
const HARD_KEY = "cardsoflife.hard";
const DECK_BY_ID = new Map(content.decks.map((d) => [d.id, d]));
const ALL_CARDS: Card[] = content.decks.flatMap((d) =>
  d.cards.map((c) => ({ ...c, deck: d.id }) as Card),
);
const CARD_BY_ID = new Map(ALL_CARDS.map((c) => [c.id, c]));
const DIRECTIONS: Direction[] = ["left", "right", "up", "down"];

const VITAL_LABEL: Record<VitalKey, StringId> = {
  finances: "vital.finances",
  happiness: "vital.happiness",
  health: "vital.health",
  spirit: "vital.spirit",
};

// A shape/icon per vital (in addition to colour) so statuses can show which
// vitals they affect, and for colour-blind legibility.
const VITAL_ICON: Record<VitalKey, string> = {
  finances: "£",
  happiness: "☺",
  health: "♥",
  spirit: "✦",
};

const STATUS_LABEL: Record<StatusKind, StringId> = {
  age: "statuskind.age",
  job: "statuskind.job",
  housing: "statuskind.housing",
  education: "statuskind.education",
  lifestyle: "statuskind.lifestyle",
};

const SWIPE_THRESHOLD = 60; // px of drag before a swipe locks in (highlight + commit) — the DECISION point
const MAX_TILT = 70; // the tilt asymptotes toward this as you drag to the edge; release flips the rest
const TILT_EASE = 55; // drag distance (px) at which tilt reaches half of MAX_TILT — higher = gentler
const TAP_SLOP = 12; // movement (px) under which a pointer-up counts as a tap, not a swipe
const FLIP_MS = 620; // must match the .flip CSS transition
const SLIDE_MS = 320;

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const LEAN_CLASSES = ["lean-left", "lean-right", "lean-up", "lean-down"];

const FULL_FLIP: Record<Direction, string> = {
  left: "rotateY(-180deg)",
  right: "rotateY(180deg)",
  up: "rotateX(180deg)",
  down: "rotateX(-180deg)",
};
const LEAVE: Record<Direction, string> = {
  left: "translateX(-140%) rotate(-8deg)",
  right: "translateX(140%) rotate(8deg)",
  up: "translateY(-140%)",
  down: "translateY(140%)",
};

export class Game {
  private root: HTMLElement;
  private state!: GameState;
  private card: Card | null = null;
  private busy = false;
  private phase: "front" | "back" | "over" = "front";
  private lastDir: Direction = "right";

  private topbar!: HTMLElement;
  private scene!: HTMLElement;
  private holder: HTMLElement | null = null;
  private flip: HTMLElement | null = null;

  private debug = false;
  private hard = false; // "hard mode": HIDE each choice's vital-change preview (shown by default)
  private hardBtn!: HTMLButtonElement;
  private ageNumEl!: HTMLElement;
  private fills!: Record<VitalKey, HTMLElement>;
  private flashes!: Record<VitalKey, HTMLElement>;
  private drains!: Record<VitalKey, HTMLElement>;
  private statusesEl!: HTMLElement;
  private dbgBtn!: HTMLButtonElement;
  private debugPanel!: HTMLElement;

  private prevVitals!: Vitals;
  private seenDecks = new Set<string>();
  private pendingUnlock: { title: StringId; blurb: StringId } | null = null;
  // A lagging snapshot the STATUS CHIPS render from. When a choice changes a
  // status AND unlocks a new titled deck (a "new chapter"), we hold the visible
  // chip change here through the result reveal and only advance it when the
  // chapter card appears — so the status change lands together with the card,
  // not a beat early. Vitals/bars always read live state; only the chips lag.
  private displayStatuses!: Record<StatusKind, string>;
  private displayDecks: string[] = [];
  private debugSelectedId: string | null = null;
  private debugOpen = new Set<string>(["pool", "detail"]); // which debug sections are expanded
  // Debug history: the pre-choice snapshot at each played card, so we can list
  // what was drawn/chosen and rewind to try a different choice.
  private history: { age: number; cardId: string; choice: string; before: GameState }[] = [];

  constructor(root: HTMLElement) {
    this.root = root;
    setContent(content);
    this.debug = loadDebug();
    this.hard = loadHard();
    this.buildShell();
    this.state = loadGame() ?? initGame(content);
    this.prevVitals = { ...this.state.vitals };
    this.seenDecks = new Set(this.state.activeDecks);
    this.captureDisplay();
    this.syncTop();
    if (this.state.over) this.showEnd();
    else this.beginTurn();
    window.addEventListener("keydown", this.onKey);
  }

  // --- shell (built once; updated in place so the bars can animate) -----------

  private buildShell(): void {
    this.root.innerHTML = "";
    this.root.classList.toggle("debug-on", this.debug);

    this.topbar = el("header", "topbar");
    const headRow = el("div", "head-row");
    const age = el("div", "age");
    this.ageNumEl = el("span", "age-num");
    const ageLbl = el("span", "age-lbl");
    ageLbl.textContent = t("ui.yearsOld");
    age.append(this.ageNumEl, ageLbl);

    const controls = el("div", "controls");
    const lang = el("button", "lang") as HTMLButtonElement;
    lang.textContent = getLocale().toUpperCase();
    lang.title = "Language";
    lang.addEventListener("click", () => {
      if (!this.busy) this.cycleLocale();
    });
    this.hardBtn = el("button", "hard") as HTMLButtonElement;
    this.hardBtn.textContent = t("ui.hard");
    this.hardBtn.title = t("ui.hardTip");
    this.hardBtn.classList.toggle("on", this.hard);
    this.hardBtn.addEventListener("click", () => this.toggleHard());
    this.dbgBtn = el("button", "dbg") as HTMLButtonElement;
    this.dbgBtn.textContent = t("ui.debug");
    this.dbgBtn.title = t("ui.debugTip");
    this.dbgBtn.addEventListener("click", () => this.toggleDebug());
    const reset = el("button", "reset") as HTMLButtonElement;
    reset.textContent = t("ui.reset");
    reset.title = t("ui.resetTip");
    reset.addEventListener("click", () => {
      if (!this.busy) this.restart();
    });
    // Debug lives on the far left (with the age) so it's clearly separate from
    // the three player-facing controls (Language / Hard / Reset) on the right.
    controls.append(lang, this.hardBtn, reset);
    const headLeft = el("div", "head-left");
    headLeft.append(age, this.dbgBtn);
    headRow.append(headLeft, controls);

    const vitals = el("div", "vitals");
    this.fills = {} as Record<VitalKey, HTMLElement>;
    this.flashes = {} as Record<VitalKey, HTMLElement>;
    this.drains = {} as Record<VitalKey, HTMLElement>;
    for (const key of VITAL_KEYS) {
      const cell = el("div", `vital vital-${key}`);
      const top = el("div", "vital-top");
      const label = el("span");
      label.innerHTML = `<span class="vicon">${VITAL_ICON[key]}</span> ${t(VITAL_LABEL[key])}`;
      top.append(label);
      const track = el("div", "track");
      const fill = el("div", "fill");
      const drain = el("div", "drain"); // marks the tip a status drift will remove
      const flash = el("div", "flash"); // bright segment shown on change
      track.append(fill, drain, flash);
      cell.append(top, track);
      vitals.append(cell);
      this.fills[key] = fill;
      this.flashes[key] = flash;
      this.drains[key] = drain;
      // Debug: tap a vital to +10, double-tap to +25.
      let lastTap = 0;
      let tapTimer: number | undefined;
      cell.addEventListener("click", () => {
        if (!this.debug) return;
        const now = Date.now();
        if (now - lastTap < 280) {
          window.clearTimeout(tapTimer);
          lastTap = 0;
          this.adjustVital(key, 25);
        } else {
          lastTap = now;
          tapTimer = window.setTimeout(() => {
            this.adjustVital(key, 10);
            lastTap = 0;
          }, 280);
        }
      });
    }
    this.statusesEl = el("div", "statuses");
    this.topbar.append(headRow, vitals, this.statusesEl);

    const stage = el("main", "stage");
    this.scene = el("div", "scene");
    this.debugPanel = el("div", "debug-panel");
    this.debugPanel.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      // Collapsible sections: track open/closed so re-renders preserve it.
      const summary = target.closest<HTMLElement>("summary[data-sec]");
      if (summary) {
        const id = summary.dataset.sec!;
        if (this.debugOpen.has(id)) this.debugOpen.delete(id);
        else this.debugOpen.add(id);
        return; // let <details> toggle natively
      }
      const hit = target.closest<HTMLElement>(
        "[data-card],[data-vital],[data-age],[data-deck],[data-trait],[data-hist]",
      );
      if (!hit) return;
      const d = hit.dataset;
      if (d.hist != null) return this.rewind(Number(d.hist));
      if (d.vital) return this.adjustVital(d.vital as VitalKey, Number(d.delta));
      if (d.age) return this.adjustAge(Number(d.age));
      if (d.deck) return this.toggleDeck(d.deck);
      if (d.trait) return this.toggleTrait(d.trait, d.tdelta ? Number(d.tdelta) : undefined);
      const id = d.card!;
      if (d.action === "force") this.forceCard(id); // pool draw ▶ — no age change
      else if (d.action === "skip") this.forceCard(id, true); // skip to milestone — jump age
      else {
        this.debugSelectedId = id;
        this.renderDebug();
      }
    });
    stage.append(this.scene, this.debugPanel);

    const version = el("div", "version");
    version.innerHTML = `<b>v${APP_VERSION} · ${BUILD_DESC}</b><br>build ${__BUILD__}`;

    this.root.append(this.topbar, stage, version);
    this.dbgBtn.classList.toggle("on", this.debug);
  }

  private syncTop(): void {
    const s = this.state;
    this.ageNumEl.textContent = String(s.age);
    // The chips (and the drain preview that must match them) render from the
    // lagging display snapshot, so a status change held for a chapter card
    // doesn't show early. Vitals/bars below always read live state.
    const disp: GameState = { ...s, statuses: this.displayStatuses, activeDecks: this.displayDecks };
    // Preview each active status's drain: the tip of the bar that next turn's
    // drift will strip off is marked, so a passive loss is visible before it
    // happens. Only losses (negative drift) are previewed.
    const drift = totalDrift(disp, content);
    for (const key of VITAL_KEYS) {
      const nv = s.vitals[key];
      const ov = this.prevVitals[key];
      this.fills[key].style.width = `${nv}%`;
      if (nv !== ov) this.flashDelta(key, ov, nv);
      const d = drift[key] ?? 0;
      const drain = this.drains[key];
      if (d < 0 && nv > 0) {
        const loss = Math.min(-d, nv); // can't strip more than the bar holds
        drain.style.left = `${nv - loss}%`;
        drain.style.width = `${loss}%`;
        drain.style.opacity = "1";
      } else {
        drain.style.opacity = "0";
      }
    }
    this.prevVitals = { ...s.vitals };
    let chips = "";
    // The three core life statuses (job, housing, education) show together from
    // the start of childhood, so the player always sees where they stand — even
    // when a status is still at its neutral start value. During babyhood they
    // stay hidden (there's nothing meaningful to show yet). Lifestyle is
    // reserved, so it only appears once it differs from its default.
    const inChildhood = !disp.activeDecks.includes("age_baby");
    for (const kind of STATUS_KINDS) {
      const value = disp.statuses[kind];
      if (!value) continue; // defensive: an old save without a newer status kind
      if (kind === "age") {
        // The life-stage chip is always shown — from birth onward it's the one
        // status that means something in babyhood too.
      } else if (kind === "lifestyle") {
        if (value === content.start.statuses[kind]) continue;
      } else if (!inChildhood) {
        continue;
      }
      const state = content.statuses[kind].states[value];
      const label = state?.label ? t(state.label) : value;
      let drift = "";
      for (const [vk, dv] of Object.entries(state?.drift ?? {})) {
        if (!dv) continue;
        // Show the STRENGTH of the drift, not just its sign: 1–3 symbols by
        // magnitude (a heavier drain reads heavier — e.g. old age ♥−− vs
        // adulthood ♥−), mirroring the +/++/+++ vocabulary on the cards.
        const mag = Math.abs(dv) >= 15 ? 3 : Math.abs(dv) >= 5 ? 2 : 1;
        const sym = (dv > 0 ? "+" : "−").repeat(mag);
        drift += `<span class="chip-drift"><span class="vicon" style="color:var(--v-${vk})">${VITAL_ICON[vk as VitalKey]}</span><span class="${dv > 0 ? "dgood" : "dbad"}">${sym}</span></span>`;
      }
      chips += `<span class="chip"><b>${t(STATUS_LABEL[kind])}</b> ${label}${drift}</span>`;
    }
    this.statusesEl.innerHTML = chips;
  }

  // Flash the changed segment of a bar in a bright tint of its own colour; the
  // bar growing or shrinking conveys whether it was a gain or a loss.
  private flashDelta(key: VitalKey, oldV: number, newV: number): void {
    const flash = this.flashes[key];
    const lo = Math.min(oldV, newV);
    const hi = Math.max(oldV, newV);
    flash.style.transition = "none";
    flash.style.left = `${lo}%`;
    flash.style.width = `${hi - lo}%`;
    flash.className = "flash";
    flash.style.opacity = "0.9";
    void flash.offsetWidth; // reflow so the fade restarts every change
    flash.style.transition = "opacity 1.5s ease";
    flash.style.opacity = "0";
  }

  // --- language --------------------------------------------------------------

  // Switch to the next locale and re-render everything. Guarded to when the
  // player isn't mid-turn (the lang button only fires while !busy), so we can
  // safely re-show the current front card / end / unlock without losing state.
  private cycleLocale(): void {
    const codes = LOCALES.map((l) => l.code);
    const next = codes[(codes.indexOf(getLocale()) + 1) % codes.length];
    setLocale(next);
    this.buildShell(); // rebuilds the topbar + a fresh scene with new labels
    this.syncTop();
    if (this.state.over) this.showEnd();
    else if (this.pendingUnlock) this.showUnlock();
    else if (this.card && this.phase === "front") this.showFront(this.card);
    else this.beginTurn();
  }

  // --- choice previews (hidden in "hard mode") -------------------------------------------------------------

  // The vital-symbol deltas of the outcome that would actually fire for a
  // choice given the current state (shown under each edge label unless hard mode is on).
  private vitalChips(opt: CardOption): string {
    const outcome = resolveOutcome(opt, this.state, content);
    // Simulate the choice's effects on a throwaway clone, so the fatal check uses
    // the drift of the status you'd be IN *after* the card — a choice that
    // changes your job/home/lifestyle changes the drains too, and previewing the
    // CURRENT drains would mislead. `projected.vitals` already holds the card's
    // vital change (clamped, in engine order: effect then drift), and `drift` is
    // the post-change per-turn drain.
    const projected = structuredClone(this.state);
    if (outcome.effects) applyEffect(projected, outcome.effects, content);
    projected.age += 1; // the turn advances before drift + the game-over/rescue check
    const drift = totalDrift(projected, content);
    let chips = "";
    for (const key of VITAL_KEYS) {
      const mag = outcome.effects?.vitals?.[key];
      // Project the year: the post-card vital plus the turn's (new) drift. A
      // vital reaches 0 → death, and we show the skull EVEN IF this card doesn't
      // touch that vital — otherwise a drain the card leaves untouched kills you
      // with no warning. Vitals the card doesn't move and won't kill you: shown
      // as nothing (no bare "—").
      const lethal = projected.vitals[key] + (drift[key] ?? 0) <= VITAL_MIN;
      if (!mag && !lethal) continue;
      // A vital hitting 0 is only really death if no safety net catches it. If a
      // one-shot rescue would fire (charity hospital, sell-up, eviction…), show a
      // STRUCK-THROUGH skull — you'd be floored but survive (this once).
      const rescued = lethal && !!findRescue(projected, content, key);
      const body = lethal
        ? rescued
          ? `<span class="ep-rescue" title="You'd hit 0 — but a safety net would catch you (once)">🛡</span>`
          : `<span class="dbad ep-end" title="This would be fatal">☠</span>`
        : `<span class="${mag!.startsWith("+") ? "dgood" : "dbad"}">${mag!.split("-").join("−")}</span>`;
      chips += `<span class="ep-v"><span class="vicon" style="color:var(--v-${key})">${VITAL_ICON[key]}</span>${body}</span>`;
    }
    if (outcome.effects?.endGame) chips += `<span class="ep-v ep-end" title="This choice can end the run">☠</span>`;
    // A BENEFICIAL path change beyond the vital numbers gets a "special" star —
    // so a rewarding choice (seize the apprenticeship, buy the house, get
    // vaccinated) doesn't look weaker than a plain sibling that only moves a stat.
    // It fires on a new job/home/education (setStatus), a BOON trait (setTraits),
    // or a life-stage deck swap. It is suppressed when the outcome inflicts a
    // BURDEN (setFlaws — the charity-hospital debt, the sold-up shame mark), even
    // if that outcome also changes status (e.g. selling up → renting), since the
    // star reads as "good". Incremental ticks (experience, +1 sporty) don't count.
    const e = outcome.effects;
    const hasFlaw = !!(e?.setFlaws && Object.keys(e.setFlaws).length > 0);
    const special = !hasFlaw && !!(e?.setStatus || e?.setTraits || e?.addDecks || e?.removeDecks);
    if (special) chips += `<span class="ep-v ep-special" title="This choice changes your path — a job, home, schooling, or a lasting boon">★</span>`;
    // No vital changes → show nothing (rather than a bare "—").
    return chips;
  }

  // An option is available only if it exists AND its per-option `if` holds in the
  // current state. Hidden options don't render an edge and can't be swiped to.
  private availOpt(card: Card, dir: Direction): CardOption | undefined {
    const o = card.options[dir];
    return o && meets(o.if, this.state, content) ? o : undefined;
  }

  private toggleHard(): void {
    if (this.busy) return;
    this.hard = !this.hard;
    saveHard(this.hard);
    this.hardBtn.classList.toggle("on", this.hard);
    // Re-render the current front card so the preview appears/disappears.
    if (this.phase === "front" && this.card) {
      if (this.holder) {
        this.holder.remove();
        this.holder = null;
        this.flip = null;
      }
      this.showFront(this.card);
    }
  }

  // --- debug -----------------------------------------------------------------

  private toggleDebug(): void {
    this.debug = !this.debug;
    saveDebug(this.debug);
    this.root.classList.toggle("debug-on", this.debug);
    this.dbgBtn.classList.toggle("on", this.debug);
    this.renderDebug();
  }

  private renderDebug(): void {
    if (!this.debug) {
      this.debugPanel.innerHTML = "";
      return;
    }
    const { milestone, pool, gated } = eligibleDraw(this.state);
    const row = (c: Card, mark: string, cls: string, note = ""): string =>
      `<div class="dbg-row ${cls}" data-card="${c.id}">
        <div class="dbg-line">
          <span class="dbg-mark">${mark}</span>
          <span class="dbg-id">${c.id}</span>
          <span class="dbg-kind">${c.kind}</span>
          <button class="dbg-draw" data-card="${c.id}" data-action="force" title="Force this card next">draw ▶</button>
        </div>
        ${note ? `<div class="dbg-note">needs ${note}</div>` : ""}
      </div>`;
    const rows = [
      ...(milestone ? [row(milestone, "★", "due")] : []),
      ...pool.map((c) => row(c, c.id === this.card?.id ? "→" : "·", "pool")),
      ...gated.map((c) => row(c, "·", "gated", fmtCond(c.conditions))),
    ];

    // Current traits, grouped into collapsible sub-sections so the (growing)
    // list stays scannable. One chip each: numbers get −/+ buttons; the rest tap
    // to toggle.
    const traitChip = ([k, v]: [string, unknown]): string => {
      if (typeof v === "number") {
        // Experience counts single years (thresholds ~3–4); the relationship
        // counters move in larger steps — so scale the debug step per trait.
        const step = k === "experience" ? 1 : 10;
        return `<span class="dbg-trait ${v !== 0 ? "set" : ""}">${k}=${v}
          <button data-trait="${k}" data-tdelta="-${step}">−</button>
          <button data-trait="${k}" data-tdelta="${step}">+</button></span>`;
      }
      const set = typeof v === "boolean" ? v : true;
      return `<span class="dbg-trait ${set ? "set" : ""}" data-trait="${k}">${k}=${v}</span>`;
    };
    // Group by the segment before the first "_", else the leading camelCase word
    // (so `relBrother`/`relSister` → "rel"). Only a prefix shared by 2+ traits
    // becomes a collapsible group; lone traits sit flat at the top.
    const groupOf = (k: string): string => {
      const u = k.indexOf("_");
      if (u > 0) return k.slice(0, u);
      return k.match(/^[a-z]+/)?.[0] ?? k;
    };
    const byGroup = new Map<string, [string, unknown][]>();
    for (const e of Object.entries(this.state.traits)) {
      const g = groupOf(e[0]);
      const arr = byGroup.get(g) ?? [];
      if (arr.length === 0) byGroup.set(g, arr);
      arr.push(e);
    }
    const loose: string[] = [];
    const groups: string[] = [];
    for (const [g, es] of byGroup) {
      if (es.length < 2) {
        loose.push(traitChip(es[0]));
        continue;
      }
      const id = `trait:${g}`;
      groups.push(`<details class="dbg-sec dbg-subsec" ${this.debugOpen.has(id) ? "open" : ""}>
        <summary data-sec="${id}">${g} · ${es.length}</summary>
        <div class="dbg-traits">${es.map(traitChip).join("")}</div>
      </details>`);
    }
    const traitHtml = `<div class="dbg-traits">${loose.join("")}</div>${groups.join("")}`;

    // Debug controls: vitals, age, decks, milestone jumps.
    const vitalCtl = VITAL_KEYS.map(
      (k) => `<div class="dbg-ctlrow"><span class="dbg-ctllabel">${t(VITAL_LABEL[k])} ${this.state.vitals[k]}</span>
        <button data-vital="${k}" data-delta="-25">−−</button>
        <button data-vital="${k}" data-delta="-10">−</button>
        <button data-vital="${k}" data-delta="10">+</button>
        <button data-vital="${k}" data-delta="25">++</button></div>`,
    ).join("");
    const ageCtl = `<div class="dbg-ctlrow"><span class="dbg-ctllabel">Age ${this.state.age}</span>
      <button data-age="-5">−5</button><button data-age="-1">−1</button>
      <button data-age="1">+1</button><button data-age="5">+5</button></div>`;
    const deckCtl = content.decks
      .map((dk) => `<button class="dbg-deck ${this.state.activeDecks.includes(dk.id) ? "on" : ""}" data-deck="${dk.id}">${dk.id}</button>`)
      .join("");
    const milestoneCtl = ALL_CARDS.filter((c) => c.kind === "milestone")
      .map((c) => `<button data-card="${c.id}" data-action="skip">${c.id}</button>`)
      .join("");

    // Card detail: the selected card (default = the current card), showing
    // EVERY option's EVERY outcome — including ones gated by conditions.
    const sel = (this.debugSelectedId && CARD_BY_ID.get(this.debugSelectedId)) || this.card;
    let detail = "<div>(none)</div>";
    if (sel) {
      let opts = "";
      for (const dir of DIRECTIONS) {
        const opt = sel.options[dir];
        if (!opt) continue;
        let outs = "";
        for (const o of opt.outcomes) {
          const matches = meets(o.if, this.state, content);
          const cond = o.if ? `if ${fmtCond(o.if)}` : "default";
          outs += `<div class="dbg-out ${matches ? "match" : ""}">
            <span class="dbg-cond">${cond}</span> → ${fmtEffect(o.effects)}
            <span class="dbg-res">“${t(o.result)}”</span></div>`;
        }
        opts += `<div class="dbg-choice"><b>${dir} · ${t(opt.label)}</b>${outs}</div>`;
      }
      detail = `<div class="dbg-prompt">${t(sel.prompt).replace(/\n+/g, " ")}</div>${opts}`;
    }

    // History: each played card + the choice taken, newest first. Tap a row to
    // rewind to just before it (restores vitals/traits/status/age and un-uses
    // one_time cards) and re-face that card to try a different choice.
    const histRows = this.history
      .map(
        (h, i) =>
          `<div class="dbg-hist" data-hist="${i}" title="Rewind to here">
            <span class="dbg-hist-age">${h.age}</span>
            <span class="dbg-hist-card">${h.cardId}</span>
            <span class="dbg-hist-choice">${h.choice}</span>
            <span class="dbg-hist-rw">⟲</span>
          </div>`,
      )
      .reverse()
      .join("");

    const sec = (id: string, title: string, body: string): string =>
      `<details class="dbg-sec" ${this.debugOpen.has(id) ? "open" : ""}>
        <summary data-sec="${id}">${title}</summary>
        ${body}
      </details>`;

    this.debugPanel.innerHTML =
      sec("vitals", "Vitals", `<div class="dbg-ctl">${vitalCtl}</div>`) +
      sec("age", "Age", `<div class="dbg-ctl">${ageCtl}</div>`) +
      sec("traits", "Traits — tap to toggle", traitHtml) +
      sec("decks", "Decks — tap to add / remove", `<div class="dbg-decks">${deckCtl}</div>`) +
      sec("milestones", "Skip to milestone", `<div class="dbg-decks">${milestoneCtl}</div>`) +
      sec("pool", `Draw pool — age ${this.state.age} · tap a card to inspect`, `<div class="dbg-list">${rows.join("") || "<div>(empty)</div>"}</div>`) +
      sec("detail", `${sel ? sel.id : "card"} — choices &amp; results`, detail) +
      sec("history", `History — tap to rewind (${this.history.length})`, `<div class="dbg-list">${histRows || "<div>(nothing played yet)</div>"}</div>`);
  }

  // Debug: drop the current card and show a specific one next (ignores
  // eligibility). Choosing it then applies its effects normally.
  // Show a specific card next (ignoring eligibility). setAge is only true for
  // "skip to milestone" — a plain force-draw never changes your age (dropping it
  // would gate out other cards and make them look consumed). Even skip only
  // raises the age up to the milestone's minimum, never lowers it.
  private forceCard(id: string, setAge = false): void {
    if (this.busy) return;
    const card = CARD_BY_ID.get(id);
    if (!card) return;
    if (this.holder) {
      this.holder.remove();
      this.holder = null;
      this.flip = null;
    }
    const min = card.conditions?.ageMin;
    if (setAge && min != null && this.state.age < min) {
      this.state.age = min;
      this.prevVitals = { ...this.state.vitals };
      saveGame(this.state);
      this.syncTop();
    }
    this.card = card;
    this.debugSelectedId = null;
    this.showFront(card);
  }

  // --- debug state edits -----------------------------------------------------
  private adjustVital(key: VitalKey, delta: number): void {
    this.state.vitals[key] = Math.max(0, Math.min(100, this.state.vitals[key] + delta));
    saveGame(this.state);
    this.syncTop();
    this.renderDebug();
    this.refreshFront(); // vitals affect preview symbols / which outcome resolves
  }
  private adjustAge(delta: number): void {
    this.state.age = Math.max(0, this.state.age + delta);
    saveGame(this.state);
    this.syncTop();
    this.renderDebug();
    this.refreshFront();
  }
  private toggleDeck(id: string): void {
    const decks = this.state.activeDecks;
    const i = decks.indexOf(id);
    if (i >= 0) decks.splice(i, 1);
    else decks.push(id);
    this.seenDecks.add(id);
    saveGame(this.state);
    this.captureDisplay(); // debug edit lands immediately (no chapter card to wait for)
    this.syncTop();
    this.renderDebug();
    this.refreshFront(); // drift changes → preview fatality may change
  }
  private toggleTrait(key: string, delta?: number): void {
    const t = this.state.traits as unknown as Record<string, unknown>;
    const v = t[key];
    if (typeof v === "number") t[key] = v + (delta ?? 10);
    else if (typeof v === "boolean") t[key] = !v;
    else if (key === "gender") t[key] = v === "boy" ? "girl" : "boy";
    saveGame(this.state);
    this.renderDebug();
    this.refreshFront(); // traits gate which outcome resolves
  }

  // --- turn flow -------------------------------------------------------------

  private beginTurn(): void {
    const draw = drawCard(this.state);
    this.state = draw.state;
    if (!draw.card) {
      const q = quietYear(this.state);
      this.state = q.state;
      saveGame(this.state);
      this.syncTop();
      if (this.state.over) this.showEnd();
      else this.beginTurn();
      return;
    }
    this.card = draw.card;
    this.showFront(draw.card);
  }

  private showFront(card: Card, animate = true): void {
    const holder = document.createElement("div");
    holder.className = "holder";
    const flip = document.createElement("div");
    flip.className = "flip";

    const front = document.createElement("div");
    front.className = "face front";
    const ageLabel = this.state.age === 0 ? t("ui.newborn") : tf("ui.age", { n: this.state.age });
    // Easy mode: attach each option's vital preview right under its edge label.
    const ev = (opt: CardOption): string =>
      !this.hard ? `<span class="edge-vitals">${this.vitalChips(opt)}</span>` : "";
    const edge = (dir: Direction, cls: string): string => {
      const opt = this.availOpt(card, dir);
      return opt ? `<div class="edge ${cls}">${t(opt.label)}${ev(opt)}</div>` : "";
    };
    front.innerHTML = `
      <div class="card-age">${ageLabel}</div>
      <p class="prompt">${t(card.prompt)}</p>
      ${edge("left", "edge-left")}
      ${edge("right", "edge-right")}
      ${edge("up", "edge-up")}
      ${edge("down", "edge-down")}`;

    const back = document.createElement("div");
    back.className = "face back";
    back.innerHTML = `<p class="result"></p><div class="tap-cue">${t("ui.tapContinue")}</div>`;

    flip.appendChild(front);
    flip.appendChild(back);
    holder.appendChild(flip);
    this.scene.appendChild(holder);
    this.holder = holder;
    this.flip = flip;
    this.phase = "front";

    this.attachDrag(flip, card);
    this.renderDebug();

    // slide in from below (skipped on a debug re-render so it doesn't replay)
    if (animate && !reduceMotion) {
      holder.style.transform = "translateY(28px)";
      holder.style.opacity = "0";
      requestAnimationFrame(() => {
        holder.style.transform = "";
        holder.style.opacity = "";
      });
    }
  }

  // Debug: re-render the current front card in place (no entrance animation) so
  // its preview symbols / resolved outcomes reflect edited vitals, age, etc.
  private refreshFront(): void {
    if (this.busy || this.phase !== "front" || !this.card) return;
    if (this.holder) {
      this.holder.remove();
      this.holder = null;
      this.flip = null;
    }
    this.showFront(this.card, false);
  }

  // Debug: restore the pre-choice snapshot at a history entry (un-consuming any
  // one_time cards, since the whole state is restored) and re-show that card so
  // a different choice can be tried.
  private rewind(index: number): void {
    const entry = this.history[index];
    if (!entry) return;
    this.history = this.history.slice(0, index);
    this.state = structuredClone(entry.before);
    saveGame(this.state);
    this.prevVitals = { ...this.state.vitals };
    this.seenDecks = new Set(this.state.activeDecks);
    this.captureDisplay();
    this.pendingUnlock = null;
    this.busy = false;
    this.holder = null;
    this.flip = null;
    this.scene.innerHTML = ""; // clear any current card / end screen / unlock
    this.card = CARD_BY_ID.get(entry.cardId) ?? null;
    this.syncTop();
    if (this.card) this.showFront(this.card, false);
    else this.beginTurn();
  }

  private choose(dir: Direction): void {
    if (this.busy || !this.card || !this.flip || !this.holder) return;
    const opt = this.card.options[dir];
    if (!opt) return;
    this.busy = true;
    this.lastDir = dir;

    // Record a pre-choice snapshot for the debug history / rewind.
    this.history.push({
      age: this.state.age,
      cardId: this.card.id,
      choice: t(opt.label),
      before: structuredClone(this.state),
    });

    const res = chooseDirection(this.state, this.card, dir);
    this.state = res.state;
    saveGame(this.state);
    this.detectUnlocks();
    // Hold the visible status/chip change until the "A new chapter" card when one
    // is pending; otherwise let it land now (there's no chapter to sync it to).
    if (!this.pendingUnlock) this.captureDisplay();

    const flip = this.flip;
    const back = flip.querySelector<HTMLElement>(".back .result")!;
    const backFace = flip.querySelector<HTMLElement>(".back")!;
    back.textContent = t(res.result as StringId);
    backFace.style.transform =
      dir === "up" || dir === "down" ? "rotateX(180deg)" : "rotateY(180deg)";

    flip.classList.remove("dragging", ...LEAN_CLASSES);

    const finishFlip = (): void => {
      this.phase = "back";
      this.syncTop(); // bars animate as the result is revealed
      this.armAdvance();
    };

    // continue the rotation the final 90° to reveal the back (instant when
    // motion is reduced, since .flip has no transition in that case)
    flip.style.transform = FULL_FLIP[dir];
    if (reduceMotion) {
      finishFlip();
      return;
    }
    window.setTimeout(finishFlip, FLIP_MS);
  }

  private armAdvance(): void {
    this.busy = false;
    const holder = this.holder;
    if (!holder) return;
    holder.style.cursor = "pointer";
    holder.addEventListener("click", this.onAdvanceClick, { once: true });
  }

  private onAdvanceClick = (): void => this.advance();

  private advance(): void {
    if (this.busy) return;
    const holder = this.holder;
    if (!holder) return;
    this.busy = true;

    const done = (): void => {
      holder.remove();
      this.holder = null;
      this.flip = null;
      this.busy = false;
      if (this.state.over) this.showEnd();
      else if (this.pendingUnlock) this.showUnlock();
      else this.beginTurn();
    };

    if (reduceMotion) {
      done();
      return;
    }
    holder.style.transform = LEAVE[this.lastDir];
    holder.style.opacity = "0";
    window.setTimeout(done, SLIDE_MS);
  }

  private showEnd(): void {
    this.phase = "over";
    this.scene.innerHTML = "";
    const reason = this.state.endReason ?? "health";
    const ending = ENDINGS[reason] ?? ENDINGS.health;
    const tr = this.state.traits;

    const wrap = document.createElement("div");
    wrap.className = "end";
    const ageLine = ending.survived
      ? ""
      : `<p class="end-line">${tf("ui.reachedYears", { n: this.state.age })}</p>`;
    wrap.innerHTML = `
      <div class="end-title">${t(ending.title)}</div>
      <p class="end-blurb">${t(ending.blurb)}</p>
      ${ageLine}
      <ul class="end-recap">
        <li>${t(tr.gender === "girl" ? "ui.bornGirl" : "ui.bornBoy")}</li>
        ${tr.knowsMartialArts ? `<li>${t("ui.recapMartial")}</li>` : ""}
      </ul>`;
    const b = document.createElement("button");
    b.className = "continue";
    b.textContent = t("ui.newLife");
    b.addEventListener("click", () => this.restart());
    wrap.appendChild(b);
    this.scene.appendChild(wrap);
  }

  private restart(): void {
    clearSave();
    this.state = initGame(content);
    this.scene.innerHTML = "";
    this.holder = null;
    this.flip = null;
    this.busy = false;
    this.pendingUnlock = null;
    this.history = [];
    this.prevVitals = { ...this.state.vitals };
    this.seenDecks = new Set(this.state.activeDecks);
    this.captureDisplay();
    this.syncTop();
    this.beginTurn();
  }

  // Advance the lagging chip snapshot to live state. Called whenever the visible
  // status change should land: on init/resume/restart, after a choice that has
  // NO chapter card to sync to, and at the moment the chapter card appears.
  private captureDisplay(): void {
    this.displayStatuses = { ...this.state.statuses };
    this.displayDecks = [...this.state.activeDecks];
  }

  // Note any deck that just became active for the first time this run, so its
  // unlock can be announced as a proper "new chapter" moment.
  private detectUnlocks(): void {
    for (const id of this.state.activeDecks) {
      if (this.seenDecks.has(id)) continue;
      this.seenDecks.add(id);
      const deck = DECK_BY_ID.get(id);
      if (deck?.title) this.pendingUnlock = { title: deck.title, blurb: deck.unlock ?? deck.title };
    }
  }

  private showUnlock(): void {
    const u = this.pendingUnlock;
    this.pendingUnlock = null;
    if (!u) return this.beginTurn();
    // The held status/chip change lands now, together with the chapter card.
    this.captureDisplay();
    this.syncTop();
    this.phase = "over"; // not a swipe card; advance by tapping only
    this.renderDebug();

    const holder = el("div", "holder");
    const card = el("div", "unlock-card");
    card.innerHTML = `
      <div class="unlock-eyebrow">${t("ui.newChapter")}</div>
      <div class="unlock-title">${t(u.title)}</div>
      <p class="unlock-blurb">${t(u.blurb)}</p>
      <div class="tap-cue">${t("ui.tapBegin")}</div>`;
    holder.append(card);
    this.scene.append(holder);
    this.holder = holder;
    this.flip = null;

    if (!reduceMotion) {
      holder.style.transform = "scale(0.92)";
      holder.style.opacity = "0";
      requestAnimationFrame(() => {
        holder.style.transform = "";
        holder.style.opacity = "";
      });
    }

    const go = (): void => {
      if (this.busy) return;
      this.busy = true;
      const done = (): void => {
        holder.remove();
        this.holder = null;
        this.busy = false;
        this.beginTurn();
      };
      if (reduceMotion) return done();
      holder.style.transform = "scale(1.06)";
      holder.style.opacity = "0";
      window.setTimeout(done, SLIDE_MS);
    };
    card.addEventListener("click", go);
  }

  private onKey = (e: KeyboardEvent): void => {
    if (this.busy) return;
    const map: Record<string, Direction> = {
      ArrowLeft: "left",
      ArrowRight: "right",
      ArrowUp: "up",
      ArrowDown: "down",
    };
    if (this.phase === "front" && this.card) {
      const dir = map[e.key];
      if (dir && this.availOpt(this.card, dir)) {
        e.preventDefault();
        this.choose(dir);
      }
    } else if (this.phase === "back" && (e.key === "Enter" || e.key === " ")) {
      this.advance();
    }
  };

  // --- swipe (3D rotate to 90°, then flip the rest to the back) --------------

  private attachDrag(flip: HTMLElement, card: Card): void {
    let startX = 0;
    let startY = 0;
    let dragging = false;

    const tilt = (dx: number, dy: number): void => {
      const horiz = Math.abs(dx) >= Math.abs(dy);
      const dir: Direction = horiz ? (dx < 0 ? "left" : "right") : (dy < 0 ? "up" : "down");
      // Don't rotate toward a direction that has no choice (absent or hidden).
      if (!this.availOpt(card, dir)) {
        flip.style.transform = "";
        flip.classList.remove(...LEAN_CLASSES);
        return;
      }
      // Ease-out: rises quickly, then asymptotes toward MAX_TILT near the edge.
      const tiltDeg = (d: number) => (MAX_TILT * d) / (Math.abs(d) + TILT_EASE);
      flip.style.transform = horiz ? `rotateY(${tiltDeg(dx)}deg)` : `rotateX(${tiltDeg(-dy)}deg)`;
      // Highlight only once past the commit point, so a highlighted edge is
      // exactly the choice that will fire on release.
      const past = Math.abs(horiz ? dx : dy) >= SWIPE_THRESHOLD;
      flip.classList.toggle("lean-left", dir === "left" && past);
      flip.classList.toggle("lean-right", dir === "right" && past);
      flip.classList.toggle("lean-up", dir === "up" && past);
      flip.classList.toggle("lean-down", dir === "down" && past);
    };

    const settle = (): void => {
      flip.classList.remove("dragging", ...LEAN_CLASSES);
      flip.style.transform = "";
    };

    const end = (x: number, y: number): void => {
      if (!dragging) return;
      dragging = false;
      const dx = x - startX;
      const dy = y - startY;
      flip.classList.remove("dragging");
      // A tap (barely moved) selects the option in whichever region you tapped.
      if (Math.hypot(dx, dy) < TAP_SLOP) {
        const dir = regionDir(flip, x, y);
        if (dir && this.availOpt(card, dir)) return this.choose(dir);
        settle();
        return;
      }
      const horiz = Math.abs(dx) >= Math.abs(dy);
      if (horiz && Math.abs(dx) > SWIPE_THRESHOLD) {
        const dir: Direction = dx < 0 ? "left" : "right";
        if (this.availOpt(card, dir)) return this.choose(dir);
      } else if (!horiz && Math.abs(dy) > SWIPE_THRESHOLD) {
        const dir: Direction = dy < 0 ? "up" : "down";
        if (this.availOpt(card, dir)) return this.choose(dir);
      }
      settle();
    };

    flip.addEventListener("pointerdown", (e) => {
      if (this.busy || this.phase !== "front") return; // only the front is draggable
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      flip.classList.add("dragging");
      flip.setPointerCapture(e.pointerId);
    });
    flip.addEventListener("pointermove", (e) => {
      if (dragging) tilt(e.clientX - startX, e.clientY - startY);
    });
    flip.addEventListener("pointerup", (e) => end(e.clientX, e.clientY));
    flip.addEventListener("pointercancel", () => {
      if (dragging) {
        dragging = false;
        settle();
      }
    });
  }
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className = "",
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}

// Which option-region a tap fell in: left/right thirds, else top/bottom.
function regionDir(flip: HTMLElement, x: number, y: number): Direction | null {
  const r = flip.getBoundingClientRect();
  const px = (x - r.left) / r.width;
  const py = (y - r.top) / r.height;
  if (px < 0.34) return "left";
  if (px > 0.66) return "right";
  if (py < 0.34) return "up";
  if (py > 0.66) return "down";
  return null;
}

// compact one-line summary of an effect, for the debug panel
function fmtEffect(e?: Effect): string {
  if (!e) return "—";
  const parts: string[] = [];
  if (e.vitals) {
    for (const [k, mag] of Object.entries(e.vitals)) parts.push(`${k} ${mag}`);
  }
  if (e.setStatus) for (const [k, v] of Object.entries(e.setStatus)) parts.push(`${k}=${v}`);
  if (e.setTraits) for (const [k, v] of Object.entries(e.setTraits)) parts.push(`${k}=${v}`);
  if (e.setFlaws) for (const [k, v] of Object.entries(e.setFlaws)) parts.push(`${k}=${v}`);
  if (e.incTraits) for (const [k, v] of Object.entries(e.incTraits)) parts.push(`${k}+=${v}`);
  if (e.addDecks) parts.push(`+deck ${e.addDecks.join(",")}`);
  if (e.removeDecks) parts.push(`−deck ${e.removeDecks.join(",")}`);
  if (e.restoreHousing) parts.push("housing=restore");
  if (e.endGame) parts.push(`END:${e.endGame}`);
  return parts.join(", ") || "—";
}

// compact one-line summary of a condition, for the debug panel
function fmtCond(c?: Condition): string {
  if (!c) return "any";
  const p: string[] = [];
  if (c.ageMin != null) p.push(`age≥${c.ageMin}`);
  if (c.ageMax != null) p.push(`age≤${c.ageMax}`);
  if (c.vitals) {
    for (const [k, r] of Object.entries(c.vitals)) {
      if (r.min != null) p.push(`${k}≥${r.min}`);
      if (r.max != null) p.push(`${k}≤${r.max}`);
    }
  }
  if (c.status) {
    for (const [k, m] of Object.entries(c.status)) {
      if (typeof m === "string") p.push(`${k}=${m}`);
      else p.push(`${k}${m.atLeast != null ? `≥${m.atLeast}` : ""}${m.atMost != null ? `≤${m.atMost}` : ""}`);
    }
  }
  if (c.traits) {
    for (const [k, v] of Object.entries(c.traits)) {
      if (typeof v === "object" && v !== null) {
        const m = v as { min?: number; max?: number };
        if (m.min != null) p.push(`${k}≥${m.min}`);
        if (m.max != null) p.push(`${k}≤${m.max}`);
      } else {
        p.push(`${k}=${v}`);
      }
    }
  }
  return p.join(", ") || "any";
}

function loadDebug(): boolean {
  try {
    return localStorage.getItem(DEBUG_KEY) === "1";
  } catch {
    return false;
  }
}
function saveDebug(on: boolean): void {
  try {
    localStorage.setItem(DEBUG_KEY, on ? "1" : "0");
  } catch {
    // ignore
  }
}

function loadHard(): boolean {
  try {
    return localStorage.getItem(HARD_KEY) === "1";
  } catch {
    return false;
  }
}
function saveHard(on: boolean): void {
  try {
    localStorage.setItem(HARD_KEY, on ? "1" : "0");
  } catch {
    // ignore
  }
}
