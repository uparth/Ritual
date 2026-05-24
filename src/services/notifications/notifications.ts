import { Platform } from 'react-native'
import * as Notifications from 'expo-notifications'

export type ReminderKind = 'morning_checkin' | 'walk' | 'evening_reflection' | 'low_energy'

export interface ReminderSchedule {
  kind: ReminderKind
  enabled: boolean
  hour: number
  minute: number
  title: string
  body: string
}

export interface NotificationPermissionState {
  granted: boolean
  canAskAgain: boolean
  status: Notifications.PermissionStatus | 'unsupported'
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

export function isNotificationSupported(): boolean {
  return Platform.OS !== 'web'
}

export async function getNotificationPermission(): Promise<NotificationPermissionState> {
  if (!isNotificationSupported()) {
    return { granted: false, canAskAgain: false, status: 'unsupported' }
  }

  const permission = await Notifications.getPermissionsAsync()
  return {
    granted: permission.granted,
    canAskAgain: permission.canAskAgain,
    status: permission.status,
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  if (!isNotificationSupported()) {
    return { granted: false, canAskAgain: false, status: 'unsupported' }
  }

  const current = await Notifications.getPermissionsAsync()
  const permission = current.granted ? current : await Notifications.requestPermissionsAsync()

  if (Platform.OS === 'android' && permission.granted) {
    await Notifications.setNotificationChannelAsync('ritual-reminders', {
      name: 'Ritual reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    })
  }

  return {
    granted: permission.granted,
    canAskAgain: permission.canAskAgain,
    status: permission.status,
  }
}

export async function cancelReminderIds(ids: string[]): Promise<void> {
  await Promise.all(ids.map(id => Notifications.cancelScheduledNotificationAsync(id)))
}

export async function scheduleDailyReminder(reminder: ReminderSchedule): Promise<string | null> {
  if (!isNotificationSupported() || !reminder.enabled) return null

  return Notifications.scheduleNotificationAsync({
    content: {
      title: reminder.title,
      body: reminder.body,
      data: { kind: reminder.kind },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: reminder.hour,
      minute: reminder.minute,
      channelId: Platform.OS === 'android' ? 'ritual-reminders' : undefined,
    },
  })
}
