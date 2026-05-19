# Database Schema Checklist

## PostgreSQL Rules (CRITICAL)
- [ ] Uses `pgTable` from `drizzle-orm/pg-core` (NOT `sqliteTable`)
- [ ] UUID primary keys with `defaultRandom()`
- [ ] `timestamp` for dates (NOT `integer`)
- [ ] `jsonb` for flexible data

## Table Structure
- [ ] Primary key: `uuid('id').primaryKey().defaultRandom()`
- [ ] `createdAt: timestamp('created_at').defaultNow()`
- [ ] `updatedAt: timestamp('updated_at').defaultNow()`
- [ ] Foreign keys with `references()`
- [ ] `onDelete: 'cascade'` for ownership relationships

## Column Types
```typescript
import { pgTable, uuid, varchar, timestamp, boolean, text, jsonb, index } from 'drizzle-orm/pg-core';

// String columns
email: varchar('email', { length: 255 }).notNull()

// Boolean with default
isPublished: boolean('is_published').default(false)

// JSONB for flexible data
metadata: jsonb('metadata').$type<Record<string, unknown>>()

// Text for long content
description: text('description')
```

## Indexes
- [ ] Index on foreign keys
- [ ] Index on frequently filtered columns
- [ ] Composite index for multi-column WHERE
- [ ] Unique index on code/email fields

```typescript
// Example indexes
, (table) => ({
  idxUsersEmail: index('idx_users_email').on(table.email),
  idxEventsUserSlug: index('idx_events_user_slug').on(table.userId, table.slug),
  idxInvitesCode: index('idx_invites_code').on(table.inviteCode).unique(),
})
```

## Migrations
- [ ] Generated with `pnpm db:generate`
- [ ] Applied with `pnpm db:migrate`
- [ ] Tested on local database
- [ ] No modification of existing migrations

## Common Mistakes to Avoid

```typescript
// WRONG - SQLite
import { sqliteTable, integer } from 'drizzle-orm/sqlite-core';

// WRONG - Auto-increment
id: serial('id').primaryKey();

// WRONG - Unix timestamp
createdAt: integer('created_at')

// CORRECT - PostgreSQL
import { pgTable, uuid, timestamp } from 'drizzle-orm/pg-core';
id: uuid('id').primaryKey().defaultRandom()
createdAt: timestamp('created_at').defaultNow()
```
