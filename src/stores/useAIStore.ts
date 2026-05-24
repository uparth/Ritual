import { create } from 'zustand'
import { serverTimestamp } from 'firebase/firestore'
import { callAI } from '@/services/firebase/functions'
import { saveAISession, getAISessions, getLatestAISession } from '@/services/firebase/firestore'
import type { AIMode, AIInputContext, AISession } from '@/types'

interface AIState {
  activeSession: AISession | null
  sessions: AISession[]
  loading: boolean
  error: string | null
  fetchLatest: (uid: string) => Promise<void>
  fetchHistory: (uid: string) => Promise<void>
  request: (uid: string, mode: AIMode, context: AIInputContext) => Promise<void>
  clearSession: () => void
  clearError: () => void
}

export const useAIStore = create<AIState>((set) => ({
  activeSession: null,
  sessions: [],
  loading: false,
  error: null,

  fetchLatest: async (uid) => {
    try {
      const session = await getLatestAISession(uid)
      set({ activeSession: session, error: null })
    } catch {
      set({ error: 'Could not load your latest coach message.' })
    }
  },

  fetchHistory: async (uid) => {
    try {
      const sessions = await getAISessions(uid)
      set({ sessions, activeSession: sessions[0] ?? null, error: null })
    } catch {
      set({ error: 'Could not load coach history.' })
    }
  },

  request: async (uid, mode, context) => {
    set({ loading: true, error: null })
    try {
      const result = await callAI({ mode, context })
      const sessionPayload: Omit<AISession, 'sessionId'> = {
        mode,
        inputContext: context,
        response: result.response,
        safetyFlagged: result.safetyFlagged,
        safetyResponse: result.safetyResponse,
        model: result.model,
        tokensUsed: result.tokensUsed,
        createdAt: serverTimestamp() as any,
      }
      const sessionId = await saveAISession(uid, sessionPayload)
      const session = { ...sessionPayload, sessionId }
      set(s => ({
        activeSession: session,
        sessions: [session, ...s.sessions.filter(item => item.sessionId !== sessionId)],
        loading: false,
      }))
    } catch {
      set({ error: 'Coach is not available yet. Please try again after Cloud Functions are configured.', loading: false })
    }
  },

  clearSession: () => set({ activeSession: null, sessions: [] }),
  clearError: () => set({ error: null }),
}))
