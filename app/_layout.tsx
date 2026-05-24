import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useAuthStore } from '@/stores/useAuthStore'
import { useUserStore } from '@/stores/useUserStore'
import { colors } from '@/constants/tokens'

SplashScreen.preventAutoHideAsync().catch(() => undefined)

export default function RootLayout() {
  const { uid, authLoading, listenToAuth } = useAuthStore()
  const { loading: userLoading, fetchUser, reset } = useUserStore()

  useEffect(() => {
    const unsub = listenToAuth()
    return unsub
  }, [])

  useEffect(() => {
    if (!uid) {
      reset()
      return
    }

    fetchUser(uid).catch(() => undefined)
  }, [uid, fetchUser, reset])

  useEffect(() => {
    if (!authLoading && !userLoading) {
      SplashScreen.hideAsync().catch(() => undefined)
    }
  }, [authLoading, userLoading])

  if (authLoading || userLoading) return null

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="check-in" options={{ presentation: 'modal' }} />
        <Stack.Screen name="low-energy" options={{ presentation: 'modal' }} />
        <Stack.Screen name="ritual/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="journal/[id]" options={{ presentation: 'modal' }} />
      </Stack>
    </GestureHandlerRootView>
  )
}
