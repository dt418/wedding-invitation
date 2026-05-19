# State Management Rules

## Tiered State Approach

### Tier 1: Server State (Primary)
- User data, events, guests
- Use Server Components + RSC data fetching
- Persisted in PostgreSQL via Drizzle

### Tier 2: URL State (Secondary)
- Filters, pagination, search
- Use `searchParams` in Server Components
- Shareable via URL

### Tier 3: Client State (Zustand - Future)
- Builder UI state
- Form state not persisted
- Local session storage

### Tier 4: Component State (Local)
- Temporary UI state
- useState, useReducer
- Not shared

## Server Components

### Data Fetching Pattern
```typescript
export default async function EventsPage() {
  const userId = await getAuthUserId();
  const events = await db.query.events.findMany({
    where: eq(eventsTable.userId, userId),
    orderBy: desc(eventsTable.createdAt),
  });
  return <EventList events={events} />;
}
```

### Avoid Client Data Fetching
```typescript
// BAD - fetch in useEffect
'use client';
function EventsPage() {
  const [events, setEvents] = useState([]);
  useEffect(() => {
    fetch('/api/events').then(r => r.json()).then(setEvents);
  }, []);
}

// GOOD - server component
export default async function EventsPage() {
  const events = await getEvents();
  return <EventList events={events} />;
}
```

## Zustand Store (Future)

### When to Use
- Complex builder state
- Cross-component state
- Persisted UI preferences

### Store Structure
```typescript
interface BuilderState {
  currentEvent: Event | null;
  sections: Section[];
  colorTokens: ColorTokens;
  activeSection: string | null;
  isDirty: boolean;
  isSaving: boolean;
}
```

## Local State

### When to Use
- Form input state
- Toggle UI elements
- Animation triggers

### Pattern
```typescript
'use client';
const [isOpen, setIsOpen] = useState(false);
const [formData, setFormData] = useState(initialData);
```

## Server Actions

### For Mutations
```typescript
'use server';
export async function createEvent(data: EventFormData) {
  const userId = await getAuthUserId();
  await db.insert(eventsTable).values({ ...data, userId });
  revalidatePath('/events');
}
```

## Anti-Patterns

1. **No prop drilling** - Use context or Zustand
2. **No fetch in useEffect** - Use Server Components
3. **No duplicate state** - Single source of truth
4. **No blocking renders** - Async state with Suspense
