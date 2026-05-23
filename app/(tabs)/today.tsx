import { useEffect } from 'react'
import { View, ScrollView, StyleSheet, SafeAreaView } from 'react-native'
import { router } from 'expo-router'
import { colors, spacing } from '@/constants/tokens'
import { RText } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { Divider } from '@/components/ui/Divider'
import { RitualCard } from '@/components/features/RitualCard'
import { AIMessageCard } from '@/components/features/AIMessageCard'
import { LowEnergyBanner } from '@/components/features/LowEnergyBanner'
import { copy } from '@/constants/copy'
import { useAuthStore } from '@/stores/useAuthStore'
import { useUserStore } from '@/stores/useUserStore'
import { useCheckInStore } from '@/stores/useCheckInStore'
import { useRitualStore } from '@/stores/useRitualStore'
import { useAIStore } from '@/stores/useAIStore'
import { getGreetingKey } from '@/utils/planBuilder'

export default function TodayScreen() {
  const { uid } = useAuthStore()
  const { profile } = useUserStore()
  const { todayCheckIn, fetchToday } = useCheckInStore()
  const { rituals, todayLogs, fetchRituals, fetchTodayLogs, completeRitual, skipRitual } = useRitualStore()
  const { activeSession, loading: aiLoading, fetchLatest } = useAIStore()

  const energy = todayCheckIn?.energy ?? 10
  const greetingKey = getGreetingKey()
  const name = profile?.preferredTone ? (profile as any).name ?? '' : ''

  useEffect(() => {
    if (!uid) return
    fetchToday(uid)
    fetchRituals(uid)
    fetchTodayLogs(uid)
    fetchLatest(uid)
  }, [uid])

  const todayRituals = rituals.slice(0, 3)

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <RText variant="h2">{copy.greeting[greetingKey](name || 'there')}</RText>
          <RText variant="body" color="muted">{copy.today.subtitle}</RText>
        </View>

        {/* Low Energy Banner */}
        <LowEnergyBanner
          energyLevel={energy}
          onActivate={() => router.push('/low-energy')}
        />

        {/* Check-in CTA */}
        {!todayCheckIn && (
          <Button
            label={copy.today.checkInCTA}
            onPress={() => router.push('/check-in')}
            fullWidth
            size="lg"
          />
        )}

        {/* AI Message */}
        <AIMessageCard
          session={activeSession}
          loading={aiLoading}
          onExpand={() => router.push('/(tabs)/coach')}
        />

        <Divider />

        {/* Today's Rituals */}
        <View style={styles.section}>
          <RText variant="h3">Today's rituals</RText>
          {todayRituals.length === 0 ? (
            <RText variant="body" color="muted">{copy.ritual.empty}</RText>
          ) : (
            <View style={styles.ritualList}>
              {todayRituals.map(ritual => (
                <RitualCard
                  key={ritual.ritualId}
                  ritual={ritual}
                  log={todayLogs[ritual.ritualId] ?? null}
                  lowEnergyMode={energy <= 3}
                  onComplete={() => uid && completeRitual(uid, ritual.ritualId)}
                  onSkip={(reason) => uid && skipRitual(uid, ritual.ritualId, reason)}
                  onPress={() => router.push(`/ritual/${ritual.ritualId}`)}
                />
              ))}
            </View>
          )}
        </View>

        {/* Evening CTA */}
        {todayCheckIn && (
          <Button
            label={copy.today.eveningCTA}
            onPress={() => router.push('/check-in?type=evening')}
            variant="secondary"
            fullWidth
          />
        )}

      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: {
    padding: spacing.screen,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  header: {
    gap: spacing.xs,
    paddingTop: spacing.sm,
  },
  section: {
    gap: spacing.sm,
  },
  ritualList: {
    gap: spacing.sm,
  },
})
