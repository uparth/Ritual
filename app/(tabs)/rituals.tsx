import { useEffect } from 'react'
import { View, ScrollView, StyleSheet, SafeAreaView } from 'react-native'
import { router } from 'expo-router'
import { colors, spacing } from '@/constants/tokens'
import { RText } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { RitualCard } from '@/components/features/RitualCard'
import { copy } from '@/constants/copy'
import { useAuthStore } from '@/stores/useAuthStore'
import { useRitualStore } from '@/stores/useRitualStore'
import { useCheckInStore } from '@/stores/useCheckInStore'

export default function RitualsScreen() {
  const { uid } = useAuthStore()
  const { rituals, todayLogs, fetchRituals, fetchTodayLogs, completeRitual, skipRitual } = useRitualStore()
  const { todayCheckIn } = useCheckInStore()
  const energy = todayCheckIn?.energy ?? 10

  useEffect(() => {
    if (!uid) return
    fetchRituals(uid)
    fetchTodayLogs(uid)
  }, [uid])

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <RText variant="h2">Rituals</RText>
          <RText variant="body" color="muted">Your daily practice, one step at a time.</RText>
        </View>

        <Button
          label={copy.ritual.add}
          onPress={() => router.push('/ritual/new')}
          variant="secondary"
          fullWidth
        />

        <View style={styles.list}>
          {rituals.length === 0 ? (
            <RText variant="body" color="muted">{copy.ritual.empty}</RText>
          ) : (
            rituals.map(ritual => (
              <RitualCard
                key={ritual.ritualId}
                ritual={ritual}
                log={todayLogs[ritual.ritualId] ?? null}
                lowEnergyMode={energy <= 3}
                onComplete={() => uid && completeRitual(uid, ritual.ritualId)}
                onSkip={(reason) => uid && skipRitual(uid, ritual.ritualId, reason)}
                onPress={() => router.push(`/ritual/${ritual.ritualId}`)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.screen, gap: spacing.md, paddingBottom: spacing.xxl },
  header: { gap: spacing.xs, paddingTop: spacing.sm },
  list: { gap: spacing.sm },
})
