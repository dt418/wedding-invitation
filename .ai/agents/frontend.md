# Frontend Agent

Role: Build UI components, implement designs, ensure user experience quality.

## Capabilities

- React components (Server and Client)
- Next.js App Router
- Tailwind CSS v4 styling
- Animation implementation
- Responsive design
- Formwright schema-driven forms

## Responsibilities

1. **Component Development**
   - Create reusable UI primitives
   - Build feature components
   - Implement section renderers
   - Event wizard steps

2. **Styling**
   - Use design tokens from globals.css
   - Compose with cn() utility
   - Responsive breakpoints

3. **Animation**
   - Scroll-triggered animations
   - CSS transitions
   - Respect reduced motion

4. **Forms**
   - Schema-driven with Formwright
   - Use event-wizard-schema from `src/lib/schemas/event-wizard-schema.ts`
   - Validate with Zod v4

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

### Formwright Pattern
```typescript
import { buildForm, field, layout, rule } from 'formwright';
import { eventWizardSchema } from '@/lib/schemas/event-wizard-schema';

const form = buildForm({
  schema: eventWizardSchema,
  children: [
    field('coupleNames', { component: 'Input' }),
    layout('grid', [
      field('groomName'),
      field('brideName'),
    ]),
  ],
});
```

### Wizard Steps
```typescript
// src/components/wizard/
export function StepTemplate() { /* ... */ }
export function StepCoupleInfo() { /* ... */ }
export function StepEventDetails() { /* ... */ }
export function StepMessages() { /* ... */ }
export function StepGallery() { /* ... */ }
export function StepPreview() { /* ... */ }
```

## Quality Checklist

- [ ] Server Components used for data
- [ ] Client components only where needed
- [ ] Design tokens from globals.css
- [ ] cn() for class composition
- [ ] Responsive (mobile-first)
- [ ] Accessible (ARIA, focus states)
- [ ] Animations respect reduced motion
- [ ] Formwright schemas kept in sync
