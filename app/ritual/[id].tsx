import { useEffect, useMemo, useState } from 'react'
import { Switch, View, StyleSheet, SafeAreaView, ScrollView } from 'react-native'
import { Controller, useForm } from 'react-hook-form'
import { router, useLocalSearchParams } from 'expo-router'
import { colors, spacing } from '@/constants/tokens'
import { RText } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { FormTextInput, ToggleChipGroup } from '@/components/forms'
import { useAuthStore } from '@/stores/useAuthStore'
import { useRitualStore } from '@/stores/useRitualStore'
import type { DayCode, Ritual, RitualType } from '@/types'

type RitualFormData = {
  title: string
  description: string
  type: RitualType
  durationMinutes: string
  scheduledTime: string
  days: DayCode[]
  lowEnergyAlternative: string
  reminderEnabled: boolean
  isActive: boolean
}

const ritualTypes: { value: RitualType; label: string }[] = [
  { value: 'mind', label: 'Mind' },
  { value: 'body', label: 'Body' },
  { value: 'food', label: 'Food' },
  { value: 'sleep', label: 'Sleep' },
  { value: 'spiritual', label: 'Spirit' },
  { value: 'creative', label: 'Creative' },
  { value: 'reflection', label: 'Reflect' },
]

const dayOptions: { value: DayCode; label: string }[] = [
  { value: 'mon', label: 'Mon' },
  { value: 'tue', label: 'Tue' },
  { value: 'wed', label: 'Wed' },
  { value: 'thu', label: 'Thu' },
  { value: 'fri', label: 'Fri' },
  { value: 'sat', label: 'Sat' },
  { value: 'sun', label: 'Sun' },
]

const allDays: DayCode[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

function formDefaults(ritual: Ritual | undefined, order: number): RitualFormData {
  return {
    title: ritual?.title ?? '',
    description: ritual?.description ?? '',
    type: ritual?.type ?? 'body',
    durationMinutes: ritual?.durationMinutes ? String(ritual.durationMinutes) : '5',
    scheduledTime: ritual?.scheduledTime ?? '',
    days: ritual?.days ?? allDays,
    lowEnergyAlternative: ritual?.lowEnergyAlternative ?? '',
    reminderEnabled: ritual?.reminderEnabled ?? false,
    isActive: ritual?.isActive ?? true,
  }
}

function normalizeDuration(value: string): number {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 1) return 1
  return Math.round(parsed)
}

export default function RitualDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { uid } = useAuthStore()
  const { rituals, addRitual, updateRitual, fetchRituals } = useRitualStore()
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const isNew = id === 'new'
  const ritual = isNew ? undefined : rituals.find(r => r.ritualId === id)
  const nextOrder = rituals.length + 1
  const defaults = useMemo(() => formDefaults(ritual, nextOrder), [ritual, nextOrder])

  const {
    control,
    formState: { isValid },
    handleSubmit,
    reset,
    watch,
  } = useForm<RitualFormData>({
    defaultValues: defaults,
    mode: 'onChange',
  })

  const selectedType = watch('type')
  const selectedDays = watch('days')

  useEffect(() => {
    if (!uid || isNew || ritual) return
    void fetchRituals(uid)
  }, [fetchRituals, isNew, ritual, uid])

  useEffect(() => {
    reset(defaults)
  }, [defaults, reset])

  async function handleSave(values: RitualFormData) {
    if (!uid) return
    setSaving(true)
    setError(null)

    const payload: Omit<Ritual, 'ritualId' | 'createdAt'> = {
      title: values.title.trim(),
      description: values.description.trim() || null,
      type: values.type,
      durationMinutes: normalizeDuration(values.durationMinutes),
      scheduledTime: values.scheduledTime.trim() || null,
      days: values.days.length > 0 ? values.days : allDays,
      isActive: values.isActive,
      lowEnergyAlternative: values.lowEnergyAlternative.trim() || null,
      reminderEnabled: values.reminderEnabled,
      order: ritual?.order ?? nextOrder,
    }

    try {
      if (isNew) {
        await addRitual(uid, payload)
      } else if (ritual) {
        await updateRitual(uid, ritual.ritualId, payload)
      }
      router.back()
    } catch {
      setError('Could not save this ritual. Please try again.')
      setSaving(false)
    }
  }

  if (!isNew && !ritual) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <RText variant="body" color="muted">Ritual not found.</RText>
          <Button label="Back" onPress={() => router.back()} variant="ghost" />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Button label="Close" onPress={() => router.back()} variant="ghost" size="sm" style={{ alignSelf: 'flex-end' }} />

        <View style={styles.header}>
          <RText variant="caption" color="primary" style={styles.eyebrow}>
            {isNew ? 'New ritual' : selectedType}
          </RText>
          <RText variant="h2">{isNew ? 'Create a ritual' : 'Edit ritual'}</RText>
          <RText variant="body" color="muted">Choose the smallest useful step you can repeat gently.</RText>
        </View>

        <Card style={styles.formCard}>
          <FormTextInput
            control={control}
            name="title"
            label="Title"
            placeholder="Walk for 10 minutes"
            rules={{
              required: 'A ritual needs a title.',
              minLength: { value: 3, message: 'Use at least 3 characters.' },
            }}
          />

          <FormTextInput
            control={control}
            name="description"
            label="Description"
            placeholder="Optional"
          />

          <View style={styles.field}>
            <RText variant="small" color="subtle">Type</RText>
            <Controller
              control={control}
              name="type"
              render={({ field: { onChange, value } }) => (
                <ToggleChipGroup
                  options={ritualTypes}
                  selected={[value]}
                  onToggle={(next) => onChange(next as RitualType)}
                  maxSelections={1}
                />
              )}
            />
          </View>

          <FormTextInput
            control={control}
            name="durationMinutes"
            label="Duration"
            placeholder="5"
            keyboardType="number-pad"
            rules={{
              required: 'Add a duration.',
              validate: (value) =>
                (typeof value === 'string' && normalizeDuration(value) > 0) ||
                'Enter a valid duration.',
            }}
          />

          <FormTextInput
            control={control}
            name="scheduledTime"
            label="Preferred time"
            placeholder="08:00 optional"
          />

          <View style={styles.field}>
            <RText variant="small" color="subtle">Days</RText>
            <Controller
              control={control}
              name="days"
              render={({ field: { onChange, value } }) => (
                <ToggleChipGroup
                  options={dayOptions}
                  selected={value}
                  onToggle={(day) => {
                    const nextDay = day as DayCode
                    const next = value.includes(nextDay)
                      ? value.filter(item => item !== nextDay)
                      : [...value, nextDay]
                    onChange(next)
                  }}
                />
              )}
            />
            {selectedDays.length === 0 ? (
              <RText variant="caption" color="warning">No days selected means Ritual will use every day.</RText>
            ) : null}
          </View>

          <FormTextInput
            control={control}
            name="lowEnergyAlternative"
            label="Low-energy alternative"
            placeholder="Walk for 3 minutes"
          />

          <Controller
            control={control}
            name="reminderEnabled"
            render={({ field: { onChange, value } }) => (
              <View style={styles.switchRow}>
                <View style={styles.switchText}>
                  <RText variant="small" color="subtle">Reminder</RText>
                  <RText variant="caption" color="muted">Notification setup comes in the reminders phase.</RText>
                </View>
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
            name="isActive"
            render={({ field: { onChange, value } }) => (
              <View style={styles.switchRow}>
                <RText variant="small" color="subtle">Active</RText>
                <Switch
                  value={value}
                  onValueChange={onChange}
                  trackColor={{ false: colors.surface3, true: colors.successTint }}
                  thumbColor={value ? colors.success : colors.muted}
                />
              </View>
            )}
          />
        </Card>

        {error ? <RText variant="small" color="error">{error}</RText> : null}

        <Button
          label={saving ? 'Saving...' : isNew ? 'Create ritual' : 'Save changes'}
          onPress={handleSubmit(handleSave)}
          loading={saving}
          disabled={!isValid}
          fullWidth
          size="lg"
        />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.screen, gap: spacing.md, paddingBottom: spacing.xxl },
  header: { gap: spacing.xs },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.md },
  eyebrow: {
    fontFamily: 'Inter-SemiBold',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  field: {
    gap: spacing.xs,
  },
  formCard: {
    gap: spacing.md,
  },
  switchRow: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 14,
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
})
