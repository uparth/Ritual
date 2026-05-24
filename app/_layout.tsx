import { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useAuthStore } from '@/stores/useAuthStore'
import { useUserStore } from '@/stores/useUserStore'
import { colors, spacing } from '@/constants/tokens'
import { Card } from '@/components/ui/Card'
import { RText } from '@/components/ui/Text'
import { firebaseSetupMessage, isFirebaseConfigured } from '@/services/firebase/config'

SplashScreen.preventAutoHideAsync().catch(() => undefined)

export default function RootLayout() {
  const { uid, authLoading, listenToAuth } = useAuthStore()
  const { loading: userLoading, fetchUser, reset } = useUserStore()

  useEffect(() => {
    const unsub = isFirebaseConfigured ? listenToAuth() : () => undefined
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
    if (!isFirebaseConfigured || (!authLoading && !userLoading)) {
      SplashScreen.hideAsync().catch(() => undefined)
    }
  }, [authLoading, userLoading])

  if (!isFirebaseConfigured) {
    return (
      <GestureHandlerRootView style={styles.root}>
        <StatusBar style="light" />
        <View style={styles.setupWrap}>
          <Card style={styles.setupCard}>
            <RText variant="h2">Firebase setup needed</RText>
            <RText variant="body" color="muted">{firebaseSetupMessage}</RText>
            <View style={styles.codeBlock}>
              <RText variant="caption">EXPO_PUBLIC_FIREBASE_API_KEY=...</RText>
              <RText variant="caption">EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...</RText>
              <RText variant="caption">EXPO_PUBLIC_FIREBASE_PROJECT_ID=...</RText>
              <RText variant="caption">EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...</RText>
              <RText variant="caption">EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...</RText>
              <RText variant="caption">EXPO_PUBLIC_FIREBASE_APP_ID=...</RText>
            </View>
          </Card>
        </View>
      </GestureHandlerRootView>
    )
  }

  if (authLoading || userLoading) return null

  return (
    <GestureHandlerRootView style={styles.root}>
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

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  setupWrap: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.screen,
  },
  setupCard: {
    gap: spacing.md,
  },
  codeBlock: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
})
