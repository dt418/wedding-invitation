# Schema Rules

## Design Principles

### 1. UUID Primary Keys
```typescript
id: uuid('id').primaryKey().defaultRandom(),
// NEVER use auto-increment integers
```

### 2. Timestamps
```typescript
createdAt: timestamp('created_at').defaultNow(),
updatedAt: timestamp('updated_at').defaultNow(),
```

### 3. Cascade Deletes
```typescript
userId: uuid('user_id')
  .notNull()
  .references(() => users.id, { onDelete: 'cascade' }),
```

### 4. JSONB for Flexible Data
```typescript
metadata: jsonb('metadata').$type<MetadataType>(),
// Access: row.metadata.field
```

### 5. Composite Indexes
```typescript
export const idxEventsUserSlug = index('idx_events_user_slug')
  .on(events.userId, events.slug);
```

## Table Naming

- Lowercase plural: `users`, `events`, `invites`
- Snake case columns: `user_id`, `created_at`
- Avoid reserved words

## Column Types

| Data | Type |
|------|------|
| Primary key | uuid |
| Email | varchar(255) |
| Short text | varchar(255) |
| Long text | text |
| Boolean | boolean |
| Date/time | timestamp |
| JSON data | jsonb |
| Enum | varchar + check constraint |

## Index Strategy

### When to Index
- Foreign keys (always)
- WHERE clause columns
- ORDER BY columns
- Composite for multi-column filters

### Example
```typescript
// Events by user + status
export const idxEventsUserStatus = index('idx_events_user_status')
  .on(events.userId, events.isPublished);

// Invites by code (unique lookup)
export const idxInvitesCode = index('idx_invites_code')
  .on(invites.inviteCode);
```

## Migration Rules

1. Never modify existing migrations
2. Test locally first
3. Backup production data
4. Use transactions for multi-step
5. Document breaking changes

```typescript
// Good migration
await db.transaction(async (tx) => {
  await tx.execute(sql\`ALTER TABLE events ADD COLUMN new_field varchar(255)\`);
  await tx.execute(sql\`UPDATE events SET new_field = 'default'\`);
});
```

## TypeScript Types

```typescript
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

type Event = InferSelectModel<typeof events>;
type NewEvent = InferInsertModel<typeof events>;
```
