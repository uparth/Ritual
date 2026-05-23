import { View, StyleSheet, SafeAreaView } from 'react-native'
import { router } from 'expo-router'
import { colors, spacing } from '@/constants/tokens'
import { RText } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { ToggleChipGroup } from '@/components/forms/ToggleChipGroup'
import { useOnboardingStore } from '@/stores/useOnboardingStore'
import type { SpiritualLevel } from '@/types'

const options: { value: SpiritualLevel; label: string }[] = [
  { value: 'yes',       label: 'Yes, regularly' },
  { value: 'sometimes', label: 'Sometimes'      },
  { value: 'no',        label: 'Not yet'        },
]

export default function Step7() {
  const { answers, setAnswer, nextStep, prevStep } = useOnboardingStore()

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.progress}>
          <RText variant="caption" color="muted">Step 7 of 8</RText>
          <View style={styles.progressBar}><View style={[styles.progressFill, { width: '87.5%' }]} /></View>
        </View>
        <View style={styles.content}>
          <RText variant="h2">Do you have a spiritual or mindfulness practice?</RText>
          <RText variant="body" color="muted">Ritual can include this as part of your daily plan.</RText>
          <ToggleChipGroup
            options={options}
            selected={answers.spiritualPractice ? [answers.spiritualPractice] : []}
            onToggle={(v) => setAnswer('spiritualPractice', v as SpiritualLevel)}
            maxSelections={1}
          />
        </View>
        <View style={styles.buttons}>
          <Button label="Back" onPress={() => { prevStep(); router.back() }} variant="ghost" style={{ flex: 1 }} />
          <Button label="Continue" onPress={() => { nextStep(); router.push('/(onboarding)/step-8') }} disabled={!answers.spiritualPractice} style={{ flex: 2 }} />
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
