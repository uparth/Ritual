import { View, ScrollView, StyleSheet, SafeAreaView } from 'react-native'
import { router } from 'expo-router'
import { colors, spacing, font } from '@/constants/tokens'
import { RText } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { BreathingTimer } from '@/components/features'
import { copy } from '@/constants/copy'
import { useRitualStore } from '@/stores/useRitualStore'

export default function LowEnergyScreen() {
  const { rituals } = useRitualStore()
  const lowEnergyRituals = rituals.slice(0, 3)
  const fallbackRituals = [
    'Drink a glass of water',
    'Step outside for 5 minutes',
    'Sleep early tonight',
  ]
  const minimumRituals = lowEnergyRituals.length > 0
    ? lowEnergyRituals.map(ritual => ritual.lowEnergyAlternative ?? ritual.title)
    : fallbackRituals

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Button label="✕" onPress={() => router.back()} variant="ghost" size="sm" style={{ alignSelf: 'flex-end' }} />
          <RText variant="h2">{copy.lowEnergy.headline}</RText>
          <RText variant="body" color="muted">{copy.lowEnergy.subline}</RText>
        </View>

        <View style={styles.list}>
          {minimumRituals.map((title, i) => (
            <Card key={i} style={styles.ritualRow}>
              <View style={styles.indexBadge}>
                <RText variant="caption" color="primary" style={styles.indexText}>{i + 1}</RText>
              </View>
              <RText variant="body" style={styles.ritualText}>{title}</RText>
            </Card>
          ))}
        </View>

        <RText variant="body" color="muted" style={styles.rest}>{copy.lowEnergy.rest}</RText>

        <BreathingTimer />

        <Button
          label="Return to today"
          onPress={() => router.back()}
          fullWidth
          size="lg"
        />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.screen, gap: spacing.lg, paddingBottom: spacing.xxl },
  header: { gap: spacing.xs },
  list: { gap: spacing.sm },
  ritualRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  indexBadge: {
    alignItems: 'center',
    backgroundColor: colors.primaryTint,
    borderRadius: 14,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  indexText: {
    fontFamily: font.family.semibold,
  },
  ritualText: {
    flex: 1,
  },
  rest: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
})
