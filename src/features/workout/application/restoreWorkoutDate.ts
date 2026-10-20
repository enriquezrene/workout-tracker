import { routines } from '../domain/catalog'
import { createRoutineLog } from '../domain/workoutFactory'
import type { RoutineLog, WorkoutSession } from '../domain/models'

export function restoreWorkoutDate(
  history: readonly WorkoutSession[],
  date: string,
): Record<string, RoutineLog> {
  return Object.fromEntries(
    routines.map((routine) => {
      const defaults = createRoutineLog(routine)
      const session = history.find((entry) => entry.date === date && entry.routineId === routine.id)
      if (!session) return [routine.id, defaults]
      const exercises = defaults.exercises.map((exercise) => {
        const saved = session.exercises.find((entry) => entry.id === exercise.id)
        return saved ? { ...exercise, ...saved, sets: saved.sets.map((set) => ({ ...set })) } : exercise
      })
      session.exercises
        .filter((saved) => !exercises.some((exercise) => exercise.id === saved.id))
        .forEach((saved) => {
          exercises.push({ ...saved, sets: saved.sets.map((set) => ({ ...set })) })
        })
      return [routine.id, { routineId: routine.id, exercises }]
    }),
  )
}
