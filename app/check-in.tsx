import { View, ScrollView, StyleSheet, SafeAreaView } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { colors, spacing } from '@/constants/tokens'
import { RText } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { MoodSlider } from '@/components/forms/MoodSlider'
import { copy } from '@/constants/copy'
import { useAuthStore } from '@/stores/useAuthStore'
import { useCheckInStore } from '@/stores/useCheckInStore'

export default function CheckInScreen() {
  const { type = 'morning' } = useLocalSearchParams<{ type: 'morning' | 'evening' }>()
  const { uid } = useAuthStore()
  const { draft, setDraftField, save, saving } = useCheckInStore()

  const isMorning = type === 'morning'
  const title = isMorning ? copy.checkIn.morningTitle : copy.checkIn.eveningTitle

  async function handleSave() {
    if (!uid) return
    setDraftField('type', type)
    await save(uid)
    router.back()
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Button label="✕" onPress={() => router.back()} variant="ghost" size="sm" style={{ alignSelf: 'flex-end' }} />
          <RText variant="h2">{title}</RText>
          <RText variant="body" color="muted">Honest answers give Ritual the best context.</RText>
        </View>

        <View style={styles.sliders}>
          <MoodSlider label={copy.checkIn.labels.mood}    value={draft.mood ?? 5}    onChange={v => setDraftField('mood', v)}    labelMin={copy.checkIn.sliderMin.mood}    labelMax={copy.checkIn.sliderMax.mood} />
          <MoodSlider label={copy.checkIn.labels.stress}  value={draft.stress ?? 5}  onChange={v => setDraftField('stress', v)}  labelMin={copy.checkIn.sliderMin.stress}  labelMax={copy.checkIn.sliderMax.stress}  color={colors.warning} />
          <MoodSlider label={copy.checkIn.labels.anxiety} value={draft.anxiety ?? 5} onChange={v => setDraftField('anxiety', v)} labelMin={copy.checkIn.sliderMin.anxiety} labelMax={copy.checkIn.sliderMax.anxiety} color={colors.error} />
          <MoodSlider label={copy.checkIn.labels.energy}  value={draft.energy ?? 5}  onChange={v => setDraftField('energy', v)}  labelMin={copy.checkIn.sliderMin.energy}  labelMax={copy.checkIn.sliderMax.energy}  color={colors.secondary} />
          <MoodSlider label={copy.checkIn.labels.cravings} value={draft.cravings ?? 5} onChange={v => setDraftField('cravings', v)} labelMin={copy.checkIn.sliderMin.cravings} labelMax={copy.checkIn.sliderMax.cravings} color={colors.warning} />

          {isMorning && (
            <MoodSlider label={copy.checkIn.labels.sleepHours} value={draft.sleepHours ?? 7} onChange={v => setDraftField('sleepHours', v)} labelMin="3 hrs" labelMax="10+ hrs" color={colors.primary} />
          )}
        </View>

        <Button
          label={saving ? 'Saving…' : 'Save check-in'}
          onPress={handleSave}
          loading={saving}
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
  sliders: { gap: spacing.lg },
})
