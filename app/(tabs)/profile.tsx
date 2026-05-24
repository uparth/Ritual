import { useEffect } from 'react'
import { View, ScrollView, StyleSheet, SafeAreaView, Switch } from 'react-native'
import { colors, spacing } from '@/constants/tokens'
import { RText } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Divider } from '@/components/ui/Divider'
import { useAuthStore } from '@/stores/useAuthStore'
import { useUserStore } from '@/stores/useUserStore'
import { useNotificationStore, type ReminderSettings } from '@/stores/useNotificationStore'
import { usePremiumStore } from '@/stores/usePremiumStore'

const reminderLabels: Record<keyof ReminderSettings, string> = {
  morning_checkin: 'Morning check-in',
  walk: 'Walk/body reset',
  evening_reflection: 'Night reflection',
  low_energy: 'Low-energy reminder',
}

export default function ProfileScreen() {
  const { uid, email, signOut } = useAuthStore()
  const { profile, reset, isPremium: firestorePremium } = useUserStore()
  const notificationSettings = useNotificationStore(s => s.settings)
  const notificationIds = useNotificationStore(s => s.scheduledIds)
  const notificationLoading = useNotificationStore(s => s.loading)
  const notificationError = useNotificationStore(s => s.error)
  const setReminderEnabled = useNotificationStore(s => s.setReminderEnabled)
  const scheduleEnabledReminders = useNotificationStore(s => s.scheduleEnabledReminders)
  const cancelAllReminders = useNotificationStore(s => s.cancelAllReminders)
  const premiumOffering = usePremiumStore(s => s.offering)
  const premiumLoading = usePremiumStore(s => s.loading)
  const premiumError = usePremiumStore(s => s.error)
  const revenueCatPremium = usePremiumStore(s => s.isPremium)
  const initializePremium = usePremiumStore(s => s.initialize)
  const purchase = usePremiumStore(s => s.purchase)
  const restore = usePremiumStore(s => s.restore)
  const isPremium = firestorePremium || revenueCatPremium

  useEffect(() => {
    if (!uid) return
    void initializePremium(uid)
  }, [initializePremium, uid])

  async function handleSignOut() {
    reset()
    await signOut()
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <RText variant="h2">Profile</RText>
          <RText variant="body" color="muted">{email}</RText>
        </View>

        <Card style={styles.section}>
          <RText variant="h3">Your goal</RText>
          <RText variant="body" color="muted">{profile?.primaryGoal?.replace(/_/g, ' ') ?? '—'}</RText>
          <Divider style={{ marginVertical: spacing.md }} />
          <RText variant="h3">Coaching tone</RText>
          <RText variant="body" color="muted">{profile?.preferredTone ?? '—'}</RText>
        </Card>

        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitle}>
              <RText variant="h3">Reminders</RText>
              <RText variant="small" color="muted">
                {notificationIds.length > 0 ? `${notificationIds.length} scheduled` : 'Permission requested when you schedule'}
              </RText>
            </View>
          </View>

          {(Object.keys(notificationSettings) as Array<keyof ReminderSettings>).map(kind => {
            const reminder = notificationSettings[kind]
            return (
              <View key={kind} style={styles.toggleRow}>
                <View style={styles.toggleCopy}>
                  <RText variant="body">{reminderLabels[kind]}</RText>
                  <RText variant="caption" color="muted">
                    {String(reminder.hour).padStart(2, '0')}:{String(reminder.minute).padStart(2, '0')}
                  </RText>
                </View>
                <Switch
                  value={reminder.enabled}
                  onValueChange={value => setReminderEnabled(kind, value)}
                  trackColor={{ false: colors.surface3, true: colors.primaryTint }}
                  thumbColor={reminder.enabled ? colors.primary : colors.muted}
                />
              </View>
            )
          })}

          {notificationError ? <RText variant="small" color="error">{notificationError}</RText> : null}

          <View style={styles.rowActions}>
            <Button
              label="Schedule"
              onPress={scheduleEnabledReminders}
              loading={notificationLoading}
              size="sm"
              style={styles.flexButton}
            />
            <Button
              label="Cancel"
              onPress={cancelAllReminders}
              disabled={notificationIds.length === 0}
              variant="secondary"
              size="sm"
              style={styles.flexButton}
            />
          </View>
        </Card>

        <Card style={styles.section}>
          <View style={styles.sectionTitle}>
            <RText variant="h3">Premium</RText>
            <RText variant="body" color={isPremium ? 'success' : 'muted'}>
              {isPremium ? 'Premium active' : 'Unlock premium coaching when RevenueCat is configured.'}
            </RText>
          </View>

          {premiumError ? <RText variant="small" color="muted">{premiumError}</RText> : null}

          {premiumOffering?.availablePackages?.length ? (
            <View style={styles.packageList}>
              {premiumOffering.availablePackages.map(pkg => (
                <Button
                  key={pkg.identifier}
                  label={`${pkg.product.title} ${pkg.product.priceString}`}
                  onPress={() => purchase(pkg)}
                  loading={premiumLoading}
                  variant="secondary"
                  fullWidth
                />
              ))}
            </View>
          ) : null}

          <Button
            label="Restore purchases"
            onPress={restore}
            loading={premiumLoading}
            variant="ghost"
            fullWidth
          />
        </Card>

        <Button
          label="Sign out"
          onPress={handleSignOut}
          variant="ghost"
          fullWidth
        />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.screen, gap: spacing.md, paddingBottom: spacing.xxl },
  header: { gap: spacing.xs, paddingTop: spacing.sm },
  section: { gap: spacing.xs },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  sectionTitle: {
    flex: 1,
    gap: spacing.xs,
  },
  toggleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  toggleCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  rowActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  flexButton: {
    flex: 1,
  },
  packageList: {
    gap: spacing.sm,
  },
})
