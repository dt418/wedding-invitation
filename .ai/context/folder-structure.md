# Folder Structure Convention

## Overview

The wedding invitation platform follows a **feature-based** folder structure with clear separation of concerns. This document defines the conventions for organizing code.

## Top-Level Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes (login, register)
│   ├── (dashboard)/       # Protected routes (events, analytics)
│   ├── api/               # API Route Handlers
│   ├── invite/            # Public invite pages
│   ├── globals.css        # Global styles + design tokens
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Landing page
├── components/
│   ├── builder/           # Event builder components
│   │   ├── sections/     # Section type components
│   │   └── ...
│   ├── templates/         # Template gallery
│   ├── ui/               # Reusable UI primitives
│   └── ...
└── lib/                   # Utilities and libraries
```

## App Router Conventions

### Route Groups

| Group | Purpose | Auth |
|-------|---------|------|
| `(auth)` | Login, Register pages | Public |
| `(dashboard)` | Event management | Required |
| `/invite/[code]` | Public invite viewing | Public |

### Dynamic Routes

```
/events                        # Event list
/events/[id]                   # Event detail
/events/[id]/edit             # Event editor
/events/[id]/analytics        # Event analytics

/invite/[code]                # Public invite view
/invite/[code]/rsvp           # RSVP submission
```

### API Routes

```
/api/events                    # Event CRUD
/api/events/[id]              # Single event operations
/api/events/[id]/analytics     # Event analytics
/api/invites/[code]           # Invite operations
/api/invites/[code]/rsvp      # RSVP submission
```

## Component Organization

### UI Primitives (`src/components/ui/`)

Reusable, design-system components:

- `button.tsx` - Button variants (primary, secondary, ghost)
- `card.tsx` - Card container
- `badge.tsx` - Status badges
- `section-wrapper.tsx` - Layout wrapper
- `icons.tsx` - Icon exports

### Feature Components (`src/components/[feature]/`)

Feature-specific components organized by domain:

```
components/
├── builder/                  # Event builder
│   ├── sections/            # Section edit components
│   ├── EventForm.tsx
│   └── TemplatePicker.tsx
├── templates/               # Template gallery
│   ├── TemplateCard.tsx
│   └── TemplateGrid.tsx
└── ...
```

### Invite Renderer (`src/components/invite-renderer.tsx`)

Core component for rendering invitations using the registry pattern.

## Database Schema Location

```
src/db/
├── index.ts                 # Drizzle client export
├── schema.ts               # Table definitions
└── seed.ts                 # Demo data seeder
```

## Library Conventions

```
src/lib/
├── auth.ts                  # Authentication utilities
├── validators.ts           # Zod schemas
├── invite-code.ts         # Code generation
├── qr.ts                  # QR generation
├── utils.ts               # Utilities (cn, etc)
└── hooks/
    └── useInView.ts       # Custom hooks
```

## File Naming

| Pattern | Example | Usage |
|---------|---------|-------|
| kebab-case | `invite-renderer.tsx` | Components |
| kebab-case | `my-component.tsx` | Components |
| camelCase | `useAuth.ts` | Hooks |
| kebab-case | `auth-utils.ts` | Utilities |
| snake_case | `user_preferences.ts` | Non-TypeScript |

## Import Conventions

### Use Path Aliases
```typescript
import { db } from "@/db/index";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
```

### Type Imports
```typescript
import type { EventFormData } from "@/lib/validators";
import type { Section } from "@/db/schema";
```

## Component Structure

### Page Components
```typescript
// app/(dashboard)/events/page.tsx
export default async function EventsPage() {
  // Server component - fetch data here
  const events = await getEvents();
  return <EventList events={events} />;
}
```

### Client Components
```typescript
// Mark with 'use client' only when needed
'use client';

import { useState } from 'react';

export function EventForm() {
  // Interactive state here
}
```

## Testing Structure

```
src/
├── __tests__/              # Unit tests
│   ├── lib/
│   └── components/
└── ...
```

## Documentation

- Inline comments for complex logic
- JSDoc for exported functions
- README.md at feature level when complex