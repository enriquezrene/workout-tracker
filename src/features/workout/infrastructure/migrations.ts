import { exerciseCatalog, legacyExerciseIds, routines } from '../domain/catalog'
import { createDefaultWorkoutState, createEmptySet } from '../domain/workoutFactory'
import { isCompletedSet } from '../domain/workoutRules'
import type { ExerciseLog, WorkoutSession, WorkoutSet, WorkoutState } from '../domain/models'

type UnknownRecord = Record<string, any>

const isRecord = (value: unknown): value is UnknownRecord =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)
const asArray = (value: unknown): any[] => (Array.isArray(value) ? value : [])

function normalizeSet(value: unknown): WorkoutSet {
  if (!isRecord(value)) return createEmptySet()
  return { weight: String(value.weight ?? ''), reps: String(value.reps ?? ''), done: value.done === true }
}

function exerciseId(value: UnknownRecord): string {
  return String(
    value.id ||
      legacyExerciseIds[String(value.name)] ||
      [...exerciseCatalog.values()].find((item) => item.name === value.name)?.id ||
      value.name ||
      '',
  )
}

function routineIdFromName(name: unknown): string | undefined {
  const match = String(name ?? '').match(/(?:Dia|Day)\s+(\d)/i)
  return match ? `day-${match[1]}` : undefined
}

function normalizeExercise(value: UnknownRecord, fallback?: ExerciseLog): ExerciseLog | null {
  const id = exerciseId(value)
  const definition = exerciseCatalog.get(id)
  if (!definition && !fallback) return null
  const source = definition || fallback!
  const sets = asArray(value.sets).map(normalizeSet)
  return {
    ...source,
    ...definition,
    id,
    name: definition?.name || source.name,
    notes: String(value.notes ?? ''),
    sets: sets.length ? sets : fallback?.sets.map((set) => ({ ...set })) || [],
  }
}

function normalizeHistory(entries: unknown): WorkoutSession[] {
  return asArray(entries).flatMap((value): WorkoutSession[] => {
    if (!isRecord(value)) return []
    const routineId = String(value.routineId || routineIdFromName(value.routineName) || '')
    const routine = routines.find((item) => item.id === routineId)
    if (!routine) return []
    const exercises = asArray(value.exercises).flatMap((exercise) =>
      isRecord(exercise) ? ([normalizeExercise(exercise)].filter(Boolean) as ExerciseLog[]) : [],
    )
    const completed = exercises.flatMap((exercise) => exercise.sets).filter(isCompletedSet)
    return [
      {
        id: String(value.id || `legacy-${value.date || 'session'}`),
        date: String(value.date || ''),
        routineId,
        routineName: routine.name,
        focus: routine.focus,
        completedSets: completed.length,
        totalSets: exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0),
        totalVolume: completed.reduce(
          (sum, set) => sum + (Number(set.weight) || 0) * (Number(set.reps) || 0),
          0,
        ),
        exercises,
      },
    ]
  })
}

export function migrateStoredState(value: unknown, today: string): WorkoutState {
  const defaults = createDefaultWorkoutState(today)
  if (!isRecord(value)) return defaults
  const selectedRoutineId = routines.some((routine) => routine.id === value.selectedRoutineId)
    ? String(value.selectedRoutineId)
    : defaults.selectedRoutineId
  const savedWorkout = isRecord(value.workout) ? value.workout : {}
  const workout = Object.fromEntries(
    routines.map((routine) => {
      const savedRoutine = isRecord(savedWorkout[routine.id]) ? savedWorkout[routine.id] : {}
      const savedExercises = asArray(savedRoutine.exercises)
      const exercises = defaults.workout[routine.id].exercises.map((fallback) => {
        const saved = savedExercises.find((item) => isRecord(item) && exerciseId(item) === fallback.id)
        return saved && isRecord(saved) ? normalizeExercise(saved, fallback) || fallback : fallback
      })
      return [routine.id, { routineId: routine.id, exercises }]
    }),
  )
  const expanded = Object.prototype.hasOwnProperty.call(value, 'expandedExerciseIndex')
    ? value.expandedExerciseIndex
    : (value.activeExerciseIndex ?? 0)
  return {
    selectedRoutineId,
    expandedExerciseIndex: expanded === null || Number.isInteger(expanded) ? (expanded as number | null) : 0,
    sessionDate: typeof value.sessionDate === 'string' ? value.sessionDate : today,
    workout,
    history: normalizeHistory(value.history),
  }
}
