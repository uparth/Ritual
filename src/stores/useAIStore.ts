import { create } from 'zustand'
import { serverTimestamp } from 'firebase/firestore'
import { callAI } from '@/services/firebase/functions'
import { saveAISession, getLatestAISession } from '@/services/firebase/firestore'
import type { AIMode, AIInputContext, AISession } from '@/types'

interface AIState {
  activeSession: AISession | null
  loading: boolean
  error: string | null
  fetchLatest: (uid: string) => Promise<void>
  request: (uid: string, mode: AIMode, context: AIInputContext) => Promise<void>
  clearSession: () => void
  clearError: () => void
}

export const useAIStore = create<AIState>((set) => ({
  activeSession: null,
  loading: false,
  error: null,

  fetchLatest: async (uid) => {
    const session = await getLatestAISession(uid)
    set({ activeSession: session })
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
      set({ activeSession: { ...sessionPayload, sessionId }, loading: false })
    } catch (e: any) {
      set({ error: e.message ?? 'AI request failed', loading: false })
    }
  },

  clearSession: () => set({ activeSession: null }),
  clearError: () => set({ error: null }),
}))
