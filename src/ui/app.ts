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

const SWIPE_THRESHOLD = 90; // px before a drag commits

type Phase = "front" | "back" | "over";

export class Game {
  private root: HTMLElement;
  private state!: GameState;
  private card: Card | null = null;
  private phase: Phase = "front";
  private result = "";

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

    const age = document.createElement("div");
    age.className = "age";
    age.innerHTML = `<span class="age-num">${this.state.age}</span><span class="age-lbl">years</span>`;
    top.appendChild(age);

    const vitals = document.createElement("div");
    vitals.className = "vitals";
    for (const key of VITAL_KEYS) {
      const v = this.state.vitals[key];
      const cell = document.createElement("div");
      cell.className = `vital vital-${key}`;
      cell.innerHTML = `
        <div class="vital-top"><span>${VITAL_LABEL[key]}</span><span class="vnum">${v}</span></div>
        <div class="track"><div class="fill" style="width:${v}%"></div></div>`;
      vitals.appendChild(cell);
    }
    top.appendChild(vitals);

    const rail = document.createElement("div");
    rail.className = "statuses";
    for (const kind of STATUS_KINDS) {
      const value = this.state.statuses[kind];
      const def = content.statuses[kind].states[value];
      const label = def?.label ?? value;
      if (kind === "lifestyle" && value === "default") continue;
      if (value === "none") continue;
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

    const el = document.createElement("article");
    el.className = "card";
    el.innerHTML = `
      <div class="card-kind">${this.state.traits.gender === "girl" ? "She" : "He"} · age ${this.state.age}</div>
      <p class="prompt">${card.prompt}</p>
      <div class="hint hint-left">${card.options.left ? "◀ " + card.options.left.label : ""}</div>
      <div class="hint hint-right">${card.options.right ? card.options.right.label + " ▶" : ""}</div>
      ${card.options.up ? `<div class="hint hint-up">▲ ${card.options.up.label}</div>` : ""}
      ${card.options.down ? `<div class="hint hint-down">▼ ${card.options.down.label}</div>` : ""}`;
    wrap.appendChild(el);
    this.attachDrag(el, card);

    const buttons = document.createElement("div");
    buttons.className = "choices";
    const dirs: Direction[] = ["left", "right", "up", "down"];
    for (const dir of dirs) {
      const opt = card.options[dir];
      if (!opt) continue;
      const b = document.createElement("button");
      b.className = "choice";
      b.textContent = opt.label;
      b.addEventListener("click", () => this.commit(dir));
      buttons.appendChild(b);
    }
    wrap.appendChild(buttons);
    return wrap;
  }

  private renderResult(): HTMLElement {
    const wrap = document.createElement("div");
    wrap.className = "card-wrap";
    const el = document.createElement("article");
    el.className = "card card-result";
    el.innerHTML = `<p class="result">${this.result}</p>`;
    wrap.appendChild(el);

    const b = document.createElement("button");
    b.className = "continue";
    b.textContent = "Continue";
    b.addEventListener("click", () => this.cont());
    wrap.appendChild(b);
    return wrap;
  }

  private renderEnd(): HTMLElement {
    const reason = this.state.endReason ?? "health";
    const ending = VITAL_ENDINGS[reason];
    const wrap = document.createElement("div");
    wrap.className = "end";
    const t = this.state.traits;
    wrap.innerHTML = `
      <div class="end-title">${ending.title}</div>
      <p class="end-blurb">${ending.blurb}</p>
      <p class="end-line">You reached <b>${this.state.age}</b> years.</p>
      <ul class="end-recap">
        <li>Job: ${content.statuses.job.states[this.state.statuses.job]?.label ?? this.state.statuses.job}</li>
        <li>Home: ${content.statuses.housing.states[this.state.statuses.housing]?.label ?? this.state.statuses.housing}</li>
        <li>Jobs changed: ${t.numTimesChangedJob} · Lottery tickets: ${t.numTimesPlayedLottery}</li>
        ${t.knowsMartialArts ? "<li>Knew martial arts</li>" : ""}
      </ul>`;
    const b = document.createElement("button");
    b.className = "continue";
    b.textContent = "New life";
    b.addEventListener("click", () => this.restart());
    wrap.appendChild(b);
    return wrap;
  }

  // --- swipe -----------------------------------------------------------------

  private attachDrag(el: HTMLElement, card: Card): void {
    let startX = 0;
    let startY = 0;
    let dragging = false;

    const move = (x: number, y: number): void => {
      const dx = x - startX;
      const dy = y - startY;
      el.style.transform = `translate(${dx}px, ${dy}px) rotate(${dx / 22}deg)`;
      const horiz = Math.abs(dx) > Math.abs(dy);
      const dir: Direction | null = horiz
        ? dx < 0 ? "left" : "right"
        : dy < 0 ? "up" : "down";
      el.classList.toggle("lean-left", dir === "left" && !!card.options.left);
      el.classList.toggle("lean-right", dir === "right" && !!card.options.right);
    };

    const end = (x: number, y: number): void => {
      if (!dragging) return;
      dragging = false;
      const dx = x - startX;
      const dy = y - startY;
      el.classList.remove("lean-left", "lean-right");
      el.style.transform = "";
      const horiz = Math.abs(dx) > Math.abs(dy);
      if (horiz && Math.abs(dx) > SWIPE_THRESHOLD) {
        const dir: Direction = dx < 0 ? "left" : "right";
        if (card.options[dir]) return this.commit(dir);
      } else if (!horiz && Math.abs(dy) > SWIPE_THRESHOLD) {
        const dir: Direction = dy < 0 ? "up" : "down";
        if (card.options[dir]) return this.commit(dir);
      }
    };

    el.addEventListener("pointerdown", (e) => {
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      el.setPointerCapture(e.pointerId);
    });
    el.addEventListener("pointermove", (e) => {
      if (dragging) move(e.clientX, e.clientY);
    });
    el.addEventListener("pointerup", (e) => end(e.clientX, e.clientY));
    el.addEventListener("pointercancel", () => {
      dragging = false;
      el.style.transform = "";
      el.classList.remove("lean-left", "lean-right");
    });
  }
}
