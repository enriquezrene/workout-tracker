import type { SupabaseClient } from '@supabase/supabase-js'
import type { WorkoutHistoryRepository } from '../application/ports'
import type { ExerciseLog, WorkoutSession, WorkoutSet } from '../domain/models'

interface SetRecord {
  set_number: number
  kg: number | null
  reps: number | null
  reps_in_reserve: number | null
  fatigue_rer: number | null
  completed: boolean
}

interface ExerciseRecord {
  exercise_id: string
  exercise_name: string
  prescription: string
  default_sets: number
  suggested: string | null
  optional: boolean
  unit: 'reps' | 'sec'
  notes: string
  position: number
  exercise_sets: SetRecord[]
}

interface SessionRecord {
  id: string
  workout_date: string
  routine_id: string
  routine_name: string
  focus: string
  completed_sets: number
  total_sets: number
  total_volume: number
  created_at: string
  exercise_entries: ExerciseRecord[]
}

const optionalNumber = (value: number | null): string => (value === null ? '' : String(value))

function mapSet(record: SetRecord): WorkoutSet {
  return {
    weight: optionalNumber(record.kg),
    reps: optionalNumber(record.reps),
    repsInReserve: optionalNumber(record.reps_in_reserve),
    fatigueRer: optionalNumber(record.fatigue_rer),
    done: record.completed,
  }
}

function mapExercise(record: ExerciseRecord): ExerciseLog {
  const sets = [...record.exercise_sets].sort((a, b) => a.set_number - b.set_number)
  return {
    id: record.exercise_id,
    name: record.exercise_name,
    prescription: record.prescription,
    defaultSets: record.default_sets,
    suggested: record.suggested || undefined,
    optional: record.optional || undefined,
    unit: record.unit,
    notes: record.notes,
    sets: sets.map(mapSet),
  }
}

export function mapSessionRecord(record: SessionRecord): WorkoutSession {
  const exercises = [...record.exercise_entries].sort((a, b) => a.position - b.position)
  return {
    id: record.id,
    date: record.workout_date,
    routineId: record.routine_id,
    routineName: record.routine_name,
    focus: record.focus,
    completedSets: record.completed_sets,
    totalSets: record.total_sets,
    totalVolume: Number(record.total_volume),
    exercises: exercises.map(mapExercise),
  }
}

export class SupabaseWorkoutHistoryRepository implements WorkoutHistoryRepository {
  constructor(private readonly client: SupabaseClient) {}

  async list(): Promise<WorkoutSession[]> {
    await this.requireSession()
    const { data, error } = await this.client
      .from('workout_sessions')
      .select(
        `id, workout_date, routine_id, routine_name, focus, completed_sets, total_sets,
        total_volume, created_at, exercise_entries (
          exercise_id, exercise_name, prescription, default_sets, suggested, optional, unit,
          notes, position, exercise_sets (
            set_number, kg, reps, reps_in_reserve, fatigue_rer, completed
          )
        )`,
      )
      .order('workout_date', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as SessionRecord[]).map(mapSessionRecord)
  }

  async save(session: WorkoutSession): Promise<void> {
    await this.requireSession()
    const { error } = await this.client.rpc('save_workout_session', { p_workout: session })
    if (error) throw error
  }

  private async requireSession(): Promise<void> {
    const { data, error } = await this.client.auth.getSession()
    if (error) throw error
    if (data.session) return
    throw new Error('Authentication is required to access workout history')
  }
}
