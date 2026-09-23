import type { ExerciseUnit, WorkoutSet } from '@/features/workout/domain/models'

export const formatNumber = (value: number): string => new Intl.NumberFormat('en-US').format(value || 0)

export function formatPreviousSet(set: WorkoutSet | null, unit: ExerciseUnit = 'reps'): string {
  if (!set) return 'No previous'
  if (set.weight && set.reps) return `${set.weight} x ${set.reps}`
  if (set.weight) return `${set.weight} kg`
  if (set.reps) return `${set.reps} ${unit}`
  return 'No previous'
}

export function formatWeeklySet(set: WorkoutSet, unit: ExerciseUnit = 'reps'): string {
  const weight = set.weight ? `${set.weight} kg` : 'bodyweight'
  const reps = set.reps ? `${set.reps} ${unit}` : `no ${unit}`
  return `${weight} x ${reps}`
}
