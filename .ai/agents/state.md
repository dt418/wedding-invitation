# State Agent

Role: Manage client-side state, implement state management patterns.

## Capabilities

- Zustand store design
- React state patterns
- URL state management
- Persistence

## State Tier Architecture

### Tier 1: Server State (Primary)
```typescript
// Server Component - data fetching
export default async function Page() {
  const data = await db.query.events.findMany();
  return <EventList data={data} />;
}
```

### Tier 2: URL State
```typescript
// searchParams for filters
export default async function EventsPage({ searchParams }) {
  const filter = searchParams.filter || 'all';
  const events = await getEvents(filter);
}
```

### Tier 3: Client State (Zustand)
```typescript
// src/store/builder.ts
import { create } from 'zustand';

interface BuilderState {
  event: Event | null;
  sections: Section[];
  isDirty: boolean;
  setEvent: (event: Event) => void;
  updateSection: (id: string, updates: Partial<Section>) => void;
  save: () => Promise<void>;
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
  event: null,
  sections: [],
  isDirty: false,
  setEvent: (event) => set({ event, sections: event.sections }),
  updateSection: (id, updates) => set((state) => ({
    sections: state.sections.map(s => s.id === id ? { ...s, ...updates } : s),
    isDirty: true,
  })),
  save: async () => {
    const { event, sections } = get();
    if (!event) return;
    await updateEvent(event.id, { sections });
    set({ isDirty: false });
  },
}));
```

### Tier 4: Local State
```typescript
// Simple useState
'use client';
const [isOpen, setIsOpen] = useState(false);
```

## When to Use Each Tier

| Tier | Use For | Persistence |
|------|---------|-------------|
| Server | User data, events | Database |
| URL | Filters, search | Shareable link |
| Zustand | Builder state, UI state | Session/localStorage |
| useState | Form inputs, toggles | Component only |

## Anti-Patterns

- Prop drilling beyond 2 levels
- Fetching in useEffect (use Server Components)
- Duplicate state
- Blocking renders without Suspense
