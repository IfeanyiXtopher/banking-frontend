import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import {
  Plus,
  CheckCircle2,
  Zap,
  Wifi,
  Shield,
  Film,
  Dumbbell,
  LayoutGrid,
  Pause,
  Play,
  Trash2,
  Landmark,
  X,
  Repeat2,
} from 'lucide-react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { cn } from '@/utils/cn'
import { StyledSelect } from '@/components/forms/StyledSelect'
import {
  type RecurringPayment,
  type RecurringFrequency,
  loadRecurringPayments,
  saveRecurringPayments,
  createRecurringPayment,
  monthlyEquivalent,
} from '@/lib/recurringPaymentsStorage'
import { loansApi } from '@/api/loans'
import { formatDisplayCurrency } from '@/utils/format'

function normalizeList(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload
  if (payload && typeof payload === 'object' && Array.isArray((payload as { results?: unknown }).results)) {
    return (payload as { results: unknown[] }).results
  }
  return []
}

const FREQUENCIES: { value: RecurringFrequency; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
]

const CATEGORY_PRESETS = [
  { value: 'Utilities', label: 'Utilities', Icon: Zap },
  { value: 'Internet', label: 'Internet', Icon: Wifi },
  { value: 'Insurance', label: 'Insurance', Icon: Shield },
  { value: 'Entertainment', label: 'Entertainment', Icon: Film },
  { value: 'Wellness', label: 'Wellness', Icon: Dumbbell },
  { value: 'Other', label: 'Other', Icon: LayoutGrid },
] as const

const PIE_COLORS = ['#152A1E', '#1E3A2A', '#C8F000', '#6B7280', '#10B981', '#8B5CF6']

function categoryIcon(category: string) {
  const p = CATEGORY_PRESETS.find((c) => c.value === category)
  return p ? p.Icon : LayoutGrid
}

export default function RecurringPaymentsPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState<RecurringPayment[]>(() => loadRecurringPayments())
  const [modalOpen, setModalOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [draftName, setDraftName] = useState('')
  const [draftAmount, setDraftAmount] = useState('')
  const [draftFreq, setDraftFreq] = useState<RecurringFrequency>('monthly')
  const [draftCategory, setDraftCategory] = useState<string>('Utilities')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: loanAccountsRes } = useQuery({ queryKey: ['loan-accounts'], queryFn: loansApi.loanAccounts })
  const loanAccounts = normalizeList(loanAccountsRes?.data) as {
    id: string
    product_name: string
    monthly_payment: string
    next_payment_due: string | null
    status: string
  }[]
  const activeLoans = loanAccounts.filter((l) => l.status === 'ACTIVE')

  const loanMonthlyTotal = useMemo(
    () => activeLoans.reduce((s, l) => s + (parseFloat(l.monthly_payment) || 0), 0),
    [activeLoans],
  )

  const activeItems = items.filter((i) => i.active)
  const monthlyTotal = useMemo(
    () => activeItems.reduce((s, i) => s + monthlyEquivalent(i.amount, i.frequency), 0) + loanMonthlyTotal,
    [activeItems, loanMonthlyTotal],
  )

  const pieData = useMemo(() => {
    const map = new Map<string, number>()
    for (const i of activeItems) {
      const m = monthlyEquivalent(i.amount, i.frequency)
      map.set(i.category, (map.get(i.category) || 0) + m)
    }
    if (loanMonthlyTotal > 0) {
      map.set('Loan repayments', (map.get('Loan repayments') || 0) + loanMonthlyTotal)
    }
    return [...map.entries()].map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
  }, [activeItems, loanMonthlyTotal])

  const hasSchedules = items.length > 0 || activeLoans.length > 0

  const resetModal = () => {
    setStep(1)
    setDraftName('')
    setDraftAmount('')
    setDraftFreq('monthly')
    setDraftCategory('Utilities')
  }

  const closeModal = () => {
    resetModal()
    setModalOpen(false)
  }

  const persist = (next: RecurringPayment[]) => {
    saveRecurringPayments(next)
    setItems(next)
  }

  const toggleActive = (id: string) => {
    persist(items.map((i) => (i.id === id ? { ...i, active: !i.active } : i)))
  }

  const confirmDelete = () => {
    if (!deleteId) return
    persist(items.filter((i) => i.id !== deleteId))
    toast.success('Schedule removed.')
    setDeleteId(null)
  }

  const submitNew = () => {
    const amt = parseFloat(draftAmount)
    if (!draftName.trim() || !Number.isFinite(amt) || amt <= 0) {
      toast.error('Enter a name and valid amount.')
      return
    }
    const nextDate = new Date()
    nextDate.setMonth(nextDate.getMonth() + 1)
    const row = createRecurringPayment({
      name: draftName.trim(),
      amount: amt,
      frequency: draftFreq,
      category: draftCategory,
      nextDate: nextDate.toISOString().slice(0, 10),
      active: true,
    })
    persist([...items, row])
    setStep(3)
    toast.success('Recurring payment saved.')
  }

  const openAdd = () => {
    resetModal()
    setModalOpen(true)
  }

  return (
    <div className="mx-auto max-w-6xl pb-10">
      <div className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-[0_4px_24px_-8px_rgba(21,42,30,0.08)]">
        <div className="flex flex-col gap-3 bg-primary-dark px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white sm:text-xl">Recurring payments</h1>
            <p className="mt-0.5 text-sm text-white/75">
              Monthly outflow{' '}
              <span className="font-semibold text-white">{formatDisplayCurrency(monthlyTotal)}</span>
            </p>
          </div>
          <button type="button" onClick={openAdd} className="btn-primary inline-flex shrink-0 items-center gap-2 py-2.5 text-sm">
            <Plus size={16} strokeWidth={2.5} />
            Add schedule
          </button>
        </div>

        {hasSchedules ? (
          <div className="grid gap-4 border-b border-gray-100 bg-gray-50/80 px-4 py-4 sm:grid-cols-2 sm:px-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Estimated monthly</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-primary-dark">{formatDisplayCurrency(monthlyTotal)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Active schedules</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-gray-900">
                {activeItems.length + activeLoans.length}
              </p>
            </div>
          </div>
        ) : null}

        <div className="p-4 sm:p-6">
          {activeLoans.length > 0 ? (
            <div className="mb-6 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Loan repayments</p>
              {activeLoans.map((loan) => (
                <div
                  key={loan.id}
                  className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 sm:flex-row sm:items-center"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-dark/10 text-primary-dark">
                    <Landmark size={20} strokeWidth={2} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900">{loan.product_name}</p>
                    <p className="mt-0.5 text-sm text-gray-500">
                      {formatDisplayCurrency(loan.monthly_payment)}/mo
                      {loan.next_payment_due
                        ? ` · Next ${format(new Date(`${loan.next_payment_due}T12:00:00`), 'MMM d')}`
                        : ''}
                    </p>
                  </div>
                  <button type="button" onClick={() => navigate(`/loans/${loan.id}`)} className="btn-outline shrink-0 py-2 text-xs">
                    View loan
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          {!hasSchedules ? (
            <div className="flex flex-col items-center rounded-xl border border-dashed border-gray-200 bg-gray-50/60 px-6 py-14 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-dark/10 text-primary-dark">
                <Repeat2 size={28} strokeWidth={1.75} />
              </div>
              <p className="mt-4 text-base font-semibold text-gray-900">No recurring payments yet</p>
              <p className="mt-1 max-w-sm text-sm text-gray-500">
                Track subscriptions and fixed transfers you set up here. Active loan repayments appear automatically.
              </p>
              <button type="button" onClick={openAdd} className="btn-primary mt-6 inline-flex items-center gap-2 text-sm">
                <Plus size={16} />
                Add your first schedule
              </button>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="space-y-3 lg:col-span-2">
                {items.map((row) => {
                  const Icon = categoryIcon(row.category)
                  const monthly = monthlyEquivalent(row.amount, row.frequency)
                  return (
                    <div
                      key={row.id}
                      className={cn(
                        'flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 transition-opacity sm:flex-row sm:items-center',
                        !row.active && 'opacity-55',
                      )}
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-primary-dark">
                        <Icon size={20} strokeWidth={2} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900">{row.name}</p>
                        <p className="mt-0.5 text-sm text-gray-500">
                          {row.category} · {row.frequency} · Next {format(new Date(`${row.nextDate}T12:00:00`), 'MMM d')}
                        </p>
                        <p className="mt-1 text-sm font-medium tabular-nums text-gray-700">
                          {formatDisplayCurrency(row.amount)} · ~{formatDisplayCurrency(monthly)}/mo
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleActive(row.id)}
                          className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                        >
                          <span className="inline-flex items-center gap-1.5">
                            {row.active ? <Pause size={14} /> : <Play size={14} />}
                            {row.active ? 'Pause' : 'Resume'}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteId(row.id)}
                          className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                          aria-label="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {pieData.length > 0 ? (
                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">By category</p>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={2}>
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="white" strokeWidth={1} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => formatDisplayCurrency(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                  <ul className="mt-3 space-y-1.5">
                    {pieData.map((d, i) => (
                      <li key={d.name} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-gray-600">
                          <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                          {d.name}
                        </span>
                        <span className="font-medium tabular-nums text-gray-900">{formatDisplayCurrency(d.value)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      <Dialog open={modalOpen} onClose={closeModal} className="relative z-50">
        <DialogBackdrop className="fixed inset-0 bg-black/45 backdrop-blur-[2px]" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
            {step === 3 ? (
              <div className="px-6 py-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/25">
                  <CheckCircle2 className="h-8 w-8 text-primary-dark" strokeWidth={2} />
                </div>
                <DialogTitle className="mt-4 text-lg font-bold text-gray-900">Schedule saved</DialogTitle>
                <button type="button" className="btn-primary mt-6 w-full py-2.5 text-sm" onClick={closeModal}>
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between bg-primary-dark px-5 py-4">
                  <DialogTitle className="text-lg font-bold text-white">
                    {step === 1 ? 'New schedule' : 'Confirm'}
                  </DialogTitle>
                  <button type="button" onClick={closeModal} className="rounded-lg p-1.5 text-white/80 hover:bg-white/10 hover:text-white">
                    <X size={20} />
                  </button>
                </div>
                <div className="overflow-y-auto px-5 py-5">
                  {step === 1 ? (
                    <div className="space-y-4">
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">Name</label>
                        <input
                          className="input-field text-sm"
                          value={draftName}
                          onChange={(e) => setDraftName(e.target.value)}
                          placeholder="e.g. Rent, Netflix"
                        />
                      </div>
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Category</p>
                        <div className="grid grid-cols-3 gap-2">
                          {CATEGORY_PRESETS.map(({ value, label, Icon }) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => setDraftCategory(value)}
                              className={cn(
                                'flex flex-col items-center gap-1 rounded-xl border-2 py-2.5 text-xs font-semibold transition-colors',
                                draftCategory === value
                                  ? 'border-primary-dark bg-primary-dark/[0.06] text-primary-dark'
                                  : 'border-gray-100 text-gray-600 hover:border-gray-200',
                              )}
                            >
                              <Icon size={18} />
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">Amount</label>
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            className="input-field text-sm"
                            value={draftAmount}
                            onChange={(e) => setDraftAmount(e.target.value)}
                            placeholder="0.00"
                          />
                        </div>
                        <StyledSelect
                          label="Frequency"
                          value={draftFreq}
                          onChange={(e) => setDraftFreq(e.target.value as RecurringFrequency)}
                        >
                          {FREQUENCIES.map((f) => (
                            <option key={f.value} value={f.value}>
                              {f.label}
                            </option>
                          ))}
                        </StyledSelect>
                      </div>
                      <button
                        type="button"
                        className="btn-primary w-full py-2.5 text-sm"
                        onClick={() => {
                          const amt = parseFloat(draftAmount)
                          if (!draftName.trim() || !Number.isFinite(amt) || amt <= 0) {
                            toast.error('Enter a name and amount.')
                            return
                          }
                          setStep(2)
                        }}
                      >
                        Continue
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <dl className="space-y-2 rounded-xl border border-gray-100 bg-gray-50/80 p-4 text-sm">
                        <div className="flex justify-between gap-4">
                          <dt className="text-gray-500">Payee</dt>
                          <dd className="font-medium text-gray-900">{draftName}</dd>
                        </div>
                        <div className="flex justify-between gap-4">
                          <dt className="text-gray-500">Category</dt>
                          <dd className="font-medium text-gray-900">{draftCategory}</dd>
                        </div>
                        <div className="flex justify-between gap-4">
                          <dt className="text-gray-500">Amount</dt>
                          <dd className="font-medium tabular-nums text-gray-900">
                            {formatDisplayCurrency(parseFloat(draftAmount || '0'))} · {draftFreq}
                          </dd>
                        </div>
                      </dl>
                      <div className="flex gap-2">
                        <button type="button" className="btn-outline flex-1 py-2.5 text-sm" onClick={() => setStep(1)}>
                          Back
                        </button>
                        <button type="button" className="btn-primary flex-1 py-2.5 text-sm" onClick={submitNew}>
                          Save
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogPanel>
        </div>
      </Dialog>

      <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)} className="relative z-50">
        <DialogBackdrop className="fixed inset-0 bg-black/45 backdrop-blur-[2px]" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="bg-primary-dark px-5 py-4">
              <DialogTitle className="text-lg font-bold text-white">Remove schedule?</DialogTitle>
            </div>
            <p className="px-5 pt-4 text-sm text-gray-600">This removes the schedule from your list.</p>
            <div className="flex gap-3 px-5 py-5">
              <button type="button" className="btn-outline flex-1 py-2.5 text-sm" onClick={() => setDeleteId(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
                onClick={confirmDelete}
              >
                Remove
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  )
}
