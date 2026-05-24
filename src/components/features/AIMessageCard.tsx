import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { colors, radius, spacing, font } from '@/constants/tokens'
import { RText } from '@/components/ui/Text'
import { Skeleton } from '@/components/ui/Skeleton'
import { copy } from '@/constants/copy'
import type { AISession } from '@/types'

interface AIMessageCardProps {
  session: AISession | null
  loading: boolean
  onExpand: () => void
}

export function AIMessageCard({ session, loading, onExpand }: AIMessageCardProps) {
  if (loading) {
    return (
      <View style={styles.card}>
        <Skeleton width="60%" height={14} />
        <Skeleton width="100%" height={14} style={{ marginTop: 8 }} />
        <Skeleton width="80%" height={14} style={{ marginTop: 6 }} />
      </View>
    )
  }

  if (!session) return null

  if (session.safetyFlagged) {
    return (
      <View style={[styles.card, styles.safetyCard]}>
        <RText variant="small" style={styles.safetyText}>{copy.coach.safety}</RText>
      </View>
    )
  }

  const firstSentence = session.response.split('. ')[0] + '.'

  return (
    <TouchableOpacity onPress={onExpand} activeOpacity={0.8} style={styles.card}>
      <View style={styles.badge}>
        <RText variant="caption" color="primary" style={{ fontFamily: font.family.semibold }}>AI Coach</RText>
      </View>
      <RText variant="body" style={styles.message}>{firstSentence}</RText>
      <RText variant="small" color="primary" style={styles.more}>Read more →</RText>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primaryTint,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.25)',
    padding: spacing.md,
    gap: spacing.sm,
  },
  safetyCard: {
    backgroundColor: colors.warningTint,
    borderColor: 'rgba(251,191,36,0.3)',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(167,139,250,0.15)',
    borderRadius: radius.chip,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  message: {
    color: colors.textSecondary,
    lineHeight: 22,
  },
  more: {
    fontFamily: font.family.semibold,
  },
  safetyText: {
    color: colors.warning,
    lineHeight: 20,
  },
})
