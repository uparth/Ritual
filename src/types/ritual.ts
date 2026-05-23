import type { Timestamp } from 'firebase/firestore'

export type RitualType =
  | 'mind'
  | 'body'
  | 'food'
  | 'sleep'
  | 'spiritual'
  | 'creative'
  | 'reflection'

export type DayCode = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

export type LogStatus = 'completed' | 'skipped' | 'partial'

export interface Ritual {
  ritualId: string
  title: string
  description: string | null
  type: RitualType
  durationMinutes: number
  scheduledTime: string | null    // "08:00"
  days: DayCode[]
  isActive: boolean
  lowEnergyAlternative: string | null
  reminderEnabled: boolean
  order: number
  createdAt: Timestamp
}

export interface RitualLog {
  logId: string
  ritualId: string
  date: string                    // "2026-05-23"
  status: LogStatus
  skipReason: string | null
  durationActualMinutes: number | null
  note: string | null
  completedAt: Timestamp
}

export type RitualWithLog = Ritual & { log: RitualLog | null }
