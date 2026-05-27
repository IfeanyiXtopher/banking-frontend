import { NavLink } from 'react-router-dom'
import { ChevronRight, User, Shield, Bell, Link2, LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import PageShell from '@/components/layout/PageShell'
import { cn } from '@/utils/cn'

const ITEMS = [
  {
    to: '/settings/personal',
    icon: User,
    label: 'Personal information',
    description: 'Name, address, ID, and preferences',
  },
  {
    to: '/settings/security',
    icon: Shield,
    label: 'Security & privacy',
    description: 'Password and two-factor authentication',
  },
  {
    to: '/settings/notifications',
    icon: Bell,
    label: 'Notifications',
    description: 'Email, SMS, and push preferences',
  },
  {
    to: '/settings/linked-accounts',
    icon: Link2,
    label: 'Linked accounts',
    description: 'Connected accounts and cards',
  },
] as const

export default function SettingsHubPage() {
  const { logout } = useAuth()

  return (
    <PageShell
      badge="Your profile"
      title="Settings"
      description="Manage how you appear in SafaPay Bank, how you sign in, and how we stay in touch."
      contentClassName="!space-y-6"
    >
      <section className="settings-panel">
        <div className="border-b border-gray-100 bg-gray-50/50 px-2">
          {ITEMS.map(({ to, icon: Icon, label, description }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex w-full items-center gap-4 border-l-4 px-4 py-4 text-left transition-colors sm:px-5 sm:py-5',
                  isActive ? 'border-l-primary-dark bg-white' : 'border-l-transparent hover:bg-white/70',
                )
              }
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 text-primary-dark ring-1 ring-gray-200/90">
                <Icon size={19} strokeWidth={1.75} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold tracking-tight text-gray-900">{label}</p>
                <p className="mt-0.5 text-sm text-gray-500">{description}</p>
              </div>
              <ChevronRight size={18} className="shrink-0 text-gray-300" aria-hidden />
            </NavLink>
          ))}
        </div>
      </section>

      <section className="settings-panel">
        <div className="settings-panel-pad flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Application</p>
            <p className="mt-1 text-sm font-medium text-gray-800">SafaPay Bank v1.0.0</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50/80 px-4 py-2.5 text-sm font-semibold text-red-700 transition-colors hover:border-red-300 hover:bg-red-50 sm:justify-end"
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </section>
    </PageShell>
  )
}
