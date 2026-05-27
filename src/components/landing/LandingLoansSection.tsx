import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import {
  ArrowRight,
  Banknote,
  Building2,
  CalendarRange,
  Car,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Home,
  Landmark,
  Percent,
  ShieldCheck,
  Sparkles,
  Wallet,
} from 'lucide-react'
import { LANDING_LOAN_TYPES } from '@/data/landingLoans'
import type { LoanCatalogType } from '@/lib/loanProductVisuals'
import { cn } from '@/utils/cn'

const LOAN_ICONS: Record<LoanCatalogType, LucideIcon> = {
  PERSONAL: Wallet,
  MORTGAGE: Home,
  AUTO: Car,
  BUSINESS: Building2,
  EDUCATION: GraduationCap,
}

const TRUST_PILLS = [
  { icon: ShieldCheck, label: 'Responsible lending' },
  { icon: Clock3, label: 'Decisions in minutes, not weeks' },
  { icon: Percent, label: 'See rates before you commit' },
] as const

export default function LandingLoansSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -5%' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="loans"
      ref={sectionRef}
      className="relative scroll-mt-20 overflow-hidden bg-gradient-to-b from-white via-surface/40 to-white py-20 sm:py-28"
      aria-labelledby="loans-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(200,240,0,0.12),transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-32 top-1/4 h-72 w-72 rounded-full bg-accent/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-20 h-80 w-80 rounded-full bg-primary-light/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:radial-gradient(rgba(21,42,30,0.08)_1px,transparent_1px)] [background-size:20px_20px]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-dark/10 bg-white/80 px-3 py-1.5 text-xs font-semibold text-primary-dark shadow-sm backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-accent-dark" aria-hidden />
            <span className="uppercase tracking-[0.12em]">Lending suite</span>
          </div>
          <h2 id="loans-heading" className="text-3xl font-bold tracking-tight text-primary-dark sm:text-4xl md:text-[2.5rem]">
            Loans built for real life
          </h2>
          <p className="mt-4 text-pretty text-gray-600 sm:text-lg">
            Five purpose-led products with transparent limits, clear terms, and digital applications — so you borrow
            for the right reason, not just because credit is available.
          </p>

          <ul className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:mt-10 sm:gap-4">
            {TRUST_PILLS.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="inline-flex items-center gap-2 rounded-2xl border border-gray-200/80 bg-white/90 px-4 py-2.5 text-left text-xs font-medium text-primary-dark shadow-sm sm:text-sm"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/25 text-primary-dark">
                  <Icon className="h-4 w-4" aria-hidden strokeWidth={2} />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>

        <ul className="space-y-10 sm:space-y-14">
          {LANDING_LOAN_TYPES.map((loan, index) => {
            const imageRight = index % 2 === 1
            const LoanIcon = LOAN_ICONS[loan.id]
            return (
              <li
                key={loan.id}
                className={cn(
                  'group/card relative overflow-hidden rounded-3xl border border-gray-100/90 bg-white shadow-card',
                  'transition-all duration-500 hover:border-accent/25 hover:shadow-[0_24px_48px_-16px_rgba(21,42,30,0.14)]',
                  visible ? 'animate-feature-card-in opacity-100' : 'translate-y-8 opacity-0',
                )}
                style={visible ? { animationDelay: `${index * 100}ms` } : undefined}
              >
                <div
                  className="absolute left-8 right-8 top-0 z-10 h-1 rounded-b-full bg-gradient-to-r from-accent via-accent-dark to-primary-light opacity-90"
                  aria-hidden
                />
                <article
                  className={cn(
                    'grid md:grid-cols-2 md:items-stretch',
                    imageRight && 'md:[&>div:first-child]:order-2',
                  )}
                >
                  <div className="relative min-h-[220px] overflow-hidden sm:min-h-[300px]">
                    <img
                      src={loan.image}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.1s] ease-out group-hover/card:scale-[1.04]"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/85 via-primary-dark/35 to-primary-dark/10 md:bg-gradient-to-r md:from-primary-dark/88 md:via-primary-dark/45 md:to-transparent" />
                    <div
                      className={cn(
                        'pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent',
                        'group-hover/card:animate-feature-shine',
                      )}
                      aria-hidden
                    />
                    <div className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/95 text-primary-dark shadow-lg ring-1 ring-white/40 backdrop-blur-sm">
                      <LoanIcon className="h-6 w-6" strokeWidth={1.75} aria-hidden />
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 md:bottom-7 md:left-7 md:right-7">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white ring-1 ring-white/30 backdrop-blur-sm">
                        <Landmark className="h-3 w-3 opacity-90" aria-hidden />
                        {loan.name.split(' ')[0]}
                      </span>
                      <h3 className="mt-3 text-xl font-bold leading-tight text-white drop-shadow sm:text-2xl md:text-[1.65rem]">
                        {loan.name}
                      </h3>
                      <p className="mt-2 max-w-md text-sm leading-snug text-white/90">{loan.tagline}</p>
                    </div>
                  </div>

                  <div className="relative flex flex-col justify-center overflow-hidden bg-gradient-to-br from-white via-surface/30 to-accent/[0.04] p-6 sm:p-8 lg:p-10">
                    <span
                      className="pointer-events-none absolute -right-2 top-6 select-none font-display text-7xl font-semibold leading-none text-primary-dark/[0.06] sm:top-8 sm:text-8xl"
                      aria-hidden
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="relative">
                      <p className="text-sm leading-relaxed text-gray-600 sm:text-[15px]">{loan.insight}</p>
                      <div
                        className="my-6 h-px w-full max-w-xs bg-gradient-to-r from-accent/50 via-primary-dark/10 to-transparent"
                        aria-hidden
                      />
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-light">Often used for</p>
                      <ul className="mt-3 space-y-2.5">
                        {loan.bestFor.map((item) => (
                          <li key={item} className="flex items-start gap-2.5 text-sm text-gray-800">
                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/20">
                              <CheckCircle2 className="h-3.5 w-3.5 text-primary-dark" aria-hidden />
                            </span>
                            {item}
                          </li>
                        ))}
                      </ul>

                      <div className="mt-7 flex flex-wrap gap-3">
                        <span className="inline-flex items-center gap-2 rounded-2xl border border-primary-dark/10 bg-white px-3.5 py-2 text-xs font-semibold text-primary-dark shadow-sm">
                          <Banknote className="h-3.5 w-3.5 text-accent-dark" aria-hidden />
                          {loan.amountLabel}
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-2xl border border-primary-dark/10 bg-white px-3.5 py-2 text-xs font-semibold text-primary-dark shadow-sm">
                          <CalendarRange className="h-3.5 w-3.5 text-accent-dark" aria-hidden />
                          {loan.termLabel}
                        </span>
                      </div>

                      <Link
                        to="/auth/signup"
                        className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-primary-dark px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-primary hover:shadow-lg"
                      >
                        Check eligibility
                        <ArrowRight size={16} className="transition-transform group-hover/card:translate-x-0.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              </li>
            )
          })}
        </ul>

        <div
          className={cn(
            'relative mt-14 overflow-hidden rounded-3xl border border-white/10 bg-primary-dark px-6 py-10 text-center text-white shadow-2xl sm:px-12 sm:py-12',
            visible && 'animate-feature-card-in',
          )}
          style={visible ? { animationDelay: '520ms' } : undefined}
        >
          <div
            className="pointer-events-none absolute -right-20 top-0 h-48 w-48 rounded-full bg-accent/20 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -left-16 bottom-0 h-40 w-40 rounded-full bg-primary-light/25 blur-3xl"
            aria-hidden
          />
          <div className="relative mx-auto max-w-xl">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
              <Landmark className="h-6 w-6 text-accent" aria-hidden />
            </div>
            <p className="text-xl font-semibold sm:text-2xl">Already a customer?</p>
            <p className="mx-auto mt-3 text-sm leading-relaxed text-white/75 sm:text-base">
              Sign in to view live rates, start an application, and track approvals from your dashboard.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/auth/signin"
                className="inline-flex min-w-[8.5rem] items-center justify-center rounded-full border border-white/40 bg-white/5 px-6 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/15"
              >
                Sign in
              </Link>
              <Link
                to="/auth/signup"
                className="inline-flex min-w-[8.5rem] items-center justify-center rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-primary-dark shadow-lg transition-colors hover:bg-accent-light"
              >
                Open an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
