import { Platform } from 'react-native'
import { config } from '@/constants/config'
import type { CustomerInfo, PurchasesOffering, PurchasesPackage } from 'react-native-purchases'

type PurchasesModule = typeof import('react-native-purchases').default

export interface PremiumStatus {
  isPremium: boolean
  customerInfo: CustomerInfo | null
}

function getRevenueCatKey(): string {
  if (Platform.OS === 'ios') return config.premium.revenueCatIosKey
  if (Platform.OS === 'android') return config.premium.revenueCatAndroidKey
  return ''
}

export function isRevenueCatSupported(): boolean {
  return Platform.OS === 'ios' || Platform.OS === 'android'
}

export function isRevenueCatConfigured(): boolean {
  return getRevenueCatKey().trim().length > 0
}

async function getPurchases(): Promise<PurchasesModule> {
  const module = await import('react-native-purchases')
  return module.default
}

function hasPremiumEntitlement(customerInfo: CustomerInfo): boolean {
  return Boolean(customerInfo.entitlements.active[config.premium.entitlementId])
}

export async function configureRevenueCat(uid: string): Promise<void> {
  if (!isRevenueCatSupported() || !isRevenueCatConfigured()) return

  const Purchases = await getPurchases()
  Purchases.configure({
    apiKey: getRevenueCatKey(),
    appUserID: uid,
  })
}

export async function getPremiumStatus(): Promise<PremiumStatus> {
  if (!isRevenueCatSupported() || !isRevenueCatConfigured()) {
    return { isPremium: false, customerInfo: null }
  }

  const Purchases = await getPurchases()
  const customerInfo = await Purchases.getCustomerInfo()
  return { isPremium: hasPremiumEntitlement(customerInfo), customerInfo }
}

export async function getCurrentOffering(): Promise<PurchasesOffering | null> {
  if (!isRevenueCatSupported() || !isRevenueCatConfigured()) return null

  const Purchases = await getPurchases()
  const offerings = await Purchases.getOfferings()
  return offerings.current
}

export async function purchasePremiumPackage(pkg: PurchasesPackage): Promise<PremiumStatus> {
  const Purchases = await getPurchases()
  const { customerInfo } = await Purchases.purchasePackage(pkg)
  return { isPremium: hasPremiumEntitlement(customerInfo), customerInfo }
}

export async function restorePremiumPurchases(): Promise<PremiumStatus> {
  if (!isRevenueCatSupported() || !isRevenueCatConfigured()) {
    return { isPremium: false, customerInfo: null }
  }

  const Purchases = await getPurchases()
  const customerInfo = await Purchases.restorePurchases()
  return { isPremium: hasPremiumEntitlement(customerInfo), customerInfo }
}
