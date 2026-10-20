import { beforeEach, describe, expect, it } from 'vitest'
import {
  createUserScopedWorkoutRepository,
  STORAGE_KEY,
} from '@/features/workout/infrastructure/localStorageWorkoutRepository'
import { createDefaultWorkoutState } from '@/features/workout/domain/workoutFactory'

describe('user-scoped local workout persistence', () => {
  const dateProvider = { today: () => '2026-10-19' }

  beforeEach(() => localStorage.clear())

  it('migrates shared local history only to the first authenticated user', () => {
    const legacyState = createDefaultWorkoutState('2026-10-19')
    legacyState.workout['day-1'].exercises[0].sets[0].weight = '40'
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 5, ...legacyState }))

    const firstUser = createUserScopedWorkoutRepository(localStorage, dateProvider, 'user-1')
    const secondUser = createUserScopedWorkoutRepository(localStorage, dateProvider, 'user-2')

    expect(firstUser.load().workout['day-1'].exercises[0].sets[0].weight).toBe('40')
    expect(secondUser.load().workout['day-1'].exercises[0].sets[0].weight).toBe('')
  })
})
