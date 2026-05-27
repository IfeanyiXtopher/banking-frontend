import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/utils/cn'

export function SettingsToggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean
  onChange: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      className={cn(
        'relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-dark/35 focus-visible:ring-offset-2',
        checked ? 'bg-primary-dark' : 'bg-gray-200',
        disabled && 'cursor-not-allowed opacity-45',
      )}
    >
      <span
        className={cn(
          'pointer-events-none absolute left-1 top-1 block h-5 w-5 rounded-full bg-white shadow-md ring-1 ring-black/[0.06]',
          'transition-transform duration-200 ease-out',
          checked ? 'translate-x-5' : 'translate-x-0',
        )}
      />
    </button>
  )
}

type Icon = LucideIcon

export function SettingsSettingRow({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: Icon
  title: string
  description: string
  action: ReactNode
}) {
  return (
    <div className="flex gap-4 border-b border-gray-100 py-5 last:border-b-0 first:pt-0 last:pb-0">
      {Icon ? (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/80 text-primary-dark ring-1 ring-gray-200/80">
          <Icon size={20} strokeWidth={1.75} />
        </div>
      ) : null}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold tracking-tight text-gray-900">{title}</p>
        <p className="mt-1 text-sm leading-relaxed text-gray-500">{description}</p>
      </div>
      <div className="flex shrink-0 items-center self-center">{action}</div>
    </div>
  )
}
