import { useEffect, useState } from 'react'
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
import { addRitual } from '@/services/firebase/firestore'
import type { UserProfile } from '@/types'

export default function PlanScreen() {
  const { answers, reset: resetOnboarding } = useOnboardingStore()
  const { completeOnboarding } = useUserStore()
  const { uid } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [planRituals, setPlanRituals] = useState<string[]>([])

  useEffect(() => {
    async function buildPlan() {
      if (!uid) return
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

      await completeOnboarding(uid, profile)
      for (const ritual of plan.rituals) {
        await addRitual(uid, ritual)
      }
      setLoading(false)
    }
    buildPlan()
  }, [])

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
          onPress={() => { resetOnboarding(); router.replace('/(tabs)/today') }}
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
  content: { flex: 1, justifyContent: 'center', gap: spacing.lg },
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
