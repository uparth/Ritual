import { create } from 'zustand'
import {
  configureRevenueCat,
  getCurrentOffering,
  getPremiumStatus,
  isRevenueCatConfigured,
  isRevenueCatSupported,
  purchasePremiumPackage,
  restorePremiumPurchases,
} from '@/services/purchases'
import type { PurchasesOffering, PurchasesPackage } from 'react-native-purchases'

interface PremiumState {
  offering: PurchasesOffering | null
  isPremium: boolean
  loading: boolean
  error: string | null
  initialize: (uid: string) => Promise<void>
  purchase: (pkg: PurchasesPackage) => Promise<void>
  restore: () => Promise<void>
  clearError: () => void
}

function unavailableMessage(): string {
  if (!isRevenueCatSupported()) return 'Payments are available in iOS and Android builds.'
  if (!isRevenueCatConfigured()) return 'RevenueCat keys are not configured yet.'
  return 'Payments are not available right now.'
}

export const usePremiumStore = create<PremiumState>((set) => ({
  offering: null,
  isPremium: false,
  loading: false,
  error: null,

  initialize: async (uid) => {
    set({ loading: true, error: null })
    try {
      if (!isRevenueCatSupported() || !isRevenueCatConfigured()) {
        set({ loading: false, error: unavailableMessage() })
        return
      }

      await configureRevenueCat(uid)
      const [status, offering] = await Promise.all([
        getPremiumStatus(),
        getCurrentOffering(),
      ])
      set({ isPremium: status.isPremium, offering, loading: false })
    } catch {
      set({ loading: false, error: 'Could not load premium options.' })
    }
  },

  purchase: async (pkg) => {
    set({ loading: true, error: null })
    try {
      const status = await purchasePremiumPackage(pkg)
      set({ isPremium: status.isPremium, loading: false })
    } catch {
      set({ loading: false, error: 'Purchase was not completed.' })
    }
  },

  restore: async () => {
    set({ loading: true, error: null })
    try {
      const status = await restorePremiumPurchases()
      set({ isPremium: status.isPremium, loading: false })
    } catch {
      set({ loading: false, error: 'Could not restore purchases.' })
    }
  },

  clearError: () => set({ error: null }),
}))
