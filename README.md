# Workout Tracker

A responsive Vue 3 application for recording workout sets, weight, repetitions, notes, training volume, previous-session references, and weekly history. Supabase is the source of truth for workouts: clicking a row's completion check saves that set immediately. Legacy reps-in-reserve and fatigue values remain preserved in saved cloud sessions, but are no longer collected.

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

Domain code is framework-independent. Supabase persistence implements application ports, and Vue components call a typed workout controller rather than owning business rules.

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

## Supabase setup

1. Apply [the workout progress migration](supabase/migrations/202610190001_workout_progress.sql) in the Supabase SQL editor. Alternatively, use `psql` locally with the real database password:

   ```bash
   export DATABASE_URL='postgresql://postgres:YOUR_REAL_PASSWORD@db.dmvekolugjlmddvgmblc.supabase.co:5432/postgres'
   psql "$DATABASE_URL" -f supabase/migrations/202610190001_workout_progress.sql
   ```

2. Create a **Web application** OAuth client in Google Cloud Console. Add this authorized redirect URI:

   ```text
   https://dmvekolugjlmddvgmblc.supabase.co/auth/v1/callback
   ```

3. In Supabase, open **Authentication → Providers → Google**, enable Google, and enter the OAuth client ID and client secret from Google Cloud.

4. Under **Authentication → URL Configuration**, set the production Site URL and add local and production redirect URLs. For local development, add `http://localhost:5173/**`.

5. Copy `.env.example` to `.env.local` and provide the project's publishable key. Never put the Google client secret, database password, or Supabase service-role key in a `VITE_` variable.

   ```text
   VITE_SUPABASE_URL=https://dmvekolugjlmddvgmblc.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-public-publishable-key
   ```

The application requires Google authentication and Supabase configuration. Row Level Security restricts each user to their own sessions. The Google session uses `sessionStorage` for the current browser tab; workouts are never stored in browser storage. Missing configuration shows an unavailable sign-in screen instead of a local-only workout tracker.

## Recording sets

- Enter weight and repetitions (or seconds), then click the row's check. Empty weight is allowed for bodyweight exercises.
- The check is confirmed after Supabase acknowledges the save. A failed request retains the entered values and offers Retry.
- Subsequent checks update the same session for the selected workout date and routine. Unchecking a row updates its saved completion state.
- Editing a checked row clears its check; click it again to save the new values. Notes save on leaving their field once a session exists, or with the first completed set otherwise.
- Changing the workout date restores the saved session for that date. Unsaved entries remain in memory while the page is open; reloading discards unconfirmed changes.
- Previous values come from completed sets in earlier saved sessions. Each date starts with its own saved values or an empty workout.

Existing Supabase sessions, including older repeated manual saves, are preserved. The app no longer reads, writes, imports, or deletes former browser workout caches. Any entries that were only saved in the old browser cache remain there, unused by the application; they are not automatically uploaded.

End-to-end tests use a simulated Supabase service and signed-in session. They prohibit access to `localStorage` and exercise completion, failures, retries, reloads, and previous-session references at desktop and 320px widths.

## Progress report

The migration creates `public.exercise_progress`, a Row Level Security-aware view with one row per exercise set. This query answers the requested progress question:

```sql
select
  date,
  "group",
  exercise,
  set_number,
  reps,
  kg,
  notes
from public.exercise_progress
order by date desc, exercise, set_number;
```

The existing `save_workout_session` RPC supports updating a session by its stable ID. The per-set recording flow uses that existing RPC and does not require a database migration.
