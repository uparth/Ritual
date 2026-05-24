import { useMemo } from 'react'
import {
  Switch,
  TextInput,
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native'
import { Controller, useForm } from 'react-hook-form'
import { router, useLocalSearchParams } from 'expo-router'
import { colors, font, radius, spacing } from '@/constants/tokens'
import { RText } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { MoodSlider } from '@/components/forms/MoodSlider'
import { copy } from '@/constants/copy'
import { useAuthStore } from '@/stores/useAuthStore'
import { useCheckInStore } from '@/stores/useCheckInStore'
import type { CheckInFormData, CheckInType } from '@/types'

type CheckInFormValues = {
  mood: number
  stress: number
  anxiety: number
  cravings: number
  sleepHours: number
  energy: number
  bodyPain: boolean
  bodyPainNote: string
  weightKg: string
  movementMinutes: string
  foodControl: number
  spiritualPractice: boolean
  notes: string
}

function todayDateString() {
  return new Date().toISOString().split('T')[0]
}

function optionalNumber(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : null
}

function normalizeCheckInType(value: string | string[] | undefined): Exclude<CheckInType, 'both'> {
  return value === 'evening' ? 'evening' : 'morning'
}

export default function CheckInScreen() {
  const params = useLocalSearchParams<{ type?: string }>()
  const type = normalizeCheckInType(params.type)
  const { uid } = useAuthStore()
  const { draft, save, saving, error, clearError } = useCheckInStore()

  const isMorning = type === 'morning'
  const title = isMorning ? copy.checkIn.morningTitle : copy.checkIn.eveningTitle

  const defaultValues = useMemo<CheckInFormValues>(() => ({
    mood: draft.mood ?? 5,
    stress: draft.stress ?? 5,
    anxiety: draft.anxiety ?? 5,
    cravings: draft.cravings ?? 5,
    sleepHours: draft.sleepHours ?? 7,
    energy: draft.energy ?? 5,
    bodyPain: draft.bodyPain ?? false,
    bodyPainNote: draft.bodyPainNote ?? '',
    weightKg: draft.weightKg ? String(draft.weightKg) : '',
    movementMinutes: draft.movementMinutes ? String(draft.movementMinutes) : '',
    foodControl: draft.foodControl ?? 5,
    spiritualPractice: draft.spiritualPractice ?? false,
    notes: draft.notes ?? '',
  }), [draft])

  const {
    control,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm<CheckInFormValues>({
    defaultValues,
    mode: 'onChange',
  })

  const hasBodyPain = watch('bodyPain')

  async function handleSave(values: CheckInFormValues) {
    if (!uid) return
    clearError()

    const payload: CheckInFormData = {
      date: todayDateString(),
      type,
      mood: values.mood,
      stress: values.stress,
      anxiety: values.anxiety,
      cravings: values.cravings,
      sleepHours: values.sleepHours,
      energy: values.energy,
      bodyPain: values.bodyPain,
      bodyPainNote: values.bodyPain ? values.bodyPainNote.trim() || null : null,
      weightKg: isMorning ? optionalNumber(values.weightKg) : null,
      movementMinutes: optionalNumber(values.movementMinutes),
      foodControl: values.foodControl,
      spiritualPractice: values.spiritualPractice,
      notes: values.notes.trim() || null,
    }

    try {
      await save(uid, payload)
      router.back()
    } catch {
      // Store owns the user-facing error message.
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Button label="Close" onPress={() => router.back()} variant="ghost" size="sm" style={{ alignSelf: 'flex-end' }} />
          <RText variant="h2">{title}</RText>
          <RText variant="body" color="muted">Honest answers give Ritual the best context.</RText>
        </View>

        <View style={styles.sliders}>
          <Controller
            control={control}
            name="mood"
            render={({ field: { onChange, value } }) => (
              <MoodSlider label={copy.checkIn.labels.mood} value={value} onChange={onChange} labelMin={copy.checkIn.sliderMin.mood} labelMax={copy.checkIn.sliderMax.mood} />
            )}
          />
          <Controller
            control={control}
            name="stress"
            render={({ field: { onChange, value } }) => (
              <MoodSlider label={copy.checkIn.labels.stress} value={value} onChange={onChange} labelMin={copy.checkIn.sliderMin.stress} labelMax={copy.checkIn.sliderMax.stress} color={colors.warning} />
            )}
          />
          <Controller
            control={control}
            name="anxiety"
            render={({ field: { onChange, value } }) => (
              <MoodSlider label={copy.checkIn.labels.anxiety} value={value} onChange={onChange} labelMin={copy.checkIn.sliderMin.anxiety} labelMax={copy.checkIn.sliderMax.anxiety} color={colors.error} />
            )}
          />
          <Controller
            control={control}
            name="energy"
            render={({ field: { onChange, value } }) => (
              <MoodSlider label={copy.checkIn.labels.energy} value={value} onChange={onChange} labelMin={copy.checkIn.sliderMin.energy} labelMax={copy.checkIn.sliderMax.energy} color={colors.secondary} />
            )}
          />
          <Controller
            control={control}
            name="cravings"
            render={({ field: { onChange, value } }) => (
              <MoodSlider label={copy.checkIn.labels.cravings} value={value} onChange={onChange} labelMin={copy.checkIn.sliderMin.cravings} labelMax={copy.checkIn.sliderMax.cravings} color={colors.warning} />
            )}
          />

          {isMorning ? (
            <Controller
              control={control}
              name="sleepHours"
              render={({ field: { onChange, value } }) => (
                <MoodSlider label={copy.checkIn.labels.sleepHours} value={value} onChange={onChange} labelMin="3 hrs" labelMax="12 hrs" color={colors.primary} minimumValue={3} maximumValue={12} step={0.5} />
              )}
            />
          ) : (
            <Controller
              control={control}
              name="foodControl"
              render={({ field: { onChange, value } }) => (
                <MoodSlider label={copy.checkIn.labels.foodControl} value={value} onChange={onChange} labelMin={copy.checkIn.sliderMin.foodControl} labelMax={copy.checkIn.sliderMax.foodControl} color={colors.success} />
              )}
            />
          )}
        </View>

        <View style={styles.fields}>
          {isMorning ? (
            <Controller
              control={control}
              name="weightKg"
              rules={{
                validate: (value) => !value.trim() || optionalNumber(value) !== null || 'Enter a valid number.',
              }}
              render={({ field: { onChange, value } }) => (
                <View style={styles.field}>
                  <RText variant="small" color="subtle">{copy.checkIn.labels.weight}</RText>
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    keyboardType="decimal-pad"
                    placeholder="Optional"
                    placeholderTextColor={colors.muted}
                    style={[styles.input, errors.weightKg && styles.inputError]}
                  />
                  {errors.weightKg?.message ? <RText variant="caption" color="error">{errors.weightKg.message}</RText> : null}
                </View>
              )}
            />
          ) : null}

          <Controller
            control={control}
            name="movementMinutes"
            rules={{
              validate: (value) => !value.trim() || optionalNumber(value) !== null || 'Enter a valid number.',
            }}
            render={({ field: { onChange, value } }) => (
              <View style={styles.field}>
                <RText variant="small" color="subtle">{copy.checkIn.labels.movement}</RText>
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  keyboardType="number-pad"
                  placeholder="Optional"
                  placeholderTextColor={colors.muted}
                  style={[styles.input, errors.movementMinutes && styles.inputError]}
                />
                {errors.movementMinutes?.message ? <RText variant="caption" color="error">{errors.movementMinutes.message}</RText> : null}
              </View>
            )}
          />

          <Controller
            control={control}
            name="bodyPain"
            render={({ field: { onChange, value } }) => (
              <View style={styles.switchRow}>
                <View style={styles.switchText}>
                  <RText variant="small" color="subtle">{copy.checkIn.labels.bodyPain}</RText>
                  <RText variant="caption" color="muted">A note is optional.</RText>
                </View>
                <Switch
                  value={value}
                  onValueChange={onChange}
                  trackColor={{ false: colors.surface3, true: colors.warningTint }}
                  thumbColor={value ? colors.warning : colors.muted}
                />
              </View>
            )}
          />

          {hasBodyPain ? (
            <Controller
              control={control}
              name="bodyPainNote"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  placeholder="Where do you feel it?"
                  placeholderTextColor={colors.muted}
                  style={styles.input}
                />
              )}
            />
          ) : null}

          <Controller
            control={control}
            name="spiritualPractice"
            render={({ field: { onChange, value } }) => (
              <View style={styles.switchRow}>
                <RText variant="small" color="subtle">{copy.checkIn.labels.spiritualPractice}</RText>
                <Switch
                  value={value}
                  onValueChange={onChange}
                  trackColor={{ false: colors.surface3, true: colors.primaryTint }}
                  thumbColor={value ? colors.primary : colors.muted}
                />
              </View>
            )}
          />

          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, value } }) => (
              <View style={styles.field}>
                <RText variant="small" color="subtle">{copy.checkIn.labels.notes}</RText>
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  multiline
                  placeholder="Optional"
                  placeholderTextColor={colors.muted}
                  style={[styles.input, styles.textArea]}
                />
              </View>
            )}
          />
        </View>

        {error ? <RText variant="small" color="error">{error}</RText> : null}

        <Button
          label={saving ? 'Saving...' : 'Save check-in'}
          onPress={handleSubmit(handleSave)}
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
  fields: { gap: spacing.md },
  field: { gap: spacing.xs },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.input,
    borderWidth: 1,
    color: colors.textPrimary,
    fontFamily: font.family.regular,
    fontSize: font.size.body,
    minHeight: 50,
    padding: spacing.md,
  },
  inputError: {
    borderColor: colors.error,
  },
  switchRow: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.input,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 54,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  switchText: {
    flex: 1,
    gap: 2,
    paddingRight: spacing.md,
  },
  textArea: {
    minHeight: 104,
    textAlignVertical: 'top',
  },
})
