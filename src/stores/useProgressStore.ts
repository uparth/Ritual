import { create } from 'zustand'
import { getLatestInsight, getRecentCheckIns, getRitualLogsInRange } from '@/services/firebase/firestore'
import type { DailyCheckIn, RitualLog, WeeklyInsight } from '@/types'

export interface ProgressPoint {
  date: string
  label: string
  value: number
}

export interface RitualConsistencySummary {
  completed: number
  total: number
  percentage: number
}

interface ProgressState {
  checkIns: DailyCheckIn[]
  ritualLogs: RitualLog[]
  insight: WeeklyInsight | null
  loading: boolean
  error: string | null
  fetchProgress: (uid: string) => Promise<void>
  clearError: () => void
}

const dayMs = 24 * 60 * 60 * 1000

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function shortDateLabel(value: string): string {
  const date = new Date(`${value}T00:00:00`)
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function getRange(days: number): { startDate: string; endDate: string } {
  const end = new Date()
  const start = new Date(end.getTime() - (days - 1) * dayMs)
  return { startDate: formatDate(start), endDate: formatDate(end) }
}

export function toProgressPoints(
  checkIns: DailyCheckIn[],
  metric: keyof Pick<DailyCheckIn, 'mood' | 'sleepHours' | 'cravings' | 'weightKg'>,
): ProgressPoint[] {
  return checkIns
    .map(checkIn => ({ date: checkIn.date, value: checkIn[metric] }))
    .filter((point): point is { date: string; value: number } => typeof point.value === 'number')
    .map(point => ({
      date: point.date,
      label: shortDateLabel(point.date),
      value: Number(point.value.toFixed(1)),
    }))
}

export function getRitualConsistency(logs: RitualLog[]): RitualConsistencySummary {
  const total = logs.length
  const completed = logs.filter(log => log.status === 'completed').length
  return {
    completed,
    total,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
  }
}

export function buildLocalInsight(checkIns: DailyCheckIn[], logs: RitualLog[]): string | null {
  if (checkIns.length < 2 && logs.length === 0) return null

  const latest = checkIns[checkIns.length - 1]
  const consistency = getRitualConsistency(logs)

  if (latest?.energy !== undefined && latest.energy <= 3) {
    return 'Energy has been low recently. Keep rituals small and choose the low-energy version before momentum drops.'
  }

  if (latest?.stress !== undefined && latest.stress >= 7) {
    return 'Stress is running high. A shorter plan with breathing, movement, and one food anchor may protect the day.'
  }

  if (consistency.total > 0 && consistency.percentage >= 70) {
    return 'Ritual consistency is building. Keep the streak boring and repeatable so it can survive busy days.'
  }

  if (checkIns.length >= 3) {
    return 'Your check-in rhythm is starting to create useful signal. Watch mood, sleep, and cravings together this week.'
  }

  return null
}

export const useProgressStore = create<ProgressState>((set) => ({
  checkIns: [],
  ritualLogs: [],
  insight: null,
  loading: false,
  error: null,

  fetchProgress: async (uid) => {
    set({ loading: true, error: null })
    try {
      const { startDate, endDate } = getRange(14)
      const [checkIns, ritualLogs, insight] = await Promise.all([
        getRecentCheckIns(uid, 14),
        getRitualLogsInRange(uid, startDate, endDate),
        getLatestInsight(uid),
      ])
      set({ checkIns, ritualLogs, insight, loading: false })
    } catch {
      set({ error: 'Could not load progress yet. Please try again.', loading: false })
    }
  },

  clearError: () => set({ error: null }),
}))
