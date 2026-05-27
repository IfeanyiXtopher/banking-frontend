import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { supportApi } from '@/api/support'
import { Input } from '@/components/forms/Input'
import Spinner from '@/components/ui/Spinner'

const schema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  initial_message: z.string().min(20, 'Please describe your issue in more detail'),
})
type FormData = z.infer<typeof schema>

export default function NewTicketPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { priority: 'MEDIUM' },
  })

  const mutation = useMutation({
    mutationFn: supportApi.createTicket,
    onSuccess: () => {
      toast.success('Support ticket created.')
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
      navigate('/support')
    },
    onError: () => toast.error('Failed to create ticket.'),
  })

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div>
        <button onClick={() => navigate('/support')} className="text-sm text-gray-400 hover:text-gray-600 mb-4">← Back</button>
        <h1 className="text-2xl font-bold text-gray-900">New Support Ticket</h1>
      </div>
      <div className="card">
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
          <Input label="Subject" placeholder="Brief description of your issue" error={errors.subject?.message} {...register('subject')} />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Priority</label>
            <select className="input-field text-sm" {...register('priority')}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea className="input-field resize-none h-28 text-sm" placeholder="Please describe your issue in detail..." {...register('initial_message')} />
            {errors.initial_message && <p className="text-xs text-red-500">{errors.initial_message.message}</p>}
          </div>
          <button type="submit" disabled={mutation.isPending} className="btn-primary w-full flex items-center justify-center gap-2">
            {mutation.isPending && <Spinner size="sm" className="border-white border-t-white/30" />}
            Submit Ticket
          </button>
        </form>
      </div>
    </div>
  )
}
