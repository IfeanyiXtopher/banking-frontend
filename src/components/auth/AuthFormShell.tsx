import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/utils/cn'

export function AuthBackLink({ to, label, compact }: { to: string; label: string; compact?: boolean }) {
  return (
    <Link
      to={to}
      className={cn(
        'inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-primary-dark',
        compact ? 'mb-3' : 'mb-6 gap-2',
      )}
    >
      {!compact ? (
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200/80 bg-white shadow-sm">
          <ArrowLeft className="h-4 w-4" aria-hidden />
        </span>
      ) : (
        <ArrowLeft className="h-3.5 w-3.5 shrink-0" aria-hidden />
      )}
      {label}
    </Link>
  )
}

export function AuthFormHeader({
  title,
  subtitle,
  centered,
  compact,
}: {
  title: string
  subtitle?: string
  centered?: boolean
  compact?: boolean
}) {
  return (
    <div className={cn(compact ? 'mb-3' : 'mb-8', centered && 'text-center')}>
      <h1
        className={cn(
          'font-bold tracking-tight text-primary-dark',
          compact ? 'text-xl' : 'text-2xl sm:text-[1.75rem]',
        )}
      >
        {title}
      </h1>
      {subtitle ? (
        <p
          className={cn(
            'text-gray-500',
            compact ? 'mt-0.5 text-xs' : 'mt-2 text-sm leading-relaxed',
            centered && 'mx-auto max-w-sm',
          )}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  )
}

export function AuthFormCard({
  children,
  className,
  compact,
  signup,
}: {
  children: React.ReactNode
  className?: string
  compact?: boolean
  /** Full-width comfortable sizing for sign-up (viewport-fit). */
  signup?: boolean
}) {
  return (
    <div
      className={cn(
        'auth-form-panel relative w-full overflow-hidden rounded-2xl border border-gray-100/90 bg-white shadow-[0_24px_60px_-28px_rgba(21,42,30,0.18)]',
        signup && 'auth-form-panel--signup p-6 sm:p-8 lg:p-9',
        compact && !signup && 'auth-form-panel--compact p-4 sm:p-5',
        !signup && !compact && 'p-6 sm:p-8',
        className,
      )}
    >
      <div
        className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-dark via-accent to-primary-light"
        aria-hidden
      />
      {children}
    </div>
  )
}

export function AuthDivider({ label }: { label: string }) {
  return (
    <div className="relative my-7 flex items-center gap-4">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent" aria-hidden />
      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">{label}</span>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent" aria-hidden />
    </div>
  )
}

export function AuthSocialButtons() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        className="auth-social-btn flex items-center justify-center gap-2 rounded-xl border border-gray-200/90 bg-gray-50/80 px-4 py-2.5 text-sm font-medium text-gray-700 transition-all hover:border-gray-300 hover:bg-white hover:shadow-sm"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Google
      </button>
      <button
        type="button"
        className="auth-social-btn flex items-center justify-center gap-2 rounded-xl border border-gray-200/90 bg-gray-50/80 px-4 py-2.5 text-sm font-medium text-gray-700 transition-all hover:border-gray-300 hover:bg-white hover:shadow-sm"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.42c1.29.06 2.19.74 2.95.72.94-.04 2.35-.76 4.01-.65 2.27.16 3.7 1.53 3.7 1.53-3.27 1.92-2.85 5.88.19 7.36-.43 1.11-.9 2.19-2.85 3.9zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
        </svg>
        Apple
      </button>
    </div>
  )
}

export function AuthFooterLink({
  prompt,
  linkLabel,
  to,
  compact,
}: {
  prompt: string
  linkLabel: string
  to: string
  compact?: boolean
}) {
  return (
    <p className={cn('text-center text-gray-500', compact ? 'mt-3 text-xs' : 'mt-8 text-sm')}>
      {prompt}{' '}
      <Link to={to} className="font-semibold text-primary-dark transition-colors hover:text-primary">
        {linkLabel}
      </Link>
    </p>
  )
}
