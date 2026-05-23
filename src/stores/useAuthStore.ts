import { create } from 'zustand'
import { signIn, signUp, signOut, listenAuth } from '@/services/firebase/auth'

interface AuthState {
  uid: string | null
  email: string | null
  authLoading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => Promise<void>
  listenToAuth: () => () => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  uid: null,
  email: null,
  authLoading: true,
  error: null,

  listenToAuth: () => {
    return listenAuth((user) => {
      set({ uid: user?.uid ?? null, email: user?.email ?? null, authLoading: false })
    })
  },

  signIn: async (email, password) => {
    set({ error: null, authLoading: true })
    try {
      await signIn(email, password)
    } catch (e: any) {
      set({ error: e.message ?? 'Sign in failed', authLoading: false })
      throw e
    }
  },

  signUp: async (email, password, name) => {
    set({ error: null, authLoading: true })
    try {
      await signUp(email, password, name)
    } catch (e: any) {
      set({ error: e.message ?? 'Sign up failed', authLoading: false })
      throw e
    }
  },

  signOut: async () => {
    await signOut()
    set({ uid: null, email: null })
  },

  clearError: () => set({ error: null }),
}))
