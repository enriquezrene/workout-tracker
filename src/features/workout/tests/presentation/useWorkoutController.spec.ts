import { describe, expect, it } from 'vitest'
import { reactive } from 'vue'
import { createWorkoutController } from '@/features/workout/presentation/useWorkoutController'
import { createDefaultWorkoutState } from '@/features/workout/domain/workoutFactory'
import type { WorkoutRepository } from '@/features/workout/application/ports'

describe('workout controller', () => {
  it('saves reactive workout state through the repository', () => {
    let saved = createDefaultWorkoutState('2026-09-23')
    const repository: WorkoutRepository = {
      load: () => reactive(saved),
      save: (state) => {
        saved = JSON.parse(JSON.stringify(state))
      },
    }
    const controller = createWorkoutController(repository, { generate: () => 'session-1' })

    controller.commands.save()

    expect(controller.state.history[0].id).toBe('session-1')
    expect(controller.state.history[0].routineId).toBe('day-1')
  })

  it('resets the active routine and clears history through commands', () => {
    const stored = createDefaultWorkoutState('2026-09-23')
    const repository: WorkoutRepository = { load: () => stored, save: () => undefined }
    const controller = createWorkoutController(repository, { generate: () => 'session-1' })
    const firstSet = stored.workout['day-1'].exercises[0].sets[0]
    firstSet.weight = '40'
    firstSet.done = true
    controller.commands.save()

    controller.commands.reset()
    expect(controller.state.workout['day-1'].exercises[0].sets[0].weight).toBe('')
    controller.commands.clearHistory()
    expect(controller.state.history).toEqual([])
  })
})
