import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  ArrowLeftRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pencil,
  Receipt,
  RefreshCw,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import { adminApi } from '@/api/admin'
import Spinner from '@/components/ui/Spinner'
import { cn } from '@/utils/cn'
import { formatDate, formatDisplayCurrency } from '@/utils/format'
import { formatTransactionStatusLabel } from '@/utils/transactionDisplay'
import AdminUserCombobox from '@/components/admin/AdminUserCombobox'
import DateRangeFilter, { type AppliedDateRange } from '@/components/admin/DateRangeFilter'
import type { DateRangeSelection } from '@/lib/dateRangePresets'

type AdminTx = {
  id: string
  reference_number: string
  transaction_type: string
  amount: string
  fee_amount: string
  currency: string
  status: string
  description: string
  created_at: string
  customer_email?: string
  initiated_by_email?: string
  metadata?: Record<string, unknown> | null
}

type PaginatedResponse = {
  count?: number
  next?: string | null
  previous?: string | null
  results?: AdminTx[]
}

const TX_TYPES = [
  'DEPOSIT',
  'WITHDRAWAL',
  'TRANSFER_INTERNAL',
  'TRANSFER_EXTERNAL',
  'TRANSFER_INTERNATIONAL',
  'FEE',
  'REVERSAL',
  'LOAN_DISBURSEMENT',
  'LOAN_PAYMENT',
  'INTEREST',
] as const

const STATUSES = ['COMPLETED', 'PENDING', 'FAILED', 'REVERSED', 'FLAGGED'] as const

const PAGE_SIZE = 50

const emptyEditForm = {
  amount: '',
  fee_amount: '',
  status: 'COMPLETED',
  transaction_type: 'DEPOSIT',
  description: '',
  currency: 'USD',
}

function typeLabel(type: string) {
  return type.replace(/_/g, ' ')
}

function typeBadgeClass(type: string) {
  if (type.includes('TRANSFER')) return 'bg-sky-50 text-sky-800 ring-sky-100'
  if (type === 'DEPOSIT' || type === 'LOAN_DISBURSEMENT' || type === 'INTEREST') {
    return 'bg-emerald-50 text-emerald-800 ring-emerald-100'
  }
  if (type === 'WITHDRAWAL' || type === 'LOAN_PAYMENT' || type === 'FEE') {
    return 'bg-rose-50 text-rose-800 ring-rose-100'
  }
  if (type === 'REVERSAL') return 'bg-violet-50 text-violet-800 ring-violet-100'
  return 'bg-gray-50 text-gray-700 ring-gray-100'
}

function statusBadgeClass(status: string) {
  if (status === 'COMPLETED') return 'bg-emerald-50 text-emerald-800 ring-emerald-100'
  if (status === 'FLAGGED') return 'bg-red-50 text-red-800 ring-red-100'
  if (status === 'REVERSED') return 'bg-gray-100 text-gray-700 ring-gray-200'
  if (status === 'FAILED') return 'bg-red-50 text-red-700 ring-red-100'
  return 'bg-amber-50 text-amber-900 ring-amber-100'
}

function customerInitial(email?: string) {
  const c = (email || '?').charAt(0).toUpperCase()
  return c
}

const filterInputClass =
  'input-field h-11 w-full py-2 text-sm'

function FilterField({
  label,
  className,
  children,
}: {
  label: string
  className?: string
  children: ReactNode
}) {
  return (
    <div className={cn('min-w-0 space-y-1.5', className)}>
      <span className="block text-xs font-medium text-gray-600">{label}</span>
      {children}
    </div>
  )
}

export default function AdminTransactionsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState(() => searchParams.get('status') || '')
  const [typeFilter, setTypeFilter] = useState('')
  const [userFilter, setUserFilter] = useState('')
  const [dateRange, setDateRange] = useState<DateRangeSelection | null>(null)
  const [appliedDateRange, setAppliedDateRange] = useState<AppliedDateRange | null>(null)
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [editTx, setEditTx] = useState<AdminTx | null>(null)
  const [editForm, setEditForm] = useState(emptyEditForm)
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(
    () => Boolean(searchParams.get('status')),
  )

  useEffect(() => {
    setStatusFilter(searchParams.get('status') || '')
  }, [searchParams])

  useEffect(() => {
    setPage(1)
  }, [search, statusFilter, typeFilter, userFilter, appliedDateRange])

  const queryClient = useQueryClient()

  const queryParams = useMemo(() => {
    const p: Record<string, string> = {
      page: String(page),
      page_size: String(PAGE_SIZE),
    }
    if (search.trim()) p.search = search.trim()
    if (statusFilter) p.status = statusFilter
    if (typeFilter) p.transaction_type = typeFilter
    if (userFilter.trim()) p.user = userFilter.trim()
    if (appliedDateRange) {
      p.created_from = appliedDateRange.created_from
      p.created_to = appliedDateRange.created_to
    }
    return p
  }, [search, statusFilter, typeFilter, userFilter, appliedDateRange, page])

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['admin-transactions', queryParams],
    queryFn: () => adminApi.transactions(queryParams),
    placeholderData: (prev) => prev,
  })

  const payload = data?.data as PaginatedResponse | AdminTx[] | undefined
  const transactions = Array.isArray(payload) ? payload : (payload?.results ?? [])
  const totalCount = Array.isArray(payload) ? transactions.length : (payload?.count ?? transactions.length)
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const rangeStart = totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const rangeEnd = Math.min(page * PAGE_SIZE, totalCount)

  const hasFilters = Boolean(
    search.trim() || statusFilter || typeFilter || userFilter.trim() || appliedDateRange,
  )

  const advancedFilterCount = [typeFilter, statusFilter, appliedDateRange].filter(Boolean).length

  const pageStats = useMemo(() => {
    const completed = transactions.filter((t) => t.status === 'COMPLETED').length
    const pending = transactions.filter((t) => t.status === 'PENDING').length
    return { completed, pending }
  }, [transactions])

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-transactions'] })
    queryClient.invalidateQueries({ queryKey: ['admin-accounts'] })
  }

  const updateMutation = useMutation({
    mutationFn: () =>
      adminApi.updateTransaction(editTx!.id, {
        amount: editForm.amount,
        fee_amount: editForm.fee_amount,
        status: editForm.status,
        transaction_type: editForm.transaction_type,
        description: editForm.description,
        currency: editForm.currency,
      }),
    onSuccess: () => {
      invalidate()
      setEditTx(null)
      toast.success('Transaction updated.')
    },
    onError: (err: unknown) =>
      toast.error((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Update failed.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (ids: string[]) =>
      ids.length === 1 ? adminApi.deleteTransaction(ids[0]) : adminApi.bulkDeleteTransactions(ids),
    onSuccess: (_res, ids) => {
      invalidate()
      setSelected(new Set())
      toast.success(ids.length === 1 ? 'Transaction deleted.' : `Deleted ${ids.length} transaction(s).`)
    },
    onError: (err: unknown) =>
      toast.error((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Delete failed.'),
  })

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('')
    setTypeFilter('')
    setUserFilter('')
    setAppliedDateRange(null)
    setDateRange(null)
    const next = new URLSearchParams(searchParams)
    next.delete('status')
    setSearchParams(next, { replace: true })
  }

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selected.size === transactions.length) setSelected(new Set())
    else setSelected(new Set(transactions.map((t) => t.id)))
  }

  const openEdit = (tx: AdminTx) => {
    setEditTx(tx)
    setEditForm({
      amount: tx.amount,
      fee_amount: tx.fee_amount || '0',
      status: tx.status,
      transaction_type: tx.transaction_type,
      description: tx.description || '',
      currency: tx.currency || 'USD',
    })
  }

  const confirmDeleteSelected = () => {
    const ids = Array.from(selected)
    if (!ids.length) return
    if (!window.confirm(`Delete ${ids.length} selected transaction(s)?`)) return
    deleteMutation.mutate(ids)
  }

  return (
    <div className="space-y-6 pb-8">
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200/80 bg-white px-4 py-3.5 shadow-sm sm:px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-dark text-accent shadow-sm ring-4 ring-primary-dark/10">
            <ArrowLeftRight size={18} strokeWidth={1.75} aria-hidden />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-gray-900 sm:text-xl">Transactions</h1>
            <p className="text-xs text-gray-500">Ledger entries — view, edit, or remove</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!isLoading && totalCount > 0 ? (
            <p className="text-xs font-semibold tabular-nums text-gray-500">
              {totalCount.toLocaleString()} total
              <span className="mx-1.5 text-gray-300">·</span>
              <span className="text-emerald-700">{pageStats.completed} ok</span>
              <span className="mx-1.5 text-gray-300">·</span>
              <span className="text-amber-800">{pageStats.pending} pending</span>
            </p>
          ) : null}
          {selected.size > 0 ? (
            <button
              type="button"
              onClick={confirmDeleteSelected}
              disabled={deleteMutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
            >
              {deleteMutation.isPending ? (
                <Loader2 size={14} className="animate-spin" aria-hidden />
              ) : (
                <Trash2 size={14} aria-hidden />
              )}
              Delete {selected.size}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={14} className={cn(isFetching && 'animate-spin')} aria-hidden />
            Refresh
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-[0_4px_24px_-10px_rgba(21,42,30,0.1)]">
      {/* Filters — search + customer visible; rest collapsed */}
      <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50/90 via-white to-white px-3 py-2.5 sm:px-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-0 flex-1 basis-[10rem]">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-gray-400"
              aria-hidden
            />
            <input
              type="search"
              placeholder="Search reference, description, account…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn(filterInputClass, 'pl-10')}
            />
          </div>
          <AdminUserCombobox
            value={userFilter}
            onChange={setUserFilter}
            placeholder="All customers"
            className="w-full shrink-0 sm:w-52"
          />
          <button
            type="button"
            onClick={() => setMoreFiltersOpen((open) => !open)}
            aria-expanded={moreFiltersOpen}
            className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <ChevronDown
              className={cn('h-4 w-4 text-gray-500 transition-transform', moreFiltersOpen && 'rotate-180')}
              aria-hidden
            />
            More filters
            {advancedFilterCount > 0 ? (
              <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                {advancedFilterCount}
              </span>
            ) : null}
          </button>
          {hasFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="h-11 shrink-0 px-2 text-xs font-semibold text-primary hover:underline"
            >
              Clear all
            </button>
          ) : null}
        </div>

        {moreFiltersOpen ? (
          <div className="mt-2.5 grid gap-3 border-t border-gray-100 pt-2.5 sm:grid-cols-3">
            <FilterField label="Type">
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={filterInputClass}>
                <option value="">All types</option>
                {TX_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {typeLabel(t)}
                  </option>
                ))}
              </select>
            </FilterField>
            <FilterField label="Status">
              <select
                value={statusFilter}
                onChange={(e) => {
                  const v = e.target.value
                  setStatusFilter(v)
                  const next = new URLSearchParams(searchParams)
                  if (v) next.set('status', v)
                  else next.delete('status')
                  setSearchParams(next, { replace: true })
                }}
                className={filterInputClass}
              >
                <option value="">All statuses</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {formatTransactionStatusLabel(s)}
                  </option>
                ))}
              </select>
            </FilterField>
            <FilterField label="Date range">
              <DateRangeFilter
                layout="inline"
                value={dateRange}
                onChange={setDateRange}
                onApply={(applied) => {
                  setAppliedDateRange(applied)
                  if (!applied) setDateRange(null)
                }}
              />
            </FilterField>
          </div>
        ) : null}
      </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/90 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                <th className="w-12 px-4 py-3.5">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-primary focus:ring-primary/30"
                    checked={transactions.length > 0 && selected.size === transactions.length}
                    onChange={toggleSelectAll}
                    aria-label="Select all on page"
                  />
                </th>
                <th className="px-4 py-3.5">Reference</th>
                <th className="px-4 py-3.5">Customer</th>
                <th className="px-4 py-3.5">Type</th>
                <th className="px-4 py-3.5 text-right">Amount</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <Spinner className="mx-auto" />
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <Receipt className="mx-auto h-10 w-10 text-gray-300" aria-hidden />
                    <p className="mt-3 text-sm font-medium text-gray-700">No transactions found</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {hasFilters ? 'Try adjusting your filters.' : 'Transactions will appear here as customers move money.'}
                    </p>
                    {hasFilters ? (
                      <button type="button" onClick={clearFilters} className="btn-outline mt-4 text-xs">
                        Clear filters
                      </button>
                    ) : null}
                  </td>
                </tr>
              ) : (
                transactions.map((tx, i) => {
                  const email = tx.customer_email || tx.initiated_by_email || ''
                  const isSelected = selected.has(tx.id)
                  return (
                    <tr
                      key={tx.id}
                      className={cn(
                        'transition-colors hover:bg-emerald-50/30',
                        i % 2 === 1 && 'bg-gray-50/40',
                        isSelected && 'bg-primary-dark/[0.04]',
                      )}
                    >
                      <td className="px-4 py-3.5">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-primary focus:ring-primary/30"
                          checked={isSelected}
                          onChange={() => toggleSelect(tx.id)}
                          aria-label={`Select ${tx.reference_number}`}
                        />
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-xs font-medium text-gray-800">{tx.reference_number}</span>
                      </td>
                      <td className="max-w-[11rem] px-4 py-3.5">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                            {customerInitial(email)}
                          </span>
                          <span className="truncate text-xs text-gray-700" title={email}>
                            {email || '—'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={cn(
                            'inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset',
                            typeBadgeClass(tx.transaction_type),
                          )}
                        >
                          {typeLabel(tx.transaction_type)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-semibold tabular-nums text-gray-900 whitespace-nowrap">
                        {formatDisplayCurrency(tx.amount)}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={cn(
                            'inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset',
                            statusBadgeClass(tx.status),
                          )}
                        >
                          {formatTransactionStatusLabel(tx.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-500 whitespace-nowrap tabular-nums">
                        {formatDate(tx.created_at)}
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(tx)}
                            title="Edit"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:border-primary-dark/20 hover:text-primary-dark"
                          >
                            <Pencil className="h-4 w-4" aria-hidden />
                            <span className="sr-only">Edit</span>
                          </button>
                          <button
                            type="button"
                            title="Delete"
                            onClick={() => {
                              if (window.confirm(`Delete ${tx.reference_number}?`)) deleteMutation.mutate([tx.id])
                            }}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden />
                            <span className="sr-only">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 bg-gray-50/50 px-4 py-3 sm:px-5">
          <p className="text-xs text-gray-500">
            {totalCount > 0 ? (
              <>
                Showing <span className="font-semibold text-gray-700">{rangeStart}–{rangeEnd}</span> of{' '}
                <span className="font-semibold text-gray-700">{totalCount.toLocaleString()}</span>
              </>
            ) : (
              'No results'
            )}
            {isFetching && !isLoading ? (
              <span className="ml-2 inline-flex items-center gap-1 text-primary">
                <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
                Updating…
              </span>
            ) : null}
          </p>
          {totalPages > 1 ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="min-w-[5rem] px-2 text-center text-xs font-medium text-gray-600">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages || isFetching}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ) : null}
        </div>
      </section>

      {/* Edit modal */}
      {editTx ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-tx-title"
        >
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
            <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-5 py-4">
              <div>
                <h2 id="edit-tx-title" className="text-lg font-semibold text-gray-900">
                  Edit transaction
                </h2>
                <p className="mt-0.5 font-mono text-xs text-gray-500">{editTx.reference_number}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditTx(null)}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[min(60vh,28rem)] overflow-y-auto px-5 py-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold text-gray-600">Type</label>
                  <select
                    className="input-field w-full text-sm"
                    value={editForm.transaction_type}
                    onChange={(e) => setEditForm({ ...editForm, transaction_type: e.target.value })}
                  >
                    {TX_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {typeLabel(t)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold text-gray-600">Status</label>
                  <select
                    className="input-field w-full text-sm"
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {formatTransactionStatusLabel(s)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-600">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="input-field w-full text-sm tabular-nums"
                    value={editForm.amount}
                    onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-600">Fee</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="input-field w-full text-sm tabular-nums"
                    value={editForm.fee_amount}
                    onChange={(e) => setEditForm({ ...editForm, fee_amount: e.target.value })}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-600">Currency</label>
                  <input
                    className="input-field w-full text-sm uppercase"
                    maxLength={3}
                    value={editForm.currency}
                    onChange={(e) => setEditForm({ ...editForm, currency: e.target.value.toUpperCase() })}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold text-gray-600">Description</label>
                  <input
                    className="input-field w-full text-sm"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 border-t border-gray-100 bg-gray-50/80 px-5 py-4">
              <button type="button" onClick={() => setEditTx(null)} className="btn-outline flex-1 rounded-xl text-sm">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => updateMutation.mutate()}
                disabled={updateMutation.isPending || !editForm.amount}
                className="btn-primary inline-flex flex-1 items-center justify-center gap-2 rounded-xl text-sm disabled:opacity-60"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    Saving…
                  </>
                ) : (
                  'Save changes'
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
