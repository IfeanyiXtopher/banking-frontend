import { useState } from 'react'
import {
  Dialog, DialogBackdrop, DialogPanel, DialogTitle,
} from '@headlessui/react'
import { X, Check, MapPin, Truck, Info } from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/utils/cn'
import CardWidget from '@/components/ui/CardWidget'

type CardTier = 'premium' | 'basic'

const TIERS: {
  id: CardTier
  title: string
  description: string
}[] = [
  { id: 'premium', title: 'Premium card', description: 'Higher limits and travel perks (demo).' },
  { id: 'basic', title: 'Basic card', description: 'Everyday spending with no annual fee (demo).' },
]

const COLORS: { id: string; label: string; widget: 'premium' | 'credit' | 'standard' }[] = [
  { id: 'black', label: 'Black', widget: 'premium' },
  { id: 'green', label: 'Green', widget: 'standard' },
  { id: 'white', label: 'Slate', widget: 'credit' },
]

interface Props {
  open: boolean
  onClose: () => void
  cardHolder: string
  accountNumberFallback: string
  deliveryAddress: string
}

export default function RequestNewCardModal({
  open,
  onClose,
  cardHolder,
  accountNumberFallback,
  deliveryAddress,
}: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [tier, setTier] = useState<CardTier>('premium')
  const [colorId, setColorId] = useState('black')
  const [shipping, setShipping] = useState<'standard' | 'express'>('standard')

  const colorMeta = COLORS.find((c) => c.id === colorId) || COLORS[0]

  const reset = () => {
    setStep(1)
    setTier('premium')
    setColorId('black')
    setShipping('standard')
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const previewNumber = accountNumberFallback.padStart(10, '0').slice(-10)

  return (
    <Dialog open={open} onClose={handleClose} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-black/50" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel
          className={cn(
            'w-full rounded-2xl bg-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col',
            step === 2 ? 'max-w-3xl' : 'max-w-lg',
          )}
        >
          {step === 3 ? (
            <div className="relative p-6 overflow-y-auto text-center">
              <button
                type="button"
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:bg-gray-100"
                aria-label="Close"
              >
                <X size={20} />
              </button>
              <div className="w-16 h-16 rounded-full bg-accent/30 flex items-center justify-center mx-auto mb-4">
                <Check className="w-9 h-9 text-primary-dark" strokeWidth={2.5} />
              </div>
              <DialogTitle className="text-xl font-bold text-gray-900">Your new card is on the way!</DialogTitle>
              <p className="text-sm text-gray-500 mt-2">
                {shipping === 'express'
                  ? 'Express delivery: expect it in 1–2 business days (demo).'
                  : 'Standard delivery: 5–7 business days (demo).'}
              </p>
              <div className="mt-6 rounded-xl border border-gray-100 bg-gray-50 p-4 text-left flex gap-4">
                <div className="scale-[0.65] origin-top-left w-[140px] h-[88px] shrink-0 -ml-2 -mt-1">
                  <CardWidget
                    variant={colorMeta.widget}
                    accountNumber={previewNumber}
                    cardHolder={cardHolder}
                    accountType={tier === 'premium' ? 'Premium' : 'Basic'}
                    className="!max-w-none w-[200px]"
                  />
                </div>
                <div className="min-w-0 py-1">
                  <p className="font-semibold text-gray-900">{tier === 'premium' ? 'Premium card' : 'Basic card'}</p>
                  <p className="text-xs text-gray-500 mt-2 flex items-start gap-1">
                    <MapPin size={12} className="mt-0.5 shrink-0" />
                    {deliveryAddress}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-start gap-2 rounded-xl bg-blue-50 border border-blue-100 px-3 py-2 text-left text-xs text-blue-900">
                <Info size={14} className="shrink-0 mt-0.5" />
                <span>Your digital card will be available in the app once it&apos;s activated.</span>
              </div>
              <button type="button" className="btn-primary w-full mt-6 text-sm py-3" onClick={handleClose}>
                Done
              </button>
            </div>
          ) : step === 1 ? (
            <div className="p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <DialogTitle className="text-lg font-bold text-gray-900">Choose your new card</DialogTitle>
                <button
                  type="button"
                  onClick={handleClose}
                  className="p-2 rounded-full text-gray-400 hover:bg-gray-100"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-3">
                {TIERS.map((t) => {
                  const active = tier === t.id
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTier(t.id)}
                      className={cn(
                        'w-full text-left rounded-xl border-2 p-4 transition-colors flex items-start gap-3',
                        active ? 'border-primary-dark bg-primary-dark/5' : 'border-gray-100 hover:border-gray-200',
                      )}
                    >
                      <div
                        className={cn(
                          'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5',
                          active ? 'border-primary-dark bg-primary-dark' : 'border-gray-300',
                        )}
                      >
                        {active && <Check size={12} className="text-white" strokeWidth={3} />}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{t.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{t.description}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
              <button
                type="button"
                className="btn-accent w-full mt-6 text-sm font-semibold py-3 rounded-xl"
                onClick={() => setStep(2)}
              >
                Next
              </button>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row max-h-[min(90vh,640px)] md:max-h-[560px]">
              <div className="bg-primary-dark text-white p-6 md:w-[42%] flex flex-col justify-center shrink-0">
                <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-2">Step 2</p>
                <DialogTitle className="text-lg font-bold text-white mb-6">Personalize & delivery</DialogTitle>
                <div className="flex justify-center">
                  <CardWidget
                    variant={colorMeta.widget}
                    accountNumber={previewNumber}
                    cardHolder={cardHolder}
                    accountType={tier === 'premium' ? 'Premium' : 'Basic'}
                    className="!max-w-[260px] shadow-xl"
                  />
                </div>
              </div>
              <div className="flex-1 p-6 overflow-y-auto flex flex-col">
                <button
                  type="button"
                  onClick={handleClose}
                  className="md:hidden self-end p-2 rounded-full text-gray-400 hover:bg-gray-100 mb-2"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
                <div className="hidden md:flex justify-end -mt-2 -mr-2 mb-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="p-2 rounded-full text-gray-400 hover:bg-gray-100"
                    aria-label="Close"
                  >
                    <X size={20} />
                  </button>
                </div>

                <p className="text-sm font-medium text-gray-800 mb-2">Card color</p>
                <div className="flex gap-3 mb-6">
                  {COLORS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setColorId(c.id)}
                      className={cn(
                        'w-10 h-10 rounded-full border-2 transition-transform',
                        c.id === 'black' && 'bg-gray-900',
                        c.id === 'green' && 'bg-primary-dark',
                        c.id === 'white' && 'bg-sky-400',
                        colorId === c.id ? 'border-accent ring-2 ring-accent/40 scale-110' : 'border-gray-200',
                      )}
                      aria-label={c.label}
                    />
                  ))}
                </div>

                <p className="text-sm font-medium text-gray-800 mb-1">Delivery address</p>
                <div className="flex items-start justify-between gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 mb-6">
                  <p className="text-sm text-gray-600 flex items-start gap-2">
                    <MapPin size={16} className="text-gray-400 shrink-0 mt-0.5" />
                    {deliveryAddress}
                  </p>
                  <button
                    type="button"
                    onClick={() => toast('Update your address under Settings → Personal information.', { icon: 'ℹ️' })}
                    className="text-xs font-semibold text-primary-dark shrink-0"
                  >
                    Edit
                  </button>
                </div>

                <p className="text-sm font-medium text-gray-800 mb-2">Delivery method</p>
                <div className="space-y-2 mb-6">
                  {(
                    [
                      { id: 'standard' as const, title: 'Standard', sub: 'Free · 5–7 days', price: 'Free' },
                      { id: 'express' as const, title: 'Express', sub: '1–2 days', price: '$12' },
                    ]
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setShipping(opt.id)}
                      className={cn(
                        'w-full flex items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors',
                        shipping === opt.id ? 'border-primary-dark bg-primary-dark/5' : 'border-gray-100 hover:border-gray-200',
                      )}
                    >
                      <Truck size={18} className="text-gray-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{opt.title}</p>
                        <p className="text-xs text-gray-500">{opt.sub}</p>
                      </div>
                      <span className="text-xs font-semibold text-gray-700">{opt.price}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-auto flex gap-2 pt-2">
                  <button type="button" className="btn-outline flex-1 text-sm py-2.5" onClick={() => setStep(1)}>
                    Back
                  </button>
                  <button type="button" className="btn-primary flex-1 text-sm py-2.5" onClick={() => setStep(3)}>
                    Request card
                  </button>
                </div>
              </div>
            </div>
          )}
        </DialogPanel>
      </div>
    </Dialog>
  )
}
