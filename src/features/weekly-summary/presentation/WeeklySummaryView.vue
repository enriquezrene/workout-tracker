<script setup lang="ts">
import { computed } from 'vue'
import { BarChart3, ChevronLeft } from '@lucide/vue'
import type { WorkoutSession } from '@/features/workout/domain/models'
import { buildWeeklySummary, getWeekRange } from '../domain/weeklySummary'
import { formatNumber, formatWeeklySet } from '@/shared/utilities/formatters'

const props = defineProps<{ history: readonly WorkoutSession[]; sessionDate: string }>()
defineEmits<{ back: [] }>()
const weekRange = computed(() => getWeekRange(props.sessionDate))
const summary = computed(() => buildWeeklySummary([...props.history], weekRange.value))
</script>

<template>
  <section class="weekly-panel" aria-label="Weekly summary">
    <div class="weekly-header">
      <div>
        <p class="eyebrow">Week</p>
        <h2>{{ weekRange.start }} / {{ weekRange.end }}</h2>
      </div>
      <button type="button" class="secondary-button" @click="$emit('back')">
        <ChevronLeft :size="18" aria-hidden="true" />Track workout
      </button>
    </div>
    <div class="weekly-metrics" aria-label="Weekly metrics">
      <div>
        <span>Sessions</span><strong>{{ summary.totals.sessions }}</strong>
      </div>
      <div>
        <span>Sets</span><strong>{{ summary.totals.sets }}</strong>
      </div>
      <div>
        <span>Volume</span><strong>{{ formatNumber(summary.totals.volume) }} kg</strong>
      </div>
    </div>
    <div v-if="summary.exercises.length" class="weekly-list">
      <article v-for="exercise in summary.exercises" :key="exercise.id" class="weekly-exercise">
        <header>
          <div>
            <h3>{{ exercise.name }}</h3>
            <p>{{ exercise.totalSets }} sets · {{ exercise.totalReps }} {{ exercise.unit }}</p>
          </div>
          <strong>{{ exercise.maxWeight ? `${exercise.maxWeight} kg max` : 'Bodyweight' }}</strong>
        </header>
        <div class="weekly-log-list">
          <div
            v-for="log in exercise.logs"
            :key="`${exercise.id}-${log.date}-${log.routineName}`"
            class="weekly-log"
          >
            <div class="weekly-log-meta">
              <span>{{ log.date }}</span
              ><strong>{{ log.routineName }}</strong>
            </div>
            <div class="weekly-set-list">
              <span v-for="set in log.sets" :key="set.number"
                >S{{ set.number }}: {{ formatWeeklySet(set, exercise.unit) }}</span
              >
            </div>
          </div>
        </div>
      </article>
    </div>
    <div v-else class="weekly-empty">
      <BarChart3 :size="34" aria-hidden="true" />
      <h3>No workouts saved this week</h3>
      <p>Saved exercises, weights, and repetitions will appear here.</p>
    </div>
  </section>
</template>

<style scoped>
.weekly-panel {
  display: grid;
  gap: 18px;
  padding: 20px;
}
.weekly-header,
.weekly-exercise header,
.weekly-log-meta {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.weekly-header h2 {
  margin: 0;
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
.weekly-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}
.weekly-metrics div {
  min-width: 0;
  padding: 14px;
  border-radius: var(--radius);
  background: var(--dark);
  color: #fff;
}
.weekly-metrics span {
  display: block;
  color: #aac6bd;
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
}
.weekly-metrics strong {
  display: block;
  margin-top: 5px;
}
.weekly-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.weekly-exercise {
  display: grid;
  gap: 12px;
  min-width: 0;
  padding: 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface-soft);
}
.weekly-exercise h3 {
  margin-bottom: 4px;
}
.weekly-exercise p {
  margin: 0;
  color: var(--muted);
  font-size: 0.84rem;
}
.weekly-exercise header > strong {
  flex: 0 0 auto;
  padding: 6px 9px;
  border-radius: var(--radius);
  background: var(--green-soft);
  color: var(--green);
  font-size: 0.8rem;
}
.weekly-log-list,
.weekly-log {
  display: grid;
  gap: 9px;
}
.weekly-log {
  padding-top: 9px;
  border-top: 1px solid var(--border);
}
.weekly-log-meta {
  color: var(--muted);
  font-size: 0.8rem;
}
.weekly-log-meta strong {
  color: var(--ink);
}
.weekly-set-list {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}
.weekly-set-list span {
  padding: 6px 8px;
  border: 1px solid rgb(47 125 109 / 18%);
  border-radius: var(--radius);
  background: var(--green-soft);
  font-size: 0.8rem;
  font-weight: 750;
}
.weekly-empty {
  display: grid;
  place-items: center;
  gap: 9px;
  min-height: 250px;
  padding: 30px;
  border: 1px dashed rgb(47 125 109 / 38%);
  border-radius: var(--radius);
  background: rgb(228 241 237 / 54%);
  color: var(--muted);
  text-align: center;
}
.weekly-empty h3,
.weekly-empty p {
  margin: 0;
}
@media (max-width: 720px) {
  .weekly-panel {
    padding: 14px;
  }
  .weekly-header {
    align-items: stretch;
    flex-direction: column;
  }
  .weekly-list {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 520px) {
  .weekly-panel {
    padding: 11px;
  }
  .weekly-metrics {
    grid-template-columns: 1fr;
  }
  .weekly-exercise header,
  .weekly-log-meta {
    flex-direction: column;
  }
  .weekly-exercise header > strong {
    width: fit-content;
  }
}
</style>
