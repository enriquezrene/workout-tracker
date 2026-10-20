import { computed, reactive, readonly, ref } from 'vue'
import type { DateProvider, IdGenerator, WorkoutHistoryRepository } from '../application/ports'
import {
  addSet,
  createSession,
  createSessionWithToggledSet,
  findPreviousExercise,
  nextExerciseAfterCompletion,
  removeSet,
  selectRoutine,
  toggleExercise,
} from '../application/workoutCommands'
import { restoreWorkoutDate } from '../application/restoreWorkoutDate'
import { routines } from '../domain/catalog'
import { createDefaultWorkoutState } from '../domain/workoutFactory'
import type { ExerciseLog, RoutineLog, WorkoutSession, WorkoutSet } from '../domain/models'
import {
  canCompleteSet,
  completedSetCount,
  exerciseVolume,
  isCompletedSet,
  isExerciseComplete,
  totalSetCount,
  workoutProgress,
  workoutVolume,
} from '../domain/workoutRules'

export function createWorkoutController(
  historyRepository: WorkoutHistoryRepository,
  dateProvider: DateProvider,
  idGenerator: IdGenerator,
) {
  const state = reactive(createDefaultWorkoutState(dateProvider.today()))
  const loading = ref(true)
  const saving = ref(false)
  const loaded = ref(false)
  const errorMessage = ref('')
  const canRetry = ref(false)
  const saveNoticeVisible = ref(false)
  const saveNoticeMessage = ref('Set saved')
  const drafts = new Map<string, Record<string, RoutineLog>>()
  const sessionIds = new Map<string, string>()
  let toastTimer: ReturnType<typeof setTimeout> | undefined
  let retryOperation: (() => Promise<void>) | undefined
  let disposed = false

  const isBusy = computed(() => loading.value || saving.value)
  const canEdit = computed(() => loaded.value && !isBusy.value)
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

  function clearError() {
    errorMessage.value = ''
    retryOperation = undefined
    canRetry.value = false
  }

  function sessionId() {
    const key = `${state.sessionDate}:${state.selectedRoutineId}`
    const existing =
      sessionIds.get(key) ||
      state.history.find(
        (session) => session.date === state.sessionDate && session.routineId === state.selectedRoutineId,
      )?.id
    const id = existing || idGenerator.generate()
    sessionIds.set(key, id)
    return id
  }

  async function persist(session: WorkoutSession, apply: () => void, retry: () => Promise<void>) {
    saving.value = true
    saveNoticeVisible.value = false
    clearTimeout(toastTimer)
    clearError()
    try {
      await historyRepository.save(session)
      if (disposed) return
      apply()
      state.history = [session, ...state.history.filter((entry) => entry.id !== session.id)].sort((a, b) =>
        b.date.localeCompare(a.date),
      )
      saveNoticeMessage.value = 'Changes saved'
      saveNoticeVisible.value = true
      clearTimeout(toastTimer)
      toastTimer = setTimeout(() => {
        saveNoticeVisible.value = false
      }, 2400)
    } catch {
      if (disposed) return
      errorMessage.value = 'Changes were not saved. Check your connection and try again.'
      retryOperation = retry
      canRetry.value = true
    } finally {
      saving.value = false
    }
  }

  async function saveChanges() {
    if (!canEdit.value || disposed) return
    const key = `${state.sessionDate}:${state.selectedRoutineId}`
    if (
      !sessionIds.has(key) &&
      !state.history.some(
        (session) => session.date === state.sessionDate && session.routineId === state.selectedRoutineId,
      )
    )
      return
    await persist(createSession(state, currentRoutine.value, sessionId()), () => undefined, saveChanges)
  }

  async function toggleSet(exercise: ExerciseLog, setIndex: number, exerciseIndex: number) {
    if (!canEdit.value || disposed || !currentLog.value.exercises.includes(exercise)) return
    const set = exercise.sets[setIndex]
    if (!set) return
    const done = !set.done
    if (done && !canCompleteSet(set, exercise.unit)) {
      clearError()
      errorMessage.value =
        'Enter valid repetitions and a non-negative weight before completing the set. Weight may be empty for bodyweight exercises.'
      retryOperation = undefined
      return
    }
    const session = createSessionWithToggledSet(
      state,
      currentRoutine.value,
      sessionId(),
      exercise.id,
      setIndex,
    )
    await persist(
      session,
      () => {
        set.done = done
        if (done) {
          const next = nextExerciseAfterCompletion(state, exerciseIndex)
          if (next !== null) state.expandedExerciseIndex = next
        }
      },
      () => toggleSet(exercise, setIndex, exerciseIndex),
    )
  }

  async function loadHistory() {
    if (disposed || saving.value) return
    loading.value = true
    clearError()
    try {
      const sessions = await historyRepository.list()
      if (disposed) return
      state.history = [...sessions].sort((a, b) => b.date.localeCompare(a.date))
      state.workout = restoreWorkoutDate(state.history, state.sessionDate)
      drafts.clear()
      sessionIds.clear()
      loaded.value = true
    } catch {
      if (disposed) return
      loaded.value = false
      errorMessage.value = 'Workouts could not be loaded. Check your connection and try again.'
      retryOperation = loadHistory
      canRetry.value = true
    } finally {
      loading.value = false
    }
  }

  const commands = {
    selectRoutine: (routineId: string) => {
      if (!canEdit.value) return
      clearError()
      selectRoutine(state, routineId)
    },
    toggleExercise: (index: number) => toggleExercise(state, index),
    setSessionDate: (date: string) => {
      if (!canEdit.value || !/^\d{4}-\d{2}-\d{2}$/.test(date) || state.sessionDate === date) return
      clearError()
      drafts.set(state.sessionDate, state.workout)
      state.sessionDate = date
      state.workout = drafts.get(date) || restoreWorkoutDate(state.history, date)
      state.expandedExerciseIndex = 0
    },
    updateSet: (
      exercise: ExerciseLog,
      setIndex: number,
      patch: Partial<Pick<WorkoutSet, 'weight' | 'reps'>>,
    ) => {
      if (!canEdit.value) return
      const set = exercise.sets[setIndex]
      if (!set) return
      if (Object.entries(patch).some(([key, value]) => set[key as 'weight' | 'reps'] !== value))
        set.done = false
      Object.assign(set, patch)
    },
    updateNotes: async (exercise: ExerciseLog, notes: string) => {
      if (!canEdit.value || exercise.notes === notes) return
      exercise.notes = notes
      await saveChanges()
    },
    addSet: (exercise: ExerciseLog) => {
      if (canEdit.value) addSet(exercise)
    },
    removeSet: async (exercise: ExerciseLog, index: number) => {
      if (!canEdit.value || index < exercise.defaultSets) return
      removeSet(exercise, index)
      await saveChanges()
    },
    toggleSet,
    retry: async () => {
      if (!isBusy.value && retryOperation) await retryOperation()
    },
  }

  const ready = loadHistory()
  return {
    state: readonly(state),
    currentRoutine,
    currentLog,
    completedSets,
    totalSets,
    progress,
    totalVolume,
    completedExercises,
    ready,
    isBusy,
    canEdit,
    loading: readonly(loading),
    saving: readonly(saving),
    errorMessage: readonly(errorMessage),
    canRetry: readonly(canRetry),
    saveNoticeVisible: readonly(saveNoticeVisible),
    saveNoticeMessage: readonly(saveNoticeMessage),
    commands,
    dispose: () => {
      disposed = true
      clearTimeout(toastTimer)
    },
    rules: { completedSetCount, exerciseVolume, isCompletedSet, isExerciseComplete },
    previousReference: (exercise: ExerciseLog) => findPreviousExercise(state, exercise),
    previousSet: (exercise: ExerciseLog, index: number) => {
      const set = findPreviousExercise(state, exercise)?.exercise.sets[index]
      return set && isCompletedSet(set) ? set : null
    },
  }
}

export type WorkoutController = ReturnType<typeof createWorkoutController>
