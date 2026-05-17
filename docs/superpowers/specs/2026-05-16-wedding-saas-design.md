# Wedding Invitation SaaS Design Spec

Date: 2026-05-16
Project: Wedding Invitation SaaS (ChungDoi-inspired)
Status: Approved for planning phase

## 1) Product Scope (MVP)

Build SaaS platform for digital wedding invitations with dual model:
- Self-serve users (free + premium path)
- Agency/planner users (white-label and client management)

MVP covers:
- Event creation and invitation publishing
- Template-based invitation builder
- Guest import and invite generation
- RSVP collection and tracking
- Basic analytics
- Multi-channel sharing (link, QR, email, social)

Out of scope for MVP:
- Fully custom free-form HTML section editor
- Deep marketing automation flows
- Complex billing lifecycle and invoicing automation

---

## 2) Core Product Decisions (Locked)

### 2.1 Delivery channels
System must support:
- Invite link
- QR code
- Email send
- Social sharing (Zalo, Messenger, similar)

### 2.2 RSVP depth
Use advanced RSVP model:
- Attendance status
- Plus-ones
- Dietary restrictions
- Session selection (for multi-session events)
- Table preference
- Transportation request

Constraint:
- VIP table/zone cannot be self-selected by normal guests.
- VIP assignment only by event owner/planner in dashboard.

### 2.3 Builder preview UX
Use:
- Live split-pane preview as default (edit + instant visual feedback)
- Optional mobile preview toggle

Do not use separate preview tab as primary workflow in MVP.

### 2.4 Template section flexibility
Use controlled flexibility:
- User can add/remove sections from predefined section pool
- Each template defines its allowed section pool
- No free-form custom HTML block in MVP

---

## 3) Architecture

### 3.1 Stack
- Frontend + backend: Next.js 16 App Router
- Database: PostgreSQL
- ORM/migrations: Drizzle ORM + Drizzle Kit
- Runtime validation: Zod (import + API payload validation)

### 3.2 Main surfaces
1. Public invite page
- Route pattern resolves event + invite code
- Shows invitation content and RSVP block

2. Private dashboard (owner/planner)
- Event CRUD
- Template customization
- Guest management/import
- Invite management
- Analytics

3. Agency/white-label surface
- Brand/domain settings
- Client event management

### 3.3 Rendering model
Template runtime flow:
1. Load event
2. Resolve template + variant
3. Load ordered sections
4. Apply event-level overrides
5. Render by section type

Benefits:
- New template/variant without core schema rewrite
- Shared builder interaction model across template families
- Controlled extensibility

---

## 4) Data Model (Current schema direction)

Schema file: `src/db/schema.ts`

Main entities:
- `users`
- `events`
- `templates`
- `template_variants`
- `sections`
- `template_sections`
- `guests`
- `invites`
- `rsvps`
- `user_subscriptions`
- `analytics_events`

### 4.1 Applied DB review fixes (confirmed)
1. Added missing FK/lookup indexes
2. Added JSON/JSONB query indexes where needed
3. Changed event slug uniqueness to per-user scope (`user_id + slug`)
4. Added audit timestamps across tables (`createdAt`, `updatedAt`)
5. Added `analytics_events.visitor_id` index

These fixes are treated as baseline, not optional.

---

## 5) Data Flow Design

### 5.1 Guest import flow (partial success)
1. Upload CSV/XLSX
2. Parse data (PapaParse/SheetJS)
3. Validate row schema (Zod)
4. Normalize values (name/phone/email)
5. Generate invite code + URL per valid guest
6. Bulk insert valid rows
7. Return structured result:
   - success rows
   - failed rows with row number + reason

Rule:
- Import never hard-fails full batch because of partial bad rows.

### 5.2 Invite lifecycle
Status lifecycle:
- `pending -> sent -> opened -> responded`

Track timestamps for transitions (`sentAt`, `openedAt`, `respondedAt` via RSVP record).

### 5.3 RSVP submission flow
1. Guest opens invite URL/code
2. Backend resolves invite and event context
3. Guest submits RSVP payload
4. Upsert one RSVP per invite (`unique inviteId`)
5. Update invite status to `responded`

VIP rule enforced at API layer for restricted seating choices.

---

## 6) API Surface (MVP)

Planned endpoints:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/events`
- `POST /api/events`
- `GET /api/events/:id`
- `PATCH /api/events/:id`
- `POST /api/events/:id/guests/import`
- `GET /api/invites/:inviteCode`
- `POST /api/invites/:inviteCode/rsvp`
- `GET /api/events/:id/analytics`

Cross-cutting rules:
- Tenant isolation by `userId`
- Agency access policy for managed client events
- Public endpoint rate limiting (invite + RSVP)
- Input validation with Zod

---

## 7) Template Catalog Direction

Template strategy inspired by Vietnamese wedding aesthetics.

Primary categories (initial catalog target):
- Traditional
- Nature
- Modern
- Romantic
- Traditional costume
- Luxury
- Minimal
- Typography
- Cute/Chibi

Each template supports color/style variants and shared section interface.

---

## 8) Quality Gates Before Implementation Completion

1. Migration discipline
- Forward-only migrations for production path
- No destructive schema changes without explicit migration step

2. Query checks
- Validate key reads with `EXPLAIN ANALYZE`

3. Seed baseline
- Seed templates, variants, demo event, guest set

4. Smoke flow coverage
- Create event
- Import mixed-validity guest file
- Open invite page
- Submit RSVP
- View analytics counters

---

## 9) Risks and Constraints

1. Channel integration complexity
- Email and social share paths can diverge in capability and reliability.
- Mitigation: keep share-link as universal fallback.

2. Template sprawl
- Too much flexibility can break visual consistency.
- Mitigation: section pool per template (locked decision B).

3. RSVP abuse/spam
- Public endpoints exposed.
- Mitigation: rate limit + basic anti-abuse controls.

4. Seat/VIP logic mismatch
- Guest self-selection could conflict with planner intent.
- Mitigation: explicit restricted zone policy in model and API.

---

## 10) Next Step

After user reviews this spec file:
- Invoke `writing-plans` skill
- Produce detailed implementation plan (phased tasks, acceptance criteria, test strategy)
- Do not start implementation before planning step is completed
