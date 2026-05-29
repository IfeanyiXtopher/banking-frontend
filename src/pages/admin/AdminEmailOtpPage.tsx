import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { KeyRound, RefreshCw, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import { adminApi } from '@/api/admin'
import Spinner from '@/components/ui/Spinner'
import { fromAdminPaginatedResponse } from '@/lib/adminList'
import { formatDate } from '@/utils/format'
import { cn } from '@/utils/cn'

type OtpRow = {
  id: string
  user_email: string
  user_name: string
  purpose: string
  purpose_label?: string
  token: string
  context_id?: string | null
  fee_line_name?: string | null
  created_at: string
  expires_at: string
  is_used: boolean
  is_expired: boolean
}

const PURPOSE_OPTIONS = [
  { value: '', label: 'All purposes' },
  { value: 'login_mfa', label: 'Login MFA' },
  { value: 'transfer_auth', label: 'Transfer verification' },
  { value: 'regulated_fee', label: 'Compliance fee verification' },
] as const

const USED_OPTIONS = [
  { value: '', label: 'Used + unused' },
  { value: 'false', label: 'Unused only' },
  { value: 'true', label: 'Used only' },
] as const

function userInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

function otpStatus(r: OtpRow): { label: string; className: string } {
  if (r.purpose === 'regulated_fee') {
    return r.is_used
      ? { label: 'Used', className: 'bg-gray-100 text-gray-700 ring-gray-200' }
      : { label: 'Valid', className: 'bg-emerald-50 text-emerald-800 ring-emerald-100' }
  }
  if (r.is_used) return { label: 'Used', className: 'bg-gray-100 text-gray-700 ring-gray-200' }
  if (r.is_expired) return { label: 'Expired', className: 'bg-amber-50 text-amber-900 ring-amber-100' }
  return { label: 'Valid', className: 'bg-emerald-50 text-emerald-800 ring-emerald-100' }
}

function purposeBadgeClass(purpose: string) {
  switch (purpose) {
    case 'login_mfa':
      return 'bg-sky-50 text-sky-800 ring-sky-100'
    case 'transfer_auth':
      return 'bg-violet-50 text-violet-800 ring-violet-100'
    case 'regulated_fee':
      return 'bg-amber-50 text-amber-900 ring-amber-100'
    default:
      return 'bg-gray-50 text-gray-700 ring-gray-100'
  }
}

function OtpStatusBadge({ row }: { row: OtpRow }) {
  const { label, className } = otpStatus(row)
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ring-1 ring-inset',
        className,
      )}
    >
      {label}
    </span>
  )
}

export default function AdminEmailOtpPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const purposeFromUrl = searchParams.get('purpose') ?? ''
  const userFromUrl = searchParams.get('user') ?? ''
  const [purpose, setPurpose] = useState(purposeFromUrl)
  const [usedFilter, setUsedFilter] = useState('')
  const [userFilter, setUserFilter] = useState(userFromUrl)
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (purposeFromUrl) setPurpose(purposeFromUrl)
    if (userFromUrl) setUserFilter(userFromUrl)
  }, [purposeFromUrl, userFromUrl])

  const params: Record<string, string> = {
    page: String(page),
    page_size: '50',
  }
  if (purpose) params.purpose = purpose
  if (usedFilter === 'true' || usedFilter === 'false') params.is_used = usedFilter
  if (userFilter.trim()) params.user = userFilter.trim()

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ['admin-email-otps', purpose, usedFilter, userFilter, page],
    queryFn: () => adminApi.emailOtps(params),
    refetchInterval: 15_000,
  })

  const { results: rows, count } = fromAdminPaginatedResponse<OtpRow>(data)
  const totalPages = Math.max(1, Math.ceil(count / 50))

  const applyUserFilter = () => {
    setPage(1)
    const next = new URLSearchParams(searchParams)
    const u = userFilter.trim()
    if (u) next.set('user', u)
    else next.delete('user')
    setSearchParams(next, { replace: true })
  }

  const purposeLabel = PURPOSE_OPTIONS.find((o) => o.value === purpose)?.label ?? 'All purposes'
  const usedLabel = USED_OPTIONS.find((o) => o.value === usedFilter)?.label ?? 'Used + unused'

  return (
    <div className="space-y-6 pb-8">
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200/80 bg-white px-4 py-3.5 shadow-sm sm:px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-dark text-accent shadow-sm ring-4 ring-primary-dark/10">
            <KeyRound size={18} strokeWidth={1.75} aria-hidden />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-gray-900 sm:text-xl">Verification codes</h1>
            <p className="text-xs text-gray-500">
              Login MFA, transfers, and compliance fees · auto-refresh 15s
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-gray-500">
              Codes are stored here even when email is not configured locally. Share the 6-digit code with
              the customer if they did not receive email.
            </p>
          </div>
        </div>
        {!isLoading && (
          <p className="text-xs font-semibold tabular-nums text-gray-500">
            {count} {count === 1 ? 'code' : 'codes'}
            {isFetching && !isLoading ? ' · updating…' : ''}
          </p>
        )}
      </section>

      {isError && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Could not load verification codes. Check permissions and API.
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-[0_4px_24px_-10px_rgba(21,42,30,0.1)]">
        <div className="flex flex-col gap-3 border-b border-gray-100 bg-gradient-to-r from-gray-50/90 via-white to-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-primary-dark">
            <Filter size={14} aria-hidden />
            Filters
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[12rem] flex-1 sm:w-52">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                aria-hidden
              />
              <input
                type="search"
                className="input-field w-full pl-9 text-sm"
                placeholder="Customer email…"
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') applyUserFilter()
                }}
              />
            </div>
            <button
              type="button"
              onClick={applyUserFilter}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-primary-dark shadow-sm transition hover:border-primary-dark/25 hover:bg-gray-50"
            >
              Apply
            </button>
            <select
              className="input-field w-auto min-w-[10rem] text-sm"
              value={purpose}
              onChange={(e) => {
                setPurpose(e.target.value)
                setPage(1)
              }}
            >
              {PURPOSE_OPTIONS.map((o) => (
                <option key={o.value || 'all'} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <select
              className="input-field w-auto min-w-[9rem] text-sm"
              value={usedFilter}
              onChange={(e) => {
                setUsedFilter(e.target.value)
                setPage(1)
              }}
            >
              {USED_OPTIONS.map((o) => (
                <option key={o.value || 'all'} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm transition hover:border-primary-dark/25 hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw size={14} className={cn(isFetching && 'animate-spin')} aria-hidden />
              Refresh
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center py-14">
              <Spinner />
            </div>
          ) : rows.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <KeyRound size={32} className="mx-auto text-gray-300" aria-hidden />
              <p className="mt-3 text-sm font-medium text-gray-700">No codes match your filters</p>
              <p className="mt-1 text-xs text-gray-500">Try another email, purpose, or status.</p>
            </div>
          ) : (
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200/80 bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  <th className="px-4 py-2.5 sm:px-6">Created</th>
                  <th className="px-3 py-2.5">Customer</th>
                  <th className="px-3 py-2.5">Purpose</th>
                  <th className="px-3 py-2.5">Fee line</th>
                  <th className="px-3 py-2.5">Code</th>
                  <th className="px-3 py-2.5">Expires</th>
                  <th className="px-4 py-2.5 sm:px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((r, i) => (
                  <tr
                    key={r.id}
                    className={cn('transition-colors hover:bg-emerald-50/30', i % 2 === 1 && 'bg-gray-50/40')}
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-[11px] tabular-nums text-gray-500 sm:px-6">
                      {formatDate(r.created_at, 'MMM d, HH:mm')}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-dark/[0.08] text-[10px] font-bold text-primary-dark ring-1 ring-primary-dark/10"
                          aria-hidden
                        >
                          {userInitials(r.user_name)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-gray-900" title={r.user_name}>
                            {r.user_name}
                          </p>
                          <p className="truncate text-[10px] text-gray-500" title={r.user_email}>
                            {r.user_email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={cn(
                          'inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ring-inset',
                          purposeBadgeClass(r.purpose),
                        )}
                      >
                        {r.purpose_label ?? r.purpose}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      {r.fee_line_name ? (
                        <span className="inline-flex rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-700">
                          {r.fee_line_name}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <span className="inline-block rounded-lg bg-primary-dark/[0.06] px-2.5 py-1 font-mono text-sm font-bold tracking-[0.2em] text-primary-dark ring-1 ring-primary-dark/10">
                        {r.token}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-[11px] tabular-nums text-gray-500">
                      {formatDate(r.expires_at, 'MMM d, HH:mm')}
                    </td>
                    <td className="px-4 py-3 sm:px-6">
                      <OtpStatusBadge row={r} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!isLoading && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 bg-gray-50/60 px-4 py-3 sm:px-6">
            <p className="text-[11px] text-gray-500">
              {count} {count === 1 ? 'code' : 'codes'}
              {(purpose || usedFilter || userFilter.trim()) && (
                <>
                  {' '}
                  · {purposeLabel} · {usedLabel}
                  {userFilter.trim() ? ` · ${userFilter.trim()}` : ''}
                </>
              )}
            </p>
            {totalPages > 1 ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-white disabled:opacity-40"
                >
                  <ChevronLeft size={14} aria-hidden />
                  Previous
                </button>
                <span className="text-xs font-medium tabular-nums text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-white disabled:opacity-40"
                >
                  Next
                  <ChevronRight size={14} aria-hidden />
                </button>
              </div>
            ) : null}
          </div>
        )}
      </section>
    </div>
  )
}
