import { useEffect } from 'react'
import { Redirect, Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useAuthStore } from '@/stores/useAuthStore'
import { useUserStore } from '@/stores/useUserStore'
import { colors } from '@/constants/tokens'

SplashScreen.preventAutoHideAsync().catch(() => undefined)

export default function RootLayout() {
  const { uid, authLoading, listenToAuth } = useAuthStore()
  const { onboardingComplete } = useUserStore()

  useEffect(() => {
    const unsub = listenToAuth()
    return unsub
  }, [])

  useEffect(() => {
    if (!authLoading) {
      SplashScreen.hideAsync().catch(() => undefined)
    }
  }, [authLoading])

  if (authLoading) return null

  if (!uid) return <Redirect href="/(auth)/welcome" />
  if (!onboardingComplete) return <Redirect href="/(onboarding)/step-1" />

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="check-in" options={{ presentation: 'modal' }} />
        <Stack.Screen name="low-energy" options={{ presentation: 'modal' }} />
        <Stack.Screen name="ritual/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="journal/[id]" options={{ presentation: 'modal' }} />
      </Stack>
    </GestureHandlerRootView>
  )
}
