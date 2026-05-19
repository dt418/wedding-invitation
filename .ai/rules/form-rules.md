# Form Rules

## Validation with Zod

### Schema Location
All Zod schemas in `src/lib/validators.ts`

### Schema Definition
```typescript
import { z } from "zod"; // Zod v4 - no /v4 suffix needed

export const createEventSchema = z.object({
  title: z.string().min(1).max(255),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  templateId: z.string().uuid(),
  eventDate: z.string().datetime(),
  venueName: z.string().max(255).optional(),
});

export const rsvpSchema = z.object({
  inviteCode: z.string().min(1),
  attendance: z.enum(['attending', 'not_attending', 'maybe']),
  dietaryRestrictions: z.string().max(500).optional(),
  message: z.string().max(1000).optional(),
});
```

## Server Actions (Auth Forms)

### Pattern
```typescript
'use server';
export async function submitForm(formData: FormData) {
  const data = Object.fromEntries(formData);
  const parsed = schema.safeParse(data);
  
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  
  try {
    await db.insert(events).values(parsed.data);
    revalidatePath('/events');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to save' };
  }
}
```

### Client Usage
```typescript
'use client';
import { useFormState } from 'react-dom';

export function EventForm() {
  const [state, formAction] = useFormState(submitForm, null);
  return (
    <form action={formAction}>
      <input name="title" />
      {state?.error && <p className="error">{state.error}</p>}
      <button type="submit">Create</button>
    </form>
  );
}
```

## Fetch API (Public Forms)

### Pattern
```typescript
async function handleSubmit(formData: FormData) {
  setIsSubmitting(true);
  
  const response = await fetch('/api/endpoint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(Object.fromEntries(formData)),
  });
  
  const result = await response.json();
  if (response.ok) {
    setResult({ success: true });
  } else {
    setResult({ error: result.error });
  }
  
  setIsSubmitting(false);
}
```

## Error Handling

### Client Validation
```typescript
const parsed = schema.safeParse(data);
if (!parsed.success) {
  const errors = parsed.error.issues.reduce((acc, issue) => {
    acc[issue.path[0] as string] = issue.message;
    return acc;
  }, {});
  return { errors };
}
```

### Server Validation
```typescript
if (!parsed.success) {
  return NextResponse.json(
    { error: parsed.error.issues[0].message },
    { status: 400 }
  );
}
```

## Accessibility

### Required
```typescript
<div className="form-field">
  <label htmlFor="email">Email <span aria-hidden="true">*</span></label>
  <input
    id="email"
    name="email"
    type="email"
    required
    aria-required="true"
    aria-describedby={error ? 'email-error' : undefined}
  />
  {error && (
    <span id="email-error" className="error" role="alert">
      {error}
    </span>
  )}
</div>
```

## Loading States

### Prevent Double Submit
```typescript
const [isSubmitting, setIsSubmitting] = useState(false);

<button type="submit" disabled={isSubmitting}>
  {isSubmitting ? 'Submitting...' : 'Submit'}
</button>
```

## File Uploads (Future)

### Pattern
```typescript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
await fetch('/api/upload', { method: 'POST', body: formData });
```
