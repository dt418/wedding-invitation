# Glossary

## Domain Terms

### Event
A wedding or celebration being organized. Contains all details, sections, and customization.

### Template
Pre-designed invitation layout. Defines section structure and default styling.

### Section
A block of content within an invitation (hero, venue, gallery, etc.)

### Invite / Invite Code
A unique link/code sent to a guest. Format: 21-char nanoid (e.g., `abc123xyz`).

### RSVP
Response from a guest indicating attendance status.

### Guest
A person invited to the event. Can have multiple invites across events.

### Template Variant
Color scheme variation of a template.

### Canvas
AI-powered content generation system.

## Technical Terms

### RSC
React Server Component. Server-rendered React component.

### Client Component
Component with 'use client' directive. Runs in browser.

### Server Action
'use server' function that runs on server but called from client.

### Drizzle ORM
TypeScript ORM for PostgreSQL. Provides schema definitions and query builder.

### JSONB
PostgreSQL binary JSON storage. Allows storing structured data without fixed schema.

### Zod
Schema validation library. Used for form validation and API contracts.

### JWT
JSON Web Token. Used for authentication.

### nanoid
URL-safe ID generator. Used for invite codes.

### IntersectionObserver
Browser API for detecting element visibility. Used for scroll animations.

## API Terms

### Route Handler
`src/app/api/*/route.ts` files that handle HTTP requests.

### GET / POST / PATCH / DELETE
HTTP methods for CRUD operations.

### Status Codes
- 200: Success
- 400: Bad Request (validation error)
- 401: Unauthorized (not logged in)
- 403: Forbidden (no permission)
- 404: Not Found
- 500: Internal Server Error

## UI Terms

### Hero Section
Top section of invitation with couple names and main image.

### Countdown
Timer showing days/hours until event.

### Gallery
Photo grid/carousel within invitation.

### RSVP Form
Guest response form with attendance, dietary, message fields.

### Color Tokens
CSS variables for theming (primary, secondary, accent, etc.)

### Preview Mode
Toggle between desktop (1920px) and mobile (375px) views.

## File Naming

| Term | File | Description |
|------|------|-------------|
| cn() | lib/utils.ts | Class name merger (clsx + tailwind-merge) |
| useInView | lib/useInView.ts | IntersectionObserver hook |
| validators | lib/validators.ts | Zod schemas |
| invite-renderer | components/invite-renderer.tsx | Main invite display component |
| rsvp-form | components/rsvp-form.tsx | RSVP input form |

## Common Patterns

### Registry Pattern
Map of component types for dynamic rendering.

### Builder Pattern
UI for creating/editing complex objects (events).

### State Management
- Server Components for data
- Zustand for client state (planned)
- URL params for filters (planned)

## Testing Terms

### Unit Test
Test a single function/component in isolation.

### Integration Test
Test multiple components working together.

### Snapshot Test
Test component renders consistently.

### E2E Test
Test complete user flows in browser.

## Deployment Terms

### Neon
Serverless PostgreSQL provider.

### Turbopack
Next.js bundler (used in dev mode).

### Edge Runtime
Next.js execution on CDN edge nodes.

### ISR
Incremental Static Regeneration. Cached pages updated periodically.
