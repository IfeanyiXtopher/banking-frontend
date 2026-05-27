import type { ReactNode } from 'react'
import { Sparkles } from 'lucide-react'
import { cn } from '@/utils/cn'
import { usePageChrome } from '@/contexts/PageChromeContext'

export type PageShellProps = {
  title: string
  description?: ReactNode
  /** Small pill above the title (e.g. section name) */
  badge?: string
  /** Show an icon-only back link above the badge (e.g. sub-settings → hub). */
  backTo?: string
  /** Accessible name for the back control; defaults to "Go back" */
  backAriaLabel?: string
  /** Right side of the header (actions) */
  headerAside?: ReactNode
  children: ReactNode
  /** Inner max width; default matches most app pages */
  maxWidthClass?: string
  /** Extra class on the animated content wrapper */
  contentClassName?: string
}

/**
 * Shared page frame with fade-in header. Lime atmosphere is applied in AppLayout.
 */
export default function PageShell({
  title,
  description,
  badge,
  backTo,
  backAriaLabel = 'Go back',
  headerAside,
  children,
  maxWidthClass = 'max-w-5xl',
  contentClassName,
}: PageShellProps) {
  usePageChrome(
    backTo
      ? {
          showBack: true,
          backTo,
          backLabel: backAriaLabel === 'Go back' ? 'Back' : backAriaLabel,
        }
      : null,
  )

  return (
    <div className={cn('relative mx-auto space-y-8 pb-10 pt-1', maxWidthClass)}>
        <header className="animate-pay-fade-up">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              {badge ? (
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary-dark/10 bg-primary-dark/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary-dark">
                  <Sparkles size={14} className="shrink-0 text-accent" aria-hidden />
                  {badge}
                </div>
              ) : null}
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">{title}</h1>
              {description ? (
                <div className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-600">{description}</div>
              ) : null}
            </div>
            {headerAside ? (
              <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">{headerAside}</div>
            ) : null}
          </div>
        </header>
        <div className={cn('animate-pay-fade-up space-y-6', contentClassName)} style={{ animationDelay: '60ms' }}>
          {children}
        </div>
    </div>
  )
}
