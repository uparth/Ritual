import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { colors, radius, spacing, font } from '@/constants/tokens'
import { RText } from '@/components/ui/Text'
import type { Ritual, RitualLog, LogStatus } from '@/types'

interface RitualCardProps {
  ritual: Ritual
  log: RitualLog | null
  lowEnergyMode?: boolean
  onComplete: () => void
  onSkip: (reason?: string) => void
  onPress: () => void
}

const typeColor: Record<string, string> = {
  mind:       colors.primary,
  body:       colors.secondary,
  food:       colors.success,
  sleep:      '#818CF8',
  spiritual:  colors.warning,
  creative:   '#F472B6',
  reflection: colors.subtle,
}

const statusIcon: Record<LogStatus, string> = {
  completed: '✓',
  skipped:   '–',
  partial:   '◑',
}

export function RitualCard({
  ritual,
  log,
  lowEnergyMode = false,
  onComplete,
  onSkip,
  onPress,
}: RitualCardProps) {
  const status = log?.status ?? null
  const accent  = typeColor[ritual.type] ?? colors.primary
  const displayText = lowEnergyMode && ritual.lowEnergyAlternative
    ? ritual.lowEnergyAlternative
    : ritual.title

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={[styles.card, status === 'completed' && styles.cardDone]}>
      <View style={[styles.accent, { backgroundColor: accent }]} />
      <View style={styles.content}>
        <View style={styles.meta}>
          <RText variant="caption" style={{ color: accent, fontFamily: 'Inter-Medium', textTransform: 'uppercase', letterSpacing: 0.6 }}>
            {ritual.type}
          </RText>
          {ritual.durationMinutes > 0 && (
            <RText variant="caption" color="muted">{ritual.durationMinutes} min</RText>
          )}
        </View>
        <RText
          variant="body"
          style={[styles.title, status === 'completed' && styles.titleDone]}
        >
          {displayText}
        </RText>
        {status === 'skipped' && (
          <RText variant="caption" color="muted">Rested today</RText>
        )}
      </View>
      <View style={styles.actions}>
        {status ? (
          <View style={[styles.statusBadge, status === 'completed' ? styles.completedBadge : styles.skippedBadge]}>
            <RText style={[styles.statusIcon, { color: status === 'completed' ? colors.success : colors.muted }]}>
              {statusIcon[status]}
            </RText>
          </View>
        ) : (
          <View style={styles.actionRow}>
            <TouchableOpacity onPress={() => onSkip()} style={styles.skipBtn} hitSlop={8}>
              <RText variant="caption" color="muted">Rest</RText>
            </TouchableOpacity>
            <TouchableOpacity onPress={onComplete} style={styles.doneBtn} hitSlop={8}>
              <RText variant="caption" style={{ color: colors.success, fontFamily: 'Inter-SemiBold' }}>Done</RText>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  cardDone: {
    opacity: 0.6,
  },
  accent: {
    width: 4,
    borderTopLeftRadius: radius.card,
    borderBottomLeftRadius: radius.card,
  },
  content: {
    flex: 1,
    padding: spacing.md,
    gap: 4,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Inter-SemiBold',
  },
  titleDone: {
    textDecorationLine: 'line-through',
    color: colors.muted,
  },
  actions: {
    padding: spacing.md,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  actionRow: {
    gap: spacing.sm,
    alignItems: 'center',
  },
  skipBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  doneBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.success,
  },
  statusBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedBadge: {
    backgroundColor: colors.successTint,
    borderWidth: 1,
    borderColor: colors.success,
  },
  skippedBadge: {
    backgroundColor: colors.surface3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusIcon: {
    fontSize: font.size.body,
    fontFamily: 'Inter-Bold',
  },
})
