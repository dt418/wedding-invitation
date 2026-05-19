# Rendering Rules

## Core Pattern

The invite renderer uses a registry-based rendering system:
```typescript
const sectionRenderers: Record<string, Component> = {
  hero: HeroSection,
  venue: VenueSection,
  // ...
};

export function InviteRenderer({ sections, colors }) {
  return sections
    .filter(s => s.visible)
    .sort((a, b) => a.order - b.order)
    .map(section => {
      const Component = sectionRenderers[section.type];
      return Component ? <Component key={section.id} {...section} colors={colors} /> : null;
    });
}
```

## Section Rendering

### Order
1. Filter invisible sections: `.filter(s => s.visible)`
2. Sort by order: `.sort((a, b) => a.order - b.order)`
3. Render each: `.map(section => ...)`

### Color Application
- Extract colors from prop
- Apply via inline style or CSS variable
- Never hardcode color values

```typescript
<section style={{
  backgroundColor: colors.background,
  color: colors.text,
}}>
```

## Preview Modes

### Desktop (1920px default)
```typescript
<div className="invite-desktop">
  <InviteRenderer sections={sections} colors={colors} isPreview="desktop" />
</div>
```

### Mobile (375px default)
```typescript
<div className="invite-mobile" style={{ maxWidth: 375 }}>
  <InviteRenderer sections={sections} colors={colors} isPreview="mobile" />
</div>
```

### Preview Indicators
```typescript
{isPreview && (
  <div className="preview-badge">
    <span>{isPreview} Preview</span>
  </div>
)}
```

## SSR Compliance

### No Browser APIs in Server Components
```typescript
// BAD - uses window
export function ClientOnlyComponent() {
  const [width, setWidth] = useState(0);
  useEffect(() => setWidth(window.innerWidth), []);
}

// GOOD - marked as client
'use client';
export function ClientOnlyComponent() {
  const [width, setWidth] = useState(0);
  useEffect(() => setWidth(window.innerWidth), []);
}
```

## Animation Integration

### Scroll Reveal Pattern
```typescript
<ScrollReveal animation="fade" delay={index * 100}>
  <SectionContent />
</ScrollReveal>
```

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  .animate-on-scroll {
    opacity: 1;
    transform: none;
  }
}
```

## Error States

### Missing Section Type
```typescript
if (!Component) {
  console.warn(`Unknown section type: ${section.type}`);
  return null; // Don't crash, just warn
}
```

### Empty Sections
```typescript
if (!sections?.length) {
  return <div className="invite-empty">No content to display</div>;
}
```

## Performance

### Server-Side Rendering
- Initial HTML rendered on server
- Fast First Contentful Paint
- SEO-friendly

### Client Hydration
- Animations enhance after hydration
- Progressive enhancement
