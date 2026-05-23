import type { Timestamp } from 'firebase/firestore'

export type JournalType =
  | 'free'
  | 'guided'
  | 'evening_reflection'
  | 'gratitude'
  | 'emotional_release'

export interface JournalEntry {
  entryId: string
  date: string                    // "2026-05-23"
  type: JournalType
  prompt: string | null
  body: string
  mood: number | null
  tags: string[]
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface WeeklyInsight {
  weekId: string                  // "2026-W21"
  weekStart: string
  weekEnd: string
  avgMood: number
  avgStress: number
  avgSleep: number
  avgEnergy: number
  avgCravings: number
  ritualsCompleted: number
  ritualsTotal: number
  weightChangeKg: number | null
  topPattern: string | null
  aiSummary: string | null
  generatedAt: Timestamp
}
