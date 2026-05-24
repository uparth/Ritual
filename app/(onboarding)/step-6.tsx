import { View, StyleSheet, SafeAreaView } from 'react-native'
import { router } from 'expo-router'
import { colors, spacing } from '@/constants/tokens'
import { RText } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { ToggleChipGroup } from '@/components/forms/ToggleChipGroup'
import { useOnboardingStore } from '@/stores/useOnboardingStore'
import type { PrimaryGoal } from '@/types'

const options: { value: PrimaryGoal; label: string }[] = [
  { value: 'weight_loss',     label: 'Lose weight and feel lighter' },
  { value: 'mental_clarity',  label: 'Calm my mind and reduce anxiety' },
  { value: 'both',            label: 'Both — body and mind reset' },
  { value: 'energy',          label: 'Rebuild energy and daily rhythm' },
]

export default function Step6() {
  const { answers, setAnswer, nextStep, prevStep } = useOnboardingStore()

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.progress}>
          <RText variant="caption" color="muted">Step 6 of 8</RText>
          <View style={styles.progressBar}><View style={[styles.progressFill, { width: '75%' }]} /></View>
        </View>
        <View style={styles.content}>
          <RText variant="h2">What is your main goal?</RText>
          <RText variant="body" color="muted">This shapes everything Ritual suggests for you.</RText>
          <ToggleChipGroup
            options={options}
            selected={answers.primaryGoal ? [answers.primaryGoal] : []}
            onToggle={(v) => setAnswer('primaryGoal', v as PrimaryGoal)}
            maxSelections={1}
          />
        </View>
        <View style={styles.buttons}>
          <Button label="Back" onPress={() => { prevStep(); router.back() }} variant="ghost" style={{ flex: 1 }} />
          <Button label="Continue" onPress={() => { nextStep(); router.push('/step-7') }} disabled={!answers.primaryGoal} style={{ flex: 2 }} />
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
