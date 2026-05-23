import { View, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native'
import { colors, spacing, radius } from '@/constants/tokens'
import { RText } from '@/components/ui/Text'
import { Card } from '@/components/ui/Card'
import { AIMessageCard } from '@/components/features/AIMessageCard'
import { copy } from '@/constants/copy'
import { useAuthStore } from '@/stores/useAuthStore'
import { useAIStore } from '@/stores/useAIStore'
import { useCheckInStore } from '@/stores/useCheckInStore'
import type { AIMode } from '@/types'

const modes: { mode: AIMode; label: string; icon: string }[] = [
  { mode: 'overthinking',    label: copy.coach.modes.overthinking, icon: '🌀' },
  { mode: 'low_energy',      label: copy.coach.modes.heavy,        icon: '🌫' },
  { mode: 'craving_support', label: copy.coach.modes.binge,        icon: '🍃' },
  { mode: 'guilt',           label: copy.coach.modes.guilty,       icon: '💧' },
  { mode: 'cant_sleep',      label: copy.coach.modes.sleep,        icon: '🌙' },
  { mode: 'daily_guidance',  label: copy.coach.modes.nextStep,     icon: '→'  },
  { mode: 'motivation',      label: copy.coach.modes.motivation,   icon: '✦'  },
]

export default function CoachScreen() {
  const { uid } = useAuthStore()
  const { activeSession, loading, request } = useAIStore()
  const { todayCheckIn } = useCheckInStore()

  function handleMode(mode: AIMode) {
    if (!uid) return
    request(uid, mode, {
      checkInDate: todayCheckIn?.date ?? null,
      mood: todayCheckIn?.mood ?? null,
      stress: todayCheckIn?.stress ?? null,
      energy: todayCheckIn?.energy ?? null,
      cravings: todayCheckIn?.cravings ?? null,
      recentPatterns: [],
      userMessage: null,
    })
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <RText variant="h2">{copy.coach.title}</RText>
          <RText variant="body" color="muted">{copy.coach.subtitle}</RText>
        </View>

        {(activeSession || loading) && (
          <AIMessageCard session={activeSession} loading={loading} onExpand={() => {}} />
        )}

        <View style={styles.grid}>
          {modes.map(({ mode, label, icon }) => (
            <TouchableOpacity
              key={mode}
              onPress={() => handleMode(mode)}
              activeOpacity={0.8}
              style={styles.modeCard}
            >
              <RText style={styles.icon}>{icon}</RText>
              <RText variant="small" style={styles.modeLabel}>{label}</RText>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.screen, gap: spacing.lg, paddingBottom: spacing.xxl },
  header: { gap: spacing.xs, paddingTop: spacing.sm },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  modeCard: {
    backgroundColor: colors.card,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    width: '47%',
    gap: spacing.xs,
  },
  icon: {
    fontSize: 24,
  },
  modeLabel: {
    color: colors.textSecondary,
    fontFamily: 'Inter-Medium',
  },
})
