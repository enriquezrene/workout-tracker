# Workout Tracker

A responsive Vue 3 application for recording workout sets, weight, repetitions, notes, training volume, previous-session references, and weekly history. Data is stored locally in the browser and legacy v4 data is migrated to the current v5 format.

## Architecture

The project uses TypeScript and feature-oriented Clean Architecture:

```text
src/
  app/                    # Application composition
  features/
    workout/              # Workout domain, use cases, persistence, and UI
    weekly-summary/       # Weekly aggregation and UI
  shared/                 # Reusable components, styles, and generic helpers
e2e/                      # Playwright user journeys
```

Domain code is framework-independent. Browser persistence implements application ports, and Vue components call a typed workout controller rather than owning business rules.

## Commands

```bash
npm install
npm run dev
npm run typecheck
npm run lint
npm run format:check
npm run test
npm run test:coverage
npm run build
npm run e2e
npm run check
```

`npm run check` runs formatting, linting, type checking, unit/component tests, and the production build. End-to-end tests run separately through Playwright.

## Persistence

Workout progress and history are saved under `diauno-workout-tracking-v5` in `localStorage`. The repository can read and migrate data from `diauno-workout-tracking-v4`; existing values and explicit completion states are preserved.
