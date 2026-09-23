<script setup lang="ts">
import { Check, Trash2 } from '@lucide/vue'
import type { ExerciseUnit, WorkoutSet } from '../../domain/models'
import { formatPreviousSet } from '@/shared/utilities/formatters'

defineProps<{
  set: WorkoutSet
  previous: WorkoutSet | null
  unit?: ExerciseUnit
  setNumber: number
  canRemove: boolean
  exerciseName: string
}>()
defineEmits<{ weight: [value: string]; reps: [value: string]; toggle: []; remove: [] }>()
const inputValue = (event: Event) => (event.target as HTMLInputElement).value
</script>

<template>
  <div class="set-row" :class="{ checked: set.done }" role="row">
    <strong>{{ setNumber }}</strong>
    <span class="previous-cell">{{ formatPreviousSet(previous, unit) }}</span>
    <input
      :value="set.weight"
      type="number"
      inputmode="decimal"
      min="0"
      placeholder="kg"
      :aria-label="`${exerciseName}, set ${setNumber}, weight`"
      @input="$emit('weight', inputValue($event))"
    />
    <input
      :value="set.reps"
      type="number"
      inputmode="numeric"
      min="0"
      :placeholder="unit === 'sec' ? 'sec' : 'reps'"
      :aria-label="`${exerciseName}, set ${setNumber}, ${unit === 'sec' ? 'seconds' : 'repetitions'}`"
      @input="$emit('reps', inputValue($event))"
    />
    <div class="set-actions">
      <button
        type="button"
        class="icon-button check-button"
        :class="{ checked: set.done }"
        :title="set.done ? 'Mark set incomplete' : 'Mark set complete'"
        @click="$emit('toggle')"
      >
        <Check :size="18" aria-hidden="true" />
      </button>
      <button
        v-if="canRemove"
        type="button"
        class="icon-button remove-button"
        title="Remove added set"
        @click="$emit('remove')"
      >
        <Trash2 :size="16" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.set-row {
  display: grid;
  grid-template-columns: 46px minmax(110px, 1fr) minmax(70px, 0.7fr) minmax(70px, 0.7fr) 76px;
  gap: 8px;
  align-items: center;
  min-height: 46px;
  padding: 5px 6px;
  border-bottom: 1px solid rgb(16 24 32 / 6%);
}
.set-row.checked {
  background: #e8faee;
}
.set-row > strong {
  text-align: center;
}
input {
  min-width: 0;
  min-height: 36px;
  width: 100%;
  padding: 0 8px;
  border: 1px solid transparent;
  border-radius: var(--radius);
  background: rgb(16 24 32 / 4.5%);
  color: var(--ink);
  text-align: center;
  font-weight: 750;
}
.checked input {
  background: rgb(47 125 109 / 6%);
}
.previous-cell {
  min-width: 0;
  overflow: hidden;
  color: rgb(82 99 94 / 58%);
  font-size: 0.82rem;
  font-weight: 750;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.set-actions {
  display: flex;
  justify-content: flex-end;
  gap: 4px;
}
.icon-button {
  display: inline-grid;
  place-items: center;
  width: 34px;
  height: 34px;
  padding: 0;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  color: var(--ink);
}
.check-button {
  border-color: transparent;
  background: transparent;
}
.check-button.checked {
  border-color: #35c983;
  background: #35c983;
  color: #fff;
}
.remove-button {
  color: var(--danger);
}
@media (max-width: 520px) {
  .set-row {
    grid-template-columns: 30px minmax(68px, 1fr) minmax(46px, 0.62fr) minmax(46px, 0.62fr) 70px;
    gap: 4px;
    min-height: 42px;
    padding: 4px 0;
  }
  input {
    min-height: 34px;
    padding: 0 4px;
    font-size: 0.82rem;
  }
  .previous-cell {
    font-size: 0.68rem;
  }
  .set-actions {
    gap: 2px;
  }
  .icon-button {
    width: 32px;
    height: 32px;
  }
}
</style>
