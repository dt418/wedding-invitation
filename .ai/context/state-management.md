# State Management

## Overview

The platform uses a **tiered state management** approach with React Server Components for data, local state for UI, and a future Zustand store for complex client state.

## Current State Patterns

### 1. Server Component Data Fetching

Primary pattern for all data that exists on the server:

```typescript
// Server Component - fetches and renders
export default async function EventsPage() {
  const userId = await getAuthUserId();
  const events = await db.query.events.findMany({
    where: eq(eventsTable.userId, userId),
  });
  
  return <EventList events={events} />;
}
```

### 2. Local Component State

For UI state that doesn't need persistence:

```typescript
'use client';

export function EventForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialData);
  
  // Local state management
}
```

### 3. Server Actions for Mutations

For form submissions and data modifications:

```typescript
'use server';

export async function createEvent(data: EventFormData) {
  const userId = await getAuthUserId();
  await db.insert(eventsTable).values({
    ...data,
    userId,
  });
  revalidatePath('/events');
}
```

### 4. URL State (Future)

For shareable filter/view states:

```typescript
// Planned: searchParams for filters
export async function EventsPage({ searchParams }) {
  const filter = searchParams.filter || 'all';
}
```

## Planned: Zustand Store Architecture

For complex client state, we'll use Zustand:

### Store Structure

```typescript
// src/store/index.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BuilderState {
  // Event builder state
  currentEvent: Event | null;
  sections: Section[];
  colorTokens: ColorTokens;
  
  // UI state
  activeSection: string | null;
  isDirty: boolean;
  isSaving: boolean;
  
  // Actions
  setEvent: (event: Event) => void;
  updateSection: (id: string, updates: Partial<Section>) => void;
  reorderSections: (from: number, to: number) => void;
  setColors: (tokens: Partial<ColorTokens>) => void;
  save: () => Promise<void>;
}

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set, get) => ({
      currentEvent: null,
      sections: [],
      colorTokens: defaultColors,
      activeSection: null,
      isDirty: false,
      isSaving: false,
      
      setEvent: (event) => set({ 
        currentEvent: event, 
        sections: event.sections,
        colorTokens: event.colorTokens,
        isDirty: false,
      }),
      
      updateSection: (id, updates) => set((state) => ({
        sections: state.sections.map((s) =>
          s.id === id ? { ...s, ...updates } : s
        ),
        isDirty: true,
      })),
      
      reorderSections: (from, to) => set((state) => {
        const next = [...state.sections];
        const [removed] = next.splice(from, 1);
        next.splice(to, 0, removed);
        return { sections: next, isDirty: true };
      }),
      
      setColors: (tokens) => set((state) => ({
        colorTokens: { ...state.colorTokens, ...tokens },
        isDirty: true,
      })),
      
      save: async () => {
        const { currentEvent, sections, colorTokens } = get();
        if (!currentEvent) return;
        
        set({ isSaving: true });
        await updateEvent(currentEvent.id, { sections, colorTokens });
        set({ isSaving: false, isDirty: false });
      },
    }),
    {
      name: 'builder-state',
      partialize: (state) => ({
        currentEvent: state.currentEvent,
      }),
    }
  )
);
```

### Store Usage Pattern

```typescript
// In components
'use client';

import { useBuilderStore } from '@/store';

export function SectionEditor() {
  const { sections, updateSection, activeSection } = useBuilderStore();
  const section = sections.find(s => s.id === activeSection);
  
  if (!section) return null;
  
  return (
    <div>
      <input
        value={section.content.title}
        onChange={(e) => updateSection(section.id, {
          content: { ...section.content, title: e.target.value }
        })}
      />
    </div>
  );
}
```

## State Boundaries

| State Type | Location | Persistence | Sync |
|-----------|----------|--------------|------|
| User data | Server | Database | Real-time |
| Events | Server | Database | Real-time |
| Builder UI | Client | Zustand | Local only |
| Form state | Component | useState | Local only |
| URL params | Server | None | Shareable |

## Anti-Patterns to Avoid

1. **No prop drilling** - Use context or Zustand for shared state
2. **No fetch in effects** - Use Server Components or React Query
3. **No duplicate state** - Single source of truth
4. **No blocking renders** - Async state with Suspense

## Migration Path

```
Current                          → Future
─────────────────────────────────────────────────
Local useState                   → Zustand store
Props for builder state          → Zustand store  
fetch in useEffect               → Server Components
Manual form handling             → React Hook Form + Zod
```

## Type Safety

All state should be typed:

```typescript
interface Event {
  id: string;
  title: string;
  sections: Section[];
  colorTokens: ColorTokens;
}

interface Section {
  id: string;
  type: string;
  content: Record<string, unknown>;
  visible: boolean;
  order: number;
}

interface ColorTokens {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  textMuted: string;
  border: string;
}
```