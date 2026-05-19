# Database Architecture

## Overview

PostgreSQL database with Drizzle ORM for type-safe queries. Supports both serverless (Neon) and traditional PostgreSQL hosting.

## Connection Pattern (postgres-js)

**ACTUAL DRIVER**: The project uses `postgres-js` (not `pg` or `neon`).

```typescript
// src/db/index.ts - ACTUAL PATTERN
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;
const queryClient = postgres(connectionString, { max: 1 });
export const db = drizzle(queryClient, { schema });
```

### Docker Compose Setup
```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: wedding
      POSTGRES_PASSWORD: wedding123
      POSTGRES_DB: wedding_invitation
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

```bash
# Start postgres
docker compose up -d

# DATABASE_URL
# postgresql://wedding:wedding123@localhost:5432/wedding_invitation
```

### Packages Installed
```bash
pnpm add postgres       # Main driver (postgres-js)
pnpm add drizzle-orm    # ORM
pnpm add @neondatabase/serverless  # Neon (available but not used)
pnpm add pg             # pg driver (available but not used)
```

### Other Drivers (Available but NOT used)
```typescript
// Neon serverless (available)
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

// pg driver (available)
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
```

## Schema Pattern - PostgreSQL

**IMPORTANT**: Use Drizzle ORM with `pgTable` (PostgreSQL), NOT `sqliteTable`:

```typescript
// CORRECT - PostgreSQL
import { pgTable, uuid, varchar, timestamp, boolean, text, jsonb, index } from 'drizzle-orm/pg-core';

export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Index for common queries
export const idxEventsUserSlug = index('idx_events_user_slug').on(events.userId, events.slug);
```

### Common Mistakes to Avoid
```typescript
// WRONG - SQLite pattern (do not use)
import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

// WRONG - Auto-increment integer ID (do not use)
id: serial('id').primaryKey();

// CORRECT - UUID
id: uuid('id').primaryKey().defaultRandom();

// CORRECT - Timestamp
createdAt: timestamp('created_at').defaultNow();
```

## Schema Structure

### Entity Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                         users                                │
│  (id, email, passwordHash, name, createdAt, updatedAt)       │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ 1:N
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         events                               │
│  (id, userId, title, slug, templateId, eventDate, ...)      │
└─────────────────────────────────────────────────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            │                 │                 │
            ▼                 ▼                 ▼
      ┌──────────┐     ┌──────────┐     ┌──────────────┐
      │ guests   │     │ invites  │     │templateSecs  │
      └──────────┘     └──────────┘     └──────────────┘
                            │
                            ▼
                      ┌──────────┐
                      │ rsvps    │
                      └──────────┘

┌─────────────────────────────────────────────────────────────┐
│                       templates                             │
│  (id, name, category, thumbnail, contentSchema, ...)        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ templateVariants│
                    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │    sections     │
                    └─────────────────┘
```

## Table Definitions

### users

```typescript
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  idxUsersEmail: index('idx_users_email').on(table.email),
}));

### events

```typescript
export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull(),
  templateId: uuid('template_id').notNull().references(() => templates.id),
  templateVariantId: uuid('template_variant_id'),
  eventDate: timestamp('event_date').notNull(),
  venueName: varchar('venue_name', { length: 255 }),
  venueAddress: text('venue_address'),
  description: text('description'),
  isPublished: boolean('is_published').default(false),
  metadata: jsonb('metadata').$type<EventMetadata>(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  idxEventsUserId: index('idx_events_user_id').on(table.userId),
  idxEventsSlug: index('idx_events_slug').on(table.slug),
}));

### templates

```typescript
export const templates = pgTable('templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  category: varchar('category', { length: 100 }),
  thumbnail: text('thumbnail'),
  contentSchema: jsonb('content_schema').$type<TemplateContentSchema>(),
  defaultColors: jsonb('default_colors').$type<ColorTokens>(),
  isPremium: boolean('is_premium').default(false),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  idxTemplatesCategory: index('idx_templates_category').on(table.category),
  idxTemplatesActive: index('idx_templates_active').on(table.isActive),
}));

### invites

```typescript
export const invites = pgTable('invites', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  guestId: uuid('guest_id').notNull().references(() => guests.id, { onDelete: 'cascade' }),
  inviteCode: varchar('invite_code', { length: 21 }).notNull().unique(),
  status: varchar('status', { length: 50 }).default('pending'),
  sentAt: timestamp('sent_at'),
  viewedAt: timestamp('viewed_at'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  idxInvitesCode: index('idx_invites_code').on(table.inviteCode).unique(),
  idxInvitesEventId: index('idx_invites_event_id').on(table.eventId),
}));

### rsvps

```typescript
export const rsvps = pgTable('rsvps', {
  id: uuid('id').primaryKey().defaultRandom(),
  inviteId: uuid('invite_id').notNull().references(() => invites.id, { onDelete: 'cascade' }).unique(),
  attendance: varchar('attendance', { length: 50 }).notNull(),
  dietaryRestrictions: text('dietary_restrictions'),
  message: text('message'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

## JSONB Usage

### contentSchema Example

```typescript
const templateContentSchema = {
  sections: [
    {
      type: 'hero',
      content: {
        primaryText: 'string',
        secondaryText: 'string',
        imageUrl: 'string',
      },
      required: ['primaryText'],
    },
    // ...
  ],
};
```

### metadata Example

```typescript
const eventMetadata = {
  customCss: 'string',
  customFonts: ['string'],
  analytics: {
    views: 0,
    rsvps: 0,
  },
};
```

## Query Patterns

### Find by ID with Relations

```typescript
const event = await db.query.events.findFirst({
  where: eq(events.id, eventId),
  with: {
    guests: true,
    invites: {
      with: {
        rsvp: true,
      },
    },
  },
});
```

### Pagination

```typescript
const events = await db.query.events.findMany({
  where: eq(events.userId, userId),
  limit: 10,
  offset: page * 10,
  orderBy: desc(events.createdAt),
});
```

### Count with Filters

```typescript
const [count] = await db
  .select({ count: count() })
  .from(rsvps)
  .innerJoin(invites, eq(rsvps.inviteId, invites.id))
  .where(eq(invites.eventId, eventId));
```

## Migrations

```bash
# Generate migration from schema changes
pnpm db:generate

# Apply migrations
pnpm db:migrate

# Seed demo data
pnpm db:seed
```

### Migration Driver Note
When using traditional PostgreSQL (not Neon), update `drizzle.config.ts` to use the pg driver:
```typescript
import { defineConfig } from 'drizzle-kit';
import { Pool } from 'pg';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
});
```

## Index Strategy

| Query Pattern | Index |
|--------------|-------|
| User lookup by email | `idx_users_email` |
| Events by user | `idx_events_user_id` |
| Event by slug | `idx_events_slug` |
| Invite by code | `idx_invites_code` |
| Invites by event | `idx_invites_event_id` |
| Templates by category | `idx_templates_category` |
| Active templates | `idx_templates_active` |

## Transactions

```typescript
const result = await db.transaction(async (tx) => {
  const [event] = await tx.insert(events).values(eventData).returning();
  await tx.insert(guests).values(guestData.map(g => ({ ...g, eventId: event.id })));
  return event;
});
```