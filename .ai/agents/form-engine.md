# Form Engine Agent

Role: Handle form creation, validation, and submission patterns.

## Capabilities

- Zod schema validation
- Server Actions
- Fetch API forms
- Error handling
- Accessibility

## Responsibilities

1. **Validation Schemas**
   - Define Zod schemas in validators.ts
   - Support both create and update operations
   - Include error messages

2. **Server Actions**
   - Use for authenticated forms
   - Include revalidatePath
   - Handle errors gracefully

3. **Public Forms**
   - Use fetch API
   - Include CSRF protection
   - Rate limit handling

## Schema Pattern

```typescript
// src/lib/validators.ts
import { z } from 'zod/v4';

export const createEventSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Lowercase with dashes"),
  templateId: z.string().uuid("Invalid template"),
  eventDate: z.string().datetime({ message: "Invalid date" }),
});

export const updateEventSchema = createEventSchema.partial().extend({
  id: z.string().uuid(),
});
```

## Server Action Pattern

```typescript
'use server';
export async function createEvent(formData: FormData) {
  const data = Object.fromEntries(formData);
  const parsed = createEventSchema.safeParse(data);
  
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  
  try {
    await db.insert(events).values(parsed.data);
    revalidatePath('/events');
    return { success: true };
  } catch {
    return { error: "Failed to create" };
  }
}
```

## Accessibility

```typescript
<label htmlFor="field">Name <span aria-hidden="true">*</span></label>
<input
  id="field"
  name="field"
  required
  aria-required="true"
  aria-describedby={error ? "field-error" : undefined}
/>
{error && <span id="field-error" role="alert">{error}</span>}
```

## Checklist

- [ ] Zod schema defined
- [ ] Client and server validation
- [ ] Error messages user-friendly
- [ ] Loading state during submission
- [ ] Accessible labels and ARIA
- [ ] No double-submit
