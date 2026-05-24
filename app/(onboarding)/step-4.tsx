import { View, StyleSheet, SafeAreaView } from 'react-native'
import { router } from 'expo-router'
import { colors, spacing } from '@/constants/tokens'
import { RText } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { MoodSlider } from '@/components/forms/MoodSlider'
import { useOnboardingStore } from '@/stores/useOnboardingStore'

export default function Step4() {
  const { answers, setAnswer, nextStep, prevStep } = useOnboardingStore()

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.progress}>
          <RText variant="caption" color="muted">Step 4 of 8</RText>
          <View style={styles.progressBar}><View style={[styles.progressFill, { width: '50%' }]} /></View>
        </View>
        <View style={styles.content}>
          <RText variant="h2">How many hours do you sleep most nights?</RText>
          <RText variant="body" color="muted">An honest average is more useful than your best night.</RText>
          <MoodSlider
            label="Sleep hours"
            value={answers.sleepHours ?? 7}
            onChange={(v) => setAnswer('sleepHours', v)}
            labelMin="Under 4 hrs"
            labelMax="10+ hrs"
            color={colors.primary}
            minimumValue={3}
            maximumValue={12}
            step={0.5}
          />
          <RText variant="h2" style={{ textAlign: 'center' }}>
            {answers.sleepHours ?? 7} hrs
          </RText>
        </View>
        <View style={styles.buttons}>
          <Button label="Back" onPress={() => { prevStep(); router.back() }} variant="ghost" style={{ flex: 1 }} />
          <Button label="Continue" onPress={() => { nextStep(); router.push('/(onboarding)/step-5') }} style={{ flex: 2 }} />
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
