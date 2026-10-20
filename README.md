# Workout Tracker

A responsive Vue 3 application for recording workout sets, weight, repetitions, notes, training volume, previous-session references, and weekly history. Local storage provides immediate offline persistence, while configured Supabase projects synchronize saved workout history. Legacy reps-in-reserve and fatigue values remain preserved in storage, but are no longer collected.

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

The application authenticates with Google, and Row Level Security restricts each user to their own sessions. Existing local history is assigned to the first Google account used in that browser, then merged and uploaded. Subsequent accounts receive separate local caches. Without the environment variables, the application continues to work locally for development and automated tests.

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

Workout drafts and history are also saved under `diauno-workout-tracking-v5` in `localStorage` for offline use. Legacy v4 data is migrated without losing values or completion state.
