import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  Plus, ToggleLeft, ToggleRight,
  Car, Home, Plane, GraduationCap, Gift, CircleEllipsis, PiggyBank,
} from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { savingsGoalsApi, type SavingsGoalRow } from '@/api/savingsGoals'
import Spinner from '@/components/ui/Spinner'
import CreateSavingsGoalModal from '@/components/savings/CreateSavingsGoalModal'
import {
  loadAutoSaveRules,
  saveAutoSaveRules,
  type SavingsGoalCategory,
  type AutoSaveRulesState,
} from '@/lib/savingsGoalsStorage'
import { formatDisplayCurrency } from '@/utils/format'

const CATEGORY_ICON: Record<SavingsGoalCategory, typeof Car> = {
  car: Car,
  house: Home,
  plane: Plane,
  education: GraduationCap,
  gift: Gift,
  other: CircleEllipsis,
}

export default function SavingsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [cancelGoal, setCancelGoal] = useState<SavingsGoalRow | null>(null)
  const [autoSave, setAutoSave] = useState<AutoSaveRulesState>(() => loadAutoSaveRules())

  const { data: goalsRes, isLoading } = useQuery({
    queryKey: ['savings-goals'],
    queryFn: () => savingsGoalsApi.list(),
  })
  const goals: SavingsGoalRow[] = Array.isArray(goalsRes?.data) ? goalsRes.data : []

  const totalSaved = useMemo(
    () => goals.reduce((s, g) => s + parseFloat(g.saved_balance || '0'), 0),
    [goals],
  )

  const cancelMutation = useMutation({
    mutationFn: (id: string) => savingsGoalsApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings-goals'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      toast.success('Goal cancelled.')
      setCancelGoal(null)
    },
    onError: (err: unknown) => {
      const d = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      toast.error(typeof d === 'string' ? d : 'Could not cancel goal.')
    },
  })

  const persistAutoSave = (next: AutoSaveRulesState) => {
    setAutoSave(next)
    saveAutoSaveRules(next)
  }

  return (
    <div className="mx-auto max-w-6xl pb-10">
      <div className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-[0_4px_24px_-8px_rgba(21,42,30,0.08)]">
        <div className="flex flex-col gap-3 bg-primary-dark px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white sm:text-xl">Savings & goals</h1>
            <p className="mt-0.5 text-sm text-white/75">
              Total saved{' '}
              <span className="font-semibold text-white">{formatDisplayCurrency(totalSaved)}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="btn-primary inline-flex shrink-0 items-center gap-2 py-2.5 text-sm"
          >
            <Plus size={16} strokeWidth={2.5} />
            New goal
          </button>
        </div>

        <div className="space-y-6 p-4 sm:p-6">
          {isLoading ? (
            <div className="flex justify-center py-14">
              <Spinner />
            </div>
          ) : goals.length === 0 ? (
            <div className="flex flex-col items-center rounded-xl border border-dashed border-gray-200 bg-gray-50/60 px-6 py-14 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-dark/10 text-primary-dark">
                <PiggyBank size={28} strokeWidth={1.75} />
              </div>
              <p className="mt-4 text-base font-semibold text-gray-900">No savings goals yet</p>
              <p className="mt-1 max-w-sm text-sm text-gray-500">
                Set a target and move money from your main account. Cancelling returns saved funds to your primary account.
              </p>
              <button type="button" onClick={() => setCreateOpen(true)} className="btn-primary mt-6 text-sm">
                Create goal
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {goals.map((g) => {
                const saved = parseFloat(g.saved_balance || '0')
                const target = parseFloat(g.target_amount || '0')
                const pct = target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0
                const rawCat = g.category as string
                const cat: SavingsGoalCategory = rawCat in CATEGORY_ICON ? (rawCat as SavingsGoalCategory) : 'other'
                const CatIcon = CATEGORY_ICON[cat]
                const dateLabel = g.target_date
                  ? format(new Date(`${g.target_date}T12:00:00`), 'MMM yyyy')
                  : 'No target date'

                return (
                  <div
                    key={g.id}
                    className="relative rounded-xl border border-gray-100 bg-white p-4 transition hover:border-gray-200 hover:shadow-[0_4px_16px_-6px_rgba(21,42,30,0.1)]"
                  >
                    <button
                      type="button"
                      onClick={() => setCancelGoal(g)}
                      className="absolute right-2 top-2 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase text-red-700 hover:bg-red-50"
                    >
                      Cancel
                    </button>
                    <button type="button" onClick={() => navigate(`/savings/${g.id}`)} className="block w-full pr-14 text-left">
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-primary-dark">
                        <CatIcon size={20} strokeWidth={2} />
                      </div>
                      <p className="font-semibold text-gray-900">{g.title}</p>
                      <p className="text-xs text-gray-500">{dateLabel}</p>
                      <p className="mt-2 text-lg font-bold tabular-nums text-gray-900">
                        {formatDisplayCurrency(saved)}
                        <span className="text-sm font-normal text-gray-500"> / {formatDisplayCurrency(target)}</span>
                      </p>
                    </button>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
                      <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="mt-1 text-right text-xs font-semibold text-primary-dark">{pct}%</p>
                  </div>
                )
              })}
            </div>
          )}

          <section className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Auto-save preferences</p>
            <p className="mt-0.5 mb-3 text-xs text-gray-400">Saved on this device only</p>
            {[
              { key: 'roundUps' as const, label: 'Round-ups', desc: 'Spare change' },
              { key: 'monthlyRecurring' as const, label: 'Monthly transfer', desc: 'Fixed amount' },
              { key: 'smartStash' as const, label: 'Smart stash', desc: 'Suggested transfers' },
            ].map(({ key, label, desc }) => {
              const enabled = autoSave[key]
              return (
                <div key={key} className="flex items-center justify-between border-t border-gray-100 py-3 first:border-0 first:pt-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{label}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                  <button
                    type="button"
                    aria-pressed={enabled}
                    onClick={() => persistAutoSave({ ...autoSave, [key]: !enabled })}
                    className="text-gray-300"
                  >
                    {enabled ? <ToggleRight size={28} className="text-accent" /> : <ToggleLeft size={28} />}
                  </button>
                </div>
              )
            })}
          </section>
        </div>
      </div>

      <CreateSavingsGoalModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => queryClient.invalidateQueries({ queryKey: ['savings-goals'] })}
      />

      <Dialog open={Boolean(cancelGoal)} onClose={() => setCancelGoal(null)} className="relative z-50">
        <DialogBackdrop className="fixed inset-0 bg-black/45 backdrop-blur-[2px]" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="bg-primary-dark px-5 py-4">
              <DialogTitle className="text-lg font-bold text-white">Cancel goal?</DialogTitle>
            </div>
            {cancelGoal ? (
              <p className="px-5 pt-4 text-sm text-gray-600">
                {formatDisplayCurrency(cancelGoal.saved_balance)} in <strong>{cancelGoal.title}</strong> returns to your
                primary account. This cannot be undone.
              </p>
            ) : null}
            <div className="flex gap-2 px-5 py-5">
              <button type="button" onClick={() => setCancelGoal(null)} className="btn-outline flex-1 py-2.5 text-sm">
                Keep
              </button>
              <button
                type="button"
                disabled={cancelMutation.isPending || !cancelGoal}
                onClick={() => cancelGoal && cancelMutation.mutate(cancelGoal.id)}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {cancelMutation.isPending ? 'Cancelling…' : 'Cancel goal'}
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  )
}
