import { describe, expect, it } from 'vitest'
import { mapSessionRecord } from '@/features/workout/infrastructure/supabaseWorkoutHistoryRepository'

describe('Supabase workout history mapping', () => {
  it('maps normalized exercise progress into the workout domain', () => {
    const session = mapSessionRecord({
      id: 'session-1',
      workout_date: '2026-10-19',
      routine_id: 'day-1',
      routine_name: 'Day 1',
      focus: 'Lower A',
      completed_sets: 1,
      total_sets: 1,
      total_volume: 320,
      created_at: '2026-10-19T12:00:00Z',
      exercise_entries: [
        {
          exercise_id: 'barbell-squat',
          exercise_name: 'Barbell Squat',
          prescription: '4 x 6-8',
          default_sets: 4,
          suggested: null,
          optional: false,
          unit: 'reps',
          notes: 'Controlled tempo',
          position: 1,
          exercise_sets: [
            {
              set_number: 1,
              kg: 40,
              reps: 8,
              reps_in_reserve: 2,
              fatigue_rer: 7.5,
              completed: true,
            },
          ],
        },
      ],
    })

    expect(session.exercises[0].sets[0]).toEqual({
      weight: '40',
      reps: '8',
      repsInReserve: '2',
      fatigueRer: '7.5',
      done: true,
    })
    expect(session.exercises[0].notes).toBe('Controlled tempo')
  })
})
