import { computed, reactive, readonly, ref, watch } from 'vue'
import type { IdGenerator, WorkoutRepository } from '../application/ports'
import {
  addSet,
  createSession,
  findPreviousExercise,
  nextExerciseAfterCompletion,
  removeSet,
  resetRoutine,
  selectRoutine,
  toggleExercise,
  toggleSet,
} from '../application/workoutCommands'
import { routines } from '../domain/catalog'
import type { ExerciseLog, WorkoutSet } from '../domain/models'
import {
  completedSetCount,
  exerciseVolume,
  isCompletedSet,
  isExerciseComplete,
  totalSetCount,
  workoutProgress,
  workoutVolume,
} from '../domain/workoutRules'

export function createWorkoutController(repository: WorkoutRepository, idGenerator: IdGenerator) {
  const state = reactive(repository.load())
  const saveNoticeVisible = ref(false)
  let toastTimer: ReturnType<typeof setTimeout> | undefined

  const currentRoutine = computed(
    () => routines.find((routine) => routine.id === state.selectedRoutineId) || routines[0],
  )
  const currentLog = computed(() => state.workout[state.selectedRoutineId])
  const completedSets = computed(() =>
    currentLog.value.exercises.reduce((sum, exercise) => sum + completedSetCount(exercise), 0),
  )
  const totalSets = computed(() => totalSetCount(currentLog.value.exercises))
  const progress = computed(() => workoutProgress(currentLog.value.exercises))
  const totalVolume = computed(() => workoutVolume(currentLog.value))
  const completedExercises = computed(() => currentLog.value.exercises.filter(isExerciseComplete).length)
  const latestSession = computed(() => state.history[0] || null)

  watch(state, () => repository.save(state), { deep: true })

  const commands = {
    selectRoutine: (routineId: string) => selectRoutine(state, routineId),
    toggleExercise: (index: number) => toggleExercise(state, index),
    setSessionDate: (date: string) => {
      state.sessionDate = date
    },
    updateSet: (
      exercise: ExerciseLog,
      setIndex: number,
      patch: Partial<Pick<WorkoutSet, 'weight' | 'reps'>>,
    ) => Object.assign(exercise.sets[setIndex], patch),
    updateNotes: (exercise: ExerciseLog, notes: string) => {
      exercise.notes = notes
    },
    addSet: (exercise: ExerciseLog) => addSet(exercise),
    removeSet: (exercise: ExerciseLog, index: number) => removeSet(exercise, index),
    toggleSet: (exercise: ExerciseLog, setIndex: number, exerciseIndex: number) => {
      toggleSet(exercise, setIndex)
      const next = nextExerciseAfterCompletion(state, exerciseIndex)
      if (next !== null) state.expandedExerciseIndex = next
    },
    reset: () => resetRoutine(state, currentRoutine.value),
    save: () => {
      state.history.unshift(createSession(state, currentRoutine.value, idGenerator.generate()))
      state.history = state.history.slice(0, 12)
      saveNoticeVisible.value = true
      clearTimeout(toastTimer)
      toastTimer = setTimeout(() => {
        saveNoticeVisible.value = false
      }, 2400)
    },
    clearHistory: () => {
      state.history = []
    },
  }

  return {
    state: readonly(state),
    currentRoutine,
    currentLog,
    completedSets,
    totalSets,
    progress,
    totalVolume,
    completedExercises,
    latestSession,
    saveNoticeVisible: readonly(saveNoticeVisible),
    commands,
    rules: { completedSetCount, exerciseVolume, isCompletedSet, isExerciseComplete },
    previousReference: (exercise: ExerciseLog) => findPreviousExercise(state, exercise),
    previousSet: (exercise: ExerciseLog, index: number) => {
      const set = findPreviousExercise(state, exercise)?.exercise.sets[index]
      return set && isCompletedSet(set) ? set : null
    },
  }
}

export type WorkoutController = ReturnType<typeof createWorkoutController>
