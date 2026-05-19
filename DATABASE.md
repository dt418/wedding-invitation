# Database

## Stack

- ORM: `drizzle-orm`
- Migration tool: `drizzle-kit`
- Driver: `postgres` (postgres-js)
- Dialect: PostgreSQL
- Config: `drizzle.config.ts`

## Drizzle Configuration

From `drizzle.config.ts`:

- `schema: "./src/db/schema.ts"`
- `out: "./drizzle"`
- `dialect: "postgresql"`
- `dbCredentials.url: process.env.DATABASE_URL`

## Connection Setup

From `src/db/index.ts`:

```ts
const queryClient = postgres(connectionString, { max: 1 });
const migrationClient = postgres(connectionString, { max: 1 });

export const db = drizzle(queryClient, { schema });
```

Current pool size is conservative (`max: 1`) for serverless compatibility, but can bottleneck concurrent local workloads.

## Schema Overview

### Enums

- `user_role`: `user | agency | admin`
- `subscription_tier`: `free | agency`
- `subscription_status`: `active | cancelled | expired`
- `event_status`: `draft | published | archived`
- `invite_status`: `pending | sent | opened | responded`
- `rsvp_attendance`: `attending | not_attending | maybe`
- `delivery_method`: `email | sms | whatsapp | link`
- `template_category`: `truyen_thong | thien_nhien | hien_dai | lang_man | co_phuc | sang_trong | toi_gian | typography | de_thuong`

### Tables (11)

1. `users`
2. `user_subscriptions`
3. `templates`
4. `template_variants`
5. `sections`
6. `events`
7. `template_sections`
8. `guests`
9. `invites`
10. `rsvps`
11. `analytics_events`

## Domain Model

### Identity & Subscription

- `users`: account, role, agency metadata
- `user_subscriptions`: current tier/features/expiry per user

### Template System

- `templates`: template metadata and category
- `template_variants`: color token variants per template
- `sections`: base section schema + defaults per template

### Event & Invitation Engine

- `events`: event instance chosen from template
- `template_sections`: per-event override layer for section visibility/content/theme
- `guests`: invitees for event
- `invites`: unique invite link + status lifecycle
- `rsvps`: one RSVP per invite (`unique index invite_id`)

### Analytics

- `analytics_events`: page views and RSVP actions with JSON metadata

## Relationships

All major FKs use `ON DELETE CASCADE`.

- `events.user_id -> users.id`
- `events.template_id -> templates.id`
- `template_variants.template_id -> templates.id`
- `sections.template_id -> templates.id`
- `template_sections.event_id -> events.id`
- `guests.event_id -> events.id`
- `invites.event_id -> events.id`
- `invites.guest_id -> guests.id`
- `rsvps.invite_id -> invites.id`
- `user_subscriptions.user_id -> users.id`
- `analytics_events.event_id -> events.id`

## JSONB Strategy

JSONB used for schema-driven flexibility:

- `templates.metadata`
- `template_variants.color_tokens`
- `sections.content_schema`
- `sections.default_content`
- `sections.animations`
- `template_sections.custom_content`
- `template_sections.custom_theme`
- `user_subscriptions.features`
- `analytics_events.metadata`

This enables rapid iteration without migration churn for every content field.

## Indexing Strategy

### Uniques

- `users.email`
- `templates.slug`
- `invites.invite_code`
- `events(user_id, slug)`
- `rsvps(invite_id)`

### Core lookups

- `events.user_id`, `events.template_id`, `events.status`
- `guests.event_id`
- `invites(event_id, guest_id)`, `invites.status`
- `analytics_events(event_id, created_at)`, `analytics_events.action`, `analytics_events.visitor_id`
- `template_sections.event_id`
- `template_variants.template_id`

### Note on JSONB indexes

Migration currently creates btree indexes for some JSONB columns (`templates.metadata`, `sections.content_schema`, `template_variants.color_tokens`). If production workload requires containment/path operations, prefer GIN indexes (`using gin`) on those columns.

## Migration Strategy

Current migration flow:

1. Edit `src/db/schema.ts`
2. Run `pnpm db:generate` (creates SQL in `drizzle/`)
3. Run `pnpm db:migrate` (apply to DB)

Existing baseline migration: `drizzle/0000_steep_mach_iv.sql`.

## Query Patterns in Code

### Auth user lookup

- `db.query.users.findFirst({ where: eq(users.email, ...) })`

### Event list by user

- `db.select().from(events).where(eq(events.userId, userId)).orderBy(desc(events.createdAt))`

### Slug uniqueness guard

- `and(eq(events.userId, userId), eq(events.slug, slug))`

### Template + variants

- templates loaded first, variants loaded via `inArray(templateVariants.templateId, templateIds)` then grouped in memory.

### Section merge pipeline

- Base sections by `templateId`
- Overrides by `eventId`
- Merge by `sectionType`

### RSVP transaction

- `db.transaction(async (tx) => { ... })`
- Upsert behavior: update existing RSVP else insert.

## Current Implementation

### Strengths

- Schema designed for template extensibility.
- Strong uniqueness constraints on critical business keys.
- Explicit status enums prevent invalid state transitions.
- RSVP write path is transactional.
- Analytics events decoupled as append-only records.

### Risks / Debt

1. **Pool config strictness**
   - `max: 1` in `src/db/index.ts` can throttle throughput under load.

2. **Potential N+1 / multiple round-trips**
   - Some handlers fetch parent + related entities in multiple queries.

3. **JSONB index mismatch**
   - btree on JSONB is limited for common JSON operations.

4. **No explicit pagination on list endpoints**
   - Event/template endpoints can grow unbounded.

5. **No explicit row-level security**
   - Access control enforced in app layer only.

## Recommended Incremental Improvements

1. Add cursor pagination for `/api/events` and template list endpoints.
2. Add GIN indexes for JSONB columns used in containment/path filters.
3. Increase connection pooling strategy by runtime environment (local/dev/prod).
4. Add scheduled retention policy for `analytics_events`.
5. Add query helpers/repositories to centralize repeated ownership checks.
