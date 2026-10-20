import type { WorkoutSession } from '../domain/models'

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
