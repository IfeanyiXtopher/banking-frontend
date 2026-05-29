import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'

type AdminModalProps = {
  open: boolean
  onClose: () => void
  title: string
  description?: ReactNode
  children: ReactNode
  footer: ReactNode
  size?: 'md' | 'lg'
}

const sizeClass = {
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
}

export function AdminModal({ open, onClose, title, description, children, footer, size = 'lg' }: AdminModalProps) {
  if (!open) return null

  return (
    <div
      className="admin-modal-backdrop fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-modal-title"
        className={cn(
          'flex max-h-[min(92dvh,100dvh)] w-full flex-col overflow-hidden bg-white shadow-xl',
          'rounded-t-2xl border border-gray-200 sm:max-h-[min(90vh,720px)] sm:rounded-2xl',
          sizeClass[size],
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-gray-100 px-4 py-3 sm:px-5 sm:py-4">
          <div className="min-w-0">
            <h3 id="admin-modal-title" className="text-base font-semibold text-gray-900 sm:text-lg">
              {title}
            </h3>
            {description ? <div className="mt-1 text-xs leading-relaxed text-gray-500">{description}</div> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close"
          >
            <X size={18} aria-hidden />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">{children}</div>
        <div className="shrink-0 border-t border-gray-100 bg-gray-50/90 px-4 py-3 sm:px-5 sm:py-4">{footer}</div>
      </div>
    </div>
  )
}

export function AdminModalActions({
  onCancel,
  cancelLabel = 'Cancel',
  primaryLabel,
  onPrimary,
  primaryDisabled,
  primaryPending,
}: {
  onCancel: () => void
  cancelLabel?: string
  primaryLabel: string
  onPrimary: () => void
  primaryDisabled?: boolean
  primaryPending?: boolean
}) {
  return (
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <button type="button" className="btn-outline w-full text-sm sm:w-auto sm:min-w-[6rem]" onClick={onCancel}>
        {cancelLabel}
      </button>
      <button
        type="button"
        className="btn-primary w-full text-sm sm:w-auto sm:min-w-[6rem]"
        disabled={primaryDisabled || primaryPending}
        onClick={onPrimary}
      >
        {primaryPending ? 'Saving…' : primaryLabel}
      </button>
    </div>
  )
}
