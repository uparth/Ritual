import {
  doc,
  collection,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './config'
import type { UserDoc, UserProfile, UserPreferences, DailyCheckIn, CheckInFormData, Ritual, RitualLog, AISession, JournalEntry, WeeklyInsight } from '@/types'

// ── User ─────────────────────────────────────────────────────────────────────

export async function getUserDoc(uid: string): Promise<UserDoc | null> {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? (snap.data() as UserDoc) : null
}

// ── Profile ──────────────────────────────────────────────────────────────────

export async function getProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid, 'profile', 'main'))
  return snap.exists() ? (snap.data() as UserProfile) : null
}

export async function setProfile(uid: string, profile: Omit<UserProfile, 'updatedAt'>): Promise<void> {
  await setDoc(doc(db, 'users', uid, 'profile', 'main'), { ...profile, updatedAt: serverTimestamp() })
}

export async function updateProfile(uid: string, patch: Partial<UserProfile>): Promise<void> {
  await updateDoc(doc(db, 'users', uid, 'profile', 'main'), { ...patch, updatedAt: serverTimestamp() })
}

// ── Preferences ──────────────────────────────────────────────────────────────

export async function getPreferences(uid: string): Promise<UserPreferences | null> {
  const snap = await getDoc(doc(db, 'users', uid, 'preferences', 'main'))
  return snap.exists() ? (snap.data() as UserPreferences) : null
}

export async function setPreferences(uid: string, prefs: Omit<UserPreferences, 'updatedAt'>): Promise<void> {
  await setDoc(doc(db, 'users', uid, 'preferences', 'main'), { ...prefs, updatedAt: serverTimestamp() })
}

// ── Check-ins ─────────────────────────────────────────────────────────────────

export async function getCheckIn(uid: string, date: string): Promise<DailyCheckIn | null> {
  const snap = await getDoc(doc(db, 'users', uid, 'daily_checkins', date))
  return snap.exists() ? (snap.data() as DailyCheckIn) : null
}

export async function getRecentCheckIns(uid: string, count = 14): Promise<DailyCheckIn[]> {
  const snap = await getDocs(
    query(collection(db, 'users', uid, 'daily_checkins'), orderBy('date', 'desc'), limit(count))
  )
  return snap.docs.map(d => d.data() as DailyCheckIn).reverse()
}

export async function saveCheckIn(uid: string, checkIn: CheckInFormData): Promise<void> {
  const ref = doc(db, 'users', uid, 'daily_checkins', checkIn.date)
  const payload = { ...checkIn, aiSessionId: null }
  const existing = await getDoc(ref)
  if (existing.exists()) {
    await updateDoc(ref, { ...payload, updatedAt: serverTimestamp() })
  } else {
    await setDoc(ref, { ...payload, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
  }
}

// ── Rituals ───────────────────────────────────────────────────────────────────

export async function getRituals(uid: string): Promise<Ritual[]> {
  const snap = await getDocs(
    query(collection(db, 'users', uid, 'rituals'), where('isActive', '==', true), orderBy('order'))
  )
  return snap.docs.map(d => d.data() as Ritual)
}

export async function addRitual(uid: string, ritual: Omit<Ritual, 'ritualId' | 'createdAt'>): Promise<string> {
  const ref = doc(collection(db, 'users', uid, 'rituals'))
  await setDoc(ref, { ...ritual, ritualId: ref.id, createdAt: serverTimestamp() })
  return ref.id
}

export async function updateRitual(uid: string, ritualId: string, patch: Partial<Ritual>): Promise<void> {
  await updateDoc(doc(db, 'users', uid, 'rituals', ritualId), patch)
}

// ── Ritual Logs ───────────────────────────────────────────────────────────────

export async function getTodayLogs(uid: string, date: string): Promise<RitualLog[]> {
  const snap = await getDocs(
    query(collection(db, 'users', uid, 'ritual_logs'), where('date', '==', date))
  )
  return snap.docs.map(d => d.data() as RitualLog)
}

export async function getRitualLogsInRange(uid: string, startDate: string, endDate: string): Promise<RitualLog[]> {
  const snap = await getDocs(
    query(
      collection(db, 'users', uid, 'ritual_logs'),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'asc'),
    )
  )
  return snap.docs.map(d => d.data() as RitualLog)
}

export async function writeRitualLog(uid: string, log: Omit<RitualLog, 'logId'>): Promise<string> {
  const logId = `${log.date}_${log.ritualId}`
  const ref = doc(db, 'users', uid, 'ritual_logs', logId)
  await setDoc(ref, { ...log, logId }, { merge: true })
  return logId
}

// ── AI Sessions ───────────────────────────────────────────────────────────────

export async function saveAISession(uid: string, session: Omit<AISession, 'sessionId'>): Promise<string> {
  const ref = doc(collection(db, 'users', uid, 'ai_sessions'))
  await setDoc(ref, { ...session, sessionId: ref.id })
  return ref.id
}

export async function getLatestAISession(uid: string): Promise<AISession | null> {
  const snap = await getDocs(
    query(collection(db, 'users', uid, 'ai_sessions'), orderBy('createdAt', 'desc'), limit(1))
  )
  if (snap.empty) return null
  return snap.docs[0].data() as AISession
}

export async function getAISessions(uid: string, count = 20): Promise<AISession[]> {
  const snap = await getDocs(
    query(collection(db, 'users', uid, 'ai_sessions'), orderBy('createdAt', 'desc'), limit(count))
  )
  return snap.docs.map(d => d.data() as AISession)
}

// ── Journal ───────────────────────────────────────────────────────────────────

export async function saveJournalEntry(uid: string, entry: Omit<JournalEntry, 'entryId' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const ref = doc(collection(db, 'users', uid, 'journal_entries'))
  await setDoc(ref, { ...entry, entryId: ref.id, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
  return ref.id
}

export async function updateJournalEntry(uid: string, entryId: string, body: string): Promise<void> {
  await updateDoc(doc(db, 'users', uid, 'journal_entries', entryId), { body, updatedAt: serverTimestamp() })
}

// ── Weight Logs ───────────────────────────────────────────────────────────────

export async function logWeight(uid: string, date: string, weightKg: number, note: string | null): Promise<void> {
  await setDoc(doc(db, 'users', uid, 'weight_logs', date), {
    date, weightKg, note, createdAt: serverTimestamp(),
  })
}

// ── Insights ──────────────────────────────────────────────────────────────────

export async function getInsight(uid: string, weekId: string): Promise<WeeklyInsight | null> {
  const snap = await getDoc(doc(db, 'users', uid, 'insights', weekId))
  return snap.exists() ? (snap.data() as WeeklyInsight) : null
}

export async function getLatestInsight(uid: string): Promise<WeeklyInsight | null> {
  const snap = await getDocs(
    query(collection(db, 'users', uid, 'insights'), orderBy('generatedAt', 'desc'), limit(1))
  )
  if (snap.empty) return null
  return snap.docs[0].data() as WeeklyInsight
}

export async function markOnboardingComplete(uid: string): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { onboardingComplete: true })
}

export async function saveOnboardingPlan(
  uid: string,
  profile: Omit<UserProfile, 'updatedAt'>,
  preferences: Omit<UserPreferences, 'updatedAt'>,
  rituals: Omit<Ritual, 'ritualId' | 'createdAt'>[],
): Promise<void> {
  const batch = writeBatch(db)
  const timestamp = serverTimestamp()

  batch.set(doc(db, 'users', uid, 'profile', 'main'), {
    ...profile,
    updatedAt: timestamp,
  })

  batch.set(doc(db, 'users', uid, 'preferences', 'main'), {
    ...preferences,
    updatedAt: timestamp,
  })

  rituals.forEach((ritual) => {
    const ritualId = `starter-${ritual.order}`
    batch.set(doc(db, 'users', uid, 'rituals', ritualId), {
      ...ritual,
      ritualId,
      createdAt: timestamp,
    })
  })

  batch.set(
    doc(db, 'users', uid),
    {
      onboardingComplete: true,
      updatedAt: timestamp,
    },
    { merge: true },
  )

  await batch.commit()
}
