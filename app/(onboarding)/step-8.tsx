import { View, StyleSheet, SafeAreaView } from 'react-native'
import { router } from 'expo-router'
import { colors, spacing } from '@/constants/tokens'
import { RText } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { ToggleChipGroup } from '@/components/forms/ToggleChipGroup'
import { useOnboardingStore } from '@/stores/useOnboardingStore'
import type { PreferredTone } from '@/types'

const options: { value: PreferredTone; label: string }[] = [
  { value: 'gentle',       label: 'Gently — soft, no pressure' },
  { value: 'direct',       label: 'Directly — clear and honest' },
  { value: 'motivational', label: 'Motivationally — a little push' },
]

export default function Step8() {
  const { answers, setAnswer, prevStep } = useOnboardingStore()

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.progress}>
          <RText variant="caption" color="muted">Step 8 of 8</RText>
          <View style={styles.progressBar}><View style={[styles.progressFill, { width: '100%' }]} /></View>
        </View>
        <View style={styles.content}>
          <RText variant="h2">How would you like Ritual to speak to you?</RText>
          <RText variant="body" color="muted">You can change this anytime in your profile.</RText>
          <ToggleChipGroup
            options={options}
            selected={answers.preferredTone ? [answers.preferredTone] : []}
            onToggle={(v) => setAnswer('preferredTone', v as PreferredTone)}
            maxSelections={1}
          />
        </View>
        <View style={styles.buttons}>
          <Button label="Back" onPress={() => { prevStep(); router.back() }} variant="ghost" style={{ flex: 1 }} />
          <Button
            label="Build my plan →"
            onPress={() => router.push('/(onboarding)/plan')}
            disabled={!answers.preferredTone}
            style={{ flex: 2 }}
          />
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, padding: spacing.screen, justifyContent: 'space-between', paddingBottom: spacing.xxl },
  progress: { gap: spacing.xs },
  progressBar: { height: 3, backgroundColor: colors.surface3, borderRadius: 999 },
  progressFill: { height: 3, backgroundColor: colors.primary, borderRadius: 999 },
  content: { flex: 1, justifyContent: 'center', gap: spacing.md },
  buttons: { flexDirection: 'row', gap: spacing.sm },
})
