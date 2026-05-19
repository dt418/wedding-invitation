# Database Rules

## Connection Pattern

**DRIVER**: `postgres-js` (NOT `pg` or `neon`).

```typescript
// src/db/index.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;
const queryClient = postgres(connectionString, { max: 1 });
export const db = drizzle(queryClient, { schema });
```

### Import Pattern
```typescript
// CORRECT - PostgreSQL with postgres-js
import { pgTable, uuid, varchar, timestamp, boolean, text, jsonb, index } from 'drizzle-orm/pg-core';
import { eq, desc, and } from 'drizzle-orm';

// WRONG - SQLite (do not use)
import { sqliteTable, integer } from 'drizzle-orm/sqlite-core';
```

### Other Drivers (Available but NOT used)
```typescript
// Neon serverless - use drizzle-orm/neon-http + @neondatabase/serverless
// pg driver - use drizzle-orm/node-postgres + pg
// Project uses postgres-js - don't change unless specified
```

### Schema Definition
```typescript
import { pgTable, uuid, varchar, timestamp, boolean, text, jsonb, index } from 'drizzle-orm/pg-core';

export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull(),
  isPublished: boolean('is_published').default(false),
  metadata: jsonb('metadata').$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  idxEventsUserSlug: index('idx_events_user_slug').on(table.userId, table.slug),
}));
```

## Query Pattern
```typescript
// Fetch single
const event = await db.query.events.findFirst({
  where: eq(events.id, id),
});

// Fetch many with pagination
const events = await db.query.events.findMany({
  where: eq(events.userId, userId),
  orderBy: desc(events.createdAt),
  limit: 10,
  offset: page * 10,
});

// Eager loading to avoid N+1
const events = await db.query.events.findMany({
  with: {
    guests: true,
    invites: { with: { rsvp: true } },
  },
});
```

## Insert Pattern
```typescript
const [newEvent] = await db.insert(events).values(data).returning();
```

## Update Pattern
```typescript
await db.update(events)
  .set({ title: newTitle, updatedAt: new Date() })
  .where(eq(events.id, id));
```

## Delete Pattern
```typescript
await db.delete(events).where(eq(events.id, id));
```

## Transactions
```typescript
const result = await db.transaction(async (tx) => {
  const [event] = await tx.insert(events).values(data).returning();
  await tx.insert(guests).values(guestsData.map(g => ({ ...g, eventId: event.id })));
  return event;
});
```

## Schema Rules

### Primary Keys
- Use `uuid` with `defaultRandom()` (not auto-increment integers)

### Timestamps
- Always include `createdAt` and `updatedAt`
- Use `.defaultNow()` for createdAt

### Relations
- Use `references()` for FK
- Add `onDelete: 'cascade'` for ownership

### JSONB Usage
```typescript
metadata: jsonb('metadata').$type<MetadataType>(),
// Access: event.metadata.fieldName
```

## Index Strategy
```typescript
// Single column
export const idxUsersEmail = index('idx_users_email').on(users.email);

// Composite for multi-column WHERE
export const idxEventsUserSlug = index('idx_events_user_slug').on(events.userId, events.slug);
```

## Migrations

### Create Migration
```bash
pnpm db:generate  # Generate migration from schema
pnpm db:migrate   # Apply migration
```

### Rules
1. Never modify existing migration files
2. Test migrations on local database
3. Backup production data before migrations
