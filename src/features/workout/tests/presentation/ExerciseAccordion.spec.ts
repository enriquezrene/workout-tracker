import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import ExerciseAccordion from '@/features/workout/presentation/components/ExerciseAccordion.vue'
import { createRoutineLog } from '@/features/workout/domain/workoutFactory'
import { routines } from '@/features/workout/domain/catalog'
import { completedSetCount, exerciseVolume, isExerciseComplete } from '@/features/workout/domain/workoutRules'

describe('ExerciseAccordion', () => {
  const routine = routines[0]
  const exercises = createRoutineLog(routine).exercises

  it('renders one expanded exercise and emits intent-focused set updates', async () => {
    const wrapper = mount(ExerciseAccordion, {
      props: {
        routine,
        exercises,
        expandedIndex: 0,
        completedSetCount,
        isExerciseComplete,
        exerciseVolume,
        previousDate: () => null,
        previousSet: () => null,
      },
    })

    const weightInput = wrapper.get('input[aria-label="Barbell Squat, set 1, weight"]')
    await weightInput.setValue('40')
    await wrapper.get('button[title="Mark set complete"]').trigger('click')

    expect(wrapper.findAll('[role="region"]')).toHaveLength(1)
    expect(wrapper.emitted('updateSet')?.[0].slice(1)).toEqual([0, 'weight', '40'])
    expect(wrapper.emitted('toggleSet')?.[0].slice(1)).toEqual([0, 0])
  })

  it('marks added sets as removable', () => {
    const withExtraSet = structuredClone(exercises)
    withExtraSet[0].sets.push({ weight: '', reps: '', done: false })
    const wrapper = mount(ExerciseAccordion, {
      props: {
        routine,
        exercises: withExtraSet,
        expandedIndex: 0,
        completedSetCount,
        isExerciseComplete,
        exerciseVolume,
        previousDate: vi.fn(() => null),
        previousSet: vi.fn(() => null),
      },
    })
    expect(wrapper.findAll('button[title="Remove added set"]')).toHaveLength(1)
  })

  it('emits notes, add-set, and remove-set intentions', async () => {
    const withExtraSet = structuredClone(exercises)
    withExtraSet[0].sets.push({ weight: '', reps: '', done: false })
    const wrapper = mount(ExerciseAccordion, {
      props: {
        routine,
        exercises: withExtraSet,
        expandedIndex: 0,
        completedSetCount,
        isExerciseComplete,
        exerciseVolume,
        previousDate: () => null,
        previousSet: () => null,
      },
    })

    await wrapper.get('textarea').setValue('Controlled tempo')
    await wrapper.get('button.add-set-button').trigger('click')
    await wrapper.get('button[title="Remove added set"]').trigger('click')

    expect(wrapper.emitted('updateNotes')?.[0][1]).toBe('Controlled tempo')
    expect(wrapper.emitted('addSet')).toHaveLength(1)
    expect(wrapper.emitted('removeSet')).toHaveLength(1)
  })
})
