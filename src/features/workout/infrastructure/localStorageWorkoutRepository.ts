import type { DateProvider, WorkoutRepository } from '../application/ports'
import type { PersistedWorkoutStateV5, WorkoutState } from '../domain/models'
import { migrateStoredState } from './migrations'

export const STORAGE_KEY = 'diauno-workout-tracking-v5'
export const LEGACY_STORAGE_KEY = 'diauno-workout-tracking-v4'

export class LocalStorageWorkoutRepository implements WorkoutRepository {
  constructor(
    private readonly storage: Storage,
    private readonly dateProvider: DateProvider,
  ) {}

  load(): WorkoutState {
    return migrateStoredState(
      this.read(STORAGE_KEY) ?? this.read(LEGACY_STORAGE_KEY),
      this.dateProvider.today(),
    )
  }

  save(state: WorkoutState): void {
    const snapshot = JSON.parse(JSON.stringify(state)) as WorkoutState
    const persisted: PersistedWorkoutStateV5 = { version: 5, ...snapshot }
    this.storage.setItem(STORAGE_KEY, JSON.stringify(persisted))
  }

  private read(key: string): unknown {
    try {
      const value = this.storage.getItem(key)
      return value ? JSON.parse(value) : null
    } catch {
      return null
    }
  }
}
