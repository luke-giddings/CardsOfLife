import { gameContent as content } from "../content/index.ts";
import {
  chooseDirection,
  drawCard,
  eligibleDraw,
  initGame,
  quietYear,
  resolveOutcome,
  setContent,
} from "../engine/engine.ts";
import { clearSave, loadGame, saveGame } from "../engine/save.ts";
import {
  ENDINGS,
  STATUS_KINDS,
  VITAL_KEYS,
  type Card,
  type Direction,
  type Effect,
  type GameState,
  type StatusKind,
  type VitalKey,
} from "../engine/types.ts";

const DEBUG_KEY = "cardsoflife.debug";

const VITAL_LABEL: Record<VitalKey, string> = {
  finances: "Finances",
  happiness: "Happiness",
  health: "Health",
  spirit: "Spirit",
};

const STATUS_LABEL: Record<StatusKind, string> = {
  job: "Job",
  housing: "Home",
  education: "Study",
  lifestyle: "Life",
};

const ROTATE_PER_PX = 0.7; // how fast the card tilts as you drag (deg per px)
const SWIPE_THRESHOLD = 60; // px of drag before a swipe locks in (highlight + commit)
const MAX_TILT = 85;
const FLIP_MS = 620; // must match the .flip CSS transition
const SLIDE_MS = 320;

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
  private ageNumEl!: HTMLElement;
  private fills!: Record<VitalKey, HTMLElement>;
  private statusesEl!: HTMLElement;
  private dbgBtn!: HTMLButtonElement;
  private debugPanel!: HTMLElement;

  constructor(root: HTMLElement) {
    this.root = root;
    setContent(content);
    this.debug = loadDebug();
    this.buildShell();
    this.state = loadGame() ?? initGame(content);
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
    ageLbl.textContent = "years old";
    age.append(this.ageNumEl, ageLbl);

    const controls = el("div", "controls");
    this.dbgBtn = el("button", "dbg") as HTMLButtonElement;
    this.dbgBtn.textContent = "Debug";
    this.dbgBtn.title = "Toggle debug info";
    this.dbgBtn.addEventListener("click", () => this.toggleDebug());
    const reset = el("button", "reset") as HTMLButtonElement;
    reset.textContent = "Reset";
    reset.title = "Debug: wipe the save and start a new life";
    reset.addEventListener("click", () => {
      if (!this.busy) this.restart();
    });
    controls.append(this.dbgBtn, reset);
    headRow.append(age, controls);

    const vitals = el("div", "vitals");
    this.fills = {} as Record<VitalKey, HTMLElement>;
    for (const key of VITAL_KEYS) {
      const cell = el("div", `vital vital-${key}`);
      const top = el("div", "vital-top");
      const label = el("span");
      label.textContent = VITAL_LABEL[key];
      top.append(label);
      const track = el("div", "track");
      const fill = el("div", "fill");
      track.append(fill);
      cell.append(top, track);
      vitals.append(cell);
      this.fills[key] = fill;
    }
    this.statusesEl = el("div", "statuses");
    this.topbar.append(headRow, vitals, this.statusesEl);

    const stage = el("main", "stage");
    this.scene = el("div", "scene");
    this.debugPanel = el("div", "debug-panel");
    stage.append(this.scene, this.debugPanel);

    this.root.append(this.topbar, stage);
    this.dbgBtn.classList.toggle("on", this.debug);
  }

  private syncTop(): void {
    const s = this.state;
    this.ageNumEl.textContent = String(s.age);
    for (const key of VITAL_KEYS) this.fills[key].style.width = `${s.vitals[key]}%`;
    let chips = "";
    for (const kind of STATUS_KINDS) {
      const value = s.statuses[kind];
      if (value === content.start.statuses[kind]) continue;
      const label = content.statuses[kind].states[value]?.label ?? value;
      chips += `<span class="chip"><b>${STATUS_LABEL[kind]}</b> ${label}</span>`;
    }
    this.statusesEl.innerHTML = chips;
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
    const { milestone, pool } = eligibleDraw(this.state);
    const items = [
      ...(milestone ? [`★ ${milestone.id} — milestone (fires next)`] : []),
      ...pool.map((c) => `${c.id === this.card?.id ? "→ " : ""}${c.id} (${c.kind})`),
    ];
    let choices = "";
    if (this.card) {
      for (const dir of ["left", "right", "up", "down"] as Direction[]) {
        const opt = this.card.options[dir];
        if (!opt) continue;
        const outcome = resolveOutcome(opt, this.state, content);
        choices += `<div class="dbg-choice"><b>${dir} · ${opt.label}</b> → ${fmtEffect(outcome.effects)}<br><i>“${outcome.result}”</i></div>`;
      }
    }
    this.debugPanel.innerHTML = `
      <div class="dbg-sec">
        <h4>Draw pool — age ${this.state.age} · ${items.length} card(s)</h4>
        <div class="dbg-list">${items.map((x) => `<div>${x}</div>`).join("") || "<div>(empty)</div>"}</div>
      </div>
      <div class="dbg-sec">
        <h4>This card's choices → results</h4>
        ${choices || "<div>(none)</div>"}
      </div>`;
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
    const ageLabel = this.state.age === 0 ? "Newborn" : `Age ${this.state.age}`;
    front.innerHTML = `
      <div class="card-age">${ageLabel}</div>
      <p class="prompt">${card.prompt}</p>
      ${card.options.left ? `<div class="edge edge-left">${card.options.left.label}</div>` : ""}
      ${card.options.right ? `<div class="edge edge-right">${card.options.right.label}</div>` : ""}
      ${card.options.up ? `<div class="edge edge-up">${card.options.up.label}</div>` : ""}
      ${card.options.down ? `<div class="edge edge-down">${card.options.down.label}</div>` : ""}`;

    const back = document.createElement("div");
    back.className = "face back";
    back.innerHTML = `<p class="result"></p><div class="tap-cue">Tap to continue</div>`;

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

    const flip = this.flip;
    const back = flip.querySelector<HTMLElement>(".back .result")!;
    const backFace = flip.querySelector<HTMLElement>(".back")!;
    back.textContent = res.result;
    backFace.style.transform =
      dir === "up" || dir === "down" ? "rotateX(180deg)" : "rotateY(180deg)";

    flip.classList.remove("dragging", "lean-left", "lean-right", "lean-up", "lean-down");

    const finishFlip = (): void => {
      this.phase = "back";
      this.syncTop(); // bars animate as the result is revealed
      this.armAdvance();
    };

    if (reduceMotion) {
      finishFlip();
      return;
    }
    // continue the rotation the final 90° to reveal the back
    flip.style.transform = FULL_FLIP[dir];
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
    const t = this.state.traits;

    const wrap = document.createElement("div");
    wrap.className = "end";
    const ageLine = ending.survived
      ? ""
      : `<p class="end-line">You reached <b>${this.state.age}</b> years.</p>`;
    wrap.innerHTML = `
      <div class="end-title">${ending.title}</div>
      <p class="end-blurb">${ending.blurb}</p>
      ${ageLine}
      <ul class="end-recap">
        <li>Born a ${t.gender}</li>
        ${t.knowsMartialArts ? "<li>Learned martial arts</li>" : ""}
      </ul>`;
    const b = document.createElement("button");
    b.className = "continue";
    b.textContent = "New life";
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
    this.syncTop();
    this.beginTurn();
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
      const clampDeg = (d: number) => clamp(d * ROTATE_PER_PX, -MAX_TILT, MAX_TILT);
      if (horiz) {
        flip.style.transform = `rotateY(${clampDeg(dx)}deg)`;
      } else {
        flip.style.transform = `rotateX(${clampDeg(-dy)}deg)`;
      }
      // Highlight only once past the commit point, so a highlighted edge is
      // exactly the choice that will fire on release.
      const past = SWIPE_THRESHOLD;
      flip.classList.toggle("lean-left", horiz && dx <= -past && !!card.options.left);
      flip.classList.toggle("lean-right", horiz && dx >= past && !!card.options.right);
      flip.classList.toggle("lean-up", !horiz && dy <= -past && !!card.options.up);
      flip.classList.toggle("lean-down", !horiz && dy >= past && !!card.options.down);
    };

    const settle = (): void => {
      flip.classList.remove("dragging", "lean-left", "lean-right", "lean-up", "lean-down");
      flip.style.transform = "";
    };

    const end = (x: number, y: number): void => {
      if (!dragging) return;
      dragging = false;
      const dx = x - startX;
      const dy = y - startY;
      const horiz = Math.abs(dx) >= Math.abs(dy);
      flip.classList.remove("dragging");
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

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className = "",
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}

// compact one-line summary of an effect, for the debug panel
function fmtEffect(e?: Effect): string {
  if (!e) return "—";
  const parts: string[] = [];
  if (e.vitals) {
    for (const [k, v] of Object.entries(e.vitals)) parts.push(`${k} ${v > 0 ? "+" : ""}${v}`);
  }
  if (e.setStatus) for (const [k, v] of Object.entries(e.setStatus)) parts.push(`${k}=${v}`);
  if (e.setTraits) for (const [k, v] of Object.entries(e.setTraits)) parts.push(`${k}=${v}`);
  if (e.incTraits) for (const [k, v] of Object.entries(e.incTraits)) parts.push(`${k}+=${v}`);
  if (e.addDecks) parts.push(`+deck ${e.addDecks.join(",")}`);
  if (e.removeDecks) parts.push(`−deck ${e.removeDecks.join(",")}`);
  if (e.endGame) parts.push(`END:${e.endGame}`);
  return parts.join(", ") || "—";
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
