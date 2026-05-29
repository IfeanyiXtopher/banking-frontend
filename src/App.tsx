import { BrowserRouter } from 'react-router-dom'
import AppRouter from '@/router/AppRouter'
import TawkToWidget from '@/components/layout/TawkToWidget'
import { LiveChatProvider } from '@/contexts/LiveChatContext'

export default function App() {
  return (
    <BrowserRouter>
      <LiveChatProvider>
        <TawkToWidget />
        <AppRouter />
      </LiveChatProvider>
    </BrowserRouter>
  )
}
