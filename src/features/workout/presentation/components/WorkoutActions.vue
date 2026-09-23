<script setup lang="ts">
import { RotateCcw, Save } from '@lucide/vue'
defineEmits<{ reset: []; save: [] }>()
</script>

<template>
  <div class="workout-actions" aria-label="Workout actions">
    <button type="button" class="danger-button" @click="$emit('reset')">
      <RotateCcw :size="18" aria-hidden="true" />Reset
    </button>
    <button type="button" class="primary-button" @click="$emit('save')">
      <Save :size="18" aria-hidden="true" />Save workout
    </button>
  </div>
</template>

<style scoped>
.workout-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--panel);
  box-shadow: var(--shadow-soft);
}
button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  padding: 0 16px;
  border-radius: var(--radius);
  font-weight: 800;
}
.primary-button {
  border: 1px solid var(--green);
  background: var(--green);
  color: #fff;
}
.danger-button {
  border: 1px solid rgb(122 64 56 / 24%);
  background: #fff3ef;
  color: var(--danger);
}
@media (max-width: 720px) {
  .workout-actions {
    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 20;
    display: grid;
    grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
    padding: 10px max(12px, env(safe-area-inset-right)) calc(10px + env(safe-area-inset-bottom))
      max(12px, env(safe-area-inset-left));
    border-width: 1px 0 0;
    border-radius: 0;
  }
}
@media (max-width: 520px) {
  .workout-actions {
    gap: 8px;
  }
  button {
    min-width: 0;
    padding: 0 8px;
    font-size: 0.82rem;
  }
}
</style>
