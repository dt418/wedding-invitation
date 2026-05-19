# ADR-001: PostgreSQL with Drizzle ORM

## Status
Accepted

## Context
We needed to choose a database and ORM for the wedding invitation platform.

Requirements:
- Type-safe database access
- Serverless deployment (Neon Postgres)
- JSON support for flexible content
- Easy migrations
- Good performance

## Decision
We chose **PostgreSQL with Drizzle ORM** and **Neon Postgres** as the database provider.

## Rationale

### PostgreSQL
- Robust, production-ready database
- Native JSONB for flexible content storage
- Excellent performance with proper indexing
- UUID support for distributed IDs

### Drizzle ORM
- Type-safe query builder
- Lightweight (not a full ORM)
- Supports PostgreSQL (not just SQLite)
- Good migration tooling
- TypeScript-first design

### Neon Postgres
- Serverless PostgreSQL
- Scales to zero
- Good DX
- Works well with Drizzle

## Alternatives Considered

### SQLite with Drizzle
- **Rejected**: Not production-ready for multi-user SaaS
- Limited concurrent writes
- No network access without external tools

### Prisma
- **Rejected**: Heavier, slower compilation
- Different query patterns
- Less control over SQL

### Supabase
- **Considered but rejected**: More opinionated
- Want to keep database layer simple

## Consequences

### Positive
- Type-safe queries throughout
- Easy migrations with Drizzle Kit
- JSONB for flexible content
- Good performance

### Negative
- Need to be careful with PostgreSQL-specific syntax
- Connection pooling needed (handled by Neon)
- Migration workflow adds steps

## Implementation Notes

Use `pgTable` from `drizzle-orm/pg-core`:
```typescript
import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';

export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  createdAt: timestamp('created_at').defaultNow(),
});
```

Connection via Neon:
```typescript
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```
