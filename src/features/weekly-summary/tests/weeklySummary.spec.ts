import { describe, expect, it } from 'vitest'
import { buildWeeklySummary, getWeekRange } from '@/features/weekly-summary/domain/weeklySummary'
import type { WorkoutSession } from '@/features/workout/domain/models'

describe('weekly summary', () => {
  it('aggregates checked sets from repeated sessions', () => {
    const session: WorkoutSession = {
      id: 'one',
      date: '2026-09-22',
      routineId: 'day-1',
      routineName: 'Day 1',
      focus: 'Lower A',
      completedSets: 1,
      totalSets: 1,
      totalVolume: 80,
      exercises: [
        {
          id: 'barbell-squat',
          name: 'Barbell Squat',
          prescription: '1 x 8',
          notes: '',
          defaultSets: 1,
          sets: [{ weight: '10', reps: '8', done: true }],
        },
      ],
    }
    const summary = buildWeeklySummary([session, { ...session, id: 'two' }], getWeekRange('2026-09-23'))
    expect(summary.totals.sessions).toBe(2)
    expect(summary.totals.sets).toBe(2)
    expect(summary.totals.volume).toBe(160)
  })
})
