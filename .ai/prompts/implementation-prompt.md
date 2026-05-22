# Implementation Prompt

Use this prompt for implementing features.

## Context Gathering

1. Read `.ai/context/architecture.md` - Understand system structure
2. Read relevant `.ai/context/*.md` files - Get domain context
3. Read existing similar code - Match patterns

## Implementation Steps

### 1. Plan
```
Feature: [description]
Steps:
1. [ ] Step 1
2. [ ] Step 2
3. [ ] Step 3
```

### 2. Database (if needed)
```typescript
// Use PostgreSQL / Drizzle patterns
// NOT sqliteTable - use pgTable
import { pgTable, uuid, varchar, timestamp, boolean, text, jsonb } from 'drizzle-orm/pg-core';

export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  // ...
});
```

### 3. API Route
```typescript
// src/app/api/[resource]/route.ts
export async function GET(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const data = await db.query.resource.findMany({
    where: eq(resource.userId, userId),
  });
  
  return NextResponse.json({ data });
}
```

### 4. Component
```typescript
// Use Server Components by default
// Add 'use client' only when needed
export default async function ResourcePage() {
  const data = await getData();
  return <ResourceList data={data} />;
}
```

### 5. Validate
```typescript
import { z } from 'zod/v4';
const schema = z.object({ ... });
const parsed = schema.safeParse(data);
```

## Quality Checklist

- [ ] PostgreSQL schema (not SQLite)
- [ ] Zod validation
- [ ] Auth check on protected routes
- [ ] Error handling
- [ ] TypeScript types
- [ ] `pnpm lint` passes
- [ ] `pnpm typecheck` passes
- [ ] `pnpm build` succeeds

## Remember

- Use `uuid` not `integer` for IDs
- Use `timestamp` not `integer` for dates
- Use `pgTable` not `sqliteTable`
- Use `postgres` package (NOT `neon-http` or `pg`)
- Import pattern: `import postgres from "postgres"`
