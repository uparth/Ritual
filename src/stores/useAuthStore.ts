import { create } from 'zustand'
import { FirebaseError } from 'firebase/app'
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

function getAuthErrorMessage(error: unknown): string {
  if (!(error instanceof FirebaseError)) {
    return 'Something went wrong. Please try again.'
  }

  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'An account already exists for this email.'
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Please check your email and password.'
    case 'auth/invalid-email':
      return 'Please enter a valid email address.'
    case 'auth/weak-password':
      return 'Please use a password with at least 8 characters.'
    case 'auth/network-request-failed':
      return 'You seem to be offline. Please try again when connected.'
    default:
      return 'Authentication failed. Please try again.'
  }
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
    } catch (error) {
      set({ error: getAuthErrorMessage(error), authLoading: false })
      throw error
    }
  },

  signUp: async (email, password, name) => {
    set({ error: null, authLoading: true })
    try {
      await signUp(email, password, name)
    } catch (error) {
      set({ error: getAuthErrorMessage(error), authLoading: false })
      throw error
    }
  },

  signOut: async () => {
    await signOut()
    set({ uid: null, email: null })
  },

  clearError: () => set({ error: null }),
}))
