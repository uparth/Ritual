import type { Timestamp } from 'firebase/firestore'

export type AIMode =
  | 'daily_guidance'
  | 'craving_support'
  | 'overthinking'
  | 'low_energy'
  | 'cant_sleep'
  | 'guilt'
  | 'motivation'

export interface AIInputContext {
  checkInDate: string | null
  mood: number | null
  stress: number | null
  energy: number | null
  cravings: number | null
  recentPatterns: string[]
  userMessage: string | null
}

export interface AISession {
  sessionId: string
  mode: AIMode
  inputContext: AIInputContext
  response: string
  safetyFlagged: boolean
  safetyResponse: string | null
  model: string
  tokensUsed: number
  createdAt: Timestamp
}
