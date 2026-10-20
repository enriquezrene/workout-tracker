import { describe, expect, it } from 'vitest'
import {
  completedSetCount,
  canCompleteSet,
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
  it('accepts bodyweight and timed sets but rejects missing, negative, or invalid entries', () => {
    const set = { weight: '', reps: '8', repsInReserve: '', fatigueRer: '', done: false }
    expect(canCompleteSet(set)).toBe(true)
    expect(canCompleteSet({ ...set, reps: '' })).toBe(false)
    expect(canCompleteSet({ ...set, reps: '8.5' })).toBe(false)
    expect(canCompleteSet({ ...set, reps: '8.5' }, 'sec')).toBe(true)
    expect(canCompleteSet({ ...set, weight: '-1' })).toBe(false)
    expect(canCompleteSet({ ...set, weight: 'Infinity' })).toBe(false)
  })
  it('counts and totals checked sets only', () => {
    const log = exercise([
      { weight: '20', reps: '8', repsInReserve: '2', fatigueRer: '7', done: true },
      { weight: '30', reps: '10', repsInReserve: '1', fatigueRer: '8', done: false },
    ])
    expect(completedSetCount(log)).toBe(1)
    expect(exerciseVolume(log)).toBe(160)
    expect(isExerciseComplete(log)).toBe(false)
  })

  it('calculates progress across exercises', () => {
    expect(
      workoutProgress([
        exercise([{ weight: '', reps: '', repsInReserve: '', fatigueRer: '', done: true }]),
        exercise([{ weight: '', reps: '', repsInReserve: '', fatigueRer: '', done: false }]),
      ]),
    ).toBe(50)
  })
})
