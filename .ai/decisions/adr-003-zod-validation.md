# ADR-003: Zod for Validation

## Status
Accepted

## Context
We needed a validation library that:
- Provides runtime validation with type inference
- Works with both client and server
- Has clear error messages
- Is actively maintained

## Decision
We use **Zod v4** for all validation.

```typescript
import { z } from 'zod/v4';

// Define schema
export const createEventSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Lowercase with dashes"),
  templateId: z.string().uuid("Invalid template"),
  eventDate: z.string().datetime({ message: "Invalid date" }),
});

// Inferred type
type CreateEvent = z.infer<typeof createEventSchema>;

// Usage
const parsed = createEventSchema.safeParse(data);
if (!parsed.success) {
  return { error: parsed.error.issues[0].message };
}
```

## Rationale

### Why Zod
1. **Type inference** - Schema doubles as TypeScript type
2. **Chainable API** - `.min().max().regex()` for readability
3. **Clear errors** - Human-readable error messages
4. **Works everywhere** - Client and server

### Alternatives Considered

### Valibot
- **Considered**: Smaller bundle size
- **Rejected**: Less adoption, fewer resources

### Yup
- **Rejected**: Older API, no type inference from schema
- Less maintained

### Custom Validation
- **Rejected**: Reinventing the wheel
- Harder to maintain, no ecosystem

## Consequences

### Positive
- Single source of truth for validation
- Type inference from schemas
- Consistent error format
- Easy to add new validation rules

### Negative
- Additional dependency
- Need to keep schemas in sync with types

## Implementation Guidelines

1. All schemas in `src/lib/validators.ts`
2. Create and update schemas as separate exports
3. Include user-friendly error messages
4. Validate at API boundary, not just UI
