import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { Headphones, Plus, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { supportApi } from '@/api/support'
import { Input } from '@/components/forms/Input'
import { StyledSelect } from '@/components/forms/StyledSelect'
import Spinner from '@/components/ui/Spinner'
import { cn } from '@/utils/cn'
import { formatRelativeTime, formatDate } from '@/utils/format'
import { useAuthStore } from '@/store/authStore'

const newTicketSchema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  initial_message: z.string().min(20, 'Please describe your issue in more detail'),
})
type NewTicketForm = z.infer<typeof newTicketSchema>

const PRIORITY_BADGE: Record<string, string> = {
  URGENT: 'bg-red-50 text-red-700',
  HIGH: 'bg-amber-50 text-amber-900',
  MEDIUM: 'bg-gray-100 text-gray-700',
  LOW: 'bg-gray-50 text-gray-600',
}

const STATUS_BADGE: Record<string, string> = {
  RESOLVED: 'bg-emerald-50 text-emerald-800',
  IN_PROGRESS: 'bg-sky-50 text-sky-800',
  OPEN: 'bg-gray-100 text-gray-700',
}

export default function TicketListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const user = useAuthStore((s) => s.user)

  const showNewModal = searchParams.get('new') === '1'
  const detailTicketId = searchParams.get('ticket')?.trim() || null

  const { data, isLoading } = useQuery({ queryKey: ['tickets'], queryFn: supportApi.tickets })
  const tickets = data?.data?.results || data?.data || []

  const closeNewModal = () => {
    const next = new URLSearchParams(searchParams)
    next.delete('new')
    setSearchParams(next, { replace: true })
  }

  const closeDetailModal = () => {
    const next = new URLSearchParams(searchParams)
    next.delete('ticket')
    setSearchParams(next, { replace: true })
  }

  const openNewModal = () => {
    const next = new URLSearchParams(searchParams)
    next.set('new', '1')
    next.delete('ticket')
    setSearchParams(next, { replace: true })
  }

  const openDetailModal = (id: string) => {
    const next = new URLSearchParams(searchParams)
    next.set('ticket', id)
    next.delete('new')
    setSearchParams(next, { replace: true })
  }

  return (
    <div className="mx-auto max-w-4xl pb-10">
      <div className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-[0_4px_24px_-8px_rgba(21,42,30,0.08)]">
        <div className="flex flex-col gap-3 bg-primary-dark px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white sm:text-xl">Support</h1>
            <p className="mt-0.5 text-sm text-white/75">Message our team about your account or transfers</p>
          </div>
          <button type="button" onClick={openNewModal} className="btn-primary inline-flex shrink-0 items-center gap-2 py-2.5 text-sm">
            <Plus size={16} strokeWidth={2.5} />
            New ticket
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {isLoading ? (
            <div className="flex justify-center py-14">
              <Spinner />
            </div>
          ) : tickets.length === 0 ? (
            <div className="flex flex-col items-center rounded-xl border border-dashed border-gray-200 bg-gray-50/60 px-6 py-14 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-dark/10 text-primary-dark">
                <Headphones size={28} strokeWidth={1.75} />
              </div>
              <p className="mt-4 text-base font-semibold text-gray-900">No tickets yet</p>
              <p className="mt-1 max-w-sm text-sm text-gray-500">Open a ticket and we will reply in this thread.</p>
              <button type="button" onClick={openNewModal} className="btn-primary mt-6 text-sm">
                Create ticket
              </button>
            </div>
          ) : (
            <ul className="space-y-2">
              {(tickets as { id: string; ticket_number: string; subject: string; status: string; priority: string; created_at: string }[]).map(
                (t) => (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => openDetailModal(t.id)}
                      className="flex w-full items-start justify-between gap-4 rounded-xl border border-gray-100 bg-white p-4 text-left transition hover:border-gray-200 hover:shadow-[0_4px_16px_-6px_rgba(21,42,30,0.1)]"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs text-gray-400">#{t.ticket_number}</span>
                          <span className={cn('rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase', PRIORITY_BADGE[t.priority] ?? PRIORITY_BADGE.MEDIUM)}>
                            {t.priority}
                          </span>
                        </div>
                        <p className="truncate font-medium text-gray-900">{t.subject}</p>
                        <p className="mt-0.5 text-xs text-gray-500">{formatRelativeTime(t.created_at)}</p>
                      </div>
                      <span
                        className={cn(
                          'shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase',
                          STATUS_BADGE[t.status] ?? STATUS_BADGE.OPEN,
                        )}
                      >
                        {t.status.replace('_', ' ')}
                      </span>
                    </button>
                  </li>
                ),
              )}
            </ul>
          )}
        </div>
      </div>

      <NewTicketModal open={showNewModal} onClose={closeNewModal} />
      <TicketDetailModal ticketId={detailTicketId} open={Boolean(detailTicketId)} onClose={closeDetailModal} userName={user?.full_name} />
    </div>
  )
}

function NewTicketModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewTicketForm>({
    resolver: zodResolver(newTicketSchema),
    defaultValues: { priority: 'MEDIUM' },
  })

  useEffect(() => {
    if (!open) reset({ priority: 'MEDIUM', subject: '', initial_message: '' })
  }, [open, reset])

  const mutation = useMutation({
    mutationFn: supportApi.createTicket,
    onSuccess: () => {
      toast.success('Ticket created.')
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
      onClose()
      reset({ priority: 'MEDIUM', subject: '', initial_message: '' })
    },
    onError: () => toast.error('Failed to create ticket.'),
  })

  return (
    <Dialog open={open} onClose={onClose} className="relative z-[110]">
      <DialogBackdrop className="fixed inset-0 bg-black/45 backdrop-blur-[2px]" />
      <div className="fixed inset-0 flex items-end justify-center p-4 sm:items-center">
        <DialogPanel className="flex max-h-[min(92dvh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
          <div className="flex items-center justify-between bg-primary-dark px-5 py-4">
            <DialogTitle className="text-lg font-bold text-white">New ticket</DialogTitle>
            <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-white/80 hover:bg-white/10" aria-label="Close">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4 overflow-y-auto px-5 py-5">
            <Input label="Subject" placeholder="Brief summary" error={errors.subject?.message} {...register('subject')} />
            <StyledSelect label="Priority" error={errors.priority?.message} {...register('priority')}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </StyledSelect>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">Message</label>
              <textarea
                className="input-field h-32 w-full resize-none text-sm"
                placeholder="Describe your issue…"
                {...register('initial_message')}
              />
              {errors.initial_message ? <p className="mt-1 text-xs text-red-600">{errors.initial_message.message}</p> : null}
            </div>
            <button type="submit" disabled={mutation.isPending} className="btn-primary flex w-full items-center justify-center gap-2 py-2.5 text-sm">
              {mutation.isPending ? <Spinner size="sm" className="border-white border-t-white/30" /> : null}
              Submit
            </button>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  )
}

function TicketDetailModal({
  ticketId,
  open,
  onClose,
  userName,
}: {
  ticketId: string | null
  open: boolean
  onClose: () => void
  userName: string | undefined
}) {
  const queryClient = useQueryClient()
  const [message, setMessage] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: () => supportApi.ticketDetail(ticketId!),
    enabled: open && Boolean(ticketId),
  })
  const ticket = data?.data

  const replyMutation = useMutation({
    mutationFn: () => supportApi.addMessage(ticketId!, { body: message }),
    onSuccess: () => {
      setMessage('')
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] })
      toast.success('Message sent.')
    },
  })

  useEffect(() => {
    if (!open) setMessage('')
  }, [open, ticketId])

  return (
    <Dialog open={open} onClose={onClose} className="relative z-[110]">
      <DialogBackdrop className="fixed inset-0 bg-black/45 backdrop-blur-[2px]" />
      <div className="fixed inset-0 flex items-end justify-center p-4 sm:items-center">
        <DialogPanel className="flex max-h-[min(92dvh,720px)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
          <div className="flex shrink-0 items-start justify-between gap-3 bg-primary-dark px-5 py-4">
            <div className="min-w-0">
              <DialogTitle className="text-lg font-bold text-white">{isLoading ? 'Loading…' : ticket?.subject ?? 'Ticket'}</DialogTitle>
              {ticket?.ticket_number ? <p className="mt-0.5 font-mono text-xs text-white/70">#{ticket.ticket_number}</p> : null}
            </div>
            <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-white/80 hover:bg-white/10" aria-label="Close">
              <X size={20} />
            </button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col">
            {isLoading ? (
              <div className="flex flex-1 justify-center py-16">
                <Spinner />
              </div>
            ) : !ticket ? (
              <p className="p-6 text-center text-sm text-gray-500">Ticket not found.</p>
            ) : (
              <>
                <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4">
                  {(ticket.messages as { id: string; author_name: string; is_staff: boolean; body: string; created_at: string }[] | undefined)?.map(
                    (msg) => (
                      <div key={msg.id} className={cn('flex gap-2', msg.author_name === userName ? 'flex-row-reverse' : '')}>
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-bold">
                          {msg.author_name?.[0]}
                        </div>
                        <div
                          className={cn(
                            'max-w-[min(100%,24rem)] rounded-2xl px-3 py-2',
                            msg.author_name === userName ? 'bg-primary-dark text-white' : 'bg-gray-100 text-gray-800',
                          )}
                        >
                          <p className="text-[10px] font-semibold opacity-70">{msg.is_staff ? 'Staff' : msg.author_name}</p>
                          <p className="text-sm">{msg.body}</p>
                          <p className="mt-1 text-[10px] opacity-50">{formatDate(msg.created_at, 'MMM dd, HH:mm')}</p>
                        </div>
                      </div>
                    ),
                  )}
                </div>
                <div className="shrink-0 border-t border-gray-100 px-5 py-4">
                  <div className="flex gap-2">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="input-field h-20 flex-1 resize-none text-sm"
                      placeholder="Reply…"
                    />
                    <button
                      type="button"
                      onClick={() => replyMutation.mutate()}
                      disabled={!message.trim() || replyMutation.isPending}
                      className="btn-primary shrink-0 self-end px-4 py-2 text-sm"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
