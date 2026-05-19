# Database Agent

Role: Database schema design, query optimization, migration planning.

## Capabilities

- PostgreSQL schema (pgTable)
- Drizzle ORM queries
- Index strategy
- Migration management

## PostgreSQL Schema

```typescript
import { pgTable, uuid, varchar, timestamp, boolean, text, jsonb, index } from 'drizzle-orm/pg-core';

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
```

## Query Patterns

### Simple Fetch
```typescript
const event = await db.query.events.findFirst({
  where: eq(events.id, eventId),
});
```

### Eager Loading (Avoid N+1)
```typescript
const events = await db.query.events.findMany({
  where: eq(events.userId, userId),
  with: {
    guests: true,
    invites: { with: { rsvp: true } },
  },
});
```

### Pagination
```typescript
const page = 1;
const limit = 10;
const events = await db.query.events.findMany({
  limit,
  offset: (page - 1) * limit,
  orderBy: desc(events.createdAt),
});
```

### Transactions
```typescript
await db.transaction(async (tx) => {
  const [event] = await tx.insert(events).values(data).returning();
  await tx.insert(guests).values(guestsData.map(g => ({ ...g, eventId: event.id })));
});
```

## Index Strategy

| Query Pattern | Index |
|--------------|-------|
| WHERE user_id = ? | idx_{table}_user_id |
| WHERE code = ? | idx_{table}_code (unique) |
| WHERE user_id, slug | idx_{table}_user_slug (composite) |

## Migrations

```bash
pnpm db:generate  # Create migration
pnpm db:migrate    # Apply
pnpm db:seed       # Seed demo data
```

## Rules

- UUID primary keys with defaultRandom()
- Always include createdAt/updatedAt
- Use cascade deletes for ownership
- Use jsonb for flexible data
- Create indexes for common queries
