<script setup lang="ts">
import { Check } from '@lucide/vue'
defineProps<{ visible: boolean }>()
</script>
<template>
  <Transition name="toast"
    ><div v-if="visible" class="save-toast" role="status">
      <Check :size="18" aria-hidden="true" />Workout saved
    </div></Transition
  >
</template>
<style scoped>
.save-toast {
  position: fixed;
  right: 22px;
  bottom: 22px;
  z-index: 30;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 0 15px;
  border-radius: var(--radius);
  background: var(--dark);
  color: #fff;
  box-shadow: 0 14px 34px rgb(16 24 32 / 24%);
  font-weight: 800;
}
.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 160ms ease,
    transform 160ms ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
@media (max-width: 720px) {
  .save-toast {
    right: 12px;
    bottom: 82px;
    left: 12px;
    justify-content: center;
  }
}
</style>
