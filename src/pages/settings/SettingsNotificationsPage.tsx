import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Mail, MessageSquare, Bell } from 'lucide-react'
import toast from 'react-hot-toast'
import PageShell from '@/components/layout/PageShell'
import { SettingsSettingRow, SettingsToggle } from '@/components/settings/SettingsControls'
import { loadNotificationPrefs, saveNotificationPrefs, type NotificationPrefs } from '@/lib/notificationPrefsStorage'

export default function SettingsNotificationsPage() {
  const [prefs, setPrefs] = useState<NotificationPrefs>(() => loadNotificationPrefs())

  useEffect(() => {
    setPrefs(loadNotificationPrefs())
  }, [])

  const update = (key: keyof NotificationPrefs, value: boolean) => {
    const next = { ...prefs, [key]: value }
    setPrefs(next)
    saveNotificationPrefs(next)
    toast.success('Preferences saved.')
  }

  return (
    <PageShell
      badge="Settings"
      title="Notifications"
      backTo="/settings"
      description={
        <div className="space-y-2">
          <nav className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
            <Link to="/settings" className="transition-colors hover:text-primary-dark">
              All settings
            </Link>
            <ChevronRight size={12} className="text-gray-300" aria-hidden />
            <span className="text-gray-700">Notifications</span>
          </nav>
          <p className="text-sm leading-relaxed text-gray-600">
            Choose how we reach you. Preferences are saved on this device for the demo.
          </p>
        </div>
      }
      contentClassName="!space-y-6"
    >
      <section className="settings-panel">
        <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4 sm:px-7">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Channels</h2>
          <p className="mt-1 text-sm text-gray-600">Turn channels on or off at any time.</p>
        </div>
        <div className="settings-panel-pad space-y-0 pt-2">
          <SettingsSettingRow
            icon={Mail}
            title="Email"
            description="Statements, alerts, and product updates."
            action={<SettingsToggle checked={prefs.email} onChange={() => update('email', !prefs.email)} />}
          />
          <SettingsSettingRow
            icon={MessageSquare}
            title="SMS"
            description="Security codes and urgent alerts."
            action={<SettingsToggle checked={prefs.sms} onChange={() => update('sms', !prefs.sms)} />}
          />
          <SettingsSettingRow
            icon={Bell}
            title="Push notifications"
            description="In-app alerts on your devices."
            action={<SettingsToggle checked={prefs.push} onChange={() => update('push', !prefs.push)} />}
          />
        </div>
      </section>
    </PageShell>
  )
}
