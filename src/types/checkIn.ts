import type { Timestamp } from 'firebase/firestore'

export type CheckInType = 'morning' | 'evening' | 'both'

export interface DailyCheckIn {
  date: string                    // "2026-05-23"
  type: CheckInType
  mood: number                    // 1–10
  stress: number
  anxiety: number
  cravings: number
  sleepHours: number              // 0–12, step 0.5
  energy: number
  bodyPain: boolean
  bodyPainNote: string | null
  weightKg: number | null         // morning only
  movementMinutes: number | null
  foodControl: number | null      // 1–10
  spiritualPractice: boolean
  notes: string | null
  aiSessionId: string | null
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type CheckInFormData = Omit<DailyCheckIn, 'createdAt' | 'updatedAt' | 'aiSessionId'>
