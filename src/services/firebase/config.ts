import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getFunctions } from 'firebase/functions'
import { config } from '@/constants/config'

const app = getApps().length ? getApp() : initializeApp(config.firebase)

export const auth      = getAuth(app)
export const db        = getFirestore(app)
export const functions = getFunctions(app)
