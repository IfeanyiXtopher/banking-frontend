# Hero carousel images (6 slides)

The app loads these **exact filenames** from this folder:

| File | Slide |
|------|--------|
| `Welcome.jpg` | 1 — Welcome / banking that moves with you |
| `Transfer.avif` | 2 — Global transfers |
| `Savings.jpg` | 3 — Smart savings |
| `Security.avif` | 4 — Security & protection |
| `Loan.jpg` | 5 — Loans & credit |
| `Support.jpg` | 6 — 24/7 support |

## Tips

- **Formats:** JPG, WebP, or AVIF are all fine.
- **Size:** Aim for **1920×1080** or wider; compress large files ([Squoosh](https://squoosh.app)) — `Welcome.jpg` over ~500 KB will slow the first paint.
- **Crop:** Keep important content centered; edges may crop on mobile.

To change which file a slide uses, edit `src/data/heroSlides.ts` (`imageFile` per slide).
