import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getCheckIn, saveCheckIn } from '@/services/firebase/firestore'
import type { DailyCheckIn, CheckInFormData } from '@/types'

function todayDateString() {
  return new Date().toISOString().split('T')[0]
}

const defaultDraft = (): Partial<CheckInFormData> => ({
  date: todayDateString(),
  type: 'morning',
  mood: 5,
  stress: 5,
  anxiety: 5,
  cravings: 5,
  sleepHours: 7,
  energy: 5,
  bodyPain: false,
  bodyPainNote: null,
  weightKg: null,
  movementMinutes: null,
  foodControl: 5,
  spiritualPractice: false,
  notes: null,
})

interface CheckInState {
  todayCheckIn: DailyCheckIn | null
  draft: Partial<CheckInFormData>
  loading: boolean
  saving: boolean
  error: string | null
  fetchToday: (uid: string) => Promise<void>
  setDraftField: <K extends keyof CheckInFormData>(field: K, value: CheckInFormData[K]) => void
  resetDraft: (type?: 'morning' | 'evening') => void
  save: (uid: string, data?: CheckInFormData) => Promise<void>
  clearError: () => void
}

export const useCheckInStore = create<CheckInState>()(
  persist(
    (set, get) => ({
      todayCheckIn: null,
      draft: defaultDraft(),
      loading: false,
      saving: false,
      error: null,

      fetchToday: async (uid) => {
        set({ loading: true, error: null })
        try {
          const checkIn = await getCheckIn(uid, todayDateString())
          set({ todayCheckIn: checkIn, loading: false })
        } catch {
          set({ error: 'Could not load today’s check-in.', loading: false })
        }
      },

      setDraftField: (field, value) => {
        set(s => ({ draft: { ...s.draft, [field]: value } }))
      },

      resetDraft: (type = 'morning') => {
        set({ draft: { ...defaultDraft(), type } })
      },

      save: async (uid, data) => {
        const { draft } = get()
        const checkIn = data ?? draft
        if (!checkIn.date) return
        set({ saving: true, error: null, draft: checkIn })
        try {
          await saveCheckIn(uid, checkIn as CheckInFormData)
          const saved = await getCheckIn(uid, checkIn.date)
          set({ todayCheckIn: saved, saving: false })
        } catch {
          set({ error: 'Could not save your check-in. Please try again.', saving: false })
          throw new Error('Check-in save failed')
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'ritual-checkin-draft',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ draft: s.draft }),
    }
  )
)
