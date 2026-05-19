# Frontend Rules

## Component Architecture

### Use Server Components by Default
- All components are Server Components unless interactivity required
- Add `'use client'` only when:
  - Using hooks (useState, useEffect, etc.)
  - Event handlers (onClick, onChange, etc.)
  - Browser APIs (IntersectionObserver, etc.)
  - State management libraries

### Component Organization
```
components/
├── ui/           # Primitives (button, card, badge)
├── builder/      # Event builder components
├── templates/   # Template gallery components
└── invite-renderer.tsx
```

### Import Rules
- Use path aliases: `@/components/...`, `@/lib/...`, `@/db/...`
- Type-only imports with `import type`
- Named exports for components

## Styling Rules

### Tailwind CSS v4
- Configure via CSS `@theme` in globals.css
- Use design tokens (CSS variables) from globals.css
- Compose classes with `cn()` utility

### Color Tokens
```typescript
// Always use color tokens via props, never hardcode
<div style={{ backgroundColor: colors.primary }}>
```

### Responsive Design
```typescript
// Mobile-first approach
<div className="flex flex-col md:flex-row">
```

## State Management

### Local State
```typescript
'use client';
const [state, setState] = useState(initial);
```

### Future: Zustand Store
- For complex builder state
- Persist user preferences
- Not for server data

## Component Patterns

### Registry Pattern (InviteRenderer)
```typescript
const sectionRenderers = {
  hero: HeroSection,
  venue: VenueSection,
  // ...
};
```

### Props Interface
```typescript
interface ComponentProps {
  content: Record<string, unknown>;
  colors: ColorTokens;
  animation?: AnimationConfig;
  isPreview?: boolean;
}
```

## Animation Rules

### CSS-First Approach
- Use CSS transitions for most animations
- Use IntersectionObserver for scroll-triggered
- Respect `prefers-reduced-motion`

### Allowed Animation Properties
- opacity
- transform (translate, scale, rotate)
- filter (blur, brightness)

### Forbidden
- width, height (use transform: scale)
- margin, padding (use transform)
- layout-triggering properties

## Accessibility

### Required
- Semantic HTML elements
- ARIA attributes when needed
- Keyboard navigation support
- Color contrast 4.5:1 minimum

### Focus States
```css
button:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
```

## Performance

### Client Components
- Mark as `'use client'` only when needed
- Use `React.cache()` for deduplication
- Consider code-splitting large components

### Images
- Use Next.js Image component
- Lazy load below-fold images
- Provide alt text

### Bundle Size
- Tree-shake unused imports
- No unnecessary dependencies
- Code-split by route
