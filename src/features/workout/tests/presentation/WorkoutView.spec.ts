import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h, shallowRef } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import WorkoutView from '@/features/workout/presentation/WorkoutView.vue'
import { createWorkoutController } from '@/features/workout/presentation/useWorkoutController'

describe('WorkoutView controller updates', () => {
  it('uses the current controller for entry, saving, and previous references after replacement', async () => {
    const createController = () =>
      createWorkoutController(
        { list: async () => [], save: vi.fn(async () => undefined) },
        { today: () => '2026-09-14' },
        { generate: () => crypto.randomUUID() },
      )
    const initialController = createController()
    const currentController = createController()
    await Promise.all([initialController.ready, currentController.ready])
    const activeController = shallowRef(initialController)
    const wrapper = mount(
      defineComponent({
        setup: () => () => h(WorkoutView, { controller: activeController.value }),
      }),
    )
    activeController.value = currentController
    await wrapper.vm.$nextTick()
    try {
      await wrapper.get('input[aria-label="Barbell Squat, set 1, weight"]').setValue('40')
      await wrapper.get('input[aria-label="Barbell Squat, set 1, repetitions"]').setValue('8')
      await wrapper.get('button[title="Mark set complete"]').trigger('click')
      await flushPromises()
      expect(currentController.state.history).toHaveLength(1)
      expect(initialController.state.history).toHaveLength(0)
      currentController.commands.setSessionDate('2026-09-15')
      await wrapper.vm.$nextTick()
      expect(wrapper.get('#exercise-barbell-squat .exercise-meta').text()).toContain('2026-09-14')
      expect(wrapper.get('#exercise-barbell-squat .previous-cell').text()).toBe('40 x 8')
    } finally {
      wrapper.unmount()
      initialController.dispose()
      currentController.dispose()
    }
  })
})
