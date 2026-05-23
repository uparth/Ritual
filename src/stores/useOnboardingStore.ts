import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { PrimaryGoal, MovementLevel, SpiritualLevel, PreferredTone } from '@/types'
import { config } from '@/constants/config'

export interface OnboardingAnswers {
  struggles: string[]
  energyLevel: number        // 1–10
  cravingLevel: number       // 1–10
  sleepHours: number         // 3–12
  movementLevel: MovementLevel
  primaryGoal: PrimaryGoal
  spiritualPractice: SpiritualLevel
  preferredTone: PreferredTone
}

interface OnboardingState {
  currentStep: number
  answers: Partial<OnboardingAnswers>
  setAnswer: <K extends keyof OnboardingAnswers>(field: K, value: OnboardingAnswers[K]) => void
  nextStep: () => void
  prevStep: () => void
  reset: () => void
}

const initialAnswers: Partial<OnboardingAnswers> = {
  struggles: [],
  energyLevel: 5,
  cravingLevel: 5,
  sleepHours: 7,
  movementLevel: 'none',
  primaryGoal: 'both',
  spiritualPractice: 'sometimes',
  preferredTone: 'gentle',
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      currentStep: 1,
      answers: { ...initialAnswers },

      setAnswer: (field, value) => {
        set(s => ({ answers: { ...s.answers, [field]: value } }))
      },

      nextStep: () => {
        set(s => ({ currentStep: Math.min(s.currentStep + 1, config.onboarding.totalSteps) }))
      },

      prevStep: () => {
        set(s => ({ currentStep: Math.max(s.currentStep - 1, 1) }))
      },

      reset: () => set({ currentStep: 1, answers: { ...initialAnswers } }),
    }),
    {
      name: 'ritual-onboarding',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)
