# Wedding Invitation Platform - Architecture Overview

## System Purpose

A multi-tenant SaaS platform enabling couples to create, customize, and distribute digital wedding invitations. The system provides:

1. **Template System** - Curated invitation designs with customizable sections
2. **Event Builder** - WYSIWYG customization of invitation content
3. **Guest Management** - Invitation distribution and RSVP tracking
4. **Analytics** - Engagement metrics and attendance insights
5. **AI Generation** - Automated content generation for invitations

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Landing   │  │  Dashboard  │  │  Public Invites     │  │
│  │   Pages     │  │   (Auth)    │  │  (RSVP/Viewing)     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Layer                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Events    │  │  Templates  │  │  RSVP/Aanalytics    │  │
│  │   CRUD      │  │   Browse    │  │    Endpoints        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Users     │  │   Events    │  │  Invites/RSVPs      │  │
│  │  Subscript  │  │  Templates  │  │    Analytics        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Key Architectural Patterns

### 1. Multi-Tenancy Model
- **Per-User**: Each user has isolated events and guests
- **Per-Event**: Events have unique invite codes and RSVP tracking
- **Per-Template**: Templates have variants (color schemes) at the schema level

### 2. Component Registry Pattern
Templates use a registry-based rendering system:
```typescript
const sectionRenderers = {
  hero: HeroSection,
  venue: VenueSection,
  gallery: GallerySection,
  countdown: CountdownSection,
  // ...
};
```

### 3. JSONB Content Model
Flexible content storage using JSONB:
- `contentSchema` - Section content (text, images, layout)
- `animations` - Animation configurations per section
- `metadata` - Event-specific data

### 4. Tiered Access
```
┌────────────────────────────────────────────────────┐
│ Public Routes (No Auth)                           │
│ - /invite/[code] - View invitation, submit RSVP   │
└────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────┐
│ Authenticated Routes (JWT Required)                │
│ - /events - Event management dashboard             │
│ - /events/[id]/edit - Event builder               │
│ - /events/[id]/analytics - Analytics dashboard    │
└────────────────────────────────────────────────────┘
```

## Data Flow

### Invitation Viewing
1. Guest visits `/invite/[code]`
2. Server fetches invite by code
3. Loads event and template data
4. Renders sections using registry pattern
5. Tracks page view in analyticsEvents

### RSVP Submission
1. Guest submits RSVP form
2. Server validates against invite record
3. Updates RSVP table
4. Returns confirmation
5. Triggers analytics event

## Extension Points

### Adding New Section Types
1. Define schema in `src/db/schema.ts` sections table
2. Create component in `src/components/builder/sections/`
3. Register in `InviteRenderer` sectionRenderers map
4. Add field definitions in validators.ts

### Adding New Templates
1. Create template record in database
2. Define section structure and contentSchema
3. Set default color tokens
4. Register any custom components

### Adding New Fields
1. Update Zod schema in validators.ts
2. Add database column via Drizzle migration
3. Update form components
4. Add analytics tracking if needed

## Quality Gates

1. **Lint** - `pnpm lint` passes with no errors
2. **Typecheck** - `pnpm typecheck` passes with no errors
3. **Build** - `pnpm build` completes successfully
4. **Test** - All tests pass (if any exist)

## Security Boundaries

- JWT tokens have 7-day expiry
- HTTP-only cookies prevent XSS token theft
- Users can only access their own events
- Invite codes are cryptographically random (nanoid)
- Rate limiting on RSVP endpoints (future)