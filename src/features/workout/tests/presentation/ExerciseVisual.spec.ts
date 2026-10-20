import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ExerciseVisual from '@/features/workout/presentation/components/ExerciseVisual.vue'

describe('ExerciseVisual', () => {
  it('clips the leg curl before the hanging knee raise begins in the source sheet', () => {
    const wrapper = mount(ExerciseVisual, { props: { exerciseId: 'leg-curl' } })
    const viewport = wrapper.get('svg')
    const [x, y, width, height] = viewport.attributes('viewBox').split(' ').map(Number)

    expect(x).toBeGreaterThanOrEqual(771)
    expect(x + width).toBeLessThanOrEqual(1149)
    expect(y + height).toBeLessThanOrEqual(474)
    expect(viewport.attributes('aria-label')).toBe('Seated leg curl exercise demonstration')
  })

  it.each([
    ['barbell-squat', 486],
    ['barbell-bench-press', 480],
    ['barbell-hip-thrust', 474],
    ['pull-up-lat-pulldown', 493],
  ])('keeps %s above its actual row separator', (exerciseId, rowEnd) => {
    const wrapper = mount(ExerciseVisual, { props: { exerciseId } })
    const [, y, , height] = wrapper.get('svg').attributes('viewBox').split(' ').map(Number)

    expect(y + height).toBeLessThanOrEqual(rowEnd)
  })

  it.each([
    ['dumbbell-step-up', 495],
    ['lateral-raises', 486],
    ['hip-abduction', 482],
    ['face-pull', 500],
  ])('keeps %s below its actual row separator', (exerciseId, rowStart) => {
    const wrapper = mount(ExerciseVisual, { props: { exerciseId } })
    const [, y] = wrapper.get('svg').attributes('viewBox').split(' ').map(Number)

    expect(y).toBeGreaterThanOrEqual(rowStart)
  })
})
