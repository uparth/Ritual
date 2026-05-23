import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { colors, spacing } from '@/constants/tokens'
import { RText } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useRitualStore } from '@/stores/useRitualStore'

export default function RitualDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { rituals } = useRitualStore()
  const ritual = rituals.find(r => r.ritualId === id)

  if (!ritual) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <RText variant="body" color="muted">Ritual not found.</RText>
          <Button label="Back" onPress={() => router.back()} variant="ghost" />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Button label="✕" onPress={() => router.back()} variant="ghost" size="sm" style={{ alignSelf: 'flex-end' }} />

        <View style={styles.header}>
          <RText variant="caption" color="primary" style={{ fontFamily: 'Inter-SemiBold', textTransform: 'uppercase', letterSpacing: 0.6 }}>
            {ritual.type}
          </RText>
          <RText variant="h2">{ritual.title}</RText>
          {ritual.description && <RText variant="body" color="muted">{ritual.description}</RText>}
        </View>

        {ritual.lowEnergyAlternative && (
          <Card>
            <RText variant="small" color="muted" style={{ fontFamily: 'Inter-SemiBold', marginBottom: 4 }}>Low energy alternative</RText>
            <RText variant="body">{ritual.lowEnergyAlternative}</RText>
          </Card>
        )}

        <RText variant="small" color="muted">{ritual.durationMinutes} min · {ritual.days.join(', ')}</RText>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.screen, gap: spacing.md, paddingBottom: spacing.xxl },
  header: { gap: spacing.xs },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.md },
})
