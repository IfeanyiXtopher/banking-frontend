import type { LucideIcon } from 'lucide-react'
import { Building2, Check, CreditCard, Lock, PiggyBank, Wallet } from 'lucide-react'
import { cn } from '@/utils/cn'
import { formatAccountTypeLabel } from '@/lib/accountDisplay'
import {
  type AccountTypeCode,
  type AccountTypeMarketing,
} from '@/lib/accountTypeMarketing'

const TYPE_ICONS: Record<AccountTypeCode, LucideIcon> = {
  CHECKING: Wallet,
  SAVINGS: PiggyBank,
  BUSINESS: Building2,
  FIXED_TERM: Lock,
  CREDIT: CreditCard,
}

type AccountTypeExploreCardProps = {
  code: AccountTypeCode
  marketing: AccountTypeMarketing
  owned: boolean
  canAdd: boolean
  onAdd?: () => void
}

export default function AccountTypeExploreCard({
  code,
  marketing,
  owned,
  canAdd,
  onAdd,
}: AccountTypeExploreCardProps) {
  const Icon = TYPE_ICONS[code]
  const title = formatAccountTypeLabel(code)

  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border bg-white shadow-card',
        'transition-[transform,box-shadow,border-color] duration-300',
        'hover:-translate-y-1 hover:border-accent/30 hover:shadow-[0_16px_36px_-12px_rgba(21,42,30,0.16)]',
        owned ? 'border-primary-dark/15 ring-1 ring-primary-dark/10' : 'border-gray-100',
      )}
    >
      <div className="relative h-40 overflow-hidden sm:h-44">
        <img
          src={marketing.imageUrl}
          alt=""
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary-dark/90 via-primary-dark/35 to-primary-dark/5"
          aria-hidden
        />
        <div
          className={cn(
            'pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent',
            'group-hover:animate-feature-shine',
          )}
          aria-hidden
        />
        <div className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white/95 text-primary-dark shadow-sm backdrop-blur-sm">
          <Icon size={18} strokeWidth={2} aria-hidden />
        </div>
        {owned ? (
          <span className="absolute right-3 top-3 rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-dark shadow-sm">
            Yours
          </span>
        ) : null}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-base font-bold leading-tight text-white drop-shadow-sm sm:text-lg">{title}</h3>
          <p className="mt-0.5 text-xs font-medium text-white/85">{marketing.headline}</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p className="text-sm leading-relaxed text-gray-600">{marketing.benefit}</p>
        <ul className="mt-3 space-y-1.5">
          {marketing.highlights.map((item) => (
            <li key={item} className="flex items-start gap-2 text-xs text-gray-500">
              <Check size={14} strokeWidth={2.5} className="mt-0.5 shrink-0 text-accent" aria-hidden />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        {!owned && canAdd && onAdd ? (
          <button
            type="button"
            onClick={onAdd}
            className="mt-4 w-full rounded-xl border border-primary-dark/15 py-2 text-xs font-semibold text-primary-dark transition hover:bg-primary-dark/[0.04]"
          >
            Open {title.toLowerCase()}
          </button>
        ) : null}
      </div>
    </article>
  )
}
