import { cn } from '@/utils/cn'
import { formatDate, formatDisplayAmount } from '@/utils/format'
import {
  formatTransactionStatusLabel,
  transactionNarration,
  transactionSettlesBalance,
  type TransactionListItem,
} from '@/utils/transactionDisplay'

type Transaction = TransactionListItem

interface TransactionRowProps {
  transaction: Transaction
  accountId?: string
  onClick?: () => void
  compact?: boolean
  /** Hide status badge column (e.g. compact mobile dashboard). */
  hideStatus?: boolean
}

const TYPE_ICONS: Record<string, string> = {
  DEPOSIT: '↓',
  WITHDRAWAL: '↑',
  TRANSFER_INTERNAL: '⇄',
  TRANSFER_EXTERNAL: '⇄',
  TRANSFER_INTERNATIONAL: '🌐',
  LOAN_DISBURSEMENT: '💳',
  LOAN_PAYMENT: '💳',
  FEE: 'F',
  REVERSAL: '↺',
}

const STATUS_BADGE: Record<string, string> = {
  COMPLETED: 'badge-success',
  PENDING: 'badge-warning',
  FAILED: 'badge-danger',
  REVERSED: 'badge-neutral',
  FLAGGED: 'badge-danger',
}

export default function TransactionRow({ transaction, accountId, onClick, compact, hideStatus }: TransactionRowProps) {
  const isCredit = transaction.to_account === accountId
  const settles = transactionSettlesBalance(transaction.status)
  const amount = parseFloat(transaction.amount)
  const typeLabel = transaction.transaction_type.replace(/_/g, ' ')

  return (
    <div
      onClick={onClick}
      className={cn(
        'grid items-center gap-x-2 rounded-xl pl-3 pr-2 transition-colors hover:bg-gray-50',
        hideStatus
          ? 'grid-cols-[1.75rem_minmax(0,1fr)_5.5rem_7rem] gap-x-1.5 sm:grid-cols-[2rem_minmax(0,1fr)_6.25rem_7.5rem] sm:gap-x-2 sm:px-3'
          : 'grid-cols-[2.25rem_minmax(0,1fr)_5.75rem_5.75rem_7rem] sm:grid-cols-[2.5rem_minmax(0,1fr)_6.25rem_6.25rem_7.5rem] sm:gap-x-3 sm:px-4',
        compact ? 'py-1.5' : 'py-3',
        onClick && 'cursor-pointer',
      )}
    >
      <div className="flex justify-center">
        <div
          className={cn(
            'flex flex-shrink-0 items-center justify-center rounded-full bg-gray-100 font-bold text-gray-500',
            compact ? 'h-7 w-7 text-xs' : 'h-9 w-9 text-sm',
          )}
        >
          {TYPE_ICONS[transaction.transaction_type] ?? '•'}
        </div>
      </div>

      <div className="min-w-0">
        <p className={cn('truncate font-medium text-gray-800', compact ? 'text-xs' : 'text-sm')}>
          {transactionNarration(transaction)}
        </p>
        <p className={cn('text-gray-400', compact ? 'text-[10px]' : 'text-xs')}>
          {formatDate(transaction.created_at)}
        </p>
      </div>

      <div className="flex min-h-[2rem] w-full min-w-0 items-center justify-center">
        <span
          className={cn(
            'badge badge-neutral inline-flex min-w-0 max-w-full justify-center px-1.5 text-center font-medium uppercase leading-tight tracking-wide',
            hideStatus ? 'text-[8px] sm:text-[9px]' : 'text-[9px] sm:text-[10px]',
          )}
        >
          <span className="truncate">{typeLabel}</span>
        </span>
      </div>

      {!hideStatus ? (
        <div className="flex min-h-[2rem] w-full min-w-0 items-center justify-center">
          <span
            className={cn(
              'badge inline-flex min-w-0 max-w-full justify-center px-1.5 text-center text-[9px] font-medium leading-tight sm:text-[10px]',
              STATUS_BADGE[transaction.status] || 'badge-neutral',
            )}
          >
            <span className="truncate">{formatTransactionStatusLabel(transaction.status)}</span>
          </span>
        </div>
      ) : null}

      <div className="flex min-h-[2rem] w-full min-w-0 items-center justify-center">
        <p
          className={cn(
            'w-full text-center text-xs font-semibold tabular-nums sm:text-sm',
            !settles
              ? 'text-amber-700'
              : isCredit
                ? 'text-green-600'
                : 'text-gray-800',
          )}
        >
          {formatDisplayAmount(amount, isCredit)}
        </p>
      </div>
    </div>
  )
}
