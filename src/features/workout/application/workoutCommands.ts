import { routines } from '../domain/catalog'
import { createEmptySet, createRoutineLog } from '../domain/workoutFactory'
import {
  completedSetCount,
  isCompletedSet,
  isExerciseComplete,
  totalSetCount,
  workoutVolume,
} from '../domain/workoutRules'
import type { ExerciseLog, RoutineDefinition, WorkoutSession, WorkoutState } from '../domain/models'

export function selectRoutine(state: WorkoutState, routineId: string): void {
  if (!routines.some((routine) => routine.id === routineId)) return
  state.selectedRoutineId = routineId
  state.expandedExerciseIndex = 0
}

export function toggleExercise(state: WorkoutState, index: number): void {
  const exerciseCount = state.workout[state.selectedRoutineId].exercises.length
  if (index < 0 || index >= exerciseCount) return
  state.expandedExerciseIndex = state.expandedExerciseIndex === index ? null : index
}

export function addSet(exercise: ExerciseLog): void {
  exercise.sets.push(createEmptySet())
}

export function removeSet(exercise: ExerciseLog, setIndex: number): void {
  if (setIndex >= exercise.defaultSets) exercise.sets.splice(setIndex, 1)
}

export function toggleSet(exercise: ExerciseLog, setIndex: number): void {
  const set = exercise.sets[setIndex]
  if (set) set.done = !set.done
}

export function resetRoutine(state: WorkoutState, routine: RoutineDefinition): void {
  state.workout[routine.id] = createRoutineLog(routine)
  state.expandedExerciseIndex = 0
}

export function createSession(state: WorkoutState, routine: RoutineDefinition, id: string): WorkoutSession {
  const log = state.workout[routine.id]
  const completedSets = log.exercises.reduce((sum, exercise) => sum + completedSetCount(exercise), 0)
  return {
    id,
    date: state.sessionDate,
    routineId: routine.id,
    routineName: routine.name,
    focus: routine.focus,
    completedSets,
    totalSets: totalSetCount(log.exercises),
    totalVolume: workoutVolume(log),
    exercises: log.exercises.map((exercise) => ({
      ...exercise,
      sets: exercise.sets.map((set) => ({ ...set })),
    })),
  }
}

export function findPreviousExercise(
  state: WorkoutState,
  exercise: ExerciseLog,
): { date: string; exercise: ExerciseLog } | null {
  const candidates = state.history
    .filter((entry) => entry.date < state.sessionDate)
    .sort((a, b) => b.date.localeCompare(a.date))
  const hasExercise = (session: WorkoutSession) =>
    session.exercises.some((item) => item.id === exercise.id && item.sets.some(isCompletedSet))
  const session =
    candidates.find((entry) => entry.routineId === state.selectedRoutineId && hasExercise(entry)) ||
    candidates.find(hasExercise)
  if (!session) return null
  return { date: session.date, exercise: session.exercises.find((item) => item.id === exercise.id)! }
}

export function nextExerciseAfterCompletion(state: WorkoutState, exerciseIndex: number): number | null {
  const exercises = state.workout[state.selectedRoutineId].exercises
  return isExerciseComplete(exercises[exerciseIndex]) && exerciseIndex < exercises.length - 1
    ? exerciseIndex + 1
    : null
}
