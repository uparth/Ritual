import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  cancelReminderIds,
  getNotificationPermission,
  requestNotificationPermission,
  scheduleDailyReminder,
  type NotificationPermissionState,
  type ReminderKind,
  type ReminderSchedule,
} from '@/services/notifications'

export type ReminderSettings = Record<ReminderKind, ReminderSchedule>

interface NotificationState {
  permission: NotificationPermissionState | null
  settings: ReminderSettings
  scheduledIds: string[]
  loading: boolean
  error: string | null
  refreshPermission: () => Promise<void>
  setReminderEnabled: (kind: ReminderKind, enabled: boolean) => void
  scheduleEnabledReminders: () => Promise<void>
  cancelAllReminders: () => Promise<void>
  clearError: () => void
}

const defaultSettings: ReminderSettings = {
  morning_checkin: {
    kind: 'morning_checkin',
    enabled: true,
    hour: 7,
    minute: 30,
    title: 'Morning check-in',
    body: 'Take one minute to notice your energy, mood, and needs.',
  },
  walk: {
    kind: 'walk',
    enabled: false,
    hour: 12,
    minute: 30,
    title: 'Body reset',
    body: 'A short walk or stretch can change the whole afternoon.',
  },
  evening_reflection: {
    kind: 'evening_reflection',
    enabled: true,
    hour: 21,
    minute: 0,
    title: 'Evening reflection',
    body: 'Close the day gently with a quick reflection.',
  },
  low_energy: {
    kind: 'low_energy',
    enabled: false,
    hour: 17,
    minute: 30,
    title: 'Low-energy option',
    body: 'Choose the smallest version of your ritual. Tiny still counts.',
  },
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      permission: null,
      settings: defaultSettings,
      scheduledIds: [],
      loading: false,
      error: null,

      refreshPermission: async () => {
        const permission = await getNotificationPermission()
        set({ permission })
      },

      setReminderEnabled: (kind, enabled) => {
        set(state => ({
          settings: {
            ...state.settings,
            [kind]: { ...state.settings[kind], enabled },
          },
        }))
      },

      scheduleEnabledReminders: async () => {
        set({ loading: true, error: null })
        try {
          const permission = await requestNotificationPermission()
          if (!permission.granted) {
            set({
              permission,
              loading: false,
              error: permission.status === 'unsupported'
                ? 'Notifications are available on iOS and Android builds.'
                : 'Notification permission was not granted.',
            })
            return
          }

          const currentIds = get().scheduledIds
          if (currentIds.length > 0) await cancelReminderIds(currentIds)

          const ids = (await Promise.all(
            Object.values(get().settings).map(scheduleDailyReminder),
          )).filter((id): id is string => Boolean(id))

          set({ permission, scheduledIds: ids, loading: false })
        } catch {
          set({ loading: false, error: 'Could not schedule reminders. Please try again.' })
        }
      },

      cancelAllReminders: async () => {
        set({ loading: true, error: null })
        try {
          await cancelReminderIds(get().scheduledIds)
          set({ scheduledIds: [], loading: false })
        } catch {
          set({ loading: false, error: 'Could not cancel reminders. Please try again.' })
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'ritual-notification-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        permission: state.permission,
        settings: state.settings,
        scheduledIds: state.scheduledIds,
      }),
    },
  ),
)
