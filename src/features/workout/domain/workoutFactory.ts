import { routines } from './catalog'
import type { ExerciseLog, RoutineDefinition, RoutineLog, WorkoutSet, WorkoutState } from './models'

export const createEmptySet = (): WorkoutSet => ({ weight: '', reps: '', done: false })

export function createRoutineLog(routine: RoutineDefinition): RoutineLog {
  return {
    routineId: routine.id,
    exercises: routine.exercises.map<ExerciseLog>((exercise) => ({
      ...exercise,
      notes: '',
      sets: Array.from({ length: exercise.defaultSets }, createEmptySet),
    })),
  }
}

export function createDefaultWorkoutState(today: string): WorkoutState {
  return {
    selectedRoutineId: routines[0].id,
    expandedExerciseIndex: 0,
    sessionDate: today,
    workout: Object.fromEntries(routines.map((routine) => [routine.id, createRoutineLog(routine)])),
    history: [],
  }
}
