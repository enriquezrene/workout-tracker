import type { WorkoutSession, WorkoutState } from '../domain/models'

export interface WorkoutRepository {
  load(): WorkoutState
  save(state: WorkoutState): void
}

export interface WorkoutHistoryRepository {
  list(): Promise<WorkoutSession[]>
  save(session: WorkoutSession): Promise<void>
}

export interface IdGenerator {
  generate(): string
}
export interface DateProvider {
  today(): string
}
