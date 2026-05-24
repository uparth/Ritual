import { useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  TextInput,
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native'
import { colors, font, radius, spacing } from '@/constants/tokens'
import { RText } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { AIMessageCard } from '@/components/features/AIMessageCard'
import { copy } from '@/constants/copy'
import { useAuthStore } from '@/stores/useAuthStore'
import { useAIStore } from '@/stores/useAIStore'
import { useCheckInStore } from '@/stores/useCheckInStore'
import type { AIMode, AISession } from '@/types'

const modes: { mode: AIMode; label: string; symbol: string }[] = [
  { mode: 'overthinking', label: copy.coach.modes.overthinking, symbol: 'O' },
  { mode: 'low_energy', label: copy.coach.modes.heavy, symbol: 'L' },
  { mode: 'craving_support', label: copy.coach.modes.binge, symbol: 'C' },
  { mode: 'guilt', label: copy.coach.modes.guilty, symbol: 'G' },
  { mode: 'cant_sleep', label: copy.coach.modes.sleep, symbol: 'S' },
  { mode: 'daily_guidance', label: copy.coach.modes.nextStep, symbol: 'N' },
  { mode: 'motivation', label: copy.coach.modes.motivation, symbol: 'M' },
]

function modeLabel(mode: AIMode) {
  return modes.find(item => item.mode === mode)?.label ?? 'Coach'
}

function sessionText(session: AISession) {
  return session.safetyFlagged
    ? session.safetyResponse ?? copy.coach.safety
    : session.response
}

export default function CoachScreen() {
  const { uid } = useAuthStore()
  const {
    activeSession,
    sessions,
    loading,
    error,
    clearError,
    fetchHistory,
    request,
  } = useAIStore()
  const { todayCheckIn } = useCheckInStore()
  const [selectedMode, setSelectedMode] = useState<AIMode>('daily_guidance')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!uid) return
    void fetchHistory(uid)
  }, [fetchHistory, uid])

  const context = useMemo(() => ({
    checkInDate: todayCheckIn?.date ?? null,
    mood: todayCheckIn?.mood ?? null,
    stress: todayCheckIn?.stress ?? null,
    energy: todayCheckIn?.energy ?? null,
    cravings: todayCheckIn?.cravings ?? null,
    recentPatterns: [],
    userMessage: message.trim() || null,
  }), [message, todayCheckIn])

  async function handleSend(mode = selectedMode) {
    if (!uid || loading) return
    clearError()
    await request(uid, mode, context)
    setMessage('')
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <RText variant="h2">{copy.coach.title}</RText>
          <RText variant="body" color="muted">{copy.coach.subtitle}</RText>
        </View>

        {(activeSession || loading) ? (
          <AIMessageCard session={activeSession} loading={loading} onExpand={() => {}} />
        ) : (
          <Card style={styles.emptyCard}>
            <RText variant="body" color="muted">{copy.coach.empty}</RText>
          </Card>
        )}

        {error ? (
          <Card style={styles.errorCard}>
            <RText variant="small" color="error">{error}</RText>
          </Card>
        ) : null}

        <View style={styles.section}>
          <RText variant="h3">Mode</RText>
          <View style={styles.grid}>
            {modes.map(({ mode, label, symbol }) => {
              const selected = selectedMode === mode
              return (
                <TouchableOpacity
                  key={mode}
                  onPress={() => setSelectedMode(mode)}
                  activeOpacity={0.8}
                  style={[styles.modeCard, selected && styles.modeCardSelected]}
                >
                  <View style={[styles.symbolBadge, selected && styles.symbolBadgeSelected]}>
                    <RText variant="caption" style={[styles.symbol, selected && styles.symbolSelected]}>{symbol}</RText>
                  </View>
                  <RText variant="small" style={[styles.modeLabel, selected && styles.modeLabelSelected]}>{label}</RText>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

        <Card style={styles.composer}>
          <RText variant="small" color="subtle">{modeLabel(selectedMode)}</RText>
          <TextInput
            value={message}
            onChangeText={setMessage}
            multiline
            placeholder={copy.coach.inputPlaceholder}
            placeholderTextColor={colors.muted}
            style={styles.input}
          />
          <Button
            label={loading ? copy.coach.loading : copy.coach.send}
            onPress={() => void handleSend()}
            loading={loading}
            fullWidth
          />
        </Card>

        <View style={styles.section}>
          <View style={styles.historyHeader}>
            <RText variant="h3">History</RText>
            {loading ? <ActivityIndicator color={colors.primary} /> : null}
          </View>

          {sessions.length === 0 ? (
            <RText variant="body" color="muted">Your coach messages will appear here.</RText>
          ) : (
            <View style={styles.historyList}>
              {sessions.map(session => (
                <Card key={session.sessionId} style={styles.historyCard}>
                  <RText variant="caption" color="primary" style={styles.historyMode}>
                    {modeLabel(session.mode)}
                  </RText>
                  {session.inputContext.userMessage ? (
                    <RText variant="small" color="muted">{session.inputContext.userMessage}</RText>
                  ) : null}
                  <RText variant="body" style={styles.historyResponse}>
                    {sessionText(session)}
                  </RText>
                </Card>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.screen, gap: spacing.lg, paddingBottom: spacing.xxl },
  header: { gap: spacing.xs, paddingTop: spacing.sm },
  section: { gap: spacing.sm },
  emptyCard: {
    backgroundColor: colors.surface,
  },
  errorCard: {
    backgroundColor: colors.errorTint,
    borderColor: 'rgba(248,113,113,0.3)',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  modeCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1,
    gap: spacing.sm,
    minHeight: 108,
    padding: spacing.md,
    width: '47%',
  },
  modeCardSelected: {
    backgroundColor: colors.primaryTint,
    borderColor: 'rgba(167,139,250,0.45)',
  },
  symbolBadge: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  symbolBadgeSelected: {
    backgroundColor: colors.primary,
  },
  symbol: {
    color: colors.textSecondary,
    fontFamily: font.family.semibold,
  },
  symbolSelected: {
    color: colors.bg,
  },
  modeLabel: {
    color: colors.textSecondary,
    fontFamily: font.family.medium,
  },
  modeLabelSelected: {
    color: colors.textPrimary,
  },
  composer: {
    gap: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.input,
    borderWidth: 1,
    color: colors.textPrimary,
    fontFamily: font.family.regular,
    fontSize: font.size.body,
    minHeight: 112,
    padding: spacing.md,
    textAlignVertical: 'top',
  },
  historyHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  historyList: {
    gap: spacing.sm,
  },
  historyCard: {
    gap: spacing.sm,
  },
  historyMode: {
    fontFamily: font.family.semibold,
  },
  historyResponse: {
    color: colors.textSecondary,
    lineHeight: 24,
  },
})
