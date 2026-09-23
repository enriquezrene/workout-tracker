import { describe, expect, it } from 'vitest'
import {
  completedSetCount,
  exerciseVolume,
  isExerciseComplete,
  workoutProgress,
} from '@/features/workout/domain/workoutRules'
import type { ExerciseLog } from '@/features/workout/domain/models'

const exercise = (sets: ExerciseLog['sets']): ExerciseLog => ({
  id: 'squat',
  name: 'Squat',
  prescription: '2 x 8',
  defaultSets: 2,
  notes: '',
  sets,
})

describe('workout rules', () => {
  it('counts and totals checked sets only', () => {
    const log = exercise([
      { weight: '20', reps: '8', done: true },
      { weight: '30', reps: '10', done: false },
    ])
    expect(completedSetCount(log)).toBe(1)
    expect(exerciseVolume(log)).toBe(160)
    expect(isExerciseComplete(log)).toBe(false)
  })

  it('calculates progress across exercises', () => {
    expect(
      workoutProgress([
        exercise([{ weight: '', reps: '', done: true }]),
        exercise([{ weight: '', reps: '', done: false }]),
      ]),
    ).toBe(50)
  })
})
