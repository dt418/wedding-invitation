# ADR-002: Component Registry Pattern for Invitations

## Status
Accepted

## Context
Invitations are composed of modular sections (hero, venue, gallery, countdown, etc.) with dynamic content. We needed a rendering approach that:

- Renders different section types dynamically
- Applies consistent styling via color tokens
- Supports preview modes
- Is extensible for new section types

## Decision
We use a **Component Registry Pattern** with a map-based renderer.

```typescript
const sectionRenderers = {
  hero: HeroSection,
  venue: VenueSection,
  gallery: GallerySection,
  countdown: CountdownSection,
};

export function InviteRenderer({ sections, colors }) {
  return sections
    .filter(s => s.visible)
    .sort((a, b) => a.order - b.order)
    .map(section => {
      const Component = sectionRenderers[section.type];
      return Component 
        ? <Component key={section.id} {...section} colors={colors} />
        : null;
    });
}
```

## Rationale

### Registry Pattern Benefits
1. **O(1) lookup** - Direct map access, no switch statement
2. **Extensible** - Add new sections by registering component
3. **Type-safe** - TypeScript validates renderer map
4. **Testable** - Each section component isolated

### Alternatives Considered

### Switch Statement
```typescript
switch (section.type) {
  case 'hero': return <HeroSection {...} />;
  // ... grows with each section
}
```
- **Rejected**: Violates open-closed principle
- Must modify renderer for each new section

### Polymorphic Component
```typescript
<Renderer type={section.type} {...props} />
```
- **Rejected**: More complex type system
- Harder to maintain props interface

## Consequences

### Positive
- Easy to add new section types
- Clear component mapping
- Consistent rendering pipeline
- Easy to test individual sections

### Negative
- Need to register new sections in multiple places
- Type string coupling (must match exactly)

## Implementation Guidelines

1. Register in `src/components/invite-renderer.tsx`
2. Define content schema in validators
3. Create editor component for builder
4. Add tests for renderer behavior
