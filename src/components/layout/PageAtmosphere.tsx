/** Soft lime wash at the top of app pages (shared across the customer layout). */
export default function PageAtmosphere() {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[min(28rem,48vh)] bg-[radial-gradient(ellipse_95%_75%_at_50%_-5%,rgba(200,240,0,0.2),transparent_68%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-80 pay-hero-shimmer opacity-95"
        aria-hidden
      />
    </>
  )
}
