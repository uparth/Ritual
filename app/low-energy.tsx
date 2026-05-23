import { View, ScrollView, StyleSheet, SafeAreaView } from 'react-native'
import { router } from 'expo-router'
import { colors, spacing } from '@/constants/tokens'
import { RText } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { copy } from '@/constants/copy'
import { useRitualStore } from '@/stores/useRitualStore'
import { useAuthStore } from '@/stores/useAuthStore'

const minimumRituals = [
  { title: 'Drink a glass of water', icon: '💧' },
  { title: 'Step outside for 5 minutes', icon: '🌿' },
  { title: 'Sleep early tonight', icon: '🌙' },
]

export default function LowEnergyScreen() {
  const { uid } = useAuthStore()
  const { rituals } = useRitualStore()
  const lowEnergyRituals = rituals.slice(0, 3)

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Button label="✕" onPress={() => router.back()} variant="ghost" size="sm" style={{ alignSelf: 'flex-end' }} />
          <RText variant="h2">{copy.lowEnergy.headline}</RText>
          <RText variant="body" color="muted">{copy.lowEnergy.subline}</RText>
        </View>

        <View style={styles.list}>
          {minimumRituals.map((r, i) => (
            <Card key={i} style={styles.ritualRow}>
              <RText style={styles.icon}>{r.icon}</RText>
              <RText variant="body">{r.title}</RText>
            </Card>
          ))}
        </View>

        <RText variant="body" color="muted" style={styles.rest}>{copy.lowEnergy.rest}</RText>

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
  icon: { fontSize: 24 },
  rest: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
})
