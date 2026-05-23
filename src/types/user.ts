import type { Timestamp } from 'firebase/firestore'

export interface UserDoc {
  uid: string
  email: string
  name: string
  createdAt: Timestamp
  onboardingComplete: boolean
  isPremium: boolean
  premiumExpiresAt: Timestamp | null
}

export type PrimaryGoal = 'weight_loss' | 'mental_clarity' | 'both' | 'energy' | 'sleep'
export type MovementLevel = 'none' | 'light' | 'moderate' | 'active'
export type CravingPattern = 'emotional' | 'boredom' | 'stress' | 'none'
export type PreferredTone = 'gentle' | 'direct' | 'motivational'
export type SpiritualLevel = 'yes' | 'sometimes' | 'no'

export interface UserProfile {
  primaryGoal: PrimaryGoal
  currentWeightKg: number | null
  targetWeightKg: number | null
  heightCm: number | null
  age: number | null
  stressLevel: number          // 1–10 from onboarding
  sleepQualityLevel: number    // 1–10
  movementLevel: MovementLevel
  cravingPattern: CravingPattern
  spiritualPractice: SpiritualLevel
  preferredTone: PreferredTone
  struggles: string[]
  updatedAt: Timestamp
}

export interface UserPreferences {
  morningCheckInTime: string      // "07:30"
  eveningReflectionTime: string   // "21:00"
  notificationsEnabled: boolean
  lowEnergyModeActive: boolean
  language: string                // "en"
  updatedAt: Timestamp
}
