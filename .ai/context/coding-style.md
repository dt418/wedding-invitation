# Coding Style Guide

## TypeScript Guidelines

### Imports

```typescript
// Type-only imports
import type { Event, Section } from '@/db/schema';

// Runtime imports
import { useState } from 'react';
import { db } from '@/db';
import { z } from 'zod';

// Named exports preferred
export function component() { }
export const constant = 42;

// Default export only for pages
export default function Page() { }
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `EventCard`, `RsvpForm` |
| Hooks | camelCase, `use` prefix | `useAuth`, `useInView` |
| Functions | camelCase | `createEvent`, `validateForm` |
| Constants | SCREAMING_SNAKE | `MAX_GUESTS`, `DEFAULT_COLORS` |
| Types/Interfaces | PascalCase | `EventFormData`, `ColorTokens` |
| Files | kebab-case | `event-card.tsx`, `use-auth.ts` |
| CSS Classes | kebab-case | `event-card`, `primary-button` |

### Props and State

```typescript
// Prefer interfaces for component props
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

// Destructure props
export function Button({ 
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled = false,
  className = '',
}: ButtonProps) {
  return (
    <button
      className={cn(styles.button, styles[variant], styles[size], className)}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
```

### Async/Await

```typescript
// Always use try/catch for async operations
async function fetchEvent(id: string): Promise<Event | null> {
  try {
    const event = await db.query.events.findFirst({
      where: eq(events.id, id),
    });
    return event || null;
  } catch (error) {
    console.error('Failed to fetch event:', error);
    return null;
  }
}

// Avoid async void - prefer returning
async function submitRsvp(data: RsvpData): Promise<Result> {
  const response = await fetch('/api/rsvp', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.json();
}
```

## React Patterns

### Server vs Client Components

```typescript
// Server Component - default
// src/app/events/page.tsx
export default async function EventsPage() {
  const events = await getEvents();
  return <EventList events={events} />;
}

// Client Component - only when needed
// src/components/event-form.tsx
'use client';

import { useState } from 'react';

export function EventForm() {
  const [isLoading, setIsLoading] = useState(false);
  // Interactive logic here
}
```

### Event Handlers

```typescript
// Named handlers for readability
function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  // Handle submit
}

function handleClick() {
  // Handle click
}

function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
  setValue(e.target.value);
}

// Use in JSX
<form onSubmit={handleSubmit}>
  <button onClick={handleClick}>Click</button>
  <input onChange={handleChange} />
</form>
```

### Conditional Rendering

```typescript
// Ternary for simple conditions
{isLoading ? <Spinner /> : <Content />}

// && for guard clauses
{error && <ErrorMessage error={error} />}

// Early return for complex conditions
if (isLoading) return <Spinner />;
if (error) return <ErrorMessage error={error} />;

return <Content data={data} />;
```

### Lists and Keys

```typescript
// Always use stable keys
{items.map((item) => (
  <EventCard 
    key={item.id}  // Prefer item.id over index
    event={item} 
  />
))}

// Avoid index as key when order might change
{items.map((item, index) => (
  <div key={item.id || index}>  // Fallback only if truly stable
))}
```

## CSS and Styling

### Tailwind Usage

```typescript
// Compose classes with cn()
import { cn } from '@/lib/utils';

<div className={cn(
  'base-class',
  isActive && 'active-class',
  'another-class'
)}>

// Responsive with kebab-case
<div className="flex flex-col md:flex-row gap-4">

// Hover states
<button className="hover:bg-primary-hover">
```

### CSS Variables for Theming

```typescript
// Use CSS variables for dynamic colors
<div style={{
  backgroundColor: colors.background,
  color: colors.text,
  borderColor: colors.border,
}}>

// Define in globals.css
:root {
  --color-primary: #8B5A5A;
}
```

## Error Handling

### Try/Catch Pattern

```typescript
async function operation() {
  try {
    const result = await riskyOperation();
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof KnownError) {
      return { success: false, error: error.message };
    }
    console.error('Unexpected error:', error);
    return { success: false, error: 'Something went wrong' };
  }
}
```

### API Error Responses

```typescript
// Consistent error format
return NextResponse.json(
  { error: 'Descriptive message', code: 'ERROR_CODE' },
  { status: 400 }
);

// For validation errors
return NextResponse.json(
  { error: parsed.error.issues[0].message },
  { status: 400 }
);
```

## Comments

### When to Comment

```typescript
// Explain WHY, not WHAT
// Using Array.from for performance - avoids prototype chain iteration
const ids = Array.from(new Set(items.map(i => i.id)));

// Document non-obvious behavior
// IntersectionObserver threshold of 0.1 prevents early triggers
// on elements partially visible
```

### When NOT to Comment

```typescript
// Don't comment obvious code
// Get user ID
const userId = await getUserId();

// Don't leave commented code
// const old = something; // TODO: remove later
```

## File Organization

### Component File

```typescript
// 1. Imports
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { Event } from '@/db/schema';
import { EventCardHeader } from './event-card-header';
import { EventCardBody } from './event-card-body';

// 2. Types (if not exported)
interface EventCardProps {
  event: Event;
  onEdit?: () => void;
}

// 3. Component
export function EventCard({ event, onEdit }: EventCardProps) {
  // 4. Hooks
  const [isExpanded, setIsExpanded] = useState(false);
  
  // 5. Handlers
  function handleToggle() {
    setIsExpanded(prev => !prev);
  }
  
  // 6. Render
  return (
    <div className={cn('event-card', isExpanded && 'expanded')}>
      <EventCardHeader event={event} onToggle={handleToggle} />
      {isExpanded && <EventCardBody event={event} />}
    </div>
  );
}
```

## Testing Patterns

```typescript
describe('EventCard', () => {
  it('renders event title', () => {
    render(<EventCard event={mockEvent} />);
    expect(screen.getByText(mockEvent.title)).toBeInTheDocument();
  });
  
  it('calls onEdit when edit button clicked', async () => {
    const onEdit = vi.fn();
    render(<EventCard event={mockEvent} onEdit={onEdit} />);
    
    await userEvent.click(screen.getByRole('button', { name: /edit/i }));
    
    expect(onEdit).toHaveBeenCalledOnce();
  });
});
```

## Code Review Checklist

- [ ] Types are correct and complete
- [ ] Error handling is present
- [ ] No commented-out code
- [ ] Imports are organized
- [ ] Naming follows conventions
- [ ] No unnecessary re-renders
- [ ] Accessibility attributes present
- [ ] Tests cover edge cases