# Form System

## Overview

Form handling uses **Zod schemas for validation** and a combination of **Server Actions** for authenticated forms and **Fetch API** for public forms (RSVP).

## Validation Schema

### Schema Location

All Zod schemas in `src/lib/validators.ts`:

```typescript
// src/lib/validators.ts
import { z } from 'zod/v4';

// Auth schemas
export const registerSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1, "Name is required").max(255),
});

export const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Event schemas
export const createEventSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  slug: z.string()
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase with dashes only")
    .min(3)
    .max(50),
  templateId: z.string().uuid("Invalid template"),
  eventDate: z.string().datetime({ message: "Invalid date format" }),
  venueName: z.string().max(255).optional(),
  venueAddress: z.string().optional(),
  description: z.string().max(1000).optional(),
});

export const updateEventSchema = createEventSchema.partial().extend({
  id: z.string().uuid(),
});

// Guest schemas
export const addGuestSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.email().optional(),
  phone: z.string().max(50).optional(),
  relation: z.enum(["family", "friend", "colleague", "other"]).optional(),
  tableNumber: z.number().int().positive().optional(),
  plusOne: z.boolean().default(false),
});

export const importGuestsSchema = z.object({
  guests: z.array(addGuestSchema).max(1000),
});

// RSVP schemas
export const rsvpSchema = z.object({
  inviteCode: z.string().min(1),
  attendance: z.enum(["attending", "not_attending", "maybe"]),
  dietaryRestrictions: z.string().max(500).optional(),
  message: z.string().max(1000).optional(),
  guestName: z.string().min(1).max(255).optional(),
});
```

## Server Actions (Auth Forms)

### Pattern

```typescript
// src/app/(auth)/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { registerSchema, loginSchema } from '@/lib/validators';
import { db } from '@/db';
import { users } from '@/db/schema';
import { hashPassword, signToken } from '@/lib/auth';

export async function register(formData: FormData) {
  const data = {
    email: formData.get('email'),
    password: formData.get('password'),
    name: formData.get('name'),
  };
  
  const parsed = registerSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  
  const passwordHash = await hashPassword(parsed.data.password);
  
  try {
    const [user] = await db.insert(users).values({
      email: parsed.data.email,
      passwordHash,
      name: parsed.data.name,
    }).returning();
    
    const token = signToken({ userId: user.id });
    // Set cookie and redirect
    redirect('/events');
  } catch (error) {
    return { error: 'Email already exists' };
  }
}
```

### Usage in Component

```typescript
// src/app/(auth)/register/page.tsx
'use client';

import { useFormState } from 'react-dom';
import { register } from '../actions';

export default function RegisterPage() {
  const [state, formAction] = useFormState(register, null);
  
  return (
    <form action={formAction}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <input name="name" required />
      {state?.error && <p className="error">{state.error}</p>}
      <button type="submit">Register</button>
    </form>
  );
}
```

## Fetch API Forms (Public RSVP)

### Pattern

```typescript
// src/components/rsvp-form.tsx
'use client';

import { useState } from 'react';
import { rsvpSchema } from '@/lib/validators';

export function RsvpForm({ inviteCode }: { inviteCode: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);
  
  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setResult(null);
    
    const data = {
      inviteCode,
      attendance: formData.get('attendance'),
      dietaryRestrictions: formData.get('dietaryRestrictions'),
      message: formData.get('message'),
      guestName: formData.get('guestName'),
    };
    
    const parsed = rsvpSchema.safeParse(data);
    if (!parsed.success) {
      setResult({ error: parsed.error.issues[0].message });
      setIsSubmitting(false);
      return;
    }
    
    try {
      const response = await fetch(`/api/invites/${inviteCode}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      
      const result = await response.json();
      if (response.ok) {
        setResult({ success: true });
      } else {
        setResult({ error: result.error || 'Something went wrong' });
      }
    } catch {
      setResult({ error: 'Network error' });
    }
    
    setIsSubmitting(false);
  }
  
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit(new FormData(e.currentTarget));
    }}>
      {/* Form fields */}
      <select name="attendance" required>
        <option value="attending">Yes, I'll attend</option>
        <option value="not_attending">No, I can't attend</option>
        <option value="maybe">Maybe</option>
      </select>
      
      <textarea name="message" placeholder="Your message" />
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit RSVP'}
      </button>
      
      {result?.error && <p className="error">{result.error}</p>}
      {result?.success && <p className="success">RSVP submitted!</p>}
    </form>
  );
}
```

## Form Field Patterns

### Text Input

```typescript
<div className="form-field">
  <label htmlFor="name">Name</label>
  <input
    id="name"
    name="name"
    type="text"
    required
    minLength={1}
    maxLength={255}
  />
</div>
```

### Select

```typescript
<select name="relation" required>
  <option value="">Select relation</option>
  <option value="family">Family</option>
  <option value="friend">Friend</option>
  <option value="colleague">Colleague</option>
  <option value="other">Other</option>
</select>
```

### Date Input

```typescript
<input
  name="eventDate"
  type="datetime-local"
  required
  min={new Date().toISOString().split('T')[0]}
/>
```

## Error Handling

### Client-Side Validation

```typescript
const parsed = schema.safeParse(data);
if (!parsed.success) {
  const errors = parsed.error.issues.reduce((acc, issue) => {
    const field = issue.path[0] as string;
    acc[field] = issue.message;
    return acc;
  }, {} as Record<string, string>);
  return { errors };
}
```

### Server-Side Validation

```typescript
export async function createEvent(formData: FormData) {
  const data = Object.fromEntries(formData);
  const parsed = createEventSchema.safeParse(data);
  
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }
  // Proceed with valid data
}
```

## Accessibility

- All inputs have associated labels
- Error messages linked via `aria-describedby`
- Focus management on errors
- Required fields marked with `aria-required`

```typescript
<div className="form-field">
  <label htmlFor="email">Email <span aria-hidden="true">*</span></label>
  <input
    id="email"
    name="email"
    type="email"
    required
    aria-required="true"
    aria-describedby={errors?.email ? 'email-error' : undefined}
  />
  {errors?.email && (
    <span id="email-error" className="error" role="alert">
      {errors.email}
    </span>
  )}
</div>
```

## Form Best Practices

1. **Validate on client AND server** - Never trust client
2. **Show loading state** - Prevent double submissions
3. **Clear error messages** - Guide user to fix
4. **Preserve form state** - Don't lose data on error
5. **Use native validation** - `required`, `type`, `pattern`
6. **Test edge cases** - Empty, max length, special characters