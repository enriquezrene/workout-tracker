import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import RoutineSelector from '@/features/workout/presentation/components/RoutineSelector.vue'
import { routines } from '@/features/workout/domain/catalog'

describe('RoutineSelector', () => {
  it('shows routine progress and emits the selected day', async () => {
    const wrapper = mount(RoutineSelector, {
      props: {
        routines,
        selectedRoutineId: 'day-1',
        completedSets: 2,
        totalSets: 10,
        volume: 160,
        progress: 20,
      },
    })

    await wrapper.get('button:nth-of-type(2)').trigger('click')

    expect(wrapper.text()).toContain('2/10')
    expect(wrapper.emitted('select')).toEqual([['day-2']])
  })
})
