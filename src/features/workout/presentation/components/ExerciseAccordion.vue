<script setup lang="ts">
import { Check, ChevronDown, Dumbbell, Plus } from '@lucide/vue'
import SetRow from './SetRow.vue'
import type { ExerciseLog, RoutineDefinition, WorkoutSet } from '../../domain/models'
import { formatNumber } from '@/shared/utilities/formatters'

const props = defineProps<{
  routine: RoutineDefinition
  exercises: readonly ExerciseLog[]
  expandedIndex: number | null
  completedSetCount: (exercise: ExerciseLog) => number
  isExerciseComplete: (exercise: ExerciseLog) => boolean
  exerciseVolume: (exercise: ExerciseLog) => number
  previousDate: (exercise: ExerciseLog) => string | null
  previousSet: (exercise: ExerciseLog, index: number) => WorkoutSet | null
}>()

const emit = defineEmits<{
  toggleExercise: [index: number]
  updateSet: [exercise: ExerciseLog, index: number, field: 'weight' | 'reps', value: string]
  toggleSet: [exercise: ExerciseLog, setIndex: number, exerciseIndex: number]
  removeSet: [exercise: ExerciseLog, index: number]
  addSet: [exercise: ExerciseLog]
  updateNotes: [exercise: ExerciseLog, notes: string]
}>()

const textareaValue = (event: Event) => (event.target as HTMLTextAreaElement).value
</script>

<template>
  <section class="accordion-panel" aria-labelledby="exercise-heading">
    <div class="section-title">
      <Dumbbell :size="20" aria-hidden="true" />
      <div>
        <p class="eyebrow">{{ routine.name }} · {{ routine.focus }}</p>
        <h2 id="exercise-heading">Exercises</h2>
      </div>
    </div>
    <article
      v-for="(exercise, exerciseIndex) in exercises"
      :id="`exercise-${exercise.id}`"
      :key="exercise.id"
      class="accordion-item"
      :class="{ open: expandedIndex === exerciseIndex, complete: props.isExerciseComplete(exercise) }"
    >
      <button
        type="button"
        class="accordion-trigger"
        :aria-expanded="expandedIndex === exerciseIndex"
        :aria-controls="`exercise-panel-${exercise.id}`"
        @click="emit('toggleExercise', exerciseIndex)"
      >
        <span class="accordion-name"
          ><Check v-if="props.isExerciseComplete(exercise)" :size="18" aria-hidden="true" />{{
            exercise.name
          }}</span
        >
        <span class="accordion-status"
          >{{ props.completedSetCount(exercise) }}/{{ exercise.sets.length }} sets</span
        >
        <ChevronDown class="accordion-chevron" :size="20" aria-hidden="true" />
      </button>
      <div
        v-if="expandedIndex === exerciseIndex"
        :id="`exercise-panel-${exercise.id}`"
        class="accordion-content"
        role="region"
        :aria-label="`${exercise.name} workout details`"
      >
        <div class="exercise-meta">
          <div>
            <span>Target</span><strong>{{ exercise.prescription }}</strong
            ><small v-if="exercise.suggested">{{ exercise.suggested }}</small>
          </div>
          <div>
            <span>Previous</span><strong>{{ props.previousDate(exercise) || 'No history' }}</strong>
          </div>
          <div>
            <span>Volume</span><strong>{{ formatNumber(props.exerciseVolume(exercise)) }} kg</strong>
          </div>
        </div>
        <div class="sets-table" role="table" :aria-label="`${exercise.name} sets`">
          <div class="set-head" role="row">
            <span>Set</span><span>Previous</span><span>kg</span
            ><span>{{ exercise.unit === 'sec' ? 'Sec' : 'Reps' }}</span
            ><span><Check :size="16" aria-hidden="true" /></span>
          </div>
          <SetRow
            v-for="(set, setIndex) in exercise.sets"
            :key="setIndex"
            :set="set"
            :previous="props.previousSet(exercise, setIndex)"
            :unit="exercise.unit"
            :set-number="setIndex + 1"
            :can-remove="setIndex >= exercise.defaultSets"
            :exercise-name="exercise.name"
            @weight="emit('updateSet', exercise, setIndex, 'weight', $event)"
            @reps="emit('updateSet', exercise, setIndex, 'reps', $event)"
            @toggle="emit('toggleSet', exercise, setIndex, exerciseIndex)"
            @remove="emit('removeSet', exercise, setIndex)"
          />
        </div>
        <label class="notes-field"
          ><span>Notes</span
          ><textarea
            :value="exercise.notes"
            rows="2"
            placeholder="Add notes for this exercise"
            @input="emit('updateNotes', exercise, textareaValue($event))"
          />
        </label>
        <button type="button" class="secondary-button add-set-button" @click="emit('addSet', exercise)">
          <Plus :size="18" aria-hidden="true" />Add set
        </button>
      </div>
    </article>
  </section>
</template>

<style scoped>
.accordion-panel {
  display: grid;
  gap: 10px;
  padding: 20px;
  scroll-margin-top: 84px;
}
.section-title {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 4px;
  color: var(--green);
}
.section-title .eyebrow {
  margin-bottom: 3px;
}
h2 {
  margin: 0;
  color: var(--ink);
  font-size: 1.45rem;
}
.accordion-item {
  overflow: clip;
  scroll-margin-top: 84px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface-soft);
}
.accordion-item.open {
  border-color: var(--green);
  background: var(--surface);
}
.accordion-item.complete:not(.open) {
  background: #e8faee;
}
.accordion-trigger {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto 24px;
  gap: 12px;
  align-items: center;
  width: 100%;
  min-height: 66px;
  padding: 14px 16px;
  border: 0;
  background: transparent;
  color: var(--ink);
  text-align: left;
}
.accordion-name {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  overflow-wrap: anywhere;
  font-size: 1rem;
  font-weight: 750;
}
.complete .accordion-name {
  color: var(--green);
}
.accordion-status {
  color: var(--muted);
  font-size: 0.84rem;
  font-weight: 800;
  white-space: nowrap;
}
.accordion-chevron {
  transition: transform 160ms ease;
}
.open .accordion-chevron {
  transform: rotate(180deg);
}
.accordion-content {
  display: grid;
  gap: 16px;
  padding: 4px 16px 16px;
  border-top: 1px solid rgb(16 24 32 / 8%);
}
.exercise-meta {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) repeat(2, minmax(120px, 0.8fr));
  gap: 8px;
  padding-top: 14px;
}
.exercise-meta div {
  min-width: 0;
  padding: 10px 12px;
  border-radius: var(--radius);
  background: #eef0e8;
}
.exercise-meta span {
  display: block;
  color: var(--muted);
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
}
.exercise-meta strong,
.exercise-meta small {
  display: block;
  margin-top: 3px;
}
.exercise-meta small {
  color: var(--muted);
}
.sets-table {
  display: grid;
  overflow: hidden;
}
.set-head {
  display: grid;
  grid-template-columns: 46px minmax(110px, 1fr) minmax(70px, 0.7fr) minmax(70px, 0.7fr) 76px;
  gap: 8px;
  align-items: center;
  min-height: 34px;
  padding: 5px 6px;
  color: var(--muted);
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
}
.set-head span:last-child {
  display: flex;
  justify-content: center;
}
.notes-field {
  display: grid;
  gap: 6px;
  color: var(--muted);
  font-size: 0.8rem;
  font-weight: 800;
}
textarea {
  min-height: 70px;
  width: 100%;
  resize: vertical;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  color: var(--ink);
}
.secondary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  padding: 0 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  color: var(--ink);
  font-weight: 800;
}
.add-set-button {
  justify-self: start;
}
@media (max-width: 720px) {
  .accordion-panel {
    padding: 14px;
  }
  .exercise-meta {
    grid-template-columns: 1fr 1fr;
  }
  .exercise-meta div:first-child {
    grid-column: 1 / -1;
  }
}
@media (max-width: 520px) {
  .accordion-panel {
    padding: 11px;
  }
  .accordion-trigger {
    grid-template-columns: minmax(0, 1fr) auto 20px;
    gap: 7px;
    min-height: 62px;
    padding: 12px;
  }
  .accordion-name {
    font-size: 0.92rem;
  }
  .accordion-status {
    font-size: 0.76rem;
  }
  .accordion-content {
    gap: 13px;
    padding: 3px 8px 12px;
  }
  .exercise-meta {
    gap: 6px;
  }
  .exercise-meta div {
    padding: 8px;
  }
  .set-head {
    grid-template-columns: 30px minmax(68px, 1fr) minmax(46px, 0.62fr) minmax(46px, 0.62fr) 70px;
    gap: 4px;
    padding: 4px 0;
    font-size: 0.64rem;
  }
}
</style>
