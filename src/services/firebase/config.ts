import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getFunctions, type Functions } from 'firebase/functions'
import { config } from '@/constants/config'

export const firebaseSetupMessage =
  'Firebase is not configured. Create a .env file with your EXPO_PUBLIC_FIREBASE_* values, then restart Expo.'

export const isFirebaseConfigured = Object.values(config.firebase).every(value => value.trim().length > 0)

const app: FirebaseApp | null = isFirebaseConfigured
  ? getApps().length ? getApp() : initializeApp(config.firebase)
  : null

const auth: Auth | null = app ? getAuth(app) : null
const db: Firestore | null = app ? getFirestore(app) : null
const functions: Functions | null = app ? getFunctions(app) : null

export function requireFirebaseAuth(): Auth {
  if (!auth) throw new Error(firebaseSetupMessage)
  return auth
}

export function requireFirestore(): Firestore {
  if (!db) throw new Error(firebaseSetupMessage)
  return db
}

export function requireFunctions(): Functions {
  if (!functions) throw new Error(firebaseSetupMessage)
  return functions
}

export function getOptionalFirebaseAuth(): Auth | null {
  return auth
}
