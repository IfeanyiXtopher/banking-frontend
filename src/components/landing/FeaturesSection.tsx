import { useEffect, useRef, useState } from 'react'
import { LANDING_FEATURES, featureImageUrl } from '@/data/landingFeatures'
import { cn } from '@/utils/cn'

const MAIN_FEATURES = LANDING_FEATURES.slice(0, -2)
const LAST_FEATURES = LANDING_FEATURES.slice(-2)

function FeatureCard({
  feature,
  index,
  visible,
  className,
}: {
  feature: (typeof LANDING_FEATURES)[number]
  index: number
  visible: boolean
  className?: string
}) {
  const [imageOk, setImageOk] = useState(true)
  const Icon = feature.icon

  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-card',
        'transition-[transform,box-shadow,border-color] duration-500 ease-out',
        'hover:-translate-y-2 hover:border-accent/35 hover:shadow-[0_20px_40px_-12px_rgba(21,42,30,0.18)]',
        visible ? 'animate-feature-card-in' : 'translate-y-6 opacity-0',
        className,
      )}
      style={{ animationDelay: visible ? `${120 + index * 90}ms` : undefined }}
    >
      <div className="relative h-44 overflow-hidden sm:h-48">
        {imageOk ? (
          <img
            src={featureImageUrl(feature.imageFile)}
            alt=""
            className="h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110 animate-feature-image-drift"
            loading="lazy"
            decoding="async"
            onError={() => setImageOk(false)}
          />
        ) : (
          <div
            className="relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-primary-dark via-primary to-primary-light animate-feature-gradient-shift"
            aria-hidden
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(200,240,0,0.25),transparent_55%)]" />
            <Icon
              className="relative z-10 h-14 w-14 text-accent animate-feature-icon-float"
              strokeWidth={1.5}
            />
          </div>
        )}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary-dark/80 via-primary-dark/25 to-transparent"
          aria-hidden
        />
        <div
          className={cn(
            'pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent',
            'group-hover:animate-feature-shine',
          )}
          aria-hidden
        />
        <div
          className={cn(
            'absolute bottom-3 left-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white/95 text-primary-dark shadow-sm backdrop-blur-sm',
            'transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3',
            visible && 'animate-feature-badge-pop',
          )}
          style={{ animationDelay: visible ? `${220 + index * 90}ms` : undefined }}
        >
          <Icon size={18} strokeWidth={2} aria-hidden />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="text-base font-semibold tracking-tight text-primary-dark transition-colors group-hover:text-primary">
          {feature.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">{feature.description}</p>
      </div>
    </article>
  )
}

export default function FeaturesSection() {
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
      { threshold: 0.1, rootMargin: '0px 0px -8%' },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="features"
      ref={sectionRef}
      className="scroll-mt-20 bg-gradient-to-b from-white via-surface/40 to-white py-20 sm:py-24"
      aria-labelledby="features-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div
          className={cn(
            'mx-auto mb-12 max-w-2xl text-center sm:mb-14',
            visible ? 'animate-feature-header-in' : 'opacity-0',
          )}
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-light">What you get</p>
          <h2 id="features-heading" className="mt-3 text-3xl font-bold text-primary-dark sm:text-4xl">
            Everything you need in one place.
          </h2>
          <p className="mt-4 text-gray-600">
            Accounts, payments, savings, credit, and support — designed for how you bank today.
          </p>
        </div>

        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MAIN_FEATURES.map((feature, index) => (
            <li key={feature.id}>
              <FeatureCard feature={feature} index={index} visible={visible} />
            </li>
          ))}
        </ul>

        <ul className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:mt-6 lg:grid-cols-6 lg:justify-items-stretch">
          {LAST_FEATURES.map((feature, index) => (
            <li
              key={feature.id}
              className={cn(
                'lg:col-span-2',
                index === 0 ? 'lg:col-start-2' : 'lg:col-start-4',
              )}
            >
              <FeatureCard feature={feature} index={MAIN_FEATURES.length + index} visible={visible} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
