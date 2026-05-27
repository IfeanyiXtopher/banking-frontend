import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, ExternalLink, HeartPulse, Sparkles } from 'lucide-react'
import {
  ALZANTA_COVERAGE_HIGHLIGHTS,
  ALZANTA_PARTNER,
  ALZANTA_PARTNER_BODY,
  ALZANTA_PARTNER_INTRO,
  ALZANTA_VALUE_PROPS,
} from '@/data/alzantaPartner'
import { cn } from '@/utils/cn'

export default function InsurancePartnerSection() {
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
      { threshold: 0.1, rootMargin: '0px 0px -6%' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="insurance-partner"
      ref={sectionRef}
      className="scroll-mt-20 border-y border-gray-100 bg-gradient-to-b from-white via-surface/50 to-white py-14 sm:py-16"
      aria-labelledby="insurance-partner-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div
          className={cn(
            'overflow-hidden rounded-3xl border border-primary-dark/10 bg-white shadow-[0_20px_50px_-24px_rgba(21,42,30,0.2)]',
            visible ? 'animate-feature-card-in' : 'translate-y-6 opacity-0',
          )}
        >
          <div className="grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <div className="border-b border-gray-100 p-6 sm:p-8 lg:border-b-0 lg:border-r">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-primary-dark">
                <Sparkles className="h-3.5 w-3.5 text-primary-dark" aria-hidden />
                Special partner
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <img
                  src={ALZANTA_PARTNER.logoUrl}
                  alt={ALZANTA_PARTNER.name}
                  className="h-11 w-auto max-w-[min(220px,70vw)] object-contain object-left sm:h-14"
                  width={220}
                  height={56}
                  loading="lazy"
                  decoding="async"
                />
                <div className="min-w-0">
                  <h2 id="insurance-partner-heading" className="sr-only">
                    {ALZANTA_PARTNER.name}
                  </h2>
                  <p className="text-sm font-medium text-primary-light">{ALZANTA_PARTNER.tagline}</p>
                </div>
              </div>

              <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-accent-dark">
                {ALZANTA_PARTNER.yearsLabel} · Est. {ALZANTA_PARTNER.since}
              </p>

              <p className="mt-5 text-sm leading-relaxed text-gray-600 sm:text-[15px]">{ALZANTA_PARTNER_INTRO}</p>
              <p className="mt-4 text-sm leading-relaxed text-gray-600 sm:text-[15px]">{ALZANTA_PARTNER_BODY}</p>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={ALZANTA_PARTNER.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-primary-dark px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary"
                >
                  Visit Alzanta Insurance
                  <ExternalLink className="h-4 w-4" aria-hidden />
                </a>
                <a
                  href={ALZANTA_PARTNER.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-primary-dark/20 bg-white px-5 py-2.5 text-sm font-semibold text-primary-dark transition-colors hover:border-primary-dark/35 hover:bg-surface"
                >
                  Get a quote
                  <ArrowUpRight className="h-4 w-4" aria-hidden />
                </a>
              </div>

              <p className="mt-4 text-[11px] leading-relaxed text-gray-500">
                Insurance is provided by Alzanta Insurance. SafaPay Bank does not underwrite policies; coverage terms,
                eligibility, and claims are subject to Alzanta&apos;s agreements and regulators.
              </p>
            </div>

            <div className="bg-gradient-to-br from-primary-dark via-primary to-primary-light p-6 text-white sm:p-8">
              <div className="flex items-center gap-2 text-accent">
                <HeartPulse className="h-5 w-5" aria-hidden />
                <p className="text-xs font-bold uppercase tracking-[0.16em]">Why it matters for you</p>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-white/85">
                Health and protection cover help ensure a setback does not undo the progress you make with your SafaPay
                accounts, savings, and loans.
              </p>

              <ul className="mt-5 space-y-2.5">
                {ALZANTA_COVERAGE_HIGHLIGHTS.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-white/90">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-6 space-y-3 border-t border-white/15 pt-6">
                {ALZANTA_VALUE_PROPS.map(({ title, detail }) => (
                  <div key={title} className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 backdrop-blur-sm">
                    <p className="text-sm font-semibold text-white">{title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-white/70">{detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
