<script setup lang="ts">
import { Activity, History, Trash2 } from '@lucide/vue'
import type { WorkoutSession } from '../../domain/models'
import { formatNumber } from '@/shared/utilities/formatters'

defineProps<{
  progress: number
  completedExercises: number
  exerciseCount: number
  completedSets: number
  totalSets: number
  history: readonly WorkoutSession[]
}>()
defineEmits<{ clearHistory: [] }>()
</script>

<template>
  <section class="side-panel" aria-label="Progress and history">
    <div class="progress-card">
      <div class="ring" :style="{ '--progress': progress + '%' }">
        <Activity :size="32" aria-hidden="true" />
      </div>
      <div>
        <p class="eyebrow">Today</p>
        <h3>{{ completedExercises }}/{{ exerciseCount }} exercises</h3>
        <p>{{ completedSets }}/{{ totalSets }} sets complete</p>
      </div>
    </div>
    <div class="history-panel">
      <div class="panel-title">
        <History :size="18" aria-hidden="true" />
        <h3>History</h3>
      </div>
      <div v-if="history[0]" class="history-item featured">
        <span>{{ history[0].date }} · {{ history[0].routineName }}</span
        ><strong>{{ history[0].completedSets }}/{{ history[0].totalSets }} sets</strong>
      </div>
      <div v-for="entry in history.slice(1, 5)" :key="entry.id" class="history-item">
        <span>{{ entry.date }} · {{ entry.routineName }}</span
        ><strong>{{ formatNumber(entry.totalVolume) }} kg</strong>
      </div>
      <p v-if="!history.length" class="empty-state">No saved workouts yet.</p>
      <button v-if="history.length" type="button" class="clear-history" @click="$emit('clearHistory')">
        <Trash2 :size="16" aria-hidden="true" />Clear history
      </button>
    </div>
  </section>
</template>

<style scoped>
.side-panel {
  display: grid;
  grid-template-columns: minmax(260px, 0.8fr) minmax(0, 1.2fr);
  gap: 14px;
  padding: 20px;
}
.progress-card {
  display: grid;
  grid-template-columns: 78px 1fr;
  gap: 14px;
  align-items: center;
  padding: 14px;
  border-radius: var(--radius);
  background: var(--dark);
  color: #fff;
}
.progress-card p {
  margin-bottom: 0;
  color: #aac6bd;
}
.progress-card h3 {
  margin-bottom: 3px;
}
.ring {
  display: grid;
  place-items: center;
  width: 78px;
  height: 78px;
  border-radius: 50%;
  color: #fff;
  background:
    radial-gradient(circle at center, var(--dark) 56%, transparent 57%),
    conic-gradient(#f2b84b var(--progress), rgb(255 255 255 / 16%) 0);
}
.history-panel {
  display: grid;
  gap: 8px;
}
.panel-title {
  display: flex;
  align-items: center;
  gap: 9px;
  color: var(--green);
}
.panel-title h3 {
  margin: 0;
}
.history-item {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  padding: 11px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
}
.history-item span,
.empty-state {
  color: var(--muted);
  font-size: 0.84rem;
}
.history-item.featured {
  border-color: rgb(47 125 109 / 34%);
  background: var(--green-soft);
}
.clear-history {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 38px;
  border: 0;
  background: transparent;
  color: var(--danger);
  font-weight: 800;
}
@media (max-width: 720px) {
  .side-panel {
    grid-template-columns: 1fr;
    padding: 14px;
  }
}
@media (max-width: 520px) {
  .side-panel {
    padding: 11px;
  }
}
</style>
