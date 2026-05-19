# UI Guidelines

> Visual and interaction design standards for the Wedding Invitation platform — covering design tokens, component patterns, motion, iconography, and accessibility.

## Design Philosophy

Cinematic, luxury, editorial. Inspired by ChungDoi.com — warm romantic palette, elegant serif headings, generous whitespace. Avoid generic SaaS styling, neon, gaming aesthetics, template-spaghetti duplication.

## Design Tokens

### Color Palette (Dashboard / App Shell)

| Token | Value | Usage |
|---|---|---|
| `--background` | `#fdf2f8` | Page background |
| `--foreground` | `#831843` | Body text |
| `--color-primary` | `#db2777` | Buttons, links, focus rings |
| `--color-secondary` | `#f472b6` | Secondary actions |
| `--color-accent` | `#ca8a04` | Highlights, badges |
| `--color-muted` | `#f0edf4` | Card backgrounds |
| `--color-border` | `#fbcfe8` | Borders, dividers |
| `--color-destructive` | `#dc2626` | Error states |

### Typography

| Font | Role | CSS Variable |
|---|---|---|
| Cormorant Infant | Headings (h1–h6) | `--font-sans` → actually `--font-serif` |
| Plus Jakarta Sans | Body, UI | `--font-sans` |
| Great Vibes | Script accents | `.font-script` class |

From `src/app/layout.tsx`: loaded via `next/font/google` and bound to CSS variables.

### Spacing & Layout

- Use Tailwind v4 utility classes throughout (`p-4`, `gap-6`, `max-w-7xl`, etc.)
- No hardcoded pixel values
- Max content width for invitation: `max-w-5xl` (desktop), `max-w-sm mx-auto` (mobile preview)

## Component Patterns

### Button

From `src/components/ui/button.tsx`:

- Variants: `primary`, `secondary`, `ghost`, `outline`, `accent`
- Sizes: `sm`, `md`, `lg`
- Always includes `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-ring]`
- Uses `cn()` for class composition

### Card

In `src/components/ui/card.tsx` (exists in glob).

### Badge

In `src/components/ui/badge.tsx` (exists in glob).

### Section Wrapper

`src/components/ui/section-wrapper.tsx` — consistent section padding/margins for landing page.

### Icons

All icons from `lucide-react` via `src/components/ui/icons.tsx`:

```
Heart, Sparkles, Users, Calendar, MapPin, Mail, Gift, Camera, Music,
ChevronRight, ChevronDown, Check, CheckCircle, Star, Quote, Menu, X,
ArrowRight, Play, Pause, Clock, Globe, Shield, Zap, Palette
```

No emoji used as structural icons. No custom SVG icons added to the codebase unless explicitly requested.

## Motion Guidelines

### Scroll Reveal

CSS class `.reveal` + `.visible` toggled via `IntersectionObserver` (from `src/lib/useInView.ts`):

```css
.reveal {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}
```

### Floating Animations

For hero phone mockup:

```css
.phone-frame { animation: float 4s ease-in-out infinite; }
.floating-card { animation: float-card 5s ease-in-out infinite; }
```

### Motion Safety

All animations wrapped in `prefers-reduced-motion` override:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### Animation Timing Budget

- Micro-interactions (hover, focus): 150–200ms
- Section reveals: 600ms ease (CSS transition)
- Page transitions: 200–300ms
- Never animate layout properties (width, height) — only transform/opacity

## Accessibility

- Focus-visible ring on all interactive elements (`focus-visible:ring-2`)
- No color-only status indicators
- Keyboard navigation for all links/buttons
- Screen reader support via semantic HTML (`<nav>`, `<main>`, `<section>`)
- `prefers-reduced-motion` fallback for all animations
- `aria-label` on icon-only buttons
- Visible focus states at all times

## Hydration & Performance

- `src/app/page.tsx` (landing) is `use client` — most of it could be RSC
- RSVP form and invite renderer are client components by necessity
- `isomorphic-dompurify` used for HTML sanitization in landing page sections
- Images should use `next/image` for automatic optimization
- Fonts loaded via `next/font` (no layout shift)

## Code Quality Rules

- `import type` for type-only imports
- `cn()` from `src/lib/utils.ts` for class composition (never template literals for conditional classes)
- No hardcoded colors — use CSS variables or Tailwind tokens
- No emoji in component markup — use Lucide icons from `src/components/ui/icons.tsx`

## Current Implementation

### Strengths
- Consistent token system via CSS variables
- Motion safety for reduced-motion users
- Lucide icon library with centralized export
- `cn()` utility for consistent class merging

### Gaps

1. **No `loading.tsx` or `error.tsx`**: Missing streaming boundaries for better perceived performance.
2. **Large client landing page**: 1100+ line client component with `use client` — impacts TTI.
3. **No image optimization audit**: Ensure all images use `next/image`.
4. **Missing a11y audit**: Run `pnpm lint` + manual WCAG check on key flows.

## Recommended Incremental Improvements

1. Convert static sections of landing page to RSC, keep only scroll-animated parts as client islands.
2. Add `loading.tsx` and `error.tsx` to all route groups.
3. Audit `next/image` usage across all pages.
4. Add `aria-live` regions for form feedback (errors, success states).
5. Add `role="status"` on RSVP success message for screen reader announcement.