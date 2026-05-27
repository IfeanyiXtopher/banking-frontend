export type Testimonial = {
  id: string
  name: string
  imageFile: string
  quote: string
}

/** Customer stories — images live in /public/images/testimonies/ */
export const TESTIMONIALS: Testimonial[] = [
  {
    id: 'alex-peacock',
    name: 'Alex Peacock',
    imageFile: 'Alex Peacock.png',
    quote:
      'SafaPay Bank feels like banking built for real life. I opened my account in minutes and everything just works.',
  },
  {
    id: 'argyri-stefanidou',
    name: 'Argyri Stefanidou',
    imageFile: 'Argyri Stefanidou.png',
    quote:
      'International transfers are straightforward, and I always know the fees upfront. That transparency matters to me.',
  },
  {
    id: 'christina-kalkantzi',
    name: 'Christina Kalkantzi',
    imageFile: 'Christina Kalkantzi.png',
    quote:
      'I use SafaPay for everyday spending and savings goals. The dashboard makes it easy to stay on track.',
  },
  {
    id: 'daniel-al-haidari',
    name: 'Daniel Al Haidari',
    imageFile: 'Daniel Al Haidari.png',
    quote:
      'Our business account setup was smooth, and payments to suppliers are faster than our old bank ever was.',
  },
  {
    id: 'drosoula-tsoutsika',
    name: 'Drosoula Tsoutsika',
    imageFile: 'Drosoula Tsoutsika.png',
    quote:
      'When I had a question about a transfer, support answered quickly and clearly. I felt genuinely looked after.',
  },
  {
    id: 'harry-smith',
    name: 'Harry Smith',
    imageFile: 'Harry Smith.png',
    quote:
      'Clean app, no clutter, and transfers land when they should. Banking finally feels simple again.',
  },
  {
    id: 'maroun-mezraani',
    name: 'Maroun Mezraani',
    imageFile: 'Maroun Mezraani.png',
    quote:
      'Security and alerts give me confidence, especially for larger payments. I trust SafaPay with my daily finances.',
  },
  {
    id: 'noura-mahmoud',
    name: 'Noura Mahmoud',
    imageFile: 'Noura Mahmoud.png',
    quote:
      'The mobile experience is excellent — I manage cards, pay bills, and check balances without calling anyone.',
  },
  {
    id: 'tomo-k',
    name: 'Tomo K',
    imageFile: 'Tomo K.png',
    quote:
      'Paying friends and moving money between accounts is instant. It is the fastest banking app I have used.',
  },
  {
    id: 'yusra-hussain',
    name: 'Yusra Hussain',
    imageFile: 'Yusra Hussain.png',
    quote:
      'No surprise charges on everyday banking. Clear statements and honest pricing — exactly what I wanted.',
  },
]

export function testimonialImageUrl(imageFile: string): string {
  return `/images/testimonies/${encodeURIComponent(imageFile)}`
}
