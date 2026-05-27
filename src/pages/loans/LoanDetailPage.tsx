import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { loansApi } from '@/api/loans'
import Spinner from '@/components/ui/Spinner'
import { cn } from '@/utils/cn'
import { formatDisplayCurrency } from '@/utils/format'

export default function LoanDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, isLoading } = useQuery({ queryKey: ['loan', id], queryFn: () => loansApi.loanAccountDetail(id!) })
  const loan = data?.data

  if (isLoading) return <div className="flex justify-center py-20"><Spinner /></div>
  if (!loan) return <p className="text-gray-400 text-center">Loan not found.</p>

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/loans')} className="text-sm text-gray-400 hover:text-gray-600">← Back</button>
        <h1 className="text-xl font-bold text-gray-900">{loan.product_name}</h1>
      </div>

      <div className="card">
        <div className="grid grid-cols-2 gap-4">
          {[
            ['Principal', formatDisplayCurrency(loan.principal_amount)],
            ['Outstanding', formatDisplayCurrency(loan.outstanding_balance)],
            ['Monthly Payment', formatDisplayCurrency(loan.monthly_payment)],
            ['Interest Rate', `${(parseFloat(loan.interest_rate) * 100).toFixed(2)}%`],
            ['Term', `${loan.term_months} months`],
            ['Next Payment', loan.next_payment_due || 'N/A'],
          ].map(([label, value]) => (
            <div key={label as string} className="bg-gray-50 p-3 rounded-xl">
              <p className="text-xs text-gray-400">{label}</p>
              <p className="font-bold text-gray-800">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-3">Repayment Schedule</h2>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {loan.schedule?.map((s: { id: string; installment_number: number; due_date: string; total_amount: string; status: string }) => (
            <div key={s.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-700">Installment #{s.installment_number}</p>
                <p className="text-xs text-gray-400">{s.due_date}</p>
              </div>
              <div className="flex items-center gap-3">
                <p className="font-semibold text-gray-800">{formatDisplayCurrency(s.total_amount)}</p>
                <span className={cn('badge text-[10px]', s.status === 'PAID' ? 'badge-success' : s.status === 'OVERDUE' ? 'badge-danger' : 'badge-neutral')}>{s.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
