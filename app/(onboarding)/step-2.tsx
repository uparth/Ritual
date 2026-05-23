import { View, StyleSheet, SafeAreaView } from 'react-native'
import { router } from 'expo-router'
import { colors, spacing } from '@/constants/tokens'
import { RText } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { MoodSlider } from '@/components/forms/MoodSlider'
import { useOnboardingStore } from '@/stores/useOnboardingStore'

export default function Step2() {
  const { answers, setAnswer, nextStep, prevStep } = useOnboardingStore()

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.progress}>
          <RText variant="caption" color="muted">Step 2 of 8</RText>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '25%' }]} />
          </View>
        </View>

        <View style={styles.content}>
          <RText variant="h2">How is your energy most days?</RText>
          <RText variant="body" color="muted">Be honest — this shapes your plan.</RText>
          <MoodSlider
            label="Energy level"
            value={answers.energyLevel ?? 5}
            onChange={(v) => setAnswer('energyLevel', v)}
            labelMin="Running on empty"
            labelMax="Consistently energetic"
            color={colors.secondary}
          />
        </View>

        <View style={styles.buttons}>
          <Button label="Back" onPress={() => { prevStep(); router.back() }} variant="ghost" style={{ flex: 1 }} />
          <Button label="Continue" onPress={() => { nextStep(); router.push('/(onboarding)/step-3') }} style={{ flex: 2 }} />
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
  content: { flex: 1, justifyContent: 'center', gap: spacing.lg },
  buttons: { flexDirection: 'row', gap: spacing.sm },
})
