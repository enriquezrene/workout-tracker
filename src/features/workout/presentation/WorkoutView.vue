<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import type { WorkoutController } from './useWorkoutController'
import { routines } from '../domain/catalog'
import RoutineSelector from './components/RoutineSelector.vue'
import ExerciseAccordion from './components/ExerciseAccordion.vue'
import ProgressHistory from './components/ProgressHistory.vue'

const props = defineProps<{ controller: WorkoutController }>()
const exerciseSection = ref<InstanceType<typeof ExerciseAccordion> | null>(null)
const state = computed(() => props.controller.state)
const currentRoutine = computed(() => props.controller.currentRoutine.value)
const currentLog = computed(() => props.controller.currentLog.value)
const completedSets = computed(() => props.controller.completedSets.value)
const totalSets = computed(() => props.controller.totalSets.value)
const progress = computed(() => props.controller.progress.value)
const totalVolume = computed(() => props.controller.totalVolume.value)
const completedExercises = computed(() => props.controller.completedExercises.value)
const commands = computed(() => props.controller.commands)
const rules = computed(() => props.controller.rules)

async function selectDay(routineId: string) {
  commands.value.selectRoutine(routineId)
  await nextTick()
  document.getElementById('exercise-heading')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

watch(
  () => state.value.expandedExerciseIndex,
  async (index) => {
    if (index === null) return
    await nextTick()
    const exercise = currentLog.value.exercises[index]
    document.getElementById(`exercise-${exercise.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  },
)
</script>

<template>
  <section class="dashboard-grid">
    <p v-if="controller.loading.value" role="status">Loading workouts...</p>
    <p v-if="controller.saving.value" role="status">Saving changes...</p>
    <div v-if="controller.errorMessage.value" class="workout-error" role="alert">
      <span>{{ controller.errorMessage.value }}</span>
      <button
        v-if="controller.canRetry.value"
        type="button"
        :disabled="controller.isBusy.value"
        @click="commands.retry"
      >
        Retry
      </button>
    </div>
    <RoutineSelector
      :routines="routines"
      :selected-routine-id="state.selectedRoutineId"
      :completed-sets="completedSets"
      :total-sets="totalSets"
      :volume="totalVolume"
      :progress="progress"
      :disabled="!controller.canEdit.value"
      @select="selectDay"
    />
    <ExerciseAccordion
      ref="exerciseSection"
      :routine="currentRoutine"
      :exercises="currentLog.exercises"
      :expanded-index="state.expandedExerciseIndex"
      :completed-set-count="rules.completedSetCount"
      :is-exercise-complete="rules.isExerciseComplete"
      :exercise-volume="rules.exerciseVolume"
      :previous-date="(exercise) => controller.previousReference(exercise)?.date || null"
      :previous-set="controller.previousSet"
      :disabled="!controller.canEdit.value"
      @toggle-exercise="commands.toggleExercise"
      @update-set="(exercise, index, field, value) => commands.updateSet(exercise, index, { [field]: value })"
      @toggle-set="commands.toggleSet"
      @remove-set="commands.removeSet"
      @add-set="commands.addSet"
      @update-notes="commands.updateNotes"
    />
    <ProgressHistory
      :progress="progress"
      :completed-exercises="completedExercises"
      :exercise-count="currentLog.exercises.length"
      :completed-sets="completedSets"
      :total-sets="totalSets"
      :history="state.history"
    />
  </section>
</template>

<style scoped>
.dashboard-grid {
  display: grid;
  gap: 18px;
}
.workout-error {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--danger);
  border-radius: var(--radius);
  background: var(--surface);
  color: var(--danger);
}
.workout-error button {
  min-height: 44px;
  padding: 0 14px;
  border: 1px solid currentColor;
  border-radius: var(--radius);
  background: transparent;
  color: inherit;
}
</style>
