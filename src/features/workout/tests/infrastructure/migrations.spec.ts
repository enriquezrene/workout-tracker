import { describe, expect, it } from 'vitest'
import { migrateStoredState } from '@/features/workout/infrastructure/migrations'

describe('workout persistence migrations', () => {
  it('creates a complete default state when storage is empty', () => {
    const state = migrateStoredState(null, '2026-09-23')
    expect(Object.keys(state.workout)).toEqual(['day-1', 'day-2', 'day-3', 'day-4'])
    expect(state.sessionDate).toBe('2026-09-23')
  })

  it('preserves legacy values while translating exercise identity', () => {
    const state = migrateStoredState(
      {
        selectedRoutineId: 'day-1',
        workout: {
          'day-1': {
            exercises: [
              {
                name: 'Sentadilla con barra',
                notes: 'steady',
                sets: [{ weight: '40', reps: '8', done: false }],
              },
            ],
          },
        },
        history: [],
      },
      '2026-09-23',
    )

    expect(state.workout['day-1'].exercises[0]).toMatchObject({
      id: 'barbell-squat',
      name: 'Barbell Squat',
      notes: 'steady',
    })
    expect(state.workout['day-1'].exercises[0].sets[0]).toEqual({ weight: '40', reps: '8', done: false })
  })

  it('returns defaults for malformed state', () => {
    const state = migrateStoredState('broken', '2026-09-23')
    expect(state.selectedRoutineId).toBe('day-1')
    expect(state.history).toEqual([])
  })

  it('normalizes a current v5 state without changing explicit completion', () => {
    const current = migrateStoredState(
      {
        version: 5,
        selectedRoutineId: 'day-2',
        expandedExerciseIndex: null,
        sessionDate: '2026-09-20',
        workout: {},
        history: [],
      },
      '2026-09-23',
    )
    expect(current).toMatchObject({
      selectedRoutineId: 'day-2',
      expandedExerciseIndex: null,
      sessionDate: '2026-09-20',
    })
  })
})
