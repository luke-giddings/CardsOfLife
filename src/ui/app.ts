import { gameContent as content } from "../content/index.ts";
import {
  chooseDirection,
  drawCard,
  initGame,
  quietYear,
  setContent,
} from "../engine/engine.ts";
import { clearSave, loadGame, saveGame } from "../engine/save.ts";
import {
  STATUS_KINDS,
  VITAL_ENDINGS,
  VITAL_KEYS,
  type Card,
  type Direction,
  type GameState,
  type StatusKind,
  type VitalKey,
} from "../engine/types.ts";

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

const SWIPE_THRESHOLD = 80; // px of drag before a swipe commits
const ROTATE_PER_PX = 0.18; // degrees of tilt per px dragged
const MAX_TILT = 80;
const EXIT_MS = 260;

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

type Phase = "front" | "back" | "over";

export class Game {
  private root: HTMLElement;
  private state!: GameState;
  private card: Card | null = null;
  private phase: Phase = "front";
  private result = "";
  private busy = false; // guards during the exit animation

  constructor(root: HTMLElement) {
    this.root = root;
    setContent(content);
    const saved = loadGame();
    this.state = saved ?? initGame(content);
    if (this.state.over) {
      this.phase = "over";
    } else {
      this.nextTurn();
    }
    this.render();
    window.addEventListener("keydown", this.onKey);
  }

  // --- flow ------------------------------------------------------------------

  private nextTurn(): void {
    const draw = drawCard(this.state);
    this.state = draw.state;
    if (draw.card) {
      this.card = draw.card;
      this.phase = "front";
    } else {
      const q = quietYear(this.state);
      this.state = q.state;
      this.result = q.result;
      this.card = null;
      this.phase = this.state.over ? "over" : "back";
      saveGame(this.state);
    }
  }

  private commit(dir: Direction): void {
    if (this.phase !== "front" || !this.card) return;
    if (!this.card.options[dir]) return;
    const res = chooseDirection(this.state, this.card, dir);
    this.state = res.state;
    this.result = res.result;
    this.phase = this.state.over ? "over" : "back";
    saveGame(this.state);
    this.render();
  }

  private cont(): void {
    if (this.phase !== "back") return;
    this.nextTurn();
    this.render();
  }

  private restart(): void {
    clearSave();
    this.state = initGame(content);
    this.nextTurn();
    this.render();
  }

  private onKey = (e: KeyboardEvent): void => {
    if (this.busy) return;
    if (this.phase === "front") {
      const map: Record<string, Direction> = {
        ArrowLeft: "left",
        ArrowRight: "right",
        ArrowUp: "up",
        ArrowDown: "down",
      };
      const dir = map[e.key];
      if (dir && this.card?.options[dir]) {
        e.preventDefault();
        this.commit(dir);
      }
    } else if (e.key === "Enter" || e.key === " ") {
      if (this.phase === "back") this.cont();
    }
  };

  // --- rendering -------------------------------------------------------------

  private render(): void {
    this.root.innerHTML = "";
    this.root.appendChild(this.renderTop());
    const stage = document.createElement("main");
    stage.className = "stage";
    if (this.phase === "over") stage.appendChild(this.renderEnd());
    else if (this.phase === "back") stage.appendChild(this.renderResult());
    else stage.appendChild(this.renderCard());
    this.root.appendChild(stage);
  }

  private renderTop(): HTMLElement {
    const top = document.createElement("header");
    top.className = "topbar";

    const headRow = document.createElement("div");
    headRow.className = "head-row";
    const age = document.createElement("div");
    age.className = "age";
    age.innerHTML = `<span class="age-num">${this.state.age}</span><span class="age-lbl">years old</span>`;
    headRow.appendChild(age);
    const reset = document.createElement("button");
    reset.className = "reset";
    reset.textContent = "Reset";
    reset.title = "Debug: wipe the save and start a new life";
    reset.addEventListener("click", () => {
      if (this.busy) return;
      this.restart();
    });
    headRow.appendChild(reset);
    top.appendChild(headRow);

    const vitals = document.createElement("div");
    vitals.className = "vitals";
    for (const key of VITAL_KEYS) {
      const v = this.state.vitals[key];
      const cell = document.createElement("div");
      cell.className = `vital vital-${key}`;
      cell.innerHTML = `
        <div class="vital-top"><span>${VITAL_LABEL[key]}</span></div>
        <div class="track"><div class="fill" style="width:${v}%"></div></div>`;
      vitals.appendChild(cell);
    }
    top.appendChild(vitals);

    const rail = document.createElement("div");
    rail.className = "statuses";
    for (const kind of STATUS_KINDS) {
      const value = this.state.statuses[kind];
      if (value === content.start.statuses[kind]) continue; // hide unchanged
      const def = content.statuses[kind].states[value];
      const label = def?.label ?? value;
      const chip = document.createElement("span");
      chip.className = "chip";
      chip.innerHTML = `<b>${STATUS_LABEL[kind]}</b> ${label}`;
      rail.appendChild(chip);
    }
    top.appendChild(rail);
    return top;
  }

  private renderCard(): HTMLElement {
    const card = this.card!;
    const wrap = document.createElement("div");
    wrap.className = "card-wrap";

    const scene = document.createElement("div");
    scene.className = "scene";

    const el = document.createElement("article");
    el.className = "card";
    const ageLabel = this.state.age === 0 ? "Newborn" : `Age ${this.state.age}`;
    el.innerHTML = `
      <div class="card-age">${ageLabel}</div>
      <p class="prompt">${card.prompt}</p>
      ${card.options.left ? `<div class="edge edge-left">${card.options.left.label}</div>` : ""}
      ${card.options.right ? `<div class="edge edge-right">${card.options.right.label}</div>` : ""}
      ${card.options.up ? `<div class="edge edge-up">${card.options.up.label}</div>` : ""}
      ${card.options.down ? `<div class="edge edge-down">${card.options.down.label}</div>` : ""}`;
    scene.appendChild(el);
    wrap.appendChild(scene);
    this.attachDrag(el, card);
    return wrap;
  }

  private renderResult(): HTMLElement {
    const wrap = document.createElement("div");
    wrap.className = "card-wrap";
    const scene = document.createElement("div");
    scene.className = "scene";
    const el = document.createElement("article");
    el.className = "card card-result";
    el.innerHTML = `<p class="result">${this.result}</p><div class="tap-cue">Tap to continue</div>`;
    el.addEventListener("click", () => this.cont());
    scene.appendChild(el);
    wrap.appendChild(scene);
    return wrap;
  }

  private renderEnd(): HTMLElement {
    const reason = this.state.endReason ?? "health";
    const ending = VITAL_ENDINGS[reason];
    const t = this.state.traits;
    const wrap = document.createElement("div");
    wrap.className = "end";
    wrap.innerHTML = `
      <div class="end-title">${ending.title}</div>
      <p class="end-blurb">${ending.blurb}</p>
      <p class="end-line">You reached <b>${this.state.age}</b> years.</p>
      <ul class="end-recap">
        <li>Born a ${t.gender}</li>
        ${t.knowsMartialArts ? "<li>Learned martial arts</li>" : ""}
      </ul>`;
    const b = document.createElement("button");
    b.className = "continue";
    b.textContent = "New life";
    b.addEventListener("click", () => this.restart());
    wrap.appendChild(b);
    return wrap;
  }

  // --- swipe (3D rotate) -----------------------------------------------------

  private attachDrag(el: HTMLElement, card: Card): void {
    let startX = 0;
    let startY = 0;
    let dragging = false;

    const tilt = (dx: number, dy: number): void => {
      const horiz = Math.abs(dx) >= Math.abs(dy);
      const ry = clamp(dx * ROTATE_PER_PX, -MAX_TILT, MAX_TILT);
      const rx = clamp(-dy * ROTATE_PER_PX, -MAX_TILT, MAX_TILT);
      el.style.transform = horiz ? `rotateY(${ry}deg)` : `rotateX(${rx}deg)`;
      el.classList.toggle("lean-left", horiz && dx < -12 && !!card.options.left);
      el.classList.toggle("lean-right", horiz && dx > 12 && !!card.options.right);
      el.classList.toggle("lean-up", !horiz && dy < -12 && !!card.options.up);
      el.classList.toggle("lean-down", !horiz && dy > 12 && !!card.options.down);
    };

    const settle = (): void => {
      el.classList.remove("dragging", "lean-left", "lean-right", "lean-up", "lean-down");
      el.style.transform = "";
    };

    const fly = (dir: Direction): void => {
      if (this.busy) return;
      this.busy = true;
      const exit: Record<Direction, string> = {
        left: "rotateY(-115deg)",
        right: "rotateY(115deg)",
        up: "rotateX(115deg)",
        down: "rotateX(-115deg)",
      };
      if (prefersReducedMotion) {
        this.busy = false;
        this.commit(dir);
        return;
      }
      el.classList.remove("dragging");
      el.classList.add("flying");
      el.style.transform = exit[dir];
      el.style.opacity = "0";
      window.setTimeout(() => {
        this.busy = false;
        this.commit(dir);
      }, EXIT_MS);
    };

    const end = (x: number, y: number): void => {
      if (!dragging) return;
      dragging = false;
      const dx = x - startX;
      const dy = y - startY;
      const horiz = Math.abs(dx) >= Math.abs(dy);
      if (horiz && Math.abs(dx) > SWIPE_THRESHOLD) {
        const dir: Direction = dx < 0 ? "left" : "right";
        if (card.options[dir]) return fly(dir);
      } else if (!horiz && Math.abs(dy) > SWIPE_THRESHOLD) {
        const dir: Direction = dy < 0 ? "up" : "down";
        if (card.options[dir]) return fly(dir);
      }
      settle();
    };

    el.addEventListener("pointerdown", (e) => {
      if (this.busy) return;
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      el.classList.add("dragging");
      el.setPointerCapture(e.pointerId);
    });
    el.addEventListener("pointermove", (e) => {
      if (dragging) tilt(e.clientX - startX, e.clientY - startY);
    });
    el.addEventListener("pointerup", (e) => end(e.clientX, e.clientY));
    el.addEventListener("pointercancel", () => {
      dragging = false;
      settle();
    });
  }
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}
