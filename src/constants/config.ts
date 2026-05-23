// All environment-specific config. Real Firebase credentials go in .env
export const config = {
  firebase: {
    apiKey:            process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
    authDomain:        process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
    projectId:         process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
    storageBucket:     process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
    appId:             process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
  },
  ai: {
    // Never put OpenAI key here — it lives in Cloud Functions only
    dailyGuidanceFn:   'dailyGuidance',
    cravingSupportFn:  'cravingSupport',
    overthinkingFn:    'overthinkingSupport',
    lowEnergyFn:       'lowEnergySupport',
  },
  onboarding: {
    totalSteps: 8,
  },
  checkin: {
    lowEnergyThreshold: 3,   // energy ≤ this → show Low Energy Mode banner
  },
  premium: {
    monthlyProductId: 'ritual_premium_monthly',
    annualProductId:  'ritual_premium_annual',
  },
} as const
