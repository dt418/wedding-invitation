# Review Agent Prompt

Use this prompt for code review tasks.

## Review Focus

### Correctness
- Logic is sound
- Edge cases handled
- Error handling present

### Security
- All inputs validated with Zod
- User can only access own data
- No SQL injection (Drizzle handles parameterized queries)
- JWT tokens verified

### Performance
- No N+1 queries (use `with` for eager loading)
- Images use Next.js Image
- Server Components used for data fetching

### Code Quality
- Types correct and complete
- Naming follows conventions (PascalCase components, camelCase functions)
- `import type` for type-only imports
- `cn()` from utils.ts for class composition

## Database Review

### PostgreSQL Patterns
```typescript
// CORRECT - PostgreSQL with Drizzle
import { pgTable, uuid, varchar, timestamp, boolean, text, jsonb } from 'drizzle-orm/pg-core';

export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  createdAt: timestamp('created_at').defaultNow(),
});

// WRONG - SQLite pattern
import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
```

### Query Patterns
```typescript
// Eager loading to avoid N+1
const events = await db.query.events.findMany({
  with: {
    guests: true,
    invites: { with: { rsvp: true } },
  },
});

// Pagination
const page = 1;
const limit = 10;
await db.query.events.findMany({
  limit,
  offset: (page - 1) * limit,
});
```

## Review Output Format

```
## Review Summary

### Issues Found
1. **[severity]** - Description
   - File: `src/path/file.ts:line`
   - Suggestion: How to fix

### Suggestions
- Improvement ideas

### Approvals
- What's done well

### Final Verdict
[ ] Approved
[ ] Request changes
```
