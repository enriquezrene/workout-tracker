import type { ExerciseLog, RoutineLog, WorkoutSet } from './models'

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
