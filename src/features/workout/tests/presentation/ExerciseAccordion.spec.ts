import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import ExerciseAccordion from '@/features/workout/presentation/components/ExerciseAccordion.vue'
import { createRoutineLog } from '@/features/workout/domain/workoutFactory'
import { routines } from '@/features/workout/domain/catalog'
import { completedSetCount, exerciseVolume, isExerciseComplete } from '@/features/workout/domain/workoutRules'
import { exerciseVisuals } from '@/features/workout/presentation/exerciseVisuals'

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
    await wrapper.get('input[aria-label="Barbell Squat, set 1, repetitions"]').setValue('8')
    await wrapper.get('button[title="Mark set complete"]').trigger('click')

    expect(wrapper.findAll('[role="region"]')).toHaveLength(1)
    expect(wrapper.get('[role="img"]').attributes('aria-label')).toBe('Barbell squat exercise demonstration')
    expect(wrapper.emitted('updateSet')?.[0].slice(1)).toEqual([0, 'weight', '40'])
    expect(wrapper.emitted('updateSet')?.[1].slice(1)).toEqual([0, 'reps', '8'])
    expect(wrapper.findAll('.set-row input')).toHaveLength(exercises[0].sets.length * 2)
    expect(wrapper.find('input[aria-label*="reps in reserve"]').exists()).toBe(false)
    expect(wrapper.find('input[aria-label*="fatigue RER"]').exists()).toBe(false)
    expect(wrapper.emitted('toggleSet')?.[0].slice(1)).toEqual([0, 0])
  })

  it('provides a visual for every catalog exercise', () => {
    const exerciseIds = routines.flatMap((workoutRoutine) =>
      workoutRoutine.exercises.map((exercise) => exercise.id),
    )

    expect(Object.keys(exerciseVisuals).sort()).toEqual(exerciseIds.sort())
  })

  it('marks added sets as removable', () => {
    const withExtraSet = structuredClone(exercises)
    withExtraSet[0].sets.push({
      weight: '',
      reps: '',
      repsInReserve: '',
      fatigueRer: '',
      done: false,
    })
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
    withExtraSet[0].sets.push({
      weight: '',
      reps: '',
      repsInReserve: '',
      fatigueRer: '',
      done: false,
    })
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
    await wrapper.get('textarea').trigger('change')
    await wrapper.get('button.add-set-button').trigger('click')
    await wrapper.get('button[title="Remove added set"]').trigger('click')

    expect(wrapper.emitted('updateNotes')?.[0][1]).toBe('Controlled tempo')
    expect(wrapper.emitted('addSet')).toHaveLength(1)
    expect(wrapper.emitted('removeSet')).toHaveLength(1)
  })
})
