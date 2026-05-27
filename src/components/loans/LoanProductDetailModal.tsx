import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { ArrowRight, Calendar, DollarSign, Landmark, Percent, X } from 'lucide-react'
import { formatDisplayCurrency, formatPercentage } from '@/utils/format'

export type LoanProductModalData = {
  name: string
  loan_type: string
  tagline: string
  heroImage: string
  fullDescription: string
  interest_rate: string
  limits: {
    min_amount: string
    max_amount: string
    min_term_months: number
    max_term_months: number
  }
}

type LoanProductDetailModalProps = {
  product: LoanProductModalData | null
  open: boolean
  onClose: () => void
  onApply: () => void
}

function splitDescription(full: string) {
  const parts = full.split(/\n\n+/).map((p) => p.trim()).filter(Boolean)
  return { overview: parts[0] ?? '', details: parts.slice(1) }
}

function loanTypeLabel(type: string) {
  return type.replace(/_/g, ' ')
}

export default function LoanProductDetailModal({
  product,
  open,
  onClose,
  onApply,
}: LoanProductDetailModalProps) {
  if (!product) {
    return (
      <Dialog open={open} onClose={onClose} className="relative z-[110]">
        <DialogBackdrop className="fixed inset-0 bg-black/45 backdrop-blur-[2px]" />
      </Dialog>
    )
  }

  const { overview, details } = splitDescription(product.fullDescription)
  const rate = parseFloat(product.interest_rate)
  const hasRate = Number.isFinite(rate) && rate > 0

  return (
    <Dialog open={open} onClose={onClose} className="relative z-[110]">
      <DialogBackdrop className="fixed inset-0 bg-black/45 backdrop-blur-[2px]" />
      <div className="fixed inset-0 flex items-end justify-center p-4 sm:items-center sm:p-6">
        <DialogPanel className="flex max-h-[min(92dvh,760px)] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div className="relative h-36 shrink-0 overflow-hidden sm:h-40">
            <img src={product.heroImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/95 via-primary-dark/40 to-primary-dark/10" />
            <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-3 bg-primary-dark/80 px-4 py-3 backdrop-blur-sm">
              <div className="flex min-w-0 items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-accent">
                  <Landmark size={16} strokeWidth={2} aria-hidden />
                </span>
                <span className="truncate text-[10px] font-bold uppercase tracking-[0.14em] text-white/80">
                  {loanTypeLabel(product.loan_type)}
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 rounded-lg p-1.5 text-white/80 transition hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 px-5 pb-4 pt-8">
              <DialogTitle className="text-xl font-bold tracking-tight text-white sm:text-2xl">{product.name}</DialogTitle>
              <p className="mt-1 text-sm leading-snug text-white/85">{product.tagline}</p>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100 bg-gray-50/60">
              <div className="px-3 py-4 text-center sm:px-4">
                <Percent className="mx-auto h-4 w-4 text-primary-dark" strokeWidth={2} aria-hidden />
                <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-gray-500">Rate</p>
                <p className="mt-0.5 text-sm font-bold tabular-nums text-gray-900">
                  {hasRate ? formatPercentage(product.interest_rate) : 'On approval'}
                </p>
              </div>
              <div className="px-3 py-4 text-center sm:px-4">
                <DollarSign className="mx-auto h-4 w-4 text-primary-dark" strokeWidth={2} aria-hidden />
                <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-gray-500">Amount</p>
                <p className="mt-0.5 text-xs font-bold leading-snug tabular-nums text-gray-900 sm:text-sm">
                  {formatDisplayCurrency(product.limits.min_amount)}
                  <span className="font-normal text-gray-400"> – </span>
                  {formatDisplayCurrency(product.limits.max_amount)}
                </p>
              </div>
              <div className="px-3 py-4 text-center sm:px-4">
                <Calendar className="mx-auto h-4 w-4 text-primary-dark" strokeWidth={2} aria-hidden />
                <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-gray-500">Term</p>
                <p className="mt-0.5 text-sm font-bold tabular-nums text-gray-900">
                  {product.limits.min_term_months}–{product.limits.max_term_months} mo
                </p>
              </div>
            </div>

            <div className="space-y-5 px-5 py-5 sm:px-6 sm:py-6">
              {overview ? (
                <div className="rounded-xl border border-primary-dark/10 bg-gradient-to-br from-primary-dark/[0.04] to-accent/[0.06] px-4 py-3.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-primary-dark">Overview</p>
                  <p className="mt-2 text-sm leading-relaxed text-gray-700">{overview}</p>
                </div>
              ) : null}

              {details.length > 0 ? (
                <div>
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500">What to know</p>
                  <ul className="space-y-4">
                    {details.map((para, i) => (
                      <li key={i} className="flex gap-3">
                        <span
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-dark text-[11px] font-bold text-white"
                          aria-hidden
                        >
                          {i + 1}
                        </span>
                        <p className="pt-0.5 text-sm leading-relaxed text-gray-600">{para}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>

          <div className="shrink-0 border-t border-gray-100 bg-white px-5 py-4 sm:px-6">
            <p className="mb-3 text-center text-xs leading-relaxed text-gray-500">
              Subject to credit review. You will see full terms before you accept any offer.
            </p>
            <button
              type="button"
              className="btn-primary flex w-full items-center justify-center gap-2 py-3 text-sm font-semibold"
              onClick={onApply}
            >
              Start application
              <ArrowRight size={16} strokeWidth={2.5} />
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
