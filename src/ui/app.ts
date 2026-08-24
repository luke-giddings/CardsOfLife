import { gameContent as content } from "../content/index.ts";
import {
  chooseDirection,
  drawCard,
  eligibleDraw,
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
const EASY_KEY = "cardsoflife.easy";
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
  private easy = false; // "easy mode": preview each choice's vital changes on the card
  private easyBtn!: HTMLButtonElement;
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
  private debugSelectedId: string | null = null;
  private debugOpen = new Set<string>(["pool", "detail"]); // which debug sections are expanded

  constructor(root: HTMLElement) {
    this.root = root;
    setContent(content);
    this.debug = loadDebug();
    this.easy = loadEasy();
    this.buildShell();
    this.state = loadGame() ?? initGame(content);
    this.prevVitals = { ...this.state.vitals };
    this.seenDecks = new Set(this.state.activeDecks);
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
    this.easyBtn = el("button", "easy") as HTMLButtonElement;
    this.easyBtn.textContent = t("ui.easy");
    this.easyBtn.title = t("ui.easyTip");
    this.easyBtn.classList.toggle("on", this.easy);
    this.easyBtn.addEventListener("click", () => this.toggleEasy());
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
    // the three player-facing controls (Language / Easy / Reset) on the right.
    controls.append(lang, this.easyBtn, reset);
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
        "[data-card],[data-vital],[data-age],[data-deck],[data-trait]",
      );
      if (!hit) return;
      const d = hit.dataset;
      if (d.vital) return this.adjustVital(d.vital as VitalKey, Number(d.delta));
      if (d.age) return this.adjustAge(Number(d.age));
      if (d.deck) return this.toggleDeck(d.deck);
      if (d.trait) return this.toggleTrait(d.trait, d.tdelta ? Number(d.tdelta) : undefined);
      const id = d.card!;
      if (d.action === "force") this.forceCard(id);
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
    // Preview each active status's drain: the tip of the bar that next turn's
    // drift will strip off is marked, so a passive loss is visible before it
    // happens. Only losses (negative drift) are previewed.
    const drift = totalDrift(s, content);
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
    const inChildhood = !s.activeDecks.includes("baby");
    for (const kind of STATUS_KINDS) {
      const value = s.statuses[kind];
      if (kind === "lifestyle") {
        if (value === content.start.statuses[kind]) continue;
      } else if (!inChildhood) {
        continue;
      }
      const state = content.statuses[kind].states[value];
      const label = state?.label ? t(state.label) : value;
      let drift = "";
      for (const [vk, dv] of Object.entries(state?.drift ?? {})) {
        if (!dv) continue;
        drift += `<span class="chip-drift"><span class="vicon" style="color:var(--v-${vk})">${VITAL_ICON[vk as VitalKey]}</span><span class="${dv > 0 ? "dgood" : "dbad"}">${dv > 0 ? "+" : "−"}</span></span>`;
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

  // --- easy mode -------------------------------------------------------------

  // One consequences row for a choice: a direction arrow + the vital-symbol
  // deltas of the outcome that would actually fire given the current state.
  private easyRow(dir: Direction, opt: CardOption): string {
    const arrow = { left: "◀", right: "▶", up: "▲", down: "▼" }[dir];
    const outcome = resolveOutcome(opt, this.state, content);
    let chips = "";
    for (const key of VITAL_KEYS) {
      const mag = outcome.effects?.vitals?.[key];
      if (!mag) continue;
      const pos = mag.startsWith("+");
      const token = mag.split("-").join("−"); // proper minus glyphs
      chips += `<span class="ep-v"><span class="vicon" style="color:var(--v-${key})">${VITAL_ICON[key]}</span><span class="${pos ? "dgood" : "dbad"}">${token}</span></span>`;
    }
    if (outcome.effects?.endGame) chips += `<span class="ep-v ep-end" title="This choice can end the run">☠</span>`;
    if (!chips) chips = `<span class="ep-none">—</span>`;
    return `<div class="ep-row"><span class="ep-dir">${arrow}</span>${chips}</div>`;
  }

  private toggleEasy(): void {
    if (this.busy) return;
    this.easy = !this.easy;
    saveEasy(this.easy);
    this.easyBtn.classList.toggle("on", this.easy);
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

    // Current traits: booleans/gender tap to toggle; numbers get −/+ buttons.
    const traitHtml = Object.entries(this.state.traits)
      .map(([k, v]) => {
        if (typeof v === "number") {
          return `<span class="dbg-trait ${v !== 0 ? "set" : ""}">${k}=${v}
            <button data-trait="${k}" data-tdelta="-10">−</button>
            <button data-trait="${k}" data-tdelta="10">+</button></span>`;
        }
        const set = typeof v === "boolean" ? v : true;
        return `<span class="dbg-trait ${set ? "set" : ""}" data-trait="${k}">${k}=${v}</span>`;
      })
      .join("");

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
      .map((c) => `<button data-card="${c.id}" data-action="force">${c.id}</button>`)
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

    const sec = (id: string, title: string, body: string): string =>
      `<details class="dbg-sec" ${this.debugOpen.has(id) ? "open" : ""}>
        <summary data-sec="${id}">${title}</summary>
        ${body}
      </details>`;

    this.debugPanel.innerHTML =
      sec("vitals", "Vitals", `<div class="dbg-ctl">${vitalCtl}</div>`) +
      sec("age", "Age", `<div class="dbg-ctl">${ageCtl}</div>`) +
      sec("traits", "Traits — tap to toggle", `<div class="dbg-traits">${traitHtml}</div>`) +
      sec("decks", "Decks — tap to add / remove", `<div class="dbg-decks">${deckCtl}</div>`) +
      sec("milestones", "Skip to milestone", `<div class="dbg-decks">${milestoneCtl}</div>`) +
      sec("pool", `Draw pool — age ${this.state.age} · tap a card to inspect`, `<div class="dbg-list">${rows.join("") || "<div>(empty)</div>"}</div>`) +
      sec("detail", `${sel ? sel.id : "card"} — choices &amp; results`, detail);
  }

  // Debug: drop the current card and show a specific one next (ignores
  // eligibility). Choosing it then applies its effects normally.
  private forceCard(id: string): void {
    if (this.busy) return;
    const card = CARD_BY_ID.get(id);
    if (!card) return;
    if (this.holder) {
      this.holder.remove();
      this.holder = null;
      this.flip = null;
    }
    // Milestones (and gated cards) happen at fixed ages — jump the age too.
    const target = card.conditions?.ageMin ?? card.conditions?.ageMax;
    if (target != null) {
      this.state.age = target;
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
  }
  private adjustAge(delta: number): void {
    this.state.age = Math.max(0, this.state.age + delta);
    saveGame(this.state);
    this.syncTop();
    this.renderDebug();
  }
  private toggleDeck(id: string): void {
    const decks = this.state.activeDecks;
    const i = decks.indexOf(id);
    if (i >= 0) decks.splice(i, 1);
    else decks.push(id);
    this.seenDecks.add(id);
    saveGame(this.state);
    this.renderDebug();
  }
  private toggleTrait(key: string, delta?: number): void {
    const t = this.state.traits as unknown as Record<string, unknown>;
    const v = t[key];
    if (typeof v === "number") t[key] = v + (delta ?? 10);
    else if (typeof v === "boolean") t[key] = !v;
    else if (key === "gender") t[key] = v === "boy" ? "girl" : "boy";
    saveGame(this.state);
    this.renderDebug();
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

  private showFront(card: Card): void {
    const holder = document.createElement("div");
    holder.className = "holder";
    const flip = document.createElement("div");
    flip.className = "flip";

    const front = document.createElement("div");
    front.className = "face front";
    const ageLabel = this.state.age === 0 ? t("ui.newborn") : tf("ui.age", { n: this.state.age });
    const easyStrip = this.easy
      ? `<div class="easy-preview">${DIRECTIONS.filter((d) => card.options[d])
          .map((d) => this.easyRow(d, card.options[d]!))
          .join("")}</div>`
      : "";
    front.innerHTML = `
      <div class="card-age">${ageLabel}</div>
      <p class="prompt">${t(card.prompt)}</p>
      ${easyStrip}
      ${card.options.left ? `<div class="edge edge-left">${t(card.options.left.label)}</div>` : ""}
      ${card.options.right ? `<div class="edge edge-right">${t(card.options.right.label)}</div>` : ""}
      ${card.options.up ? `<div class="edge edge-up">${t(card.options.up.label)}</div>` : ""}
      ${card.options.down ? `<div class="edge edge-down">${t(card.options.down.label)}</div>` : ""}`;

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

    // slide in from below
    if (!reduceMotion) {
      holder.style.transform = "translateY(28px)";
      holder.style.opacity = "0";
      requestAnimationFrame(() => {
        holder.style.transform = "";
        holder.style.opacity = "";
      });
    }
  }

  private choose(dir: Direction): void {
    if (this.busy || !this.card || !this.flip || !this.holder) return;
    if (!this.card.options[dir]) return;
    this.busy = true;
    this.lastDir = dir;

    const res = chooseDirection(this.state, this.card, dir);
    this.state = res.state;
    saveGame(this.state);
    this.detectUnlocks();

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
    this.prevVitals = { ...this.state.vitals };
    this.seenDecks = new Set(this.state.activeDecks);
    this.syncTop();
    this.beginTurn();
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
      if (dir && this.card.options[dir]) {
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
      // Don't rotate toward a direction that has no choice.
      if (!card.options[dir]) {
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
        if (dir && card.options[dir]) return this.choose(dir);
        settle();
        return;
      }
      const horiz = Math.abs(dx) >= Math.abs(dy);
      if (horiz && Math.abs(dx) > SWIPE_THRESHOLD) {
        const dir: Direction = dx < 0 ? "left" : "right";
        if (card.options[dir]) return this.choose(dir);
      } else if (!horiz && Math.abs(dy) > SWIPE_THRESHOLD) {
        const dir: Direction = dy < 0 ? "up" : "down";
        if (card.options[dir]) return this.choose(dir);
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
  if (e.incTraits) for (const [k, v] of Object.entries(e.incTraits)) parts.push(`${k}+=${v}`);
  if (e.addDecks) parts.push(`+deck ${e.addDecks.join(",")}`);
  if (e.removeDecks) parts.push(`−deck ${e.removeDecks.join(",")}`);
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
      p.push(typeof m === "string" ? `${k}=${m}` : `${k}≥${m.atLeast}`);
    }
  }
  if (c.traits) {
    for (const [k, v] of Object.entries(c.traits)) {
      p.push(typeof v === "object" && v !== null ? `${k}∈range` : `${k}=${v}`);
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

function loadEasy(): boolean {
  try {
    return localStorage.getItem(EASY_KEY) === "1";
  } catch {
    return false;
  }
}
function saveEasy(on: boolean): void {
  try {
    localStorage.setItem(EASY_KEY, on ? "1" : "0");
  } catch {
    // ignore
  }
}
