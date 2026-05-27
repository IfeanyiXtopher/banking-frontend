import type { LucideIcon } from 'lucide-react'
import {
  ArrowLeftRight,
  BellRing,
  Globe2,
  Headphones,
  LineChart,
  PiggyBank,
  Receipt,
  Wallet,
} from 'lucide-react'

export type LandingFeature = {
  id: string
  title: string
  description: string
  imageFile: string
  icon: LucideIcon
}

export const LANDING_FEATURES: LandingFeature[] = [
  {
    id: 'transfers',
    title: 'Global transfers',
    description: 'Send domestic and international payments with live rates and clear delivery timelines.',
    imageFile: 'global-transfers.jpg',
    icon: ArrowLeftRight,
  },
  {
    id: 'savings',
    title: 'Smart savings',
    description: 'Set goals, automate deposits, and track progress toward what matters to you.',
    imageFile: 'smart-savings.jpg',
    icon: PiggyBank,
  },
  {
    id: 'loans',
    title: 'Loans & credit',
    description: 'Explore personal, auto, and business lending with a guided digital application.',
    imageFile: 'loans-credit.jpg',
    icon: Wallet,
  },
  {
    id: 'bills',
    title: 'Bill pay',
    description: 'Schedule utilities, rent, and subscriptions — one-off or recurring — from one place.',
    imageFile: 'bill-pay.jpg',
    icon: Receipt,
  },
  {
    id: 'fx',
    title: 'Multi-currency',
    description: 'Hold and convert between currencies with transparent spreads and rate alerts.',
    imageFile: 'multi-currency.jpg',
    icon: Globe2,
  },
  {
    id: 'security',
    title: 'Security & alerts',
    description: 'Biometric sign-in, device checks, and real-time notifications on every transaction.',
    imageFile: 'security-alerts.jpg',
    icon: BellRing,
  },
  {
    id: 'insights',
    title: 'Spending insights',
    description: 'See where money goes with categories, trends, and monthly summaries at a glance.',
    imageFile: 'insights-dashboard.jpg',
    icon: LineChart,
  },
  {
    id: 'support',
    title: '24/7 support',
    description: 'Chat with our team anytime for help with accounts, cards, and transfers.',
    imageFile: 'support.jpg',
    icon: Headphones,
  },
]

export function featureImageUrl(imageFile: string): string {
  return `/images/features/${encodeURIComponent(imageFile)}`
}
