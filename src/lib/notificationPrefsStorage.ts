const KEY = 'banking:notificationPrefs:v1'

export interface NotificationPrefs {
  email: boolean
  sms: boolean
  push: boolean
}

const DEFAULTS: NotificationPrefs = {
  email: true,
  sms: false,
  push: true,
}

export function loadNotificationPrefs(): NotificationPrefs {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...DEFAULTS }
    return { ...DEFAULTS, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULTS }
  }
}

export function saveNotificationPrefs(prefs: NotificationPrefs): void {
  localStorage.setItem(KEY, JSON.stringify(prefs))
}
