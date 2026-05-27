import { TESTIMONIALS, testimonialImageUrl, type Testimonial } from '@/data/testimonials'

function TestimonialCard({ person }: { person: Testimonial }) {
  return (
    <article
      className="mx-3 flex w-[min(100vw-2.5rem,20rem)] shrink-0 flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-card sm:w-[22rem] sm:p-6"
      aria-label={`Review from ${person.name}`}
    >
      <div className="mb-4 flex items-center gap-3">
        <img
          src={testimonialImageUrl(person.imageFile)}
          alt=""
          className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-gray-100"
          loading="lazy"
          decoding="async"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-primary-dark">{person.name}</p>
          <p className="text-xs text-accent-dark" aria-hidden>
            ★★★★★
          </p>
          <span className="sr-only">5 out of 5 stars</span>
        </div>
      </div>
      <blockquote className="text-sm leading-relaxed text-gray-600">&ldquo;{person.quote}&rdquo;</blockquote>
    </article>
  )
}

function TestimonialTrack({ items, idSuffix }: { items: Testimonial[]; idSuffix: string }) {
  return (
    <ul className="flex shrink-0 items-stretch py-1" role="list">
      {items.map((person) => (
        <li key={`${person.id}-${idSuffix}`} className="flex shrink-0">
          <TestimonialCard person={person} />
        </li>
      ))}
    </ul>
  )
}

export default function TestimonialsMarquee() {
  return (
    <section className="py-20" aria-labelledby="testimonials-heading">
      <div className="mx-auto mb-12 max-w-6xl px-4 text-center sm:px-6">
        <h2 id="testimonials-heading" className="text-3xl font-bold text-primary-dark">
          Loved by thousands of customers.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-gray-600">
          Real stories from people who bank with SafaPay every day.
        </p>
      </div>

      <div className="group relative overflow-hidden" aria-label="Customer testimonials" aria-live="off">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-white to-transparent sm:w-20"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-white to-transparent sm:w-20"
          aria-hidden
        />

        <div className="flex w-max animate-testimonial-marquee motion-reduce:animate-none group-hover:[animation-play-state:paused]">
          <TestimonialTrack items={TESTIMONIALS} idSuffix="a" />
          <TestimonialTrack items={TESTIMONIALS} idSuffix="b" />
        </div>
      </div>
    </section>
  )
}
