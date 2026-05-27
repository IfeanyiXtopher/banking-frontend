import { useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { ToggleLeft, ToggleRight, Pencil } from 'lucide-react'
import {
  Dialog, DialogBackdrop, DialogPanel, DialogTitle,
} from '@headlessui/react'
import { differenceInCalendarMonths, format } from 'date-fns'
import toast from 'react-hot-toast'
import { savingsGoalsApi } from '@/api/savingsGoals'
import { transactionsApi } from '@/api/transactions'
import Spinner from '@/components/ui/Spinner'
import TransactionRow from '@/components/ui/TransactionRow'
import { formatDisplayCurrency } from '@/utils/format'

const GROWTH_DATA = [
  { month: 'Oct', balance: 14000 }, { month: 'Nov', balance: 14500 },
  { month: 'Dec', balance: 15000 }, { month: 'Jan', balance: 15800 },
  { month: 'Feb', balance: 16400 },
]

export default function SavingsDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [editOpen, setEditOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [allocateAmount, setAllocateAmount] = useState('')

  const { data: goalRes, isLoading } = useQuery({
    queryKey: ['savings-goal', id],
    queryFn: () => savingsGoalsApi.detail(id!),
    enabled: Boolean(id),
  })
  const goal = goalRes?.data

  const searchTag = id ? `SG_GOAL#${id}` : ''
  const { data: txRes, isLoading: txLoading } = useQuery({
    queryKey: ['transactions', 'savings-goal', id],
    queryFn: () => transactionsApi.list({ page_size: '80', search: searchTag }),
    enabled: Boolean(id) && Boolean(searchTag),
  })

  const rawList = txRes?.data?.results ?? txRes?.data
  const allTx = Array.isArray(rawList) ? rawList : []
  const transactions = allTx.filter((tx: { description?: string }) =>
    (tx.description || '').includes(searchTag),
  )

  const [editName, setEditName] = useState('')
  const [editTarget, setEditTarget] = useState('')
  const [editDate, setEditDate] = useState('')

  const openEdit = () => {
    if (!goal) return
    setEditName(goal.title)
    setEditTarget(goal.target_amount)
    setEditDate(goal.target_date ? goal.target_date.slice(0, 10) : '')
    setEditOpen(true)
  }

  const patchMutation = useMutation({
    mutationFn: async () => {
      if (!id || !goal) return
      await savingsGoalsApi.update(id, {
        title: editName.trim(),
        target_amount: parseFloat(editTarget).toFixed(2),
        target_date: editDate || null,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings-goal', id] })
      queryClient.invalidateQueries({ queryKey: ['savings-goals'] })
      toast.success('Goal updated.')
      setEditOpen(false)
    },
    onError: () => toast.error('Could not save changes.'),
  })

  const cancelMutation = useMutation({
    mutationFn: () => savingsGoalsApi.cancel(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings-goals'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      toast.success('Goal cancelled. Funds moved to your main account if any balance was saved.')
      setCancelOpen(false)
      navigate('/savings')
    },
    onError: (err: unknown) => {
      const d = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      toast.error(typeof d === 'string' ? d : 'Could not cancel goal.')
    },
  })

  const allocateMutation = useMutation({
    mutationFn: () => savingsGoalsApi.allocate(id!, parseFloat(allocateAmount).toFixed(2)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings-goal', id] })
      queryClient.invalidateQueries({ queryKey: ['savings-goals'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      toast.success('Added to goal.')
      setAllocateAmount('')
    },
    onError: (err: unknown) => {
      const d = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      toast.error(typeof d === 'string' ? d : 'Could not add funds.')
    },
  })

  const saved = goal ? parseFloat(goal.saved_balance || '0') : 0
  const target = goal ? parseFloat(goal.target_amount || '0') : 0
  const pct = useMemo(
    () => (target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0),
    [saved, target],
  )

  const targetDateObj = goal?.target_date ? new Date(`${goal.target_date}T12:00:00`) : null
  const monthsLeft =
    targetDateObj && !Number.isNaN(targetDateObj.getTime())
      ? Math.max(1, differenceInCalendarMonths(targetDateObj, new Date()))
      : 12
  const monthlyFromTarget = monthsLeft > 0 ? Math.max(0, target - saved) / monthsLeft : 0

  const rules = (goal?.rules || {}) as {
    roundUp?: boolean
    weeklyRecurring?: boolean
    weeklyAmount?: number
    smartSave?: boolean
  }
  const roundUp = rules.roundUp ?? true
  const recurring = rules.weeklyRecurring ?? false

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }
  if (!goal || goal.status !== 'ACTIVE') {
    return <p className="text-gray-400 text-center">Goal not found or has been cancelled.</p>
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <nav className="text-sm text-gray-400">
        <Link to="/savings" className="hover:text-gray-600">
          Savings
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">{goal.title}</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">{goal.title}</h1>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={openEdit} className="btn-outline text-sm inline-flex items-center gap-1.5">
            <Pencil size={14} />
            Edit goal
          </button>
          <button
            type="button"
            onClick={() => setCancelOpen(true)}
            className="btn-outline text-sm text-red-600 border-red-100 hover:bg-red-50"
          >
            Cancel goal
          </button>
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-2">Add to this goal</h2>
        <p className="text-xs text-gray-500 mb-3">
          Moves money from your primary account into your goals pocket and credits this goal.
        </p>
        <div className="flex flex-wrap items-end gap-2">
          <input
            type="number"
            min="0.01"
            step="0.01"
            placeholder="Amount"
            className="input-field max-w-[10rem] text-sm"
            value={allocateAmount}
            onChange={(e) => setAllocateAmount(e.target.value)}
          />
          <button
            type="button"
            disabled={allocateMutation.isPending || !allocateAmount || parseFloat(allocateAmount) <= 0}
            onClick={() => allocateMutation.mutate()}
            className="btn-primary text-sm py-2.5 px-4"
          >
            {allocateMutation.isPending ? 'Adding…' : 'Add to goal'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 card">
          <p className="text-sm text-gray-500 mb-1">Progress</p>
          <div className="flex items-end justify-between gap-4 mb-3">
            <p className="text-3xl font-bold text-gray-900">{formatDisplayCurrency(saved)}</p>
            <p className="text-2xl font-bold text-accent tabular-nums">{pct}%</p>
          </div>
          <p className="text-xs text-gray-400 mb-3">of {formatDisplayCurrency(target)} target</p>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          {targetDateObj && !Number.isNaN(targetDateObj.getTime()) && (
            <p className="text-xs text-green-700 font-medium mt-3">
              Target {format(targetDateObj, 'MMM yyyy')} · on track
            </p>
          )}
        </div>

        <div className="card">
          <p className="text-sm font-medium text-gray-700 mb-1">Projected growth</p>
          <p className="text-xs text-gray-400 mb-3">Based on your plan</p>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Est. monthly contribution</p>
          <p className="text-xl font-bold text-gray-900 mb-3">{formatDisplayCurrency(monthlyFromTarget)}/mo</p>
          <ResponsiveContainer width="100%" height={88}>
            <AreaChart data={GROWTH_DATA}>
              <Area type="monotone" dataKey="balance" stroke="#152A1E" fill="#C8F00033" strokeWidth={2} />
              <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                formatter={(v) => [formatDisplayCurrency(v as number), '']}
                contentStyle={{ borderRadius: 8, border: 'none', fontSize: 11 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-1">Savings strategy</h2>
        <p className="text-xs text-gray-400 mb-4">Rules stored with this goal</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: 'Round-ups', desc: 'Spare change from purchases', enabled: roundUp },
            {
              label: recurring ? `Weekly: ${formatDisplayCurrency(rules.weeklyAmount || 0)}` : 'Weekly recurring',
              desc: 'Automatic transfers',
              enabled: recurring,
            },
          ].map(({ label, desc, enabled }) => (
            <div key={label} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl gap-2">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{label}</p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
              {enabled ? <ToggleRight size={26} className="text-accent shrink-0" /> : <ToggleLeft size={26} className="text-gray-300 shrink-0" />}
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-1">Recent activity</h2>
        <p className="text-xs text-gray-400 mb-3">Transfers tagged for this goal</p>
        {txLoading ? (
          <div className="flex justify-center py-8">
            <Spinner size="sm" />
          </div>
        ) : transactions.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No transactions for this goal yet. Add funds above.</p>
        ) : (
          <div className="rounded-xl border border-gray-100 divide-y divide-gray-50 -mx-1">
            {transactions.slice(0, 12).map((tx: Parameters<typeof TransactionRow>[0]['transaction']) => (
              <TransactionRow key={tx.id} transaction={tx} accountId={undefined} />
            ))}
          </div>
        )}
      </div>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} className="relative z-50">
        <DialogBackdrop className="fixed inset-0 bg-black/40" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <DialogTitle className="text-lg font-bold text-gray-900">Edit savings goal</DialogTitle>
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Goal name</label>
                <input className="input-field text-sm" value={editName} onChange={(e) => setEditName(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Target amount</label>
                <input
                  className="input-field text-sm"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={editTarget}
                  onChange={(e) => setEditTarget(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Target date</label>
                <input
                  className="input-field text-sm"
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <button type="button" onClick={() => setEditOpen(false)} className="btn-outline flex-1 text-sm py-2.5">
                Cancel
              </button>
              <button
                type="button"
                disabled={patchMutation.isPending}
                onClick={() => patchMutation.mutate()}
                className="btn-primary flex-1 text-sm py-2.5 flex justify-center items-center gap-2"
              >
                {patchMutation.isPending && <Spinner size="sm" className="border-white border-t-white/30" />}
                Save changes
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      <Dialog open={cancelOpen} onClose={() => setCancelOpen(false)} className="relative z-50">
        <DialogBackdrop className="fixed inset-0 bg-black/40" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <DialogTitle className="text-lg font-bold text-gray-900">Cancel this goal?</DialogTitle>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              <span className="font-semibold text-amber-800">Important:</span> Any money saved in this goal (
              {formatDisplayCurrency(saved)}) will be transferred to your <span className="font-semibold text-gray-900">main (primary) account</span>.
              This cannot be undone.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row">
              <button type="button" onClick={() => setCancelOpen(false)} className="btn-outline flex-1 text-sm py-2.5">
                Keep goal
              </button>
              <button
                type="button"
                disabled={cancelMutation.isPending}
                onClick={() => cancelMutation.mutate()}
                className="flex-1 rounded-full bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {cancelMutation.isPending ? 'Cancelling…' : 'Yes, cancel goal'}
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  )
}
