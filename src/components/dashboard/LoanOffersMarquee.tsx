import { Landmark } from 'lucide-react'
import { Link } from 'react-router-dom'

const LOAN_OFFERS = [
  { id: 'personal', name: 'Personal Loan', rate: '~4.9%', unit: 'APR' },
  { id: 'auto', name: 'Auto Loan', rate: '~3.5%', unit: 'APR' },
  { id: 'home', name: 'Home Mortgage', rate: '~4.2%', unit: 'fixed' },
  { id: 'business', name: 'Business Loan', rate: '~5.9%', unit: 'APR' },
  { id: 'education', name: 'Education Loan', rate: '~4.0%', unit: 'APR' },
  { id: 'consolidation', name: 'Debt Consolidation', rate: '~5.5%', unit: 'APR' },
] as const

function OfferTrack({ offers, idSuffix }: { offers: typeof LOAN_OFFERS; idSuffix: string }) {
  return (
    <ul className="flex shrink-0 items-center gap-1 pr-2 sm:gap-1.5">
      {offers.map((offer) => (
        <li
          key={`${offer.id}-${idSuffix}`}
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 sm:px-3"
        >
          <span className="whitespace-nowrap text-[10px] font-semibold text-white sm:text-xs">{offer.name}</span>
          <span className="h-3 w-px shrink-0 bg-white/25" aria-hidden />
          <span className="whitespace-nowrap text-[10px] tabular-nums sm:text-xs">
            <span className="font-bold text-accent">{offer.rate}</span>
            <span className="ml-1 text-[9px] font-semibold uppercase tracking-wide text-white/60">{offer.unit}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}

export default function LoanOffersMarquee() {
  return (
    <section
      className="overflow-hidden rounded-2xl border border-primary-dark/20 bg-gradient-to-r from-primary-dark via-[#1a3d2e] to-primary-dark text-white shadow-[0_4px_20px_-8px_rgba(21,42,30,0.25)]"
      aria-label="Loan offers"
    >
      <div className="flex items-stretch">
        <div className="hidden shrink-0 items-center gap-2 border-r border-white/10 bg-black/15 px-4 sm:flex">
          <Landmark size={16} className="text-accent" aria-hidden />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/70">Borrowing</p>
            <Link to="/loans" className="text-xs font-semibold text-accent hover:underline">
              View loans →
            </Link>
          </div>
        </div>

        <div className="group relative min-w-0 flex-1 overflow-hidden py-2 sm:py-2.5">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-primary-dark to-transparent sm:w-12" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-primary-dark to-transparent sm:w-12" />

          <div className="flex w-max animate-loan-marquee motion-reduce:animate-none group-hover:[animation-play-state:paused]">
            <OfferTrack offers={LOAN_OFFERS} idSuffix="a" />
            <OfferTrack offers={LOAN_OFFERS} idSuffix="b" />
          </div>
        </div>
      </div>
    </section>
  )
}
