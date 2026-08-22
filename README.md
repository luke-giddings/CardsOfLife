# Cards of Life

A single-player, swipe-to-decide life-simulation game. Each card is one year of
your life and a dilemma; swipe to choose. Juggle four **Vitals** (Finances,
Happiness, Health, Spirit) while persistent **Statuses** (Job, Housing,
Education, and more) pull them around. Unlock new decks as life progresses —
childhood, jobs, homes, relationships — until a Vital runs out and the run ends.

Built as a static web app (playable in a phone browser), with a strict split
between the **engine** (code) and the **content** (cards & decks as JSON data),
so the game grows by adding data, not editing logic.

## Status

Early design phase — no code yet. The design is being nailed down first.

## Design

See **[docs/DESIGN.md](docs/DESIGN.md)** for the full design: terminology,
Vitals & Statuses, the virtual-pool draw model, card lifecycle, the
conditions/effects system, deck progression, and first-playable scope.
