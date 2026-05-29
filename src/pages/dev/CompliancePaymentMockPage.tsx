import { useState } from 'react'
import { Palette } from 'lucide-react'
import CompliancePaymentModalMock from '@/components/transactions/CompliancePaymentModalMock'
import type { AdminPaymentAvailability } from '@/components/transactions/compliancePaymentMockData'
import { cn } from '@/utils/cn'

const AVAILABILITY_OPTIONS: { value: AdminPaymentAvailability; label: string }[] = [
  { value: 'crypto', label: 'Crypto only' },
  { value: 'wire', label: 'Bank wire only' },
  { value: 'both', label: 'Both (customer chooses)' },
]

export default function CompliancePaymentMockPage() {
  const [open, setOpen] = useState(false)
  const [availability, setAvailability] = useState<AdminPaymentAvailability>('both')

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div className="flex items-start gap-3 rounded-2xl border border-violet-200 bg-violet-50/80 px-4 py-4">
        <Palette className="mt-0.5 h-5 w-5 shrink-0 text-violet-700" aria-hidden />
        <div>
          <h1 className="text-lg font-bold text-gray-900">Compliance payment modal — mock</h1>
          <p className="mt-1 text-sm leading-relaxed text-gray-700">
            Preview only. After admin allows self-service payment, the customer opens this flow instead of generating
            a code from balance. Admin configures crypto, wire, or both per fee line (not wired yet).
          </p>
        </div>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Simulate admin setting</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {AVAILABILITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setAvailability(opt.value)}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-inset transition',
                availability === opt.value
                  ? 'bg-primary-dark text-white ring-primary-dark'
                  : 'bg-white text-gray-700 ring-gray-200 hover:ring-gray-300',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <button type="button" className="btn-primary mt-6 w-full sm:w-auto" onClick={() => setOpen(true)}>
          Open payment modal
        </button>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 text-sm text-gray-600 shadow-sm">
        <h2 className="font-semibold text-gray-900">Included in mock</h2>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>Crypto: BTC, USDT (ERC-20, TRC-20, BEP-20), ETH — address + QR + copy</li>
          <li>Wire: international beneficiary / bank / SWIFT / IBAN / reference fields</li>
          <li>Method picker when admin enables both</li>
          <li>Optional proof upload placeholder and “I&apos;ve sent payment” confirmation step</li>
        </ul>
      </section>

      <CompliancePaymentModalMock
        open={open}
        onClose={() => setOpen(false)}
        availableMethods={availability}
        feeName="YTRD"
        feeAmount="8000000.00"
      />
    </div>
  )
}
