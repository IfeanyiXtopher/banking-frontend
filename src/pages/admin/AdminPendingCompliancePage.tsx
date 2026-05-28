import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Loader2,
  Mail,
  RefreshCw,
  Shield,
  Trash2,
  UserCheck,
} from 'lucide-react'
import { adminApi } from '@/api/admin'
import Spinner from '@/components/ui/Spinner'
import { cn } from '@/utils/cn'
import { formatDisplayCurrency } from '@/utils/format'

type SessionLine = {
  id: string
  sequence: number
  name: string
  code: string
  amount: string
  status: string
  customer_self_charge_allowed?: boolean
  requires_balance?: boolean
  has_sufficient_balance?: boolean
}

type PendingSession = {
  session_id: string
  flow?: string
  status: string
  compliance_scope?: 'PERSONAL' | 'GLOBAL'
  principal_amount: string
  expires_at: string
  transfer_reference: string | null
  transfer_description?: string
  loan_application_id?: string
  customer_email: string
  customer_name: string
  from_account_id: string | null
  from_account_number: string
  from_account_available_balance: string
  lines: SessionLine[]
}

function userInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

function sessionStatusClass(status: string) {
  const s = status.toUpperCase()
  if (s.includes('COMPLETE')) return 'bg-emerald-50 text-emerald-800 ring-emerald-100'
  if (s.includes('EXPIRED') || s.includes('FAILED')) return 'bg-red-50 text-red-800 ring-red-100'
  return 'bg-amber-50 text-amber-900 ring-amber-100'
}

const LINE_STATUS_LABEL: Record<string, string> = {
  PENDING: 'Awaiting code',
  CHARGED: 'Code sent — customer may verify',
  OTP_VERIFIED: 'Verified',
}

function fundAccountSearchQuery(session: PendingSession) {
  return session.from_account_number || session.customer_email
}

function sessionProgress(lines: SessionLine[]) {
  const total = lines.length
  const verified = lines.filter((l) => l.status === 'OTP_VERIFIED').length
  const pending = lines.filter((l) => l.status === 'PENDING').length
  return { total, verified, pending }
}

function sessionKind(session: PendingSession) {
  if (session.flow === 'LOAN_PAYOUT') return 'Loan payout'
  return 'International transfer'
}

export default function AdminPendingCompliancePage() {
  const queryClient = useQueryClient()
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['admin-pending-compliance-sessions'],
    queryFn: () => adminApi.pendingComplianceSessions(),
    refetchInterval: 15_000,
  })

  const sessions = (data?.data?.results ?? []) as PendingSession[]

  const summary = useMemo(() => {
    const lines = sessions.flatMap((s) => s.lines)
    return {
      sessions: sessions.length,
      fees: lines.length,
      awaiting: lines.filter((l) => l.status === 'PENDING').length,
      verified: lines.filter((l) => l.status === 'OTP_VERIFIED').length,
    }
  }, [sessions])

  const toggleExpanded = (sessionId: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(sessionId)) next.delete(sessionId)
      else next.add(sessionId)
      return next
    })
  }

  const allowMutation = useMutation({
    mutationFn: ({ sessionId, lineId }: { sessionId: string; lineId: string }) =>
      adminApi.adminRegulatedLineAllowCustomerCharge(sessionId, lineId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-pending-compliance-sessions'] })
      toast.success('Customer may now generate this fee code from their transfer.')
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      toast.error(typeof msg === 'string' ? msg : 'Could not allow customer generation.', { duration: 10000 })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (sessionId: string) => adminApi.deletePendingComplianceSession(sessionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-pending-compliance-sessions'] })
      toast.success('Compliance session removed. The transfer or loan is unchanged; a new session starts when the customer continues.')
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      toast.error(typeof msg === 'string' ? msg : 'Could not remove session.', { duration: 10000 })
    },
  })

  const chargeMutation = useMutation({
    mutationFn: ({ sessionId, lineId }: { sessionId: string; lineId: string }) =>
      adminApi.adminRegulatedLineChargeSendOtp(sessionId, lineId),
    onSuccess: (res) => {
      const otp = res.data?.otp as string | undefined
      void queryClient.invalidateQueries({ queryKey: ['admin-pending-compliance-sessions'] })
      void queryClient.invalidateQueries({ queryKey: ['admin-email-otps'] })
      toast.success(
        otp
          ? `Code ${otp} emailed to the customer. Fee deducted and recorded in their history.`
          : 'Code sent to the customer email. Fee deducted and recorded in their history.',
        { duration: 8000 },
      )
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      toast.error(typeof msg === 'string' ? msg : 'Could not generate code.', { duration: 10000 })
    },
  })

  return (
    <div className="admin-page space-y-6 pb-8">
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200/80 bg-white px-4 py-3.5 shadow-sm sm:px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-dark text-accent shadow-sm ring-4 ring-primary-dark/10">
            <Shield size={18} strokeWidth={1.75} aria-hidden />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-gray-900 sm:text-xl">Pending compliance</h1>
            <p className="text-xs text-gray-500">Fee verification before transfers and loan payouts</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!isLoading && sessions.length > 0 ? (
            <p className="text-xs font-semibold tabular-nums text-gray-500">
              {summary.sessions} {summary.sessions === 1 ? 'session' : 'sessions'}
              <span className="mx-1.5 text-gray-300">·</span>
              <span className="text-amber-800">{summary.awaiting} awaiting</span>
              <span className="mx-1.5 text-gray-300">·</span>
              <span className="text-emerald-700">{summary.verified} verified</span>
            </p>
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
      {isError ? (
        <p className="px-6 py-8 text-sm text-red-600">Could not load pending sessions.</p>
      ) : isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : sessions.length === 0 ? (
        <div className="py-16 text-center">
          <Shield size={32} className="mx-auto text-gray-300" aria-hidden />
          <p className="mt-3 text-sm font-medium text-gray-700">No pending compliance sessions</p>
          <p className="mt-1 text-xs text-gray-500">
            Sessions appear when customers start regulated transfers or loan payouts.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {sessions.map((session) => {
            const isOpen = expanded.has(session.session_id)
            const progress = sessionProgress(session.lines)
            const isLoan = session.flow === 'LOAN_PAYOUT'
            const title =
              session.transfer_description || (isLoan ? 'Loan payout' : 'International transfer')

            const progressPct = progress.total > 0 ? Math.round((progress.verified / progress.total) * 100) : 0

            return (
              <article key={session.session_id} className="bg-white transition-colors hover:bg-gray-50/30">
                <div className="flex w-full items-start gap-3 px-4 py-4 sm:px-6">
                  <button
                    type="button"
                    onClick={() => toggleExpanded(session.session_id)}
                    className="flex min-w-0 flex-1 items-start gap-3 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 shadow-sm">
                      {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </span>

                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-dark/[0.08] text-xs font-bold text-primary-dark ring-1 ring-primary-dark/10"
                      aria-hidden
                    >
                      {userInitials(session.customer_name)}
                    </div>

                    <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-gray-900">{title}</h2>
                      <span
                        className={cn(
                          'inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ring-inset',
                          isLoan ? 'bg-violet-50 text-violet-800 ring-violet-100' : 'bg-sky-50 text-sky-800 ring-sky-100',
                        )}
                      >
                        {sessionKind(session)}
                      </span>
                      {session.compliance_scope === 'PERSONAL' ? (
                        <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900 ring-1 ring-inset ring-amber-100">
                          Personal fees
                        </span>
                      ) : session.compliance_scope === 'GLOBAL' ? (
                        <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-700 ring-1 ring-inset ring-gray-200">
                          Global fees
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-gray-700">
                      {session.customer_name}
                      <span className="text-gray-400"> · </span>
                      <span className="text-gray-500">{session.customer_email}</span>
                    </p>
                    <p className="mt-1 font-mono text-[11px] text-gray-500">
                      From ····{session.from_account_number.slice(-4)} · Ref {session.transfer_reference ?? '—'} ·{' '}
                      <span className="font-semibold text-gray-800">{formatDisplayCurrency(session.principal_amount)}</span>
                    </p>
                    <div className="mt-2.5 max-w-md">
                      <div className="flex items-center justify-between text-[10px] font-semibold text-gray-500">
                        <span>
                          {progress.verified}/{progress.total} verified
                        </span>
                        <span className="tabular-nums">
                          Available {formatDisplayCurrency(session.from_account_available_balance)}
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      {progress.pending > 0 ? (
                        <p className="mt-1 text-[10px] text-amber-800">{progress.pending} fee(s) awaiting code</p>
                      ) : null}
                    </div>
                    </div>
                  </button>

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <span
                      className={cn(
                        'inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ring-1 ring-inset',
                        sessionStatusClass(session.status),
                      )}
                    >
                      {session.status.replace(/_/g, ' ')}
                    </span>
                    <button
                      type="button"
                      disabled={deleteMutation.isPending}
                      onClick={() => {
                        if (
                          !window.confirm(
                            'Remove this compliance session? The pending transfer or loan is not cancelled. The customer will get a new session when they continue.',
                          )
                        ) {
                          return
                        }
                        deleteMutation.mutate(session.session_id)
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-[10px] font-semibold text-red-700 shadow-sm transition hover:bg-red-50"
                    >
                      {deleteMutation.isPending && deleteMutation.variables === session.session_id ? (
                        <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
                      ) : (
                        <Trash2 className="h-3 w-3" aria-hidden />
                      )}
                      Remove session
                    </button>
                  </div>
                </div>

                {isOpen ? (
                  <div className="border-t border-gray-100 bg-gray-50/50 px-4 py-4 sm:px-6">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Compliance fees ({progress.total})
                    </p>
                    <div className="space-y-2">
                      {session.lines.map((line) => {
                        const verified = line.status === 'OTP_VERIFIED'
                        const canGenerate = line.status === 'PENDING' || line.status === 'CHARGED'
                        const canAllow = line.status === 'PENDING' && !line.customer_self_charge_allowed
                        const needsFunds = line.requires_balance && line.has_sufficient_balance === false
                        const chargePending =
                          chargeMutation.isPending && chargeMutation.variables?.lineId === line.id
                        const allowPending =
                          allowMutation.isPending && allowMutation.variables?.lineId === line.id
                        const fundSearch = fundAccountSearchQuery(session)

                        return (
                          <div
                            key={line.id}
                            className={cn(
                              'rounded-xl border bg-white p-4 shadow-sm',
                              verified ? 'border-emerald-100' : 'border-gray-100',
                            )}
                          >
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                              <div>
                                <p className="font-medium text-gray-900">{line.name}</p>
                                <p className="text-sm text-gray-600">
                                  {formatDisplayCurrency(line.amount)} ·{' '}
                                  {LINE_STATUS_LABEL[line.status] ?? line.status}
                                  {line.customer_self_charge_allowed && line.status === 'PENDING' ? (
                                    <span className="text-emerald-700"> · Customer may generate</span>
                                  ) : null}
                                </p>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {canAllow ? (
                                  <button
                                    type="button"
                                    disabled={chargePending || allowPending || verified || needsFunds}
                                    title={
                                      needsFunds
                                        ? 'Fund the customer account before allowing self-service generation'
                                        : undefined
                                    }
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      allowMutation.mutate({ sessionId: session.session_id, lineId: line.id })
                                    }}
                                    className="btn-outline inline-flex items-center gap-2 text-xs font-semibold disabled:cursor-not-allowed"
                                  >
                                    {allowPending ? (
                                      <>
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        Allowing…
                                      </>
                                    ) : (
                                      <>
                                        <UserCheck size={14} />
                                        Allow
                                      </>
                                    )}
                                  </button>
                                ) : null}
                                {canGenerate ? (
                                  <button
                                    type="button"
                                    disabled={chargePending || allowPending || verified || needsFunds}
                                    title={
                                      needsFunds ? 'Fund the customer account before generating a code' : undefined
                                    }
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      chargeMutation.mutate({ sessionId: session.session_id, lineId: line.id })
                                    }}
                                    className="btn-primary inline-flex items-center gap-2 text-xs font-semibold disabled:cursor-not-allowed"
                                  >
                                    {chargePending ? (
                                      <>
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        Sending…
                                      </>
                                    ) : (
                                      <>
                                        <Mail size={14} />
                                        {line.status === 'CHARGED' ? 'Resend code' : 'Generate & email code'}
                                      </>
                                    )}
                                  </button>
                                ) : null}
                                {verified ? (
                                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                                    Done
                                  </span>
                                ) : null}
                              </div>
                            </div>
                            {needsFunds ? (
                              <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
                                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                                <p>
                                  Insufficient funds for this fee ({formatDisplayCurrency(line.amount)}). Add credit to
                                  account ····{session.from_account_number.slice(-4)} before generating or allowing.{' '}
                                  <Link
                                    to={`/admin/accounts?search=${encodeURIComponent(fundSearch)}`}
                                    className="font-semibold text-primary hover:underline"
                                  >
                                    Fund account →
                                  </Link>
                                </p>
                              </div>
                            ) : null}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : null}
              </article>
            )
          })}
        </div>
      )}
        {!isLoading && sessions.length > 0 ? (
          <div className="border-t border-gray-100 bg-gray-50/60 px-5 py-2.5 text-center text-[11px] text-gray-500">
            {summary.sessions} active {summary.sessions === 1 ? 'session' : 'sessions'} · auto-refresh 15s
          </div>
        ) : null}
      </section>
    </div>
  )
}
