import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { KeyRound, Loader2, Mail, Shield } from 'lucide-react'
import { transactionsApi } from '@/api/transactions'
import { loansApi } from '@/api/loans'
import Spinner from '@/components/ui/Spinner'
import { cn } from '@/utils/cn'
import { formatDisplayCurrency } from '@/utils/format'
import {
  TRANSFER_UI_MOCK,
  MOCK_COMPLIANCE_OTP,
  MOCK_REG_SESSION_ID,
  createInitialMockComplianceLines,
} from '@/pages/transactions/transferMock'
import type { SessionLine } from '@/pages/transactions/transferTypes'

type RegSession = {
  session_id: string
  status: string
  lines: SessionLine[]
}

type Props = {
  open: boolean
  sessionId: string | null
  onClose: () => void
  onCompleted?: () => void
  flow?: 'international' | 'loan'
  loanApplicationId?: string
  disbursementAccountId?: string
}

export default function ComplianceFeesModal({
  open,
  sessionId,
  onClose,
  onCompleted,
  flow = 'international',
  loanApplicationId,
  disbursementAccountId,
}: Props) {
  const isLoan = flow === 'loan'
  const queryClient = useQueryClient()
  const [complianceOtps, setComplianceOtps] = useState<Record<string, string>>({})
  const [chargeInsufficientMsg, setChargeInsufficientMsg] = useState<string | null>(null)
  const [phase, setPhase] = useState<'loading' | 'lines' | 'submitting'>('loading')
  const mockSessionRef = useRef<{ lines: SessionLine[]; status: string } | null>(null)
  const [mockSession, setMockSession] = useState<{ lines: SessionLine[]; status: string } | null>(null)

  const effectiveSessionId = TRANSFER_UI_MOCK && open ? MOCK_REG_SESSION_ID : sessionId

  const { data: sessionRes, isLoading: sessionLoading, refetch } = useQuery({
    queryKey: ['regulated-session', effectiveSessionId],
    queryFn: () => transactionsApi.regulatedSessionDetail(effectiveSessionId!),
    enabled: open && !!effectiveSessionId && !TRANSFER_UI_MOCK,
    refetchInterval: open && !TRANSFER_UI_MOCK ? 5000 : false,
  })

  useEffect(() => {
    if (!open) {
      setComplianceOtps({})
      setChargeInsufficientMsg(null)
      setPhase('loading')
      mockSessionRef.current = null
      setMockSession(null)
      return
    }
    if (TRANSFER_UI_MOCK) {
      const lines = createInitialMockComplianceLines()
      mockSessionRef.current = { lines, status: 'IN_PROGRESS' }
      setMockSession({ lines, status: 'IN_PROGRESS' })
      setPhase('lines')
      return
    }
    setPhase('loading')
  }, [open, sessionId])

  useEffect(() => {
    if (!open) return
    if (!effectiveSessionId) {
      setPhase('loading')
      return
    }
    if (TRANSFER_UI_MOCK) return
    if (!sessionLoading && sessionRes?.data) setPhase('lines')
  }, [open, effectiveSessionId, sessionLoading, sessionRes, TRANSFER_UI_MOCK])

  const regSession: RegSession | undefined = TRANSFER_UI_MOCK
    ? mockSession
      ? { session_id: MOCK_REG_SESSION_ID, status: mockSession.status, lines: mockSession.lines }
      : undefined
    : (sessionRes?.data as RegSession | undefined)

  const activeLine = useMemo(() => {
    if (!regSession?.lines?.length) return undefined
    return regSession.lines.find((l) => l.status !== 'OTP_VERIFIED')
  }, [regSession?.lines])

  useEffect(() => {
    setChargeInsufficientMsg(null)
  }, [activeLine?.id])

  useEffect(() => {
    if (!chargeInsufficientMsg) return
    const timer = window.setTimeout(() => setChargeInsufficientMsg(null), 4000)
    return () => window.clearTimeout(timer)
  }, [chargeInsufficientMsg])

  const lineBlocked = (line: SessionLine) => {
    const lines = regSession?.lines ?? []
    for (const pl of lines) {
      if (pl.sequence < line.sequence && pl.status !== 'OTP_VERIFIED') return true
    }
    return false
  }

  const completeMutation = useMutation({
    mutationFn: async () => {
      if (TRANSFER_UI_MOCK) {
        await new Promise((r) => setTimeout(r, 500))
        return { data: { id: 'mock-tx', status: 'COMPLETED' } }
      }
      if (isLoan) {
        if (!loanApplicationId) {
          throw new Error('loanApplicationId required')
        }
        if (!disbursementAccountId) {
          throw new Error('disbursementAccountId required')
        }
        return loansApi.regulatedPayoutComplete(loanApplicationId, {
          regulated_session_id: effectiveSessionId!,
          disbursement_account_id: disbursementAccountId,
        })
      }
      return transactionsApi.regulatedSessionCompleteTransfer(effectiveSessionId!)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['transactions'] })
      void queryClient.invalidateQueries({ queryKey: ['accounts'] })
      void queryClient.invalidateQueries({ queryKey: ['loan-applications'] })
      void queryClient.invalidateQueries({ queryKey: ['loan-accounts'] })
      toast.success(isLoan ? 'Loan sent to your account.' : 'International transfer completed.')
      onCompleted?.()
      onClose()
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      if (isLoan && msg === undefined && err instanceof Error && err.message === 'disbursementAccountId required') {
        toast.success('All compliance fees verified.')
        onCompleted?.()
        onClose()
        return
      }
      toast.error(typeof msg === 'string' ? msg : isLoan ? 'Could not disburse loan.' : 'Could not complete transfer.')
      setPhase('lines')
    },
  })

  const chargeMutation = useMutation({
    mutationFn: async (lineId: string) => {
      if (TRANSFER_UI_MOCK) {
        await new Promise((r) => setTimeout(r, 300))
        const prev = mockSessionRef.current
        if (!prev) return {}
        const next = {
          ...prev,
          lines: prev.lines.map((l) => (l.id === lineId ? { ...l, status: 'CHARGED' } : l)),
        }
        mockSessionRef.current = next
        setMockSession(next)
        return {}
      }
      return transactionsApi.regulatedLineChargeSendOtp(effectiveSessionId!, lineId)
    },
    onMutate: () => {
      setChargeInsufficientMsg(null)
    },
    onSuccess: () => {
      setChargeInsufficientMsg(null)
      if (!TRANSFER_UI_MOCK) {
        void refetch()
        toast.success('Verification code sent to your email.')
      }
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setChargeInsufficientMsg(typeof msg === 'string' ? msg : 'Insufficient funds.')
    },
  })

  const verifyMutation = useMutation({
    mutationFn: async ({ lineId, otp }: { lineId: string; otp: string }) => {
      if (TRANSFER_UI_MOCK) {
        if (otp !== MOCK_COMPLIANCE_OTP) {
          throw Object.assign(new Error('demo'), {
            response: { data: { detail: `Demo mode: use ${MOCK_COMPLIANCE_OTP}` } },
          })
        }
        const prev = mockSessionRef.current
        if (!prev) return { data: { session: { lines: [], status: 'IN_PROGRESS' } } }
        const nextLines = prev.lines.map((l) =>
          l.id === lineId ? { ...l, status: 'OTP_VERIFIED' } : l,
        )
        const allVerified = nextLines.every((l) => l.status === 'OTP_VERIFIED')
        const next = { lines: nextLines, status: allVerified ? 'LINES_VERIFIED' : prev.status }
        mockSessionRef.current = next
        setMockSession(next)
        return { data: { session: { lines: nextLines, status: next.status } } }
      }
      return transactionsApi.regulatedLineVerifyOtp(effectiveSessionId!, lineId, otp)
    },
    onSuccess: (res, v) => {
      if (!TRANSFER_UI_MOCK) void refetch()
      setComplianceOtps((m) => ({ ...m, [v.lineId]: '' }))
      toast.success('Step verified.')
      const sess = res.data?.session as RegSession | undefined
      const lines = sess?.lines ?? regSession?.lines ?? []
      if (lines.length && lines.every((l) => l.status === 'OTP_VERIFIED')) {
        if (isLoan && !disbursementAccountId) {
          onCompleted?.()
          onClose()
          return
        }
        setPhase('submitting')
        completeMutation.mutate()
      }
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      toast.error(typeof msg === 'string' ? msg : 'Invalid code.')
    },
  })

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="compliance-modal-title"
    >
      <div className="my-auto flex w-full max-w-md max-h-[min(calc(100vh-2rem),640px)] flex-col overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-[0_24px_48px_-12px_rgba(21,42,30,0.2)]">
        <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50/90 via-white to-white px-5 py-4 text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-dark text-accent shadow-sm ring-4 ring-primary-dark/10">
            <Shield size={18} strokeWidth={1.75} aria-hidden />
          </div>
          <h3 id="compliance-modal-title" className="text-base font-semibold text-gray-900">
            Compliance fees
          </h3>
          <p className="mt-1 text-[11px] leading-relaxed text-gray-500">
            Codes are emailed for verification. Close anytime — resume from Transactions.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {TRANSFER_UI_MOCK ? (
            <p className="mb-4 text-center text-[11px] text-violet-950">
              <span className="inline-block rounded-lg border border-violet-200/80 bg-violet-50 px-3 py-2">
                Demo: use <code className="font-mono font-bold">{MOCK_COMPLIANCE_OTP}</code> for each fee.
              </span>
            </p>
          ) : null}

          {phase === 'loading' || sessionLoading ? (
            <div className="flex flex-col items-center gap-3 py-10">
              <Spinner />
              <p className="text-sm text-gray-600">Loading fee steps…</p>
            </div>
          ) : null}

          {phase === 'lines' && !sessionLoading && activeLine ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-gray-100 bg-gray-50/90 px-4 py-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Current fee</p>
                <p className="mt-1 text-base font-semibold text-gray-900">{activeLine.name}</p>
                <p className="mt-0.5 text-xl font-bold tabular-nums tracking-tight text-primary-dark">
                  {formatDisplayCurrency(activeLine.amount)}
                </p>
              </div>

              {activeLine.status === 'PENDING' ? (
                <div className="space-y-2">
                  {activeLine.customer_self_charge_allowed ? (
                    <p className="text-center text-xs text-emerald-800">
                      You can generate your verification code below.
                    </p>
                  ) : (
                    <p className="text-center text-xs text-gray-500">
                      Your bank will email a code when this fee is ready.
                    </p>
                  )}
                  <button
                    type="button"
                    className={cn(
                      'inline-flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition',
                      activeLine.customer_self_charge_allowed
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
                        : 'border-gray-200 bg-gray-100 text-gray-600',
                    )}
                    disabled={chargeMutation.isPending || lineBlocked(activeLine)}
                    onClick={() => chargeMutation.mutate(activeLine.id)}
                  >
                    {chargeMutation.isPending && chargeMutation.variables === activeLine.id ? (
                      <>
                        <Loader2 size={16} className="animate-spin" aria-hidden />
                        Processing…
                      </>
                    ) : (
                      <>
                        <KeyRound size={16} aria-hidden />
                        Generate code · {formatDisplayCurrency(activeLine.amount)}
                      </>
                    )}
                  </button>
                  {chargeInsufficientMsg ? (
                    <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-center text-xs font-medium text-red-700" role="alert">
                      {chargeInsufficientMsg}
                    </p>
                  ) : null}
                </div>
              ) : activeLine.status === 'CHARGED' ? (
                <p className="flex items-center justify-center gap-1.5 text-xs font-medium text-emerald-800">
                  <Mail size={14} aria-hidden />
                  Enter the 6-digit code from your email
                </p>
              ) : null}

              <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                <input
                  className={cn(
                    'input-field w-full text-center font-mono text-base font-bold tracking-[0.35em] sm:flex-1',
                    activeLine.status === 'CHARGED'
                      ? 'border-primary-dark/20 bg-primary-dark/[0.04] ring-1 ring-primary-dark/10'
                      : 'opacity-70',
                  )}
                  placeholder="······"
                  inputMode="numeric"
                  maxLength={6}
                  autoComplete="one-time-code"
                  disabled={activeLine.status !== 'CHARGED'}
                  value={complianceOtps[activeLine.id] ?? ''}
                  onChange={(e) =>
                    setComplianceOtps((m) => ({
                      ...m,
                      [activeLine.id]: e.target.value.replace(/\D/g, '').slice(0, 6),
                    }))
                  }
                />
                <button
                  type="button"
                  className="btn-primary shrink-0 px-5 py-2.5 text-sm font-semibold sm:min-w-[7.5rem]"
                  disabled={
                    verifyMutation.isPending ||
                    activeLine.status !== 'CHARGED' ||
                    (complianceOtps[activeLine.id] ?? '').length !== 6
                  }
                  onClick={() =>
                    verifyMutation.mutate({
                      lineId: activeLine.id,
                      otp: complianceOtps[activeLine.id] ?? '',
                    })
                  }
                >
                  {verifyMutation.isPending ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Loader2 size={14} className="animate-spin" aria-hidden />
                      Verifying…
                    </span>
                  ) : (
                    'Verify'
                  )}
                </button>
              </div>
            </div>
          ) : null}

          {phase === 'lines' && !sessionLoading && !activeLine && regSession?.lines?.length ? (
            <div className="flex flex-col items-center gap-3 py-10">
              <Spinner />
              <p className="text-sm text-gray-600">{isLoan ? 'Sending loan to your account…' : 'Completing transfer…'}</p>
            </div>
          ) : null}

          {phase === 'submitting' ? (
            <div className="flex flex-col items-center gap-3 py-10">
              <Spinner />
              <p className="text-sm text-gray-600">{isLoan ? 'Disbursing your loan…' : 'Posting your transfer…'}</p>
            </div>
          ) : null}
        </div>

        <div className="border-t border-gray-100 bg-gray-50/60 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50"
          >
            Close (resume later)
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
