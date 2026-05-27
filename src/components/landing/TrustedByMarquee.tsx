import { TRUSTED_BY_LOGO_FILES, trustedByLogoUrl } from '@/data/trustedByLogos'

function LogoRow({ idSuffix }: { idSuffix: string }) {
  return (
    <ul className="flex shrink-0 items-center gap-10 py-3 sm:gap-16" role="presentation" aria-hidden>
      {TRUSTED_BY_LOGO_FILES.map((file) => (
        <li key={`${idSuffix}-${file}`} className="flex shrink-0">
          <img
            src={trustedByLogoUrl(file)}
            alt=""
            className="h-9 w-auto max-w-[min(8rem,22vw)] object-contain opacity-80 brightness-95 contrast-95 saturate-50 transition duration-300 hover:opacity-100 hover:saturate-100 sm:h-11"
            loading="lazy"
            decoding="async"
          />
        </li>
      ))}
    </ul>
  )
}

export default function TrustedByMarquee() {
  return (
    <section className="border-y border-gray-100 bg-surface py-10 sm:py-12" aria-labelledby="trusted-by-heading">
      <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
        <p id="trusted-by-heading" className="mb-8 text-sm font-medium text-gray-500">
          Trusted by leading companies worldwide
        </p>
      </div>

      <div className="group relative overflow-hidden" aria-label="Partner companies">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-surface to-transparent sm:w-16"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-surface to-transparent sm:w-16"
          aria-hidden
        />

        <div className="flex w-max animate-trusted-by-marquee motion-reduce:animate-none group-hover:[animation-play-state:paused]">
          <LogoRow idSuffix="a" />
          <LogoRow idSuffix="b" />
        </div>
      </div>
    </section>
  )
}
