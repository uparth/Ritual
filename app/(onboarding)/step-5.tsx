import { View, StyleSheet, SafeAreaView } from 'react-native'
import { router } from 'expo-router'
import { colors, spacing } from '@/constants/tokens'
import { RText } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { ToggleChipGroup } from '@/components/forms/ToggleChipGroup'
import { useOnboardingStore } from '@/stores/useOnboardingStore'
import type { MovementLevel } from '@/types'

const options: { value: MovementLevel; label: string }[] = [
  { value: 'none',     label: 'Not at all'      },
  { value: 'light',    label: 'Light walks'     },
  { value: 'moderate', label: 'Some exercise'   },
  { value: 'active',   label: 'Regular training'},
]

export default function Step5() {
  const { answers, setAnswer, nextStep, prevStep } = useOnboardingStore()

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.progress}>
          <RText variant="caption" color="muted">Step 5 of 8</RText>
          <View style={styles.progressBar}><View style={[styles.progressFill, { width: '62.5%' }]} /></View>
        </View>
        <View style={styles.content}>
          <RText variant="h2">How active are you right now?</RText>
          <RText variant="body" color="muted">No judgement — just your current reality.</RText>
          <ToggleChipGroup
            options={options}
            selected={answers.movementLevel ? [answers.movementLevel] : []}
            onToggle={(v) => setAnswer('movementLevel', v as MovementLevel)}
            maxSelections={1}
          />
        </View>
        <View style={styles.buttons}>
          <Button label="Back" onPress={() => { prevStep(); router.back() }} variant="ghost" style={{ flex: 1 }} />
          <Button label="Continue" onPress={() => { nextStep(); router.push('/step-6') }} disabled={!answers.movementLevel} style={{ flex: 2 }} />
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
