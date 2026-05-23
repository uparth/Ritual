import { View, ScrollView, StyleSheet, SafeAreaView } from 'react-native'
import { colors, spacing } from '@/constants/tokens'
import { RText } from '@/components/ui/Text'
import { Card } from '@/components/ui/Card'

// Phase 5 — Progress graphs and weekly insights wired in here
export default function ProgressScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <RText variant="h2">Progress</RText>
          <RText variant="body" color="muted">Your patterns over time.</RText>
        </View>

        <Card>
          <RText variant="body" color="muted" style={{ textAlign: 'center', paddingVertical: spacing.lg }}>
            Complete a few check-ins to see your progress graphs here.
          </RText>
        </Card>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.screen, gap: spacing.md, paddingBottom: spacing.xxl },
  header: { gap: spacing.xs, paddingTop: spacing.sm },
})
