import {
  Dialog, DialogBackdrop, DialogPanel, DialogTitle,
} from '@headlessui/react'
import { X, Download, Flag, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/utils/cn'
import { formatDate, formatDisplayAmount } from '@/utils/format'
import {
  type TransactionListItem,
  getCategoryMeta,
  inferCategory,
  transactionNarration,
  statusBadgeClass,
  formatTransactionStatusLabel,
  canResumeCompliance,
  transactionSettlesBalance,
} from '@/utils/transactionDisplay'

interface Props {
  transaction: TransactionListItem | null
  isCredit: boolean
  onClose: () => void
  onContinueCompliance?: (tx: TransactionListItem) => void
}

export default function TransactionDetailDrawer({
  transaction: tx,
  isCredit,
  onClose,
  onContinueCompliance,
}: Props) {
  const cat = tx ? inferCategory(tx) : 'other'
  const categoryMeta = getCategoryMeta(cat)
  const CategoryIcon = categoryMeta.Icon
  const merchant = tx ? transactionNarration(tx) : ''
  const settles = tx ? transactionSettlesBalance(tx.status) : false

  return (
    <Dialog open={Boolean(tx)} onClose={onClose} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-black/40" />
      <div className="fixed inset-0 flex justify-end pointer-events-none">
        <DialogPanel className="pointer-events-auto h-full w-full max-w-md bg-white shadow-2xl flex flex-col border-l border-gray-100">
          {tx && (
            <>
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <DialogTitle className="text-lg font-semibold text-gray-900">Transaction details</DialogTitle>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
                <div>
                  <p
                    className={cn(
                      'text-3xl font-bold tabular-nums',
                      !settles
                        ? 'text-amber-800'
                        : isCredit
                          ? 'text-green-700'
                          : 'text-gray-900',
                    )}
                  >
                    {formatDisplayAmount(parseFloat(tx.amount), isCredit)}
                  </p>
                  <span
                    className={`inline-flex mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadgeClass(tx.status)}`}
                  >
                    {formatTransactionStatusLabel(tx.status)}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-primary-dark">
                    <CategoryIcon size={26} strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">{merchant}</p>
                    <p className="text-sm text-gray-500">{categoryMeta.label}</p>
                  </div>
                </div>

                <dl className="space-y-4 text-sm">
                  <div className="flex justify-between gap-4 py-2 border-b border-gray-50">
                    <dt className="text-gray-500">Date</dt>
                    <dd className="text-gray-900 font-medium text-right">
                      {formatDate(tx.created_at, 'MMM dd, yyyy, h:mm a')}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 py-2 border-b border-gray-50">
                    <dt className="text-gray-500">Payment method</dt>
                    <dd className="text-gray-900 font-medium text-right">
                      {tx.from_account_number
                        ? `Account ····${String(tx.from_account_number).slice(-4)}`
                        : tx.to_account_number
                          ? `Account ····${String(tx.to_account_number).slice(-4)}`
                          : '—'}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 py-2 border-b border-gray-50">
                    <dt className="text-gray-500">Category</dt>
                    <dd className="text-gray-900 font-medium text-right">{categoryMeta.label}</dd>
                  </div>
                  <div className="flex justify-between gap-4 py-2 border-b border-gray-50">
                    <dt className="text-gray-500">Reference</dt>
                    <dd className="text-gray-900 font-mono text-xs text-right break-all">
                      {tx.reference_number || tx.id.slice(0, 8)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 py-2">
                    <dt className="text-gray-500">Type</dt>
                    <dd className="text-gray-900 font-medium text-right">
                      {tx.transaction_type.replace(/_/g, ' ')}
                    </dd>
                  </div>
                </dl>

                {tx.compliance_resume && tx.status === 'PENDING' ? (
                  <div className="rounded-xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-sm text-amber-950">
                    <p className="font-medium">Compliance verification in progress</p>
                    <p className="mt-1 text-xs text-amber-900/80">
                      {tx.compliance_resume.is_expired
                        ? 'This session has expired — contact support if you need help.'
                        : 'Complete the remaining step to post this transfer.'}
                    </p>
                  </div>
                ) : null}
              </div>

              <div className="p-5 border-t border-gray-100 space-y-2 bg-gray-50/80">
                {canResumeCompliance(tx) && onContinueCompliance ? (
                  <button
                    type="button"
                    className="btn-primary w-full text-sm py-2.5 flex items-center justify-center gap-2"
                    onClick={() => onContinueCompliance(tx)}
                  >
                    <Shield size={16} />
                    Continue compliance
                  </button>
                ) : null}
                <button
                  type="button"
                  className={cn(
                    'w-full text-sm py-2.5 flex items-center justify-center gap-2',
                    canResumeCompliance(tx) && onContinueCompliance ? 'btn-outline' : 'btn-primary',
                  )}
                  onClick={() => toast.success('Receipt download started (demo).')}
                >
                  <Download size={16} />
                  Download receipt
                </button>
                <button
                  type="button"
                  className="btn-outline w-full text-sm py-2.5 flex items-center justify-center gap-2"
                  onClick={() => toast('Thanks — support will follow up (demo).', { icon: '💬' })}
                >
                  <Flag size={16} />
                  Report a problem
                </button>
              </div>
            </>
          )}
        </DialogPanel>
      </div>
    </Dialog>
  )
}
