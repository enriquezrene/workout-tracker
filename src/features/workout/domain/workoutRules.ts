import type { ExerciseLog, ExerciseUnit, RoutineLog, WorkoutSet } from './models'

export function canCompleteSet(set: WorkoutSet, unit: ExerciseUnit = 'reps'): boolean {
  const reps = Number(set.reps)
  const weight = Number(set.weight)
  return (
    Number.isFinite(reps) &&
    reps > 0 &&
    (unit === 'sec' || Number.isInteger(reps)) &&
    Number.isFinite(weight) &&
    weight >= 0
  )
}

export const isCompletedSet = (set: WorkoutSet): boolean => set.done === true
export const completedSetCount = (exercise: ExerciseLog): number =>
  exercise.sets.filter(isCompletedSet).length
export const totalSetCount = (exercises: ExerciseLog[]): number =>
  exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0)
export const isExerciseComplete = (exercise: ExerciseLog): boolean =>
  exercise.sets.length > 0 && exercise.sets.every(isCompletedSet)

export function exerciseVolume(exercise: ExerciseLog): number {
  return exercise.sets
    .filter(isCompletedSet)
    .reduce((sum, set) => sum + (Number(set.weight) || 0) * (Number(set.reps) || 0), 0)
}

export const workoutVolume = (routine: RoutineLog): number =>
  routine.exercises.reduce((sum, exercise) => sum + exerciseVolume(exercise), 0)

export function workoutProgress(exercises: ExerciseLog[]): number {
  const total = totalSetCount(exercises)
  const completed = exercises.reduce((sum, exercise) => sum + completedSetCount(exercise), 0)
  return Math.round((completed / Math.max(total, 1)) * 100)
}
