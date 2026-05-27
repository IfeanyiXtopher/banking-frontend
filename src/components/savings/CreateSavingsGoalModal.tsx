import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react'
import {
  Car,
  Home,
  Plane,
  GraduationCap,
  Gift,
  CircleEllipsis,
  ChevronRight,
  X,
} from 'lucide-react'
import { differenceInCalendarMonths, format } from 'date-fns'
import toast from 'react-hot-toast'
import { savingsGoalsApi } from '@/api/savingsGoals'
import Spinner from '@/components/ui/Spinner'
import { cn } from '@/utils/cn'
import { type SavingsGoalCategory } from '@/lib/savingsGoalsStorage'
import { formatDisplayCurrency } from '@/utils/format'

const CATEGORIES: { id: SavingsGoalCategory; label: string; Icon: typeof Car }[] = [
  { id: 'car', label: 'Car', Icon: Car },
  { id: 'house', label: 'Home', Icon: Home },
  { id: 'plane', label: 'Travel', Icon: Plane },
  { id: 'education', label: 'Study', Icon: GraduationCap },
  { id: 'gift', label: 'Gift', Icon: Gift },
  { id: 'other', label: 'Other', Icon: CircleEllipsis },
]

const STEP_LABELS = ['Basics', 'Target date', 'Rules'] as const

interface Props {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-gray-500">
      {children}
    </label>
  )
}

export default function CreateSavingsGoalModal({ open, onClose, onCreated }: Props) {
  const queryClient = useQueryClient()
  const [step, setStep] = useState(1)
  const [goalName, setGoalName] = useState('')
  const [category, setCategory] = useState<SavingsGoalCategory>('car')
  const [targetAmount, setTargetAmount] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [roundUp, setRoundUp] = useState(true)
  const [weeklyRecurring, setWeeklyRecurring] = useState(false)
  const [weeklyAmount, setWeeklyAmount] = useState('50')
  const [smartSave, setSmartSave] = useState(false)

  const resetForm = () => {
    setStep(1)
    setGoalName('')
    setCategory('car')
    setTargetAmount('')
    setTargetDate('')
    setRoundUp(true)
    setWeeklyRecurring(false)
    setWeeklyAmount('50')
    setSmartSave(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const createMutation = useMutation({
    mutationFn: async () => {
      await savingsGoalsApi.create({
        title: goalName.trim(),
        category,
        target_amount: parseFloat(targetAmount).toFixed(2),
        target_date: targetDate || null,
        rules: {
          roundUp,
          weeklyRecurring,
          weeklyAmount: weeklyRecurring ? parseFloat(weeklyAmount) || 0 : 0,
          smartSave,
        },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings-goals'] })
      toast.success('Goal created.')
      onCreated()
      handleClose()
    },
    onError: (err: unknown) => {
      const data = (err as { response?: { data?: Record<string, unknown> } })?.response?.data
      const detail = typeof data?.detail === 'string' ? data.detail : null
      toast.error(detail || 'Could not create savings goal. Try again.')
    },
  })

  const targetNum = parseFloat(targetAmount) || 0
  const dateObj = targetDate ? new Date(`${targetDate}T12:00:00`) : null
  const monthsUntil =
    dateObj && !Number.isNaN(dateObj.getTime())
      ? Math.max(1, differenceInCalendarMonths(dateObj, new Date()))
      : 0
  const monthlyNeeded = monthsUntil > 0 ? targetNum / monthsUntil : 0

  const canStep1 = goalName.trim().length > 0 && targetNum > 0
  const canStep2 = Boolean(targetDate && dateObj && dateObj > new Date() && monthsUntil > 0)

  const submitStep1 = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canStep1) return
    setStep(2)
  }

  const submitStep2 = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canStep2) return
    setStep(3)
  }

  return (
    <Dialog open={open} onClose={handleClose} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-black/50 backdrop-blur-[2px] transition" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="flex max-h-[min(calc(100vh-2rem),640px)] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-[0_24px_48px_-12px_rgba(21,42,30,0.2)]">
          <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50/90 via-white to-white px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <DialogTitle className="text-base font-semibold text-gray-900">Create new goal</DialogTitle>
                <p className="mt-0.5 text-xs text-gray-500">
                  Step {step} of 3 — {STEP_LABELS[step - 1]}
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg border border-gray-200 p-1.5 text-gray-500 transition hover:bg-gray-50 hover:text-gray-800"
                aria-label="Close"
              >
                <X size={16} aria-hidden />
              </button>
            </div>
            <div className="mt-3 flex gap-1">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={cn(
                    'h-1 flex-1 rounded-full transition-colors',
                    s <= step ? 'bg-primary-dark' : 'bg-gray-200',
                  )}
                />
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4">
            {step === 1 ? (
              <form onSubmit={submitStep1} className="space-y-4">
                <div>
                  <FieldLabel>Goal name</FieldLabel>
                  <input
                    className="input-field w-full text-sm"
                    value={goalName}
                    onChange={(e) => setGoalName(e.target.value)}
                    placeholder="e.g. New car fund"
                    autoFocus
                  />
                </div>
                <div>
                  <FieldLabel>Category</FieldLabel>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(({ id, label, Icon }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setCategory(id)}
                        className={cn(
                          'flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition',
                          category === id
                            ? 'border-primary-dark bg-primary-dark/[0.06] text-primary-dark shadow-sm'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300',
                        )}
                      >
                        <Icon size={14} aria-hidden />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <FieldLabel>Target amount</FieldLabel>
                  <input
                    className="input-field w-full text-sm tabular-nums"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!canStep1}
                  className="btn-primary flex w-full items-center justify-center gap-2 py-2.5 text-sm disabled:opacity-50"
                >
                  Next: target date
                  <ChevronRight size={16} aria-hidden />
                </button>
              </form>
            ) : step === 2 ? (
              <form onSubmit={submitStep2} className="space-y-4">
                <div>
                  <FieldLabel>Target date</FieldLabel>
                  <input
                    className="input-field w-full text-sm"
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    min={format(new Date(), 'yyyy-MM-dd')}
                  />
                </div>
                {canStep2 ? (
                  <p className="text-xs text-gray-600">
                    About{' '}
                    <span className="font-semibold text-primary-dark">
                      {formatDisplayCurrency(monthlyNeeded)}/mo
                    </span>{' '}
                    to reach {formatDisplayCurrency(targetNum)} by{' '}
                    {dateObj ? format(dateObj, 'MMM yyyy') : ''}
                  </p>
                ) : null}
                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={() => setStep(1)} className="btn-outline flex-1 py-2.5 text-sm">
                    Back
                  </button>
                  <button type="submit" disabled={!canStep2} className="btn-primary flex-1 py-2.5 text-sm disabled:opacity-50">
                    Next: rules
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="overflow-hidden rounded-xl border border-gray-200 divide-y divide-gray-100">
                  <label className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3 transition hover:bg-gray-50/80">
                    <span className="text-sm font-medium text-gray-900">Round-up transactions</span>
                    <input
                      type="checkbox"
                      checked={roundUp}
                      onChange={(e) => setRoundUp(e.target.checked)}
                      className="rounded border-gray-300 text-primary-dark focus:ring-primary/30"
                    />
                  </label>
                  <div className="px-4 py-3">
                    <label className="flex cursor-pointer items-center justify-between gap-3">
                      <span className="text-sm font-medium text-gray-900">Weekly recurring</span>
                      <input
                        type="checkbox"
                        checked={weeklyRecurring}
                        onChange={(e) => setWeeklyRecurring(e.target.checked)}
                        className="rounded border-gray-300 text-primary-dark focus:ring-primary/30"
                      />
                    </label>
                    {weeklyRecurring ? (
                      <input
                        type="number"
                        min="0"
                        step="1"
                        className="input-field mt-2 w-full text-sm tabular-nums"
                        value={weeklyAmount}
                        onChange={(e) => setWeeklyAmount(e.target.value)}
                        placeholder="Weekly amount"
                      />
                    ) : null}
                  </div>
                  <label className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3 transition hover:bg-gray-50/80">
                    <span className="text-sm font-medium text-gray-900">Smart save</span>
                    <input
                      type="checkbox"
                      checked={smartSave}
                      onChange={(e) => setSmartSave(e.target.checked)}
                      className="rounded border-gray-300 text-primary-dark focus:ring-primary/30"
                    />
                  </label>
                </div>

                <div className="rounded-xl border border-primary-dark/10 bg-primary-dark/[0.04] px-3.5 py-2.5 text-xs text-gray-700">
                  <span className="font-semibold text-gray-900">{goalName}</span>
                  <span className="text-gray-400"> · </span>
                  {formatDisplayCurrency(targetNum)}
                  <span className="text-gray-400"> · </span>
                  {dateObj ? format(dateObj, 'MMM d, yyyy') : ''}
                </div>

                <div className="flex gap-2">
                  <button type="button" onClick={() => setStep(2)} className="btn-outline flex-1 py-2.5 text-sm">
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={createMutation.isPending}
                    onClick={() => createMutation.mutate()}
                    className="btn-primary flex flex-1 items-center justify-center gap-2 py-2.5 text-sm disabled:opacity-50"
                  >
                    {createMutation.isPending && (
                      <Spinner size="sm" className="border-white border-t-white/30" />
                    )}
                    Create goal
                  </button>
                </div>
              </div>
            )}
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
