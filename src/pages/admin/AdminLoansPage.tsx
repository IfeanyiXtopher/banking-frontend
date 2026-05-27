import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Check, CreditCard, X } from 'lucide-react'
import { adminApi } from '@/api/admin'
import Spinner from '@/components/ui/Spinner'
import { formatDisplayCurrency } from '@/utils/format'
import { cn } from '@/utils/cn'
import AdminLoanProductsTab from '@/pages/admin/AdminLoanProductsTab'

type Tab = 'applications' | 'products'

type LoanRow = {
  id: string
  applicant_name: string
  product_name: string
  requested_amount: string
  term_months: number
  status: string
}

function loanStatusClass(status: string) {
  switch (status) {
    case 'APPROVED':
      return 'bg-emerald-50 text-emerald-800 ring-emerald-100'
    case 'REJECTED':
      return 'bg-red-50 text-red-800 ring-red-100'
    case 'DISBURSED':
      return 'bg-sky-50 text-sky-800 ring-sky-100'
    default:
      return 'bg-amber-50 text-amber-900 ring-amber-100'
  }
}

function userInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export default function AdminLoansPage() {
  const [tab, setTab] = useState<Tab>('applications')
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['admin-loans'],
    queryFn: () => adminApi.loans(),
    enabled: tab === 'applications',
  })
  const loans = (data?.data?.results || data?.data || []) as LoanRow[]

  const summary = useMemo(() => {
    const submitted = loans.filter((l) => l.status === 'SUBMITTED').length
    return { total: loans.length, submitted }
  }, [loans])

  const reviewMutation = useMutation({
    mutationFn: ({ id, decision }: { id: string; decision: string }) => adminApi.reviewLoan(id, decision),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-loans'] })
      toast.success('Decision saved.')
    },
    onError: () => toast.error('Failed to process decision.'),
  })

  return (
    <div className="space-y-6 pb-8">
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200/80 bg-white px-4 py-3.5 shadow-sm sm:px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-dark text-accent shadow-sm ring-4 ring-primary-dark/10">
            <CreditCard size={18} strokeWidth={1.75} aria-hidden />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-gray-900 sm:text-xl">Loans</h1>
            <p className="text-xs text-gray-500">Applications and customer-facing loan products</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {tab === 'applications' && !isLoading && loans.length > 0 ? (
            <p className="text-xs font-semibold tabular-nums text-gray-500">
              {summary.total} {summary.total === 1 ? 'application' : 'applications'}
              {summary.submitted > 0 ? (
                <>
                  <span className="mx-1.5 text-gray-300">·</span>
                  <span className="text-amber-800">{summary.submitted} pending review</span>
                </>
              ) : null}
            </p>
          ) : null}
          <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50/80 p-0.5">
            <button
              type="button"
              onClick={() => setTab('applications')}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-semibold transition',
                tab === 'applications' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800',
              )}
            >
              Applications
            </button>
            <button
              type="button"
              onClick={() => setTab('products')}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-semibold transition',
                tab === 'products' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800',
              )}
            >
              Loan products
            </button>
          </div>
        </div>
      </section>

      {tab === 'products' ? (
        <AdminLoanProductsTab />
      ) : (
        <section className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-[0_4px_24px_-10px_rgba(21,42,30,0.1)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200/80 bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  <th className="px-4 py-2.5 sm:px-6">Applicant</th>
                  <th className="px-3 py-2.5">Product</th>
                  <th className="px-3 py-2.5 text-right">Amount</th>
                  <th className="px-3 py-2.5">Term</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-4 py-2.5 text-right sm:px-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-14 text-center">
                      <Spinner className="mx-auto" />
                    </td>
                  </tr>
                ) : loans.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-14 text-center">
                      <CreditCard size={32} className="mx-auto text-gray-300" aria-hidden />
                      <p className="mt-3 text-sm font-medium text-gray-700">No loan applications</p>
                      <p className="mt-1 text-xs text-gray-500">New applications will appear here for review.</p>
                    </td>
                  </tr>
                ) : (
                  loans.map((loan, i) => (
                    <tr
                      key={loan.id}
                      className={cn('transition-colors hover:bg-emerald-50/30', i % 2 === 1 && 'bg-gray-50/40')}
                    >
                      <td className="px-4 py-3.5 sm:px-6">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-dark/[0.08] text-[10px] font-bold text-primary-dark ring-1 ring-primary-dark/10"
                            aria-hidden
                          >
                            {userInitials(loan.applicant_name)}
                          </div>
                          <span className="font-medium text-gray-900">{loan.applicant_name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-gray-700">{loan.product_name}</td>
                      <td className="px-3 py-3.5 text-right font-semibold tabular-nums text-gray-900">
                        {formatDisplayCurrency(loan.requested_amount)}
                      </td>
                      <td className="px-3 py-3.5 tabular-nums text-gray-600">{loan.term_months} mo</td>
                      <td className="px-3 py-3.5">
                        <span
                          className={cn(
                            'inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ring-1 ring-inset',
                            loanStatusClass(loan.status),
                          )}
                        >
                          {loan.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 sm:px-6">
                        {loan.status === 'SUBMITTED' ? (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              title="Approve"
                              disabled={reviewMutation.isPending}
                              onClick={() => reviewMutation.mutate({ id: loan.id, decision: 'APPROVE' })}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-emerald-700 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 disabled:opacity-50"
                            >
                              <Check size={15} aria-hidden />
                              <span className="sr-only">Approve {loan.applicant_name}</span>
                            </button>
                            <button
                              type="button"
                              title="Reject"
                              disabled={reviewMutation.isPending}
                              onClick={() => reviewMutation.mutate({ id: loan.id, decision: 'REJECT' })}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-red-600 shadow-sm transition hover:border-red-200 hover:bg-red-50 disabled:opacity-50"
                            >
                              <X size={15} aria-hidden />
                              <span className="sr-only">Reject {loan.applicant_name}</span>
                            </button>
                          </div>
                        ) : (
                          <span className="block text-right text-xs text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {!isLoading && loans.length > 0 ? (
            <div className="border-t border-gray-100 bg-gray-50/60 px-5 py-2.5 text-center text-[11px] text-gray-500">
              Showing {loans.length} {loans.length === 1 ? 'application' : 'applications'}
            </div>
          ) : null}
        </section>
      )}
    </div>
  )
}
