# Design System

## Color Palette

The primary palette is **dark green with a lime accent**, derived from the original design mockups. All colors are defined as Tailwind CSS design tokens in `tailwind.config.js`.

### Brand Colors

| Token | Hex | Usage |
|---|---|---|
| `primary-dark` (default) | `#0D2818` | Sidebar background, hero sections |
| `primary-dark-800` | `#1A3D28` | Sidebar hover states, card backgrounds |
| `primary-dark-700` | `#254D34` | Secondary backgrounds |
| `accent` (default) | `#A3E635` | Active nav items, primary buttons, highlights |
| `accent-400` | `#BEF264` | Button hover states |
| `accent-600` | `#84CC16` | Focus rings, darker accents |

### Semantic Colors (Standard Tailwind)

| Purpose | Token |
|---|---|
| Success | `green-500` |
| Error / Danger | `red-500` |
| Warning | `amber-500` |
| Info | `blue-500` |
| Neutral text | `gray-900` / `gray-600` |
| Borders | `gray-200` |
| Page background | `gray-50` |

---

## Typography

**Font Family:** [Inter](https://rsms.me/inter/) — loaded from Google Fonts in `index.html`.

| Token | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| `text-xs` | 12px | — | — | Captions, labels |
| `text-sm` | 14px | — | — | Secondary text, inputs |
| `text-base` | 16px | — | — | Body text |
| `text-lg` | 18px | `font-semibold` | — | Card headings |
| `text-xl` | 20px | `font-bold` | — | Section headers |
| `text-2xl` | 24px | `font-bold` | — | Page titles |
| `text-3xl`+ | 30px+ | `font-bold` | — | Dashboard KPI numbers |

---

## Spacing

Uses Tailwind's default 4px base scale. Key spacing values:

| Token | Value | Usage |
|---|---|---|
| `p-4` | 16px | Card internal padding |
| `p-6` | 24px | Page section padding |
| `gap-4` | 16px | Grid gaps |
| `gap-6` | 24px | Section spacing |
| `mb-8` | 32px | Between major sections |

---

## Layout

### Auth Pages — `SplitAuthLayout`

```
┌──────────────────────────────────────────────────────────┐
│  Left panel (hidden on mobile)  │  Right panel           │
│  bg-primary-dark                │  bg-white              │
│                                 │                        │
│  App logo + tagline             │  Form content          │
│  Decorative illustration        │  centered vertically   │
│  "Trusted by X customers"       │                        │
└──────────────────────────────────────────────────────────┘
```

- Left: `w-1/2 hidden lg:flex`, `bg-primary-dark text-white`
- Right: `w-full lg:w-1/2`, centered form with max-width `sm`

### App Pages — `AppLayout`

```
┌──────────────────────────────────────────────────────────┐
│  Sidebar (fixed, 240px)   │  Main content area           │
│  bg-primary-dark          │  bg-gray-50                  │
│                           │                              │
│  Logo                     │  Header (h-16, white)        │
│  ─────────────────        │  ────────────────────────    │
│  Nav items                │                              │
│  (active = accent bg)     │  <page content>              │
│                           │                              │
│  Bottom: user avatar      │                              │
└──────────────────────────────────────────────────────────┘
```

- Sidebar: `w-60 fixed left-0 top-0 h-full`
- Main: `ml-60 min-h-screen`
- Header: `fixed top-0 right-0 left-60 h-16 bg-white border-b`
- Page content: `pt-16 p-6` (offset for fixed header)

---

## Component Classes

Defined as Tailwind `@layer components` in `src/styles/globals.css`:

### `btn-primary`

```css
.btn-primary {
  @apply bg-accent text-primary-dark font-semibold py-2.5 px-5 rounded-lg
         hover:bg-accent-400 active:scale-95 transition-all duration-150
         focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2
         disabled:opacity-50 disabled:cursor-not-allowed;
}
```

Usage:
```tsx
<button className="btn-primary">Transfer Funds</button>
```

### `input-field`

```css
.input-field {
  @apply block w-full px-3.5 py-2.5 border border-gray-200 rounded-lg
         bg-white text-gray-900 text-sm
         placeholder:text-gray-400
         focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
         disabled:bg-gray-50 disabled:text-gray-500;
}
```

### `card`

```css
.card {
  @apply bg-white rounded-xl border border-gray-100 shadow-card p-6;
}
```

### `badge`

```css
.badge {
  @apply inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full
         text-xs font-medium;
}
```

Status-colored badges (compose with `badge`):
```tsx
<span className="badge bg-green-100 text-green-700">Completed</span>
<span className="badge bg-red-100 text-red-700">Failed</span>
<span className="badge bg-amber-100 text-amber-700">Pending</span>
<span className="badge bg-blue-100 text-blue-700">Processing</span>
```

---

## Icons

Using [Lucide React](https://lucide.dev/):

```tsx
import { ArrowUpRight, ArrowDownLeft, Wallet, CreditCard } from "lucide-react";

<ArrowUpRight className="w-5 h-5 text-red-500" />    // outgoing
<ArrowDownLeft className="w-5 h-5 text-green-500" />  // incoming
```

---

## Box Shadows

Custom shadows defined in `tailwind.config.js`:

| Token | Value | Usage |
|---|---|---|
| `shadow-card` | `0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)` | Default cards |
| `shadow-card-hover` | `0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.05)` | Card hover state |
| `shadow-sidebar` | `2px 0 8px rgba(0,0,0,0.15)` | Sidebar right edge |

---

## Border Radius

| Token | Value | Usage |
|---|---|---|
| `rounded-lg` | 8px | Buttons, inputs |
| `rounded-xl` | 12px | Cards |
| `rounded-2xl` | 16px | Large cards, modals |
| `rounded-full` | 9999px | Avatars, badges, pills |
