import { useState } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { X } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  currencySymbol: string
  issueFee: string
  onConfirm: (terminatePrevious: boolean) => void
  isSubmitting: boolean
}

export default function RequestReplacementModal({
  open,
  onClose,
  currencySymbol,
  issueFee,
  onConfirm,
  isSubmitting,
}: Props) {
  const [terminatePrevious, setTerminatePrevious] = useState(true)
  const feeNum = parseFloat(issueFee || '0')

  const handleClose = () => {
    if (!isSubmitting) {
      setTerminatePrevious(true)
      onClose()
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-black/50" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:bg-gray-100 disabled:opacity-50"
            aria-label="Close"
          >
            <X size={20} />
          </button>
          <DialogTitle className="pr-10 text-lg font-bold text-gray-900">Request card replacement</DialogTitle>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            The same issuance fee applies as when you first ordered this card (
            <strong className="tabular-nums text-gray-900">
              {currencySymbol}
              {feeNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </strong>
            ). After you confirm, use <strong>Pay</strong> under this account to activate the replacement.
          </p>
          <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/80 p-3">
            <input
              type="checkbox"
              checked={terminatePrevious}
              onChange={(e) => setTerminatePrevious(e.target.checked)}
              disabled={isSubmitting}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-primary-dark focus:ring-primary-dark"
            />
            <span className="text-sm text-gray-700">
              <span className="font-medium text-gray-900">Terminate my current card immediately.</span>{' '}
              Recommended if it was lost or stolen. If you leave this off, your current card stays usable until the
              replacement is paid and activated—then the previous card is closed automatically.
            </span>
          </label>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" className="btn-outline text-sm py-2.5 sm:min-w-[100px]" disabled={isSubmitting} onClick={handleClose}>
              Cancel
            </button>
            <button
              type="button"
              className="btn-primary text-sm py-2.5 sm:min-w-[140px]"
              disabled={isSubmitting}
              onClick={() => onConfirm(terminatePrevious)}
            >
              {isSubmitting ? 'Submitting…' : 'Request replacement'}
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
