# Workout Tracker Engineering Guide

## Project Overview

Workout Tracker is a responsive Vue 3 and Vite application for recording gym sessions on mobile and desktop. Users select one of four workout days, expand an exercise, and record weight and repetitions for every set. The app also shows values from the previous workout, calculates progress and completed training volume, stores exercise notes, and provides a weekly summary of saved sessions.

The application currently persists workout state and history in browser `localStorage`. It does not have a backend, authentication, or cross-device synchronization. Treat stored user workout data as important and preserve compatibility when changing persistence formats.

## Engineering Principles

- Use Clean Architecture. Business rules must not depend on Vue, browser APIs, persistence implementations, or presentation details.
- Organize code by feature first, then by architectural responsibility inside each feature.
- Keep dependencies pointing inward: presentation and infrastructure may depend on application and domain code, never the reverse.
- Prefer small, explicit modules with one clear responsibility.
- Write clean code: use descriptive names, short functions, minimal nesting, and no hidden side effects.
- Avoid speculative abstractions. Extract shared code only when it represents a stable concept or removes meaningful duplication.
- Preserve existing behavior and user data unless the task explicitly changes them.
- Keep the interface responsive and touch-friendly, with mobile as a primary use case.
- Maintain accessible semantics, labels, keyboard behavior, focus states, and sufficient contrast.

## Feature-Based Structure

New code and substantial refactors should follow this shape:

```text
src/
  app/                    # App composition, routing, and global providers
  features/
    workout/
      domain/             # Entities, value objects, and pure business rules
      application/        # Use cases and orchestration
      infrastructure/     # localStorage repositories and external adapters
      presentation/       # Vue components, composables, and view models
      tests/              # Feature-focused tests when colocating is clearest
    weekly-summary/
      domain/
      application/
      presentation/
  shared/
    components/           # Reusable UI primitives with no feature rules
    utilities/            # Generic helpers only
    styles/               # Shared tokens and global styles
```

- Group files around user-facing capabilities, not technical file types.
- Do not create global `components`, `services`, or `utils` dumping grounds.
- Keep feature-specific components and helpers inside their owning feature.
- Use `shared` only for code that is genuinely reused across features.
- Prefer stable IDs for routines and exercises. Display names must not be used as persistence keys or domain identity.
- Access `localStorage` through an infrastructure repository or adapter, not directly from Vue components.
- Keep calculations such as completion, volume, and weekly aggregation as pure domain functions.
- Let Vue components focus on rendering, input handling, and calling application use cases.

## TDD Workflow

Work with a test-driven development approach in mind:

1. Define the expected behavior and edge cases before implementation.
2. Add or update a failing test that demonstrates the behavior when practical.
3. Implement the smallest change that makes the test pass.
4. Refactor only after the behavior is protected by tests.
5. Run focused tests during development, then the complete relevant test suite and production build.

Testing priorities:

- Unit-test domain rules such as completed-set counting, volume calculations, automatic progression, weekly aggregation, and persistence migrations.
- Component-test accordion behavior, set entry, add/remove set controls, save feedback, and responsive interaction states.
- Add end-to-end coverage for critical workflows: selecting a day, completing a workout, saving it, reloading persisted data, and viewing the weekly summary.
- Test migrations with representative older stored-state fixtures so existing workout history is not lost.
- Include regression tests with every bug fix whenever a suitable test harness exists.
- If the project lacks the required test tooling, call that out and add the smallest appropriate test setup as part of substantive feature work.

## Clean Code Standards

- Use names that describe intent; avoid abbreviations and vague names such as `data`, `item`, or `handler` when a domain name is available.
- Keep functions pure by default. Isolate time, storage, browser, and random-ID dependencies behind adapters.
- Prefer guard clauses over deeply nested conditionals.
- Avoid boolean parameters when separate named functions or options communicate intent better.
- Do not duplicate business rules across components and summaries.
- Keep comments limited to non-obvious decisions and constraints. Do not narrate self-explanatory code.
- Handle empty history, malformed persisted data, incomplete sets, and legacy storage versions safely.
- Do not silently discard user-entered values during migrations or catalog changes.
- Keep UI copy in English and centralized when repetition makes drift likely.

## Current Product Rules

- A set is complete only when the user explicitly marks it complete.
- Progress and volume include completed sets only.
- Only one exercise accordion is expanded at a time, but all exercises may be collapsed.
- Selecting a workout day opens its first exercise.
- Completing the final outstanding set opens the next exercise when one exists.
- Prescribed sets cannot be removed; user-added sets can be removed.
- Each save creates a separate workout-history entry, including repeated saves for the same day and date.
- Previous-set references come from an earlier saved session and are read-only.
- Exercise and routine identity must remain stable across translated labels and persistence migrations.

## Verification

Before considering a change complete:

- Run the relevant automated tests.
- Run `npm run build`.
- Check the primary workout flow at narrow mobile and desktop widths when UI code changes.
- Confirm set rows do not overflow or overlap at the minimum supported width of 320px.
- Verify keyboard and screen-reader semantics for interactive controls.
- Verify persisted state can still be loaded after data-model changes.
- Report any verification that could not be performed.

## Repository Commands

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
