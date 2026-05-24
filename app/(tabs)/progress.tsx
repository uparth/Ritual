import { useEffect, useMemo } from 'react'
import { View, ScrollView, StyleSheet, SafeAreaView } from 'react-native'
import { colors, spacing } from '@/constants/tokens'
import { RText } from '@/components/ui/Text'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { ProgressGraph, WeeklyInsightCard } from '@/components/features'
import { useAuthStore } from '@/stores/useAuthStore'
import {
  buildLocalInsight,
  getRitualConsistency,
  toProgressPoints,
  useProgressStore,
} from '@/stores/useProgressStore'

export default function ProgressScreen() {
  const uid = useAuthStore(s => s.uid)
  const checkIns = useProgressStore(s => s.checkIns)
  const ritualLogs = useProgressStore(s => s.ritualLogs)
  const insight = useProgressStore(s => s.insight)
  const loading = useProgressStore(s => s.loading)
  const error = useProgressStore(s => s.error)
  const fetchProgress = useProgressStore(s => s.fetchProgress)

  useEffect(() => {
    if (!uid) return
    fetchProgress(uid)
  }, [fetchProgress, uid])

  const moodPoints = useMemo(() => toProgressPoints(checkIns, 'mood'), [checkIns])
  const sleepPoints = useMemo(() => toProgressPoints(checkIns, 'sleepHours'), [checkIns])
  const cravingPoints = useMemo(() => toProgressPoints(checkIns, 'cravings'), [checkIns])
  const weightPoints = useMemo(() => toProgressPoints(checkIns, 'weightKg'), [checkIns])
  const consistency = useMemo(() => getRitualConsistency(ritualLogs), [ritualLogs])
  const localInsight = useMemo(() => buildLocalInsight(checkIns, ritualLogs), [checkIns, ritualLogs])
  const hasProgress = checkIns.length > 0 || ritualLogs.length > 0

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <RText variant="h2">Progress</RText>
          <RText variant="body" color="muted">Your patterns over time.</RText>
        </View>

        {loading ? (
          <ProgressSkeleton />
        ) : error ? (
          <Card style={styles.messageCard}>
            <RText variant="body" color="error">{error}</RText>
            {uid ? (
              <Button label="Try again" variant="secondary" onPress={() => fetchProgress(uid)} />
            ) : null}
          </Card>
        ) : hasProgress ? (
          <>
            <WeeklyInsightCard
              insight={insight}
              fallbackInsight={localInsight}
              consistency={consistency}
            />

            <ProgressGraph
              title="Mood"
              subtitle="Daily check-in score"
              points={moodPoints}
              color={colors.primary}
              maxValue={10}
            />

            <ProgressGraph
              title="Sleep"
              subtitle="Hours logged"
              points={sleepPoints}
              color={colors.secondary}
              maxValue={12}
              suffix="h"
            />

            <ProgressGraph
              title="Cravings"
              subtitle="Lower is easier"
              points={cravingPoints}
              color={colors.warning}
              maxValue={10}
            />

            <ProgressGraph
              title="Weight"
              subtitle="Morning check-in"
              points={weightPoints}
              color={colors.success}
              suffix="kg"
            />
          </>
        ) : (
          <Card style={styles.messageCard}>
            <RText variant="body" color="muted" style={styles.centerText}>
              Complete a few check-ins to see your progress graphs here.
            </RText>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

function ProgressSkeleton() {
  return (
    <>
      <Card style={styles.skeletonCard}>
        <Skeleton width="38%" height={18} />
        <Skeleton width="84%" height={16} />
        <Skeleton width="100%" height={10} />
      </Card>
      {[0, 1, 2].map(item => (
        <Card key={item} style={styles.skeletonCard}>
          <Skeleton width="44%" height={20} />
          <Skeleton width="60%" height={14} />
          <Skeleton width="100%" height={132} />
        </Card>
      ))}
    </>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.screen, gap: spacing.md, paddingBottom: spacing.xxl },
  header: { gap: spacing.xs, paddingTop: spacing.sm },
  messageCard: { gap: spacing.md },
  centerText: { textAlign: 'center', paddingVertical: spacing.lg },
  skeletonCard: { gap: spacing.md },
})
