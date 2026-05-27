import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  UserPen,
  Check,
  X,
  Clock,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Globe,
  IdCard,
  Filter,
} from 'lucide-react'
import { adminApi } from '@/api/admin'
import Spinner from '@/components/ui/Spinner'
import { cn } from '@/utils/cn'
import { formatDate } from '@/utils/format'

type ProfileRequestRow = {
  id: string
  status: string
  user_email: string
  user_name: string
  proposed_full_name: string
  proposed_email: string
  proposed_phone: string
  proposed_address?: string
  proposed_date_of_birth?: string | null
  proposed_nationality?: string
  proposed_id_document_type?: string
  proposed_id_document_number?: string
  proposed_profile_picture?: string | null
  rejection_reason?: string
  created_at: string
  reviewed_at?: string | null
}

const STATUS_FILTERS = [
  { value: 'PENDING', label: 'Pending' },
  { value: '', label: 'All' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
] as const

function userInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

function statusBadgeClass(status: string) {
  switch (status) {
    case 'PENDING':
      return 'bg-amber-50 text-amber-900 ring-amber-100'
    case 'APPROVED':
      return 'bg-emerald-50 text-emerald-800 ring-emerald-100'
    case 'REJECTED':
      return 'bg-red-50 text-red-800 ring-red-100'
    default:
      return 'bg-gray-50 text-gray-600 ring-gray-100'
  }
}

function ProposedField({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value?: string | null
  icon?: typeof Mail
}) {
  const text = value?.trim()
  if (!text) return null

  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/90 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
        {Icon ? <Icon size={12} aria-hidden /> : null}
        {label}
      </div>
      <p className="mt-1 break-words text-sm font-medium text-gray-900">{text}</p>
    </div>
  )
}

function RequestCard({
  row,
  onApprove,
  onReject,
  busy,
}: {
  row: ProfileRequestRow
  onApprove: (id: string) => void
  onReject: (id: string) => void
  busy: boolean
}) {
  const isPending = row.status === 'PENDING'
  const extraFields = [
    { label: 'Address', value: row.proposed_address, icon: MapPin },
    {
      label: 'Date of birth',
      value: row.proposed_date_of_birth ? formatDate(row.proposed_date_of_birth) : null,
      icon: Calendar,
    },
    { label: 'Nationality', value: row.proposed_nationality, icon: Globe },
    {
      label: 'ID document',
      value:
        row.proposed_id_document_type || row.proposed_id_document_number
          ? [row.proposed_id_document_type, row.proposed_id_document_number].filter(Boolean).join(' · ')
          : null,
      icon: IdCard,
    },
  ].filter((f) => f.value?.trim())

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-[0_2px_16px_-6px_rgba(21,42,30,0.08)] transition hover:border-primary-dark/15 hover:shadow-md">
      <div className="flex flex-col gap-4 border-b border-gray-100 bg-gradient-to-r from-gray-50/80 via-white to-white px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-dark/[0.08] text-xs font-bold text-primary-dark ring-1 ring-primary-dark/10"
            aria-hidden
          >
            {userInitials(row.user_name)}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-gray-900" title={row.user_name}>
              {row.user_name}
            </p>
            <p className="truncate text-xs text-gray-500" title={row.user_email}>
              Current: {row.user_email}
            </p>
            <p className="mt-1.5 flex items-center gap-1 text-[11px] text-gray-400">
              <Clock size={12} aria-hidden />
              Submitted {formatDate(row.created_at, 'MMM d, yyyy · HH:mm')}
            </p>
          </div>
        </div>
        <span
          className={cn(
            'inline-flex shrink-0 self-start rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ring-1 ring-inset',
            statusBadgeClass(row.status),
          )}
        >
          {row.status}
        </span>
      </div>

      <div className="space-y-3 px-4 py-4 sm:px-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-primary-dark">Proposed changes</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <ProposedField label="Full name" value={row.proposed_full_name} />
          <ProposedField label="Email" value={row.proposed_email} icon={Mail} />
          <ProposedField label="Phone" value={row.proposed_phone} icon={Phone} />
          {extraFields.map((f) => (
            <ProposedField key={f.label} label={f.label} value={f.value} icon={f.icon} />
          ))}
        </div>
        {row.proposed_profile_picture ? (
          <div className="rounded-xl border border-gray-100 bg-gray-50/90 px-3 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Profile photo</p>
            <a
              href={row.proposed_profile_picture}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-xs font-semibold text-primary-dark hover:underline"
            >
              View uploaded image →
            </a>
          </div>
        ) : null}
        {row.status === 'REJECTED' && row.rejection_reason?.trim() ? (
          <p className="rounded-lg border border-red-100 bg-red-50/80 px-3 py-2 text-xs text-red-800">
            <span className="font-semibold">Rejection reason:</span> {row.rejection_reason}
          </p>
        ) : null}
        {row.reviewed_at ? (
          <p className="text-[11px] text-gray-400">Reviewed {formatDate(row.reviewed_at, 'MMM d, yyyy · HH:mm')}</p>
        ) : null}
      </div>

      {isPending ? (
        <div className="flex flex-wrap gap-2 border-t border-gray-100 bg-gray-50/50 px-4 py-3 sm:px-6">
          <button
            type="button"
            disabled={busy}
            onClick={() => onApprove(row.id)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary-dark px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-primary-light disabled:opacity-50"
          >
            <Check size={14} aria-hidden />
            Approve
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onReject(row.id)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-700 shadow-sm transition hover:bg-red-50 disabled:opacity-50"
          >
            <X size={14} aria-hidden />
            Reject
          </button>
        </div>
      ) : null}
    </article>
  )
}

export default function AdminProfileRequestsPage() {
  const [statusFilter, setStatusFilter] = useState('PENDING')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-profile-requests', statusFilter],
    queryFn: () =>
      adminApi.profileChangeRequests(statusFilter ? { status: statusFilter } : undefined),
  })

  const approve = useMutation({
    mutationFn: (id: string) => adminApi.approveProfileChangeRequest(id),
    onSuccess: () => {
      toast.success('Request approved and applied.')
      queryClient.invalidateQueries({ queryKey: ['admin-profile-requests'] })
    },
    onError: (err: unknown) => {
      const d = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      toast.error(typeof d === 'string' ? d : 'Approval failed.')
    },
  })

  const reject = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminApi.rejectProfileChangeRequest(id, reason),
    onSuccess: () => {
      toast.success('Request rejected.')
      queryClient.invalidateQueries({ queryKey: ['admin-profile-requests'] })
    },
    onError: () => toast.error('Rejection failed.'),
  })

  const rows: ProfileRequestRow[] = data?.data?.results ?? data?.data ?? []
  const busy = approve.isPending || reject.isPending
  const filterLabel = STATUS_FILTERS.find((f) => f.value === statusFilter)?.label ?? 'All'

  const handleReject = (id: string) => {
    const reason = window.prompt('Rejection reason (optional):') ?? ''
    reject.mutate({ id, reason })
  }

  return (
    <div className="space-y-6 pb-8">
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200/80 bg-white px-4 py-3.5 shadow-sm sm:px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-dark text-accent shadow-sm ring-4 ring-primary-dark/10">
            <UserPen size={18} strokeWidth={1.75} aria-hidden />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-gray-900 sm:text-xl">Profile requests</h1>
            <p className="text-xs text-gray-500">Review and apply customer detail updates</p>
          </div>
        </div>
        {!isLoading && (
          <p className="text-xs font-semibold tabular-nums text-gray-500">
            {rows.length} {rows.length === 1 ? 'request' : 'requests'} · {filterLabel}
          </p>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-[0_4px_24px_-10px_rgba(21,42,30,0.1)]">
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 bg-gradient-to-r from-gray-50/90 via-white to-white px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-primary-dark">
            <Filter size={14} aria-hidden />
            Status
          </div>
          <div className="flex flex-wrap gap-1.5">
            {STATUS_FILTERS.map((opt) => (
              <button
                key={opt.value || 'all'}
                type="button"
                onClick={() => setStatusFilter(opt.value)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-semibold transition',
                  statusFilter === opt.value
                    ? 'bg-primary-dark text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {isLoading ? (
            <div className="flex justify-center py-14">
              <Spinner />
            </div>
          ) : rows.length === 0 ? (
            <div className="py-14 text-center">
              <UserPen size={32} className="mx-auto text-gray-300" aria-hidden />
              <p className="mt-3 text-sm font-medium text-gray-700">No {filterLabel.toLowerCase()} requests</p>
              <p className="mt-1 text-xs text-gray-500">
                {statusFilter === 'PENDING'
                  ? 'New customer profile changes will appear here.'
                  : 'Try another status filter.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {rows.map((r) => (
                <RequestCard
                  key={r.id}
                  row={r}
                  busy={busy}
                  onApprove={(id) => approve.mutate(id)}
                  onReject={handleReject}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
