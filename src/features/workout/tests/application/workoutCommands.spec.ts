import { describe, expect, it } from 'vitest'
import {
  addSet,
  findPreviousExercise,
  nextExerciseAfterCompletion,
  removeSet,
} from '@/features/workout/application/workoutCommands'
import { createDefaultWorkoutState } from '@/features/workout/domain/workoutFactory'

describe('workout commands', () => {
  it('only removes user-added sets', () => {
    const state = createDefaultWorkoutState('2026-09-23')
    const exercise = state.workout['day-1'].exercises[0]
    addSet(exercise)
    removeSet(exercise, 0)
    expect(exercise.sets).toHaveLength(5)
    removeSet(exercise, 4)
    expect(exercise.sets).toHaveLength(4)
  })

  it('advances only after every current set is complete', () => {
    const state = createDefaultWorkoutState('2026-09-23')
    const exercise = state.workout['day-1'].exercises[0]
    expect(nextExerciseAfterCompletion(state, 0)).toBeNull()
    exercise.sets.forEach((set) => {
      set.done = true
    })
    expect(nextExerciseAfterCompletion(state, 0)).toBe(1)
  })

  it('uses the latest earlier session for previous values', () => {
    const state = createDefaultWorkoutState('2026-09-23')
    const exercise = state.workout['day-1'].exercises[0]
    state.history = ['2026-09-21', '2026-09-22'].map((date) => ({
      id: date,
      date,
      routineId: 'day-1',
      routineName: 'Day 1',
      focus: 'Lower A',
      completedSets: 1,
      totalSets: 4,
      totalVolume: 80,
      exercises: [
        { ...exercise, sets: [{ weight: date.endsWith('22') ? '20' : '10', reps: '8', done: true }] },
      ],
    }))
    expect(findPreviousExercise(state, exercise)?.exercise.sets[0].weight).toBe('20')
  })
})
