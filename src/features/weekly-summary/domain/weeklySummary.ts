import { isCompletedSet } from '@/features/workout/domain/workoutRules'
import type { ExerciseUnit, WorkoutSession, WorkoutSet } from '@/features/workout/domain/models'

export interface DateRange {
  start: string
  end: string
}
export interface WeeklySet extends WorkoutSet {
  number: number
}
export interface WeeklyLog {
  date: string
  routineName: string
  sets: WeeklySet[]
}
export interface WeeklyExerciseSummary {
  id: string
  name: string
  unit: ExerciseUnit
  totalSets: number
  totalReps: number
  maxWeight: number
  totalVolume: number
  logs: WeeklyLog[]
}

export function getWeekRange(dateValue: string): DateRange {
  const [year, month, dayOfMonth] = dateValue.split('-').map(Number)
  const date = new Date(year, month - 1, dayOfMonth)
  const day = date.getDay() || 7
  const monday = new Date(date)
  monday.setDate(date.getDate() - day + 1)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  const format = (value: Date) =>
    `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
  return { start: format(monday), end: format(sunday) }
}

export function buildWeeklySummary(history: WorkoutSession[], range: DateRange) {
  const sessions = history
    .filter((entry) => entry.date >= range.start && entry.date <= range.end)
    .sort((a, b) => a.date.localeCompare(b.date))
  const exercises = new Map<string, WeeklyExerciseSummary>()
  sessions.forEach((entry) =>
    entry.exercises.forEach((exercise) => {
      const completed = exercise.sets.filter(isCompletedSet)
      if (!completed.length) return
      const summary = exercises.get(exercise.id) || {
        id: exercise.id,
        name: exercise.name,
        unit: exercise.unit || 'reps',
        totalSets: 0,
        totalReps: 0,
        maxWeight: 0,
        totalVolume: 0,
        logs: [],
      }
      const sets = completed.map((set, index) => {
        const weight = Number(set.weight) || 0
        const reps = Number(set.reps) || 0
        summary.totalSets += 1
        summary.totalReps += reps
        summary.maxWeight = Math.max(summary.maxWeight, weight)
        summary.totalVolume += weight * reps
        return { ...set, number: index + 1 }
      })
      summary.logs.push({ date: entry.date, routineName: entry.routineName, sets })
      exercises.set(exercise.id, summary)
    }),
  )
  const exerciseList = [...exercises.values()].sort((a, b) => a.name.localeCompare(b.name))
  return {
    sessions,
    exercises: exerciseList,
    totals: {
      sessions: sessions.length,
      sets: exerciseList.reduce((sum, item) => sum + item.totalSets, 0),
      volume: exerciseList.reduce((sum, item) => sum + item.totalVolume, 0),
    },
  }
}
