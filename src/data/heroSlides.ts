export type HeroSlide = {
  id: string
  imageFile: string
  eyebrow: string
  headline: string
  description: string
  ctaLabel: string
  ctaHref: string
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'welcome',
    imageFile: 'Welcome.avif',
    eyebrow: 'SafaPay Bank',
    headline: 'Banking that moves with you.',
    description: 'Open an account, move money, and grow savings — all in one secure place.',
    ctaLabel: 'Open an Account',
    ctaHref: '/auth/signup',
  },
  {
    id: 'transfers',
    imageFile: 'Transfer.avif',
    eyebrow: 'Global transfers',
    headline: 'Send money across borders with confidence.',
    description: 'Live rates, clear fees, and delivery timelines you can plan around.',
    ctaLabel: 'Start transferring',
    ctaHref: '/auth/signup',
  },
  {
    id: 'savings',
    imageFile: 'Savings.avif',
    eyebrow: 'Smart savings',
    headline: 'Turn plans into progress.',
    description: 'Automate deposits, set goals, and watch your balance grow over time.',
    ctaLabel: 'Explore savings',
    ctaHref: '/auth/signup',
  },
  {
    id: 'security',
    imageFile: 'Security.avif',
    eyebrow: 'Security first',
    headline: 'Protected at every step.',
    description: 'Biometric sign-in, device checks, and instant alerts on account activity.',
    ctaLabel: 'Learn more',
    ctaHref: '#features',
  },
  {
    id: 'loans',
    imageFile: 'Loan.avif',
    eyebrow: 'Loans & credit',
    headline: 'Finance life’s big moments.',
    description: 'Personal, auto, and business lending with a guided digital application.',
    ctaLabel: 'View loan options',
    ctaHref: '#loans',
  },
  {
    id: 'support',
    imageFile: 'Support.jpg',
    eyebrow: '24/7 support',
    headline: 'People who pick up when you call.',
    description: 'Chat with our team anytime for help with accounts, payments, and more.',
    ctaLabel: 'Get in touch',
    ctaHref: '#contact',
  },
]

export function heroImageUrl(imageFile: string): string {
  return `/images/hero/${encodeURIComponent(imageFile)}`
}
