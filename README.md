# Cards of Life

A single-player, swipe-to-decide life-simulation game. Each card is one year of
your life and a dilemma; swipe to choose, then read the result. Juggle four
**Vitals** (Finances, Happiness, Health, Spirit) — any hitting 0 ends the run —
while persistent **Statuses** (Job, Housing, Education) pull them around and
hidden **Traits** quietly shape how your choices play out.

Built as a static web app (playable in a phone browser), with a strict split
between the **engine** (code) and the **content** (cards & decks as typed data),
so the game grows by adding data, not editing logic.

## Play

The latest push deploys automatically to **GitHub Pages**:
<https://luke-giddings.github.io/CardsOfLife/>

> One-time setup: in the repo, **Settings → Pages → Build and deployment →
> Source: “GitHub Actions”**. After that, every push to the dev branch builds
> and publishes via `.github/workflows/deploy.yml`.

## Develop

```bash
npm install
npm run dev        # local dev server
npm run build      # typecheck (tsc --noEmit) + production build
npm run typecheck  # types only
node --experimental-strip-types scripts/sim.ts   # headless playthrough smoke test
```

## Layout

```
src/
  engine/      # pure game logic, no DOM
    types.ts       # the typed registry: Vitals, Statuses, Traits, Cards…
    engine.ts      # draw model, outcome resolution, effects, drift, game-over
    conditions.ts  # condition evaluation
    rng.ts         # seeded PRNG (saved with the game)
    save.ts        # localStorage save / resume / reset
  content/     # the game as data (typed, `satisfies Content`)
    index.ts       # decks, statuses, starting config
  ui/          # rendering + swipe input
    app.ts
  styles.css
```

## Design

See **[docs/DESIGN.md](docs/DESIGN.md)** for the full design.
