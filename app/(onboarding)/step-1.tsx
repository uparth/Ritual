import { View, StyleSheet, SafeAreaView } from 'react-native'
import { router } from 'expo-router'
import { colors, spacing } from '@/constants/tokens'
import { RText } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { ToggleChipGroup } from '@/components/forms/ToggleChipGroup'
import { useOnboardingStore } from '@/stores/useOnboardingStore'

const options = [
  { value: 'overthinking',  label: 'Overthinking'   },
  { value: 'weight',        label: 'Weight'          },
  { value: 'sleep',         label: 'Sleep'           },
  { value: 'stress',        label: 'Stress'          },
  { value: 'energy',        label: 'Low energy'      },
  { value: 'habits',        label: 'Building habits' },
]

export default function Step1() {
  const { answers, setAnswer, nextStep } = useOnboardingStore()
  const selected = answers.struggles ?? []

  function toggle(value: string) {
    const current = answers.struggles ?? []
    const next = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value]
    setAnswer('struggles', next)
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.progress}>
          <RText variant="caption" color="muted">Step 1 of 8</RText>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '12.5%' }]} />
          </View>
        </View>

        <View style={styles.content}>
          <RText variant="h2">What brings you to Ritual?</RText>
          <RText variant="body" color="muted">Choose everything that feels true right now.</RText>
          <ToggleChipGroup
            options={options}
            selected={selected}
            onToggle={toggle}
            style={{ marginTop: spacing.sm }}
          />
        </View>

        <Button
          label="Continue"
          onPress={() => { nextStep(); router.push('/(onboarding)/step-2') }}
          disabled={selected.length === 0}
          fullWidth
          size="lg"
        />
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
})
