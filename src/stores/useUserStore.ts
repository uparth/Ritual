import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getProfile, setProfile, updateProfile, getPreferences, setPreferences, markOnboardingComplete } from '@/services/firebase/firestore'
import type { UserProfile, UserPreferences } from '@/types'

interface UserState {
  profile: UserProfile | null
  preferences: UserPreferences | null
  onboardingComplete: boolean
  isPremium: boolean
  loading: boolean
  fetchUser: (uid: string) => Promise<void>
  updateProfile: (uid: string, patch: Partial<UserProfile>) => Promise<void>
  updatePreferences: (uid: string, patch: Partial<UserPreferences>) => Promise<void>
  completeOnboarding: (uid: string, profile: Omit<UserProfile, 'updatedAt'>) => Promise<void>
  reset: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      profile: null,
      preferences: null,
      onboardingComplete: false,
      isPremium: false,
      loading: false,

      fetchUser: async (uid) => {
        set({ loading: true })
        const [profile, prefs] = await Promise.all([getProfile(uid), getPreferences(uid)])
        set({ profile, preferences: prefs, loading: false })
      },

      updateProfile: async (uid, patch) => {
        await updateProfile(uid, patch)
        set(s => ({ profile: s.profile ? { ...s.profile, ...patch } : null }))
      },

      updatePreferences: async (uid, patch) => {
        const current = get().preferences
        if (!current) return
        const merged = { ...current, ...patch }
        await setPreferences(uid, merged)
        set({ preferences: merged })
      },

      completeOnboarding: async (uid, profile) => {
        await Promise.all([
          setProfile(uid, profile),
          markOnboardingComplete(uid),
        ])
        set({ profile: profile as UserProfile, onboardingComplete: true })
      },

      reset: () => set({ profile: null, preferences: null, onboardingComplete: false, isPremium: false }),
    }),
    {
      name: 'ritual-user-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        profile: s.profile,
        preferences: s.preferences,
        onboardingComplete: s.onboardingComplete,
        isPremium: s.isPremium,
      }),
    }
  )
)
