# Theme System

> The theme system provides a layered, per-instance color and style override pipeline — from template variant defaults down to per-section customizations.

## Layers

```
Layer 1 (base)         Layer 2 (variant)        Layer 3 (event override)
─────────────────       ─────────────────        ──────────────────────────
template               template_variants         template_sections
  .metadata              .color_tokens (JSONB)     .custom_theme (JSONB)
                        per-variant palette
```

Guests see: **Layer 2 merged with Layer 3** (Layer 1 defaults baked into variant unless overridden).

## Color Token Structure

Stored in `template_variants.color_tokens` as JSONB:

```json
{
  "primary": "#C41E3A",
  "secondary": "#E8B4BC",
  "background": "#FFF8F0",
  "accent": "#8B4513",
  "text": "#2C1810",
  "textMuted": "#6B5B4F"
}
```

These tokens are passed to:
- `InviteRenderer` → forwarded to section components
- `RsvpForm` → `backgroundColor`, `color` overrides

## Section Theme Overrides

Per-section theme overrides live in `template_sections.custom_theme`:

```json
{
  "backgroundColor": "#F5F0E8",
  "textColor": "#333333"
}
```

Merged at API layer in `/api/invites/[code]` before being sent to the renderer.

## Theme Application in Code

### Invitation API (`/api/invites/[code]`)

```ts
// Section merge pipeline:
// 1. Load base sections (by templateId)
// 2. Load event overrides (by eventId)
// 3. For each section:
mergedSections = baseSections.map(section => {
  const override = templateSections.find(s => s.sectionType === section.sectionType);
  return {
    ...section,
    customContent: override?.customContent ?? section.defaultContent,
    customTheme: { ...variant.colorTokens, ...override?.customTheme }
  };
});
```

### Invite Renderer

```tsx
// src/components/invite-renderer.tsx
const mergedTokens = { ...variant.colorTokens, ...section.customTheme };
// → applied as inline style to section container
```

### RSVP Form

```tsx
// src/components/rsvp-form.tsx
style={{ backgroundColor: colorTokens?.background || "#FFF8F0" }}
style={{ color: colorTokens?.primary }}
style={{ backgroundColor: colorTokens?.primary || "#C41E3A" }}
```

## Design Tokens in CSS

From `src/app/globals.css`:

```css
:root {
  --background: #fdf2f8;
  --foreground: #831843;
  --color-primary: #db2777;
  --color-secondary: #f472b6;
  --color-accent: #ca8a04;
  --color-muted: #f0edf4;
  --color-border: #fbcfe8;
  --color-ring: #db2777;
  --color-destructive: #dc2626;
}
```

These are the **dashboard design tokens** (not invitation-specific) — used by the builder UI, auth pages, and landing page.

Invitation tokens live in `template_variants.color_tokens` (JSONB) and are fully isolated from the CSS token system.

## Typography

Invitation and landing page fonts (via `next/font/google`):

| Font | Usage | CSS var |
|---|---|---|
| Cormorant Infant | Headings (h1–h6) | `--font-cormorant` |
| Plus Jakarta Sans | Body text | `--font-jakarta` |
| Great Vibes | Script accents | `--font-great-vibes` |

## Current Implementation

### What's Working
- Per-variant color tokens stored in JSONB — swappable per event.
- Per-section theme override via `template_sections.custom_theme`.
- Runtime token injection via inline styles (no SSR flash for color changes).
- Reduced-motion overrides in CSS for accessibility.

### Limitations

1. **No dark mode** — color tokens are single-mode.
2. **No design token validation schema** — color token shape is implicit, not enforced by Zod.
3. **No semantic token abstraction** — tokens are named `primary/secondary` rather than semantic roles like `surface/callToAction`.
4. **Font customization** — fonts are hardcoded per template, not stored as theme data.

## Recommended Incremental Improvements

1. Add Zod schema validating `colorTokens` structure in `src/lib/validators.ts`.
2. Consider semantic token naming (`background`, `headingColor`, `buttonBg`) rather than role-based (`primary`, `secondary`).
3. Store `fontFamily` per template variant for theme-driven typography.
4. Add dark-mode palette as a second JSONB key in `color_tokens`.
5. Add a `theme_presets` table for curated palette sets that can be applied across templates.