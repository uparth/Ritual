import { StyleSheet, View } from 'react-native'
import { Card } from '@/components/ui/Card'
import { RText } from '@/components/ui/Text'
import { colors, spacing } from '@/constants/tokens'
import type { RitualConsistencySummary } from '@/stores/useProgressStore'
import type { WeeklyInsight } from '@/types'

interface WeeklyInsightCardProps {
  insight: WeeklyInsight | null
  fallbackInsight: string | null
  consistency: RitualConsistencySummary
}

export function WeeklyInsightCard({ insight, fallbackInsight, consistency }: WeeklyInsightCardProps) {
  const message = insight?.aiSummary ?? insight?.topPattern ?? fallbackInsight

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.badge}>
          <RText variant="small" style={styles.badgeText}>Weekly</RText>
        </View>
        <RText variant="small" color="muted">
          {consistency.total > 0 ? `${consistency.completed}/${consistency.total} rituals complete` : 'No ritual logs yet'}
        </RText>
      </View>

      <View style={styles.body}>
        <RText variant="h3">Insight</RText>
        <RText variant="body" color={message ? 'secondary' : 'muted'}>
          {message ?? 'Complete more check-ins and rituals to unlock your first weekly pattern.'}
        </RText>
      </View>

      <View style={styles.meterTrack}>
        <View style={[styles.meterFill, { width: `${consistency.percentage}%` }]} />
      </View>
      <RText variant="caption" color="muted">Ritual consistency: {consistency.percentage}%</RText>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  badge: {
    backgroundColor: colors.primaryTint,
    borderColor: colors.primary,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    color: colors.primary,
  },
  body: {
    gap: spacing.sm,
  },
  meterTrack: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    height: 10,
    overflow: 'hidden',
  },
  meterFill: {
    backgroundColor: colors.success,
    height: '100%',
  },
})
