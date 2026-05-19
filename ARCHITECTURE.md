# Architecture

> **Core invariant:** `Invitation Engine + Theme System + JSON Schema Content + Dynamic Section Renderer = Unlimited Templates`. Templates are schema-driven, not hardcoded pages.

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                     Client Browser                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │ Landing page │  │  Dashboard  │  │ Public invite   │ │
│  │ (RSC, SSR)   │  │  (RSC+CSR) │  │ (RSC+CSR)       │ │
│  └─────────────┘  └─────────────┘  └─────────────────┘ │
└──────────────┬─────────────────┬───────────────────────┘
               │                 │
          ┌────▼────┐      ┌────▼────┐
          │ Middleware│      │ Route   │
          │ /proxy   │      │ Handlers│
          └────┬────┘      └────┬────┘
               │                 │
          ┌────▼─────────────────▼────┐
          │      Next.js App Router    │
          │  Server Components + Actions │
          └────────────┬────────────────┘
                       │
          ┌────────────▼────────────┐
          │       API Routes        │
          │  /api/events, /invites, │
          │  /templates             │
          └────────────┬────────────┘
                       │
          ┌────────────▼────────────┐
          │    Business Logic       │
          │  Auth, Validation,      │
          │  Analytics Tracking    │
          └────────────┬────────────┘
                       │
          ┌────────────▼────────────┐
          │      Drizzle ORM         │
          │    + postgres driver     │
          └────────────┬────────────┘
                       │
          ┌────────────▼────────────┐
          │    PostgreSQL           │
          │  (Neon / Docker Local)  │
          └─────────────────────────┘
```

## Route Structure

### Public Routes

| Route | Type | Auth | Description |
|---|---|---|---|
| `/` | RSC | None | Marketing landing page (client component) |
| `/invite/[code]` | RSC | None (public) | Public invitation + RSVP |
| `/login` | RSC | Redirects auth | Login page |
| `/register` | RSC | Redirects auth | Registration page |

### Protected Routes (via `src/proxy.ts`)

| Route | Type | Description |
|---|---|---|
| `/events` | RSC + CSR | Event list dashboard |
| `/events/[id]` | RSC + CSR | Event detail |
| `/events/[id]/edit` | CSR | Section editor + preview |
| `/events/[id]/analytics` | RSC + CSR | Analytics dashboard |
| `/events/[id]/guests` | RSC + CSR | Guest management |
| `/events/[id]/invites` | RSC + CSR | Invite generation |
| `/templates` | RSC + CSR | Template gallery |
| `/settings` | RSC + CSR | User settings |

### API Routes

| Route | Method | Auth | Description |
|---|---|---|---|
| `/api/templates` | GET | None | List active templates with variants |
| `/api/events` | GET/POST | JWT cookie | List/create events |
| `/api/events/[id]` | GET/PATCH/DELETE | JWT cookie | Event CRUD |
| `/api/events/[id]/sections` | GET/PATCH | JWT cookie | Get/patch section overrides |
| `/api/events/[id]/analytics` | GET | JWT cookie | Event analytics |
| `/api/events/[id]/guests/import` | POST | JWT cookie | Bulk guest import |
| `/api/invites/[code]` | GET | Public | Load invite + sections + variant |
| `/api/invites/[code]/rsvp` | POST | Public | Submit RSVP |

## Server / Client Boundaries

### Server Components (RSC)
- All page files in `src/app/` (except client pages)
- API route handlers (`src/app/api/`)
- Server actions (`src/app/(auth)/actions.ts`)
- DB queries in loaders

### Client Components
- `src/app/page.tsx` (landing page — `use client`)
- `src/app/invite/[code]/page.tsx` (public invite page)
- `src/components/invite-renderer.tsx` (dynamic section renderer)
- `src/components/rsvp-form.tsx` (RSVP submission form)
- `src/components/builder/*` (preview, section list)
- Dashboard pages that use `useState`/`useEffect`

### Server Actions
- `src/app/(auth)/actions.ts`: `registerAction`, `loginAction`, `logoutAction`
- Used for form submissions in auth pages

## Data Flow

### Invitation Rendering Flow

```
Guest visits /invite/[code]
    │
    ├─ Server page checks invite exists via direct DB query
    │       (avoids unnecessary API call on public route)
    │
    ├─ Server page fetches /api/invites/[code]
    │       ├─ Load invite + guest + event
    │       ├─ Load base sections (by templateId)
    │       ├─ Load template_sections overrides (by eventId)
    │       ├─ Merge: override visibility/customContent/customTheme
    │       ├─ Load template variants, select default
    │       ├─ Log analytics page_view
    │       └─ Update invite status: sent/pending → opened
    │
    └─ Render InviteRenderer (client)
            ├─ Filter sections where visibility === "hidden"
            ├─ For each visible section:
            │     lookup sectionType in sectionRenderers map
            │     render section component with:
            │         section.defaultContent + section.customContent
            │         variant.colorTokens + section.customTheme
            └─ Render RsvpForm below
```

### Section Override System

```
Base section (templates.template_id → sections.template_id)
    └── default_content: schema defaults
    └── content_schema: field definitions
    └── visibility, animations

Event override (events.id → template_sections.event_id)
    └── custom_content: event-specific content
    └── custom_theme: per-section color overrides
    └── visibility: "visible" | "hidden"

Merge rules (applied in /api/invites/[code]):
    - visibility: override OR base
    - custom_content: replace base entirely (deep merge)
    - custom_theme: shallow merge over variant colorTokens
```

## Auth Architecture

- Cookie: `wedding_token` (JWT, 7-day expiry)
- Library: `jsonwebtoken` + `bcryptjs`
- Middleware: `src/proxy.ts` intercepts requests before rendering
- Auth check in each API route via `getUserId(req)` helper

## Key Files

| File | Purpose |
|---|---|
| `src/proxy.ts` | Auth middleware / route guard |
| `src/lib/auth.ts` | JWT sign/verify, password hashing, cookie parse |
| `src/lib/validators.ts` | Zod schemas for all inputs |
| `src/components/invite-renderer.tsx` | Dynamic section renderer |
| `src/components/builder/preview.tsx` | Desktop/mobile preview wrapper |
| `src/app/api/invites/[code]/route.ts` | Section merge + analytics pipeline |
| `src/app/api/invites/[code]/rsvp/route.ts` | RSVP transaction + status update |

## Current Implementation

### What's Working
- JWT cookie auth with proxy middleware
- Server/client component boundary via `use client` directive
- Dynamic section rendering with section type registry
- Event-level content overrides via `template_sections`
- Color variant system via `template_variants.colorTokens`
- RSVP upsert with transaction (edit existing or insert new)
- Analytics event logging on page view and RSVP submit
- Section visibility toggle persisted to `template_sections`

### Technical Debt

1. **Public invite page fetches itself via fetch**: `src/app/invite/[code]/page.tsx` calls `NEXT_PUBLIC_BASE_URL`/`http://localhost:3000/api/invites/${code}` — should use server-side DB query directly for the data it needs instead of a round-trip HTTP call.

2. **Landing page is a 1100+ line client component**: `src/app/page.tsx` is `"use client"` for scroll animations, but much of it could be RSC with progressive enhancement.

3. **No loading.tsx or error.tsx boundaries**: Missing Next.js streaming/suspense fallbacks.

4. **Guest import in single transaction**: The `/api/events/[id]/guests/import` route should be verified for transaction safety.

5. **No optimistic updates for section visibility**: Dashboard edit page fetches full data but uses local state for toggles; on network failure the UI may desync.

## Scalability Notes

- Section renderer uses a plain `Record<sectionType, React.ComponentType>` map — adding new section types requires a code change (no plugin architecture). Consider a registry pattern if templates grow beyond 20 section types.
- JSONB fields are indexed individually (`idx_sections_content_schema`, `idx_template_variants_colors`) — for complex JSON path queries, consider GIN indexes instead of btree.
- `analytics_events` is append-only — no TTL cleanup currently. Partitioning by date or a background cleanup job will be needed at scale.