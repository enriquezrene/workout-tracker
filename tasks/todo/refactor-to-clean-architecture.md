# Refactor Workout Tracker to Clean Architecture

## Overview

Refactor the current Vue 3 and Vite workout tracker from a monolithic JavaScript application into a TypeScript, feature-oriented Clean Architecture. Separate workout domain rules, application use cases, browser persistence, Vue presentation, and weekly-summary behavior into explicit feature boundaries.

The refactor should preserve the existing workout experience and local user data while introducing typed interfaces, focused Vue components, scoped styles, automated tests, static-quality tooling, and continuous integration. Small accessibility, copy, and spacing improvements are allowed when they support the component extraction, but the established product workflows must remain intact.

## Why

The current application concentrates the routine catalog, workout calculations, persistence migrations, browser side effects, reactive state, weekly aggregation, and the complete interface inside `App.vue`. This makes behavior difficult to test in isolation, increases regression risk, and causes unrelated responsibilities to change together.

The project also lacks TypeScript, automated tests, linting, formatting enforcement, and continuous integration. Aligning the codebase with `AGENTS.md` will create clear dependency boundaries, make business rules independently testable, protect existing `localStorage` data, and provide a maintainable structure for future features.

## Assumptions

- Existing workout workflows and product rules must remain unchanged unless an acceptance criterion explicitly states otherwise.
- Existing v4 and v5 `localStorage` data is durable user data and must remain readable without losing weights, repetitions, notes, dates, history, or explicit completion values.
- The project will migrate from JavaScript to TypeScript.
- State management will use a typed feature controller composable rather than Pinia.
- The application will continue without a backend, authentication, router, or cross-device synchronization.
- Vitest, Vue Test Utils, jsdom, and Playwright will provide unit, component, and end-to-end coverage.
- ESLint, Prettier, and `vue-tsc` will enforce code quality and type correctness.
- GitHub Actions will run the required quality checks on pushes and pull requests.
- Feature components will use scoped CSS; only design tokens, resets, and genuinely shared foundations will remain global.
- Small visual and accessibility improvements are allowed, but a broader redesign is outside the scope of this task.
- Stable routine and exercise IDs will remain the source of identity; display labels must not become persistence keys.

## Acceptance Criteria

- [ ] Application entrypoints and source modules are migrated to TypeScript and pass `vue-tsc` with no errors.
- [ ] Source code is organized by feature under `src/features`, with separate domain, application, infrastructure, presentation, and test responsibilities where applicable.
- [ ] `App.vue` is reduced to app-level composition and Track/Weekly Summary view selection.
- [ ] Workout entities and persistence shapes have explicit TypeScript types.
- [ ] Workout completion, progress, volume, exercise progression, and weekly aggregation are implemented as pure domain functions.
- [ ] Workout commands for selecting and resetting routines, editing sets and notes, adding and removing sets, saving sessions, and clearing history are separated from Vue components.
- [ ] Browser `localStorage`, ID generation, and current-date access are isolated behind injected infrastructure interfaces.
- [ ] The persistence repository safely reads current v5 state and migrates legacy v4 state without deleting or silently discarding user data.
- [ ] Vue components receive typed props and emit intent-focused events instead of directly owning cross-feature business rules.
- [ ] The workout interface is split into focused components for navigation, routine selection, summaries, exercise accordion, set rows, progress, history, actions, and save feedback.
- [ ] Weekly-summary calculations and presentation are contained in the weekly-summary feature and do not depend on workout presentation or infrastructure code.
- [ ] Feature styles are scoped beside their components, and shared global styles contain only tokens, resets, and reusable foundations.
- [ ] The current accordion, completion, automatic progression, set removal, save-history, previous-session, reset, and weekly-summary behaviors remain functional.
- [ ] Unit tests cover checked-only completion and volume, progress, exercise completion, automatic progression, removable added sets, previous-session selection, and weekly aggregation.
- [ ] Migration tests cover empty, malformed, v4, and v5 persisted states with representative fixtures.
- [ ] Component tests cover accordion interaction, set entry, notes, add/remove controls, reset, save feedback, and history clearing.
- [ ] Playwright covers selecting a workout day, entering and completing sets, automatic progression, saving, reloading persisted state, and viewing the weekly summary.
- [ ] Responsive verification confirms set rows and sticky actions do not overlap or overflow at a 320px viewport.
- [ ] Interactive controls retain accessible names, keyboard operation, focus states, and correct accordion semantics.
- [ ] Package scripts include type checking, linting, formatting checks, unit/component tests, coverage, end-to-end tests, build, and an aggregate quality check.
- [ ] GitHub Actions runs formatting, linting, type checking, unit/component tests, production build, and Chromium Playwright tests.
- [ ] `README.md` and `AGENTS.md` document the resulting architecture and repository commands.
- [ ] `npm run check`, `npm run e2e`, and `npm run build` complete successfully.

## Technical Notes

## Plan

<!-- Claude will fill this in during the Plan phase -->
