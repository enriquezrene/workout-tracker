export type ExerciseUnit = 'reps' | 'sec'
export type ViewName = 'track' | 'week'

export interface WorkoutSet {
  weight: string
  reps: string
  done: boolean
}

export interface ExerciseDefinition {
  id: string
  name: string
  prescription: string
  defaultSets: number
  suggested?: string
  optional?: boolean
  unit?: ExerciseUnit
}

export interface ExerciseLog extends ExerciseDefinition {
  notes: string
  sets: WorkoutSet[]
}

export interface RoutineDefinition {
  id: string
  name: string
  focus: string
  exercises: ExerciseDefinition[]
}

export interface RoutineLog {
  routineId: string
  exercises: ExerciseLog[]
}

export interface WorkoutSession {
  id: string
  date: string
  routineId: string
  routineName: string
  focus: string
  completedSets: number
  totalSets: number
  totalVolume: number
  exercises: ExerciseLog[]
}

export interface WorkoutState {
  selectedRoutineId: string
  expandedExerciseIndex: number | null
  sessionDate: string
  workout: Record<string, RoutineLog>
  history: WorkoutSession[]
}

export interface PersistedWorkoutStateV5 extends WorkoutState {
  version: 5
}
