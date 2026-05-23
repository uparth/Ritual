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
  saving: boolean
  fetchToday: (uid: string) => Promise<void>
  setDraftField: <K extends keyof CheckInFormData>(field: K, value: CheckInFormData[K]) => void
  resetDraft: (type?: 'morning' | 'evening') => void
  save: (uid: string) => Promise<void>
}

export const useCheckInStore = create<CheckInState>()(
  persist(
    (set, get) => ({
      todayCheckIn: null,
      draft: defaultDraft(),
      saving: false,

      fetchToday: async (uid) => {
        const checkIn = await getCheckIn(uid, todayDateString())
        set({ todayCheckIn: checkIn })
      },

      setDraftField: (field, value) => {
        set(s => ({ draft: { ...s.draft, [field]: value } }))
      },

      resetDraft: (type = 'morning') => {
        set({ draft: { ...defaultDraft(), type } })
      },

      save: async (uid) => {
        const { draft } = get()
        if (!draft.date) return
        set({ saving: true })
        try {
          await saveCheckIn(uid, draft as Omit<DailyCheckIn, 'createdAt' | 'updatedAt'>)
          const saved = await getCheckIn(uid, draft.date)
          set({ todayCheckIn: saved, saving: false })
        } catch {
          set({ saving: false })
          throw new Error('Check-in save failed')
        }
      },
    }),
    {
      name: 'ritual-checkin-draft',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ draft: s.draft }),
    }
  )
)
