import { useCallback, useEffect, useRef, useState } from 'react'
import { View, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import { colors, spacing } from '@/constants/tokens'
import { RText } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { copy } from '@/constants/copy'
import { useOnboardingStore } from '@/stores/useOnboardingStore'
import { useUserStore } from '@/stores/useUserStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { buildRitualPlan } from '@/utils/planBuilder'
import type { UserPreferences, UserProfile } from '@/types'

export default function PlanScreen() {
  const { answers, reset: resetOnboarding } = useOnboardingStore()
  const { completeOnboardingPlan } = useUserStore()
  const { uid } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [planRituals, setPlanRituals] = useState<string[]>([])
  const didBuildPlan = useRef(false)

  const buildPlan = useCallback(async () => {
    if (!uid) {
      setError('Please sign in again before building your plan.')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const plan = buildRitualPlan(answers)
      setPlanRituals(plan.ritualTitles)

      const profile: Omit<UserProfile, 'updatedAt'> = {
        primaryGoal: answers.primaryGoal ?? 'both',
        currentWeightKg: null,
        targetWeightKg: null,
        heightCm: null,
        age: null,
        stressLevel: answers.energyLevel ? 11 - answers.energyLevel : 5,
        sleepQualityLevel: answers.sleepHours ? Math.round((answers.sleepHours / 12) * 10) : 5,
        movementLevel: answers.movementLevel ?? 'none',
        cravingPattern: answers.cravingLevel && answers.cravingLevel >= 7 ? 'stress' : 'none',
        spiritualPractice: answers.spiritualPractice ?? 'sometimes',
        preferredTone: answers.preferredTone ?? 'gentle',
        struggles: answers.struggles ?? [],
      }

      const preferences: Omit<UserPreferences, 'updatedAt'> = {
        morningCheckInTime: '07:30',
        eveningReflectionTime: '21:00',
        notificationsEnabled: false,
        lowEnergyModeActive: false,
        language: 'en',
      }

      await completeOnboardingPlan(uid, profile, preferences, plan.rituals)
      setLoading(false)
    } catch {
      setError('We could not save your plan yet. Please try again.')
      setLoading(false)
    }
  }, [answers, completeOnboardingPlan, uid])

  useEffect(() => {
    if (didBuildPlan.current) return
    didBuildPlan.current = true
    buildPlan()
  }, [buildPlan])

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
          <RText variant="body" color="muted" style={{ marginTop: spacing.md }}>{copy.onboarding.plan.loading}</RText>
        </View>
      </SafeAreaView>
    )
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <View style={styles.centerContent}>
            <Card style={styles.errorCard}>
              <RText variant="h3" color="error">Something needs attention</RText>
              <RText variant="body" color="muted" style={styles.errorText}>{error}</RText>
            </Card>
          </View>

          <View style={styles.buttons}>
            <Button
              label="Back"
              onPress={() => router.back()}
              variant="ghost"
              style={{ flex: 1 }}
            />
            <Button
              label="Try again"
              onPress={buildPlan}
              style={{ flex: 2 }}
            />
          </View>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.content}>
          <RText variant="h2">{copy.onboarding.plan.headline}</RText>
          <RText variant="body" color="muted">{copy.onboarding.plan.subline}</RText>

          <View style={styles.list}>
            {planRituals.map((title, i) => (
              <Card key={i} style={styles.ritualPreview}>
                <View style={styles.dot} />
                <RText variant="body">{title}</RText>
              </Card>
            ))}
          </View>
        </View>

        <Button
          label={copy.onboarding.plan.cta}
          onPress={() => { resetOnboarding(); router.replace('/today') }}
          fullWidth
          size="lg"
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, padding: spacing.screen, justifyContent: 'space-between', paddingBottom: spacing.xxl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  centerContent: { flex: 1, justifyContent: 'center' },
  content: { flex: 1, justifyContent: 'center', gap: spacing.lg },
  buttons: { flexDirection: 'row', gap: spacing.sm },
  errorCard: {
    gap: spacing.sm,
  },
  errorText: {
    lineHeight: 24,
  },
  list: { gap: spacing.sm },
  ritualPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
})
