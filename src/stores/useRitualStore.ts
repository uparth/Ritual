import { create } from 'zustand'
import { serverTimestamp } from 'firebase/firestore'
import { getRituals, getTodayLogs, addRitual, updateRitual, writeRitualLog } from '@/services/firebase/firestore'
import type { Ritual, RitualLog } from '@/types'

function todayDateString() {
  return new Date().toISOString().split('T')[0]
}

interface RitualState {
  rituals: Ritual[]
  todayLogs: Record<string, RitualLog>  // keyed by ritualId
  loading: boolean
  error: string | null
  fetchRituals: (uid: string) => Promise<void>
  fetchTodayLogs: (uid: string) => Promise<void>
  completeRitual: (uid: string, ritualId: string) => Promise<void>
  skipRitual: (uid: string, ritualId: string, reason?: string) => Promise<void>
  addRitual: (uid: string, ritual: Omit<Ritual, 'ritualId' | 'createdAt'>) => Promise<void>
  updateRitual: (uid: string, ritualId: string, patch: Partial<Ritual>) => Promise<void>
  clearError: () => void
}

export const useRitualStore = create<RitualState>((set, get) => ({
  rituals: [],
  todayLogs: {},
  loading: false,
  error: null,

  fetchRituals: async (uid) => {
    set({ loading: true, error: null })
    try {
      const rituals = await getRituals(uid)
      set({ rituals, loading: false })
    } catch {
      set({ error: 'Could not load today’s rituals.', loading: false })
    }
  },

  fetchTodayLogs: async (uid) => {
    try {
      const logs = await getTodayLogs(uid, todayDateString())
      const map: Record<string, RitualLog> = {}
      logs.forEach(l => { map[l.ritualId] = l })
      set({ todayLogs: map, error: null })
    } catch {
      set({ error: 'Could not load ritual progress.' })
    }
  },

  completeRitual: async (uid, ritualId) => {
    const previous = get().todayLogs[ritualId] ?? null
    const optimistic: RitualLog = {
      logId: `${todayDateString()}_${ritualId}`,
      ritualId,
      date: todayDateString(),
      status: 'completed',
      skipReason: null,
      durationActualMinutes: null,
      note: null,
      completedAt: serverTimestamp() as any,
    }
    set(s => ({ todayLogs: { ...s.todayLogs, [ritualId]: optimistic } }))
    try {
      const logId = await writeRitualLog(uid, optimistic)
      set(s => ({
        todayLogs: { ...s.todayLogs, [ritualId]: { ...optimistic, logId } },
        error: null,
      }))
    } catch {
      set(s => {
        const logs = { ...s.todayLogs }
        if (previous) {
          logs[ritualId] = previous
        } else {
          delete logs[ritualId]
        }
        return { todayLogs: logs, error: 'Could not save ritual completion.' }
      })
      throw new Error('Could not save ritual completion')
    }
  },

  skipRitual: async (uid, ritualId, reason) => {
    const previous = get().todayLogs[ritualId] ?? null
    const optimistic: RitualLog = {
      logId: `${todayDateString()}_${ritualId}`,
      ritualId,
      date: todayDateString(),
      status: 'skipped',
      skipReason: reason ?? null,
      durationActualMinutes: null,
      note: null,
      completedAt: serverTimestamp() as any,
    }
    set(s => ({ todayLogs: { ...s.todayLogs, [ritualId]: optimistic } }))
    try {
      const logId = await writeRitualLog(uid, optimistic)
      set(s => ({
        todayLogs: { ...s.todayLogs, [ritualId]: { ...optimistic, logId } },
        error: null,
      }))
    } catch {
      set(s => {
        const logs = { ...s.todayLogs }
        if (previous) {
          logs[ritualId] = previous
        } else {
          delete logs[ritualId]
        }
        return { todayLogs: logs, error: 'Could not save ritual rest day.' }
      })
      throw new Error('Could not save ritual skip')
    }
  },

  addRitual: async (uid, ritual) => {
    const id = await addRitual(uid, ritual)
    await get().fetchRituals(uid)
  },

  updateRitual: async (uid, ritualId, patch) => {
    await updateRitual(uid, ritualId, patch)
    set(s => ({
      rituals: s.rituals.map(r => r.ritualId === ritualId ? { ...r, ...patch } : r),
    }))
  },

  clearError: () => set({ error: null }),
}))
