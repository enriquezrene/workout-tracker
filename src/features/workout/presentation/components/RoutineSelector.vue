<script setup lang="ts">
import type { RoutineDefinition } from '../../domain/models'
import { formatNumber } from '@/shared/utilities/formatters'

defineProps<{
  routines: RoutineDefinition[]
  selectedRoutineId: string
  completedSets: number
  totalSets: number
  volume: number
  progress: number
}>()

defineEmits<{ select: [routineId: string] }>()
</script>

<template>
  <section class="routine-panel" aria-label="Workout days">
    <div class="routine-list">
      <button
        v-for="routine in routines"
        :key="routine.id"
        class="routine-button"
        :class="{ active: routine.id === selectedRoutineId }"
        type="button"
        @click="$emit('select', routine.id)"
      >
        <span>{{ routine.name }}</span>
        <strong>{{ routine.focus }}</strong>
      </button>
    </div>
    <div class="summary-strip">
      <div>
        <span>Sets</span><strong>{{ completedSets }}/{{ totalSets }}</strong>
      </div>
      <div>
        <span>Volume</span><strong>{{ formatNumber(volume) }} kg</strong>
      </div>
      <div>
        <span>Progress</span><strong>{{ progress }}%</strong>
      </div>
    </div>
  </section>
</template>

<style scoped>
.routine-panel {
  display: grid;
  gap: 16px;
  padding: 20px;
}
.routine-list {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 9px;
}
.routine-button {
  display: grid;
  gap: 4px;
  min-height: 72px;
  padding: 13px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface-soft);
  color: var(--ink);
  text-align: left;
}
.routine-button span {
  font-size: 0.86rem;
}
.routine-button strong {
  color: var(--green);
  font-size: 1rem;
}
.routine-button.active {
  border-color: var(--green);
  background: var(--green-soft);
  box-shadow: inset 0 0 0 1px rgb(47 125 109 / 12%);
}
.summary-strip {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.summary-strip div {
  min-width: 0;
  padding: 10px 12px;
  border-radius: var(--radius);
  background: var(--dark);
  color: #fff;
}
.summary-strip span {
  display: block;
  color: #aac6bd;
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
}
.summary-strip strong {
  display: block;
  margin-top: 3px;
  overflow-wrap: anywhere;
}
@media (max-width: 720px) {
  .routine-panel {
    padding: 14px;
  }
  .routine-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 520px) {
  .routine-panel {
    padding: 11px;
  }
  .routine-list {
    grid-template-columns: 1fr;
  }
  .summary-strip div {
    padding: 9px 7px;
  }
  .summary-strip strong {
    font-size: 0.84rem;
  }
}
</style>
