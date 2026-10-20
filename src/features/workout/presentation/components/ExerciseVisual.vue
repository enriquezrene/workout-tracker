<script setup lang="ts">
import { computed } from 'vue'
import { exerciseSheetSize, exerciseVisuals } from '../exerciseVisuals'

const props = defineProps<{ exerciseId: string }>()

const visual = computed(() => exerciseVisuals[props.exerciseId])
const viewBox = computed(() => {
  const crop = visual.value?.crop
  return crop ? `${crop.x} ${crop.y} ${crop.width} ${crop.height}` : undefined
})
</script>

<template>
  <svg
    v-if="visual"
    class="exercise-visual"
    role="img"
    :aria-label="visual.alt"
    :viewBox="viewBox"
    :style="{ aspectRatio: `${visual.crop.width} / ${visual.crop.height}` }"
  >
    <image :href="visual.source" :width="exerciseSheetSize.width" :height="exerciseSheetSize.height" />
  </svg>
</template>

<style scoped>
.exercise-visual {
  display: block;
  width: min(100%, 320px);
  justify-self: center;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background-color: #f7f3e9;
}

@media (max-width: 520px) {
  .exercise-visual {
    width: min(100%, 280px);
  }
}
</style>
