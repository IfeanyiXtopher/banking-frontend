import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { supportApi } from '@/api/support'
import { useAuthStore } from '@/store/authStore'
import Spinner from '@/components/ui/Spinner'
import { formatDate } from '@/utils/format'

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const [message, setMessage] = useState('')

  const { data, isLoading } = useQuery({ queryKey: ['ticket', id], queryFn: () => supportApi.ticketDetail(id!) })
  const ticket = data?.data

  const replyMutation = useMutation({
    mutationFn: () => supportApi.addMessage(id!, { body: message }),
    onSuccess: () => {
      setMessage('')
      queryClient.invalidateQueries({ queryKey: ['ticket', id] })
      toast.success('Message sent.')
    },
  })

  if (isLoading) return <div className="flex justify-center py-20"><Spinner /></div>
  if (!ticket) return <p className="text-gray-400 text-center">Ticket not found.</p>

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/support')} className="text-sm text-gray-400 hover:text-gray-600">← Back</button>
        <h1 className="text-xl font-bold text-gray-900">{ticket.subject}</h1>
      </div>

      <div className="card">
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {ticket.messages?.map((msg: { id: string; author_name: string; is_staff: boolean; body: string; created_at: string }) => (
            <div key={msg.id} className={`flex gap-3 ${msg.author_name === user?.full_name ? 'flex-row-reverse' : ''}`}>
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold flex-shrink-0">
                {msg.author_name?.[0]}
              </div>
              <div className={`max-w-xs rounded-2xl px-4 py-2.5 ${msg.author_name === user?.full_name ? 'bg-primary text-white' : 'bg-gray-100 text-gray-800'}`}>
                <p className="text-xs font-semibold mb-1 opacity-70">{msg.is_staff ? '👨‍💼 Staff' : msg.author_name}</p>
                <p className="text-sm">{msg.body}</p>
                <p className="text-[10px] opacity-50 mt-1">{formatDate(msg.created_at, 'MMM dd, HH:mm')}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="input-field flex-1 resize-none h-16 text-sm"
            placeholder="Type your message..."
          />
          <button
            onClick={() => replyMutation.mutate()}
            disabled={!message.trim() || replyMutation.isPending}
            className="btn-primary px-4 self-end"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
