import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getUserDoc, getProfile, setProfile, updateProfile, getPreferences, setPreferences, markOnboardingComplete, saveOnboardingPlan } from '@/services/firebase/firestore'
import type { Ritual, UserProfile, UserPreferences } from '@/types'

interface UserState {
  name: string | null
  profile: UserProfile | null
  preferences: UserPreferences | null
  onboardingComplete: boolean
  isPremium: boolean
  loading: boolean
  fetchUser: (uid: string) => Promise<void>
  updateProfile: (uid: string, patch: Partial<UserProfile>) => Promise<void>
  updatePreferences: (uid: string, patch: Partial<UserPreferences>) => Promise<void>
  completeOnboarding: (uid: string, profile: Omit<UserProfile, 'updatedAt'>) => Promise<void>
  completeOnboardingPlan: (
    uid: string,
    profile: Omit<UserProfile, 'updatedAt'>,
    preferences: Omit<UserPreferences, 'updatedAt'>,
    rituals: Omit<Ritual, 'ritualId' | 'createdAt'>[],
  ) => Promise<void>
  reset: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      profile: null,
      name: null,
      preferences: null,
      onboardingComplete: false,
      isPremium: false,
      loading: false,

      fetchUser: async (uid) => {
        set({ loading: true })
        try {
          const [user, profile, prefs] = await Promise.all([
            getUserDoc(uid),
            getProfile(uid),
            getPreferences(uid),
          ])
          set({
            name: user?.name ?? null,
            profile,
            preferences: prefs,
            onboardingComplete: user?.onboardingComplete ?? Boolean(profile),
            isPremium: user?.isPremium ?? false,
            loading: false,
          })
        } catch (error) {
          set({ loading: false })
          throw error
        }
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

      completeOnboardingPlan: async (uid, profile, preferences, rituals) => {
        await saveOnboardingPlan(uid, profile, preferences, rituals)
        set({
          profile: profile as UserProfile,
          preferences: preferences as UserPreferences,
          onboardingComplete: true,
        })
      },

      reset: () => set({ name: null, profile: null, preferences: null, onboardingComplete: false, isPremium: false }),
    }),
    {
      name: 'ritual-user-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        profile: s.profile,
        name: s.name,
        preferences: s.preferences,
        onboardingComplete: s.onboardingComplete,
        isPremium: s.isPremium,
      }),
    }
  )
)
