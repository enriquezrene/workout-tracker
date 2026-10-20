import type { DateProvider, WorkoutRepository } from '../application/ports'
import type { PersistedWorkoutStateV5, WorkoutState } from '../domain/models'
import { migrateStoredState } from './migrations'

export const STORAGE_KEY = 'diauno-workout-tracking-v5'
export const LEGACY_STORAGE_KEY = 'diauno-workout-tracking-v4'
const MIGRATION_OWNER_KEY = 'diauno-workout-tracking-cloud-migration-owner'

export class LocalStorageWorkoutRepository implements WorkoutRepository {
  constructor(
    private readonly storage: Storage,
    private readonly dateProvider: DateProvider,
    private readonly storageKey = STORAGE_KEY,
    private readonly fallbackKeys: string[] = [LEGACY_STORAGE_KEY],
  ) {}

  load(): WorkoutState {
    const storedState = [this.storageKey, ...this.fallbackKeys]
      .map((key) => this.read(key))
      .find((value) => value !== null)
    return migrateStoredState(storedState, this.dateProvider.today())
  }

  save(state: WorkoutState): void {
    const snapshot = JSON.parse(JSON.stringify(state)) as WorkoutState
    const persisted: PersistedWorkoutStateV5 = { version: 5, ...snapshot }
    this.storage.setItem(this.storageKey, JSON.stringify(persisted))
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

export function createUserScopedWorkoutRepository(
  storage: Storage,
  dateProvider: DateProvider,
  userId: string,
): WorkoutRepository {
  const migrationOwner = storage.getItem(MIGRATION_OWNER_KEY)
  if (!migrationOwner) storage.setItem(MIGRATION_OWNER_KEY, userId)
  const mayImportLegacyData = !migrationOwner || migrationOwner === userId
  const fallbackKeys = mayImportLegacyData ? [STORAGE_KEY, LEGACY_STORAGE_KEY] : []

  return new LocalStorageWorkoutRepository(storage, dateProvider, `${STORAGE_KEY}:${userId}`, fallbackKeys)
}
