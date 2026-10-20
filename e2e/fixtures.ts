import { test as base, expect } from '@playwright/test'
import type { WorkoutSession } from '../src/features/workout/domain/models'

export const supabaseUrl = 'https://workout-e2e.supabase.co'
const user = {
  id: '00000000-0000-4000-8000-000000000001',
  aud: 'authenticated',
  role: 'authenticated',
  email: 'rene@example.test',
  app_metadata: { provider: 'google', providers: ['google'] },
  user_metadata: { full_name: 'Rene Enriquez' },
  created_at: '2026-09-14T00:00:00Z',
}
const expiresAt = Math.floor(Date.now() / 1000) + 3600
const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url')
const session = {
  access_token: `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: user.id, exp: expiresAt, aud: 'authenticated', role: 'authenticated' })}.${encode('test-signature')}`,
  refresh_token: 'test-refresh-token',
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: expiresAt,
  user,
}

function sessionRecord(workout: WorkoutSession) {
  return {
    id: workout.id,
    workout_date: workout.date,
    routine_id: workout.routineId,
    routine_name: workout.routineName,
    focus: workout.focus,
    completed_sets: workout.completedSets,
    total_sets: workout.totalSets,
    total_volume: workout.totalVolume,
    created_at: '2026-09-14T12:00:00Z',
    exercise_entries: workout.exercises.map((exercise, index) => ({
      exercise_id: exercise.id,
      exercise_name: exercise.name,
      prescription: exercise.prescription,
      default_sets: exercise.defaultSets,
      suggested: exercise.suggested || null,
      optional: exercise.optional || false,
      unit: exercise.unit || 'reps',
      notes: exercise.notes,
      position: index + 1,
      exercise_sets: exercise.sets.map((set, setIndex) => ({
        set_number: setIndex + 1,
        kg: set.weight === '' ? null : Number(set.weight),
        reps: set.reps === '' ? null : Number(set.reps),
        reps_in_reserve: null,
        fatigue_rer: null,
        completed: set.done,
      })),
    })),
  }
}

interface CloudFixture {
  sessions: Map<string, WorkoutSession>
  failNextSave: boolean
  failLoad: boolean
  writes: WorkoutSession[]
}

export const test = base.extend<{ cloud: CloudFixture }>({
  cloud: async ({ page, context }, use) => {
    const cloud: CloudFixture = { sessions: new Map(), failNextSave: false, failLoad: false, writes: [] }
    await context.route(`${supabaseUrl}/**`, async (route) => {
      const path = new URL(route.request().url()).pathname
      if (path.endsWith('/logout')) return route.fulfill({ status: 204 })
      if (path.endsWith('/user')) return route.fulfill({ json: user })
      if (path.includes('/rest/v1/workout_sessions')) {
        if (cloud.failLoad) return route.fulfill({ status: 403, json: { message: 'Test load failure' } })
        return route.fulfill({ json: [...cloud.sessions.values()].reverse().map(sessionRecord) })
      }
      if (path.endsWith('/rpc/save_workout_session')) {
        if (cloud.failNextSave) {
          cloud.failNextSave = false
          return route.fulfill({ status: 403, json: { message: 'Test save failure' } })
        }
        const workout = route.request().postDataJSON().p_workout as WorkoutSession
        cloud.writes.push(workout)
        cloud.sessions.set(workout.id, workout)
        return route.fulfill({ json: workout.id })
      }
      return route.fulfill({ status: 400, json: { message: 'Unexpected test request' } })
    })
    await context.route('https://images.unsplash.com/**', (route) => route.abort())
    await context.addInitScript(
      ({ session }) => {
        Object.defineProperty(window, 'localStorage', {
          get: () => {
            throw new Error('The app must not use localStorage')
          },
        })
        if (!sessionStorage.getItem('e2e-session-seeded')) {
          sessionStorage.setItem('sb-workout-e2e-auth-token', JSON.stringify(session))
          sessionStorage.setItem('e2e-session-seeded', 'true')
        }
      },
      { session },
    )
    // Requesting this fixture also configures the page before navigation.
    void page
    await use(cloud)
  },
})
export { expect }
