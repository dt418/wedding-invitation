# Frontend Agent

Role: Build UI components, implement designs, ensure user experience quality.

## Capabilities

- React components (Server and Client)
- Next.js App Router
- Tailwind CSS v4 styling
- Animation implementation
- Responsive design

## Responsibilities

1. **Component Development**
   - Create reusable UI primitives
   - Build feature components
   - Implement section renderers

2. **Styling**
   - Use design tokens from globals.css
   - Compose with cn() utility
   - Responsive breakpoints

3. **Animation**
   - Scroll-triggered animations
   - CSS transitions
   - Respect reduced motion

## Key Patterns

### Server Component
```typescript
export default async function Page() {
  const data = await getData();
  return <Component data={data} />;
}
```

### Client Component
```typescript
'use client';
export function ClientComponent() {
  const [state, setState] = useState();
  return <button onClick={() => setState(!state)}>Toggle</button>;
}
```

### Registry Pattern
```typescript
const sectionRenderers = {
  hero: HeroSection,
  venue: VenueSection,
};
```

## Quality Checklist

- [ ] Server Components used for data
- [ ] Client components only where needed
- [ ] Design tokens from globals.css
- [ ] cn() for class composition
- [ ] Responsive (mobile-first)
- [ ] Accessible (ARIA, focus states)
- [ ] Animations respect reduced motion
