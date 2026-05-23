import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from './config'

export async function signUp(email: string, password: string, name: string): Promise<User> {
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  await setDoc(doc(db, 'users', cred.user.uid), {
    uid: cred.user.uid,
    email,
    name,
    createdAt: serverTimestamp(),
    onboardingComplete: false,
    isPremium: false,
    premiumExpiresAt: null,
  })
  return cred.user
}

export async function signIn(email: string, password: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email, password)
  return cred.user
}

export async function signOut(): Promise<void> {
  await fbSignOut(auth)
}

export function listenAuth(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback)
}
