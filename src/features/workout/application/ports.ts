import type { WorkoutState } from '../domain/models'

export interface WorkoutRepository {
  load(): WorkoutState
  save(state: WorkoutState): void
}

export interface IdGenerator {
  generate(): string
}
export interface DateProvider {
  today(): string
}
