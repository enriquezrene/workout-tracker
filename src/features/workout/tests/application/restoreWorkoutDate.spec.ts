import { describe, expect, it } from 'vitest'
import { restoreWorkoutDate } from '@/features/workout/application/restoreWorkoutDate'
import { createSession } from '@/features/workout/application/workoutCommands'
import { routines } from '@/features/workout/domain/catalog'
import { createDefaultWorkoutState } from '@/features/workout/domain/workoutFactory'

describe('restoring cloud workouts by date', () => {
  it('uses the latest repeated session without mutating or discarding historical entries', () => {
    const state = createDefaultWorkoutState('2026-09-14')
    const set = state.workout['day-1'].exercises[0].sets[0]
    Object.assign(set, { weight: '40', reps: '8', done: true, repsInReserve: '2', fatigueRer: '7.5' })
    const earlier = createSession(state, routines[0], 'earlier-manual-save')
    set.weight = '45'
    const latest = createSession(state, routines[0], 'latest-manual-save')
    const history = [latest, earlier]
    const restored = restoreWorkoutDate(history, '2026-09-14')
    expect(restored['day-1'].exercises[0].sets[0]).toMatchObject({
      weight: '45',
      repsInReserve: '2',
      fatigueRer: '7.5',
      done: true,
    })
    restored['day-1'].exercises[0].sets[0].weight = '50'
    expect(latest.exercises[0].sets[0].weight).toBe('45')
    expect(earlier.exercises[0].sets[0].weight).toBe('40')
    expect(history).toHaveLength(2)
    expect(restoreWorkoutDate(history, '2026-09-15')['day-1'].exercises[0].sets[0]).toMatchObject({
      weight: '',
      reps: '',
      done: false,
    })
  })
})
