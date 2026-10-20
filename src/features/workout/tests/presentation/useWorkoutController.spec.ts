import { describe, expect, it, vi } from 'vitest'
import { createWorkoutController } from '@/features/workout/presentation/useWorkoutController'
import type { WorkoutSession } from '@/features/workout/domain/models'

function setup(history: WorkoutSession[] = []) {
  const repository = {
    list: vi.fn(async () => history),
    save: vi.fn<(session: WorkoutSession) => Promise<void>>(async () => undefined),
  }
  let nextId = 0
  const controller = createWorkoutController(
    repository,
    { today: () => '2026-09-14' },
    { generate: () => `session-${++nextId}` },
  )
  const firstExercise = () => controller.currentLog.value.exercises[0]
  const enterSet = (index = 0) =>
    controller.commands.updateSet(firstExercise(), index, { weight: '40', reps: '8' })
  return { controller, repository, firstExercise, enterSet }
}

describe('cloud workout recording', () => {
  it('saves notes and removal of added sets to the same cloud session', async () => {
    const { controller, repository, firstExercise, enterSet } = setup()
    await controller.ready
    enterSet()
    await controller.commands.toggleSet(firstExercise(), 0, 0)
    await controller.commands.updateNotes(firstExercise(), 'Controlled tempo')
    expect(repository.save).toHaveBeenLastCalledWith(
      expect.objectContaining({
        exercises: expect.arrayContaining([expect.objectContaining({ notes: 'Controlled tempo' })]),
      }),
    )
    controller.commands.addSet(firstExercise())
    const addedIndex = firstExercise().sets.length - 1
    enterSet(addedIndex)
    await controller.commands.toggleSet(firstExercise(), addedIndex, 0)
    await controller.commands.removeSet(firstExercise(), addedIndex)
    expect(repository.save.mock.calls.at(-1)?.[0].exercises[0].sets).toHaveLength(firstExercise().defaultSets)
    expect(repository.save.mock.calls.every(([session]) => session.id === 'session-1')).toBe(true)
    expect(controller.state.history).toHaveLength(1)
    controller.dispose()
  })
  it('saves on each check, reuses the session ID, and only confirms after the server succeeds', async () => {
    const { controller, repository, firstExercise, enterSet } = setup()
    await controller.ready
    let finishSave!: () => void
    repository.save.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          finishSave = resolve
        }),
    )
    enterSet()
    const saving = controller.commands.toggleSet(firstExercise(), 0, 0)
    expect(firstExercise().sets[0].done).toBe(false)
    expect(controller.isBusy.value).toBe(true)
    finishSave()
    await saving
    expect(firstExercise().sets[0].done).toBe(true)
    expect(repository.save).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: 'session-1', date: '2026-09-14', completedSets: 1, totalVolume: 320 }),
    )
    enterSet(1)
    await controller.commands.toggleSet(firstExercise(), 1, 0)
    expect(repository.save).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: 'session-1', completedSets: 2 }),
    )
    expect(controller.state.history).toHaveLength(1)
    controller.dispose()
  })

  it('leaves a failed set unconfirmed and retries the same session without duplicating history', async () => {
    const { controller, repository, firstExercise, enterSet } = setup()
    await controller.ready
    enterSet()
    repository.save.mockRejectedValueOnce(new Error('offline'))
    await controller.commands.toggleSet(firstExercise(), 0, 0)
    expect(firstExercise().sets[0].done).toBe(false)
    expect(controller.state.history).toHaveLength(0)
    expect(controller.errorMessage.value).toContain('not saved')
    await controller.commands.retry()
    expect(firstExercise().sets[0].done).toBe(true)
    expect(repository.save.mock.calls.map(([session]) => session.id)).toEqual(['session-1', 'session-1'])
    expect(controller.state.history).toHaveLength(1)
    controller.dispose()
  })

  it('loads only cloud history, restores saved sets on the correct date, and supplies previous values on the next day', async () => {
    const original = setup()
    await original.controller.ready
    original.enterSet()
    await original.controller.commands.toggleSet(original.firstExercise(), 0, 0)
    const savedSession = original.repository.save.mock.calls[0][0]
    original.controller.dispose()
    const { controller, repository, firstExercise } = setup([savedSession])
    await controller.ready
    expect(repository.save).not.toHaveBeenCalled()
    expect(firstExercise().sets[0]).toMatchObject({ weight: '40', reps: '8', done: true })
    controller.commands.setSessionDate('2026-09-15')
    expect(firstExercise().sets[0]).toMatchObject({ weight: '', reps: '', done: false })
    expect(controller.previousSet(firstExercise(), 0)?.weight).toBe('40')
    expect(controller.previousReference(firstExercise())?.date).toBe('2026-09-14')
    controller.commands.setSessionDate('2026-09-14')
    await controller.commands.toggleSet(firstExercise(), 0, 0)
    expect(repository.save).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: savedSession.id, completedSets: 0 }),
    )
    controller.dispose()
  })

  it('retains drafts per date without carrying completion into another day', async () => {
    const { controller, firstExercise, enterSet } = setup()
    await controller.ready
    enterSet()
    controller.commands.setSessionDate('2026-09-15')
    expect(firstExercise().sets[0].weight).toBe('')
    controller.commands.setSessionDate('2026-09-14')
    expect(firstExercise().sets[0].weight).toBe('40')
    controller.dispose()
  })

  it('blocks writes until history loads and retries a failed load without uploading anything', async () => {
    const repository = {
      list: vi
        .fn<() => Promise<WorkoutSession[]>>()
        .mockRejectedValueOnce(new Error('offline'))
        .mockResolvedValue([]),
      save: vi.fn(),
    }
    const controller = createWorkoutController(
      repository,
      { today: () => '2026-09-14' },
      { generate: () => 'session-1' },
    )
    await controller.ready
    const exercise = controller.currentLog.value.exercises[0]
    await controller.commands.toggleSet(exercise, 0, 0)
    expect(repository.save).not.toHaveBeenCalled()
    expect(controller.canEdit.value).toBe(false)
    await controller.commands.retry()
    expect(controller.canEdit.value).toBe(true)
    expect(repository.save).not.toHaveBeenCalled()
    controller.dispose()
  })

  it('rejects empty or invalid set values and advances only after confirmed completion', async () => {
    const { controller, repository, firstExercise, enterSet } = setup()
    await controller.ready
    await controller.commands.toggleSet(firstExercise(), 0, 0)
    expect(repository.save).not.toHaveBeenCalled()
    expect(controller.errorMessage.value).toContain('repetitions')
    for (let index = 0; index < firstExercise().sets.length; index++) {
      enterSet(index)
      await controller.commands.toggleSet(firstExercise(), index, 0)
    }
    expect(controller.state.expandedExerciseIndex).toBe(1)
    controller.dispose()
  })

  it('ignores duplicate checks and date changes while a save is pending', async () => {
    const { controller, repository, firstExercise, enterSet } = setup()
    await controller.ready
    enterSet()
    let finishSave!: () => void
    repository.save.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          finishSave = resolve
        }),
    )
    const saving = controller.commands.toggleSet(firstExercise(), 0, 0)
    await controller.commands.toggleSet(firstExercise(), 0, 0)
    controller.commands.setSessionDate('2026-09-15')
    expect(repository.save).toHaveBeenCalledTimes(1)
    expect(controller.state.sessionDate).toBe('2026-09-14')
    finishSave()
    await saving
    controller.dispose()
  })
})
