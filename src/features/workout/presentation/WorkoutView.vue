<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import type { WorkoutController } from './useWorkoutController'
import { routines } from '../domain/catalog'
import RoutineSelector from './components/RoutineSelector.vue'
import ExerciseAccordion from './components/ExerciseAccordion.vue'
import ProgressHistory from './components/ProgressHistory.vue'
import WorkoutActions from './components/WorkoutActions.vue'

const props = defineProps<{ controller: WorkoutController }>()
const exerciseSection = ref<InstanceType<typeof ExerciseAccordion> | null>(null)
const {
  state,
  currentRoutine,
  currentLog,
  completedSets,
  totalSets,
  progress,
  totalVolume,
  completedExercises,
  commands,
  rules,
} = props.controller

async function selectDay(routineId: string) {
  commands.selectRoutine(routineId)
  await nextTick()
  document.getElementById('exercise-heading')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

watch(
  () => state.expandedExerciseIndex,
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
    <RoutineSelector
      :routines="routines"
      :selected-routine-id="state.selectedRoutineId"
      :completed-sets="completedSets"
      :total-sets="totalSets"
      :volume="totalVolume"
      :progress="progress"
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
      @clear-history="commands.clearHistory"
    />
    <WorkoutActions @reset="commands.reset" @save="commands.save" />
  </section>
</template>

<style scoped>
.dashboard-grid {
  display: grid;
  gap: 18px;
}
</style>
