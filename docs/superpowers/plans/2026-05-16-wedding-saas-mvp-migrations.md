# Database Migration Checklist

Reference: `database-migrations` skill — principles applied from policy.

## Core Principles

1. Every change is a migration — never alter production DBs manually
2. Migrations are forward-only in production — rollbacks use new forward migrations
3. Schema and data migrations are separate — never mix DDL + DML in one
4. Test migrations against production-sized data
5. Migrations are immutable once deployed — never edit deployed migrations

---

## Pre-Migration Checklist

- [ ] Migration has both UP and DOWN (or explicitly marked irreversible)
- [ ] No full table locks on large tables — use concurrent operations
- [ ] New columns have defaults or are nullable — never `NOT NULL` without default on existing tables
- [ ] Indexes created with `CONCURRENTLY` on existing tables (not inline with CREATE TABLE)
- [ ] Data backfill is a separate migration from schema change
- [ ] Tested against copy of production data
- [ ] Rollback plan documented

---

## Drizzle ORM Workflow

### Generate migration

```bash
DATABASE_URL=... pnpm drizzle-kit generate
```

### Apply migrations

```bash
DATABASE_URL=... pnpm drizzle-kit migrate
```

### Push schema (dev only, no migration file)

```bash
DATABASE_URL=... pnpm drizzle-kit push
```

---

## Common Patterns

### Adding a column safely

```sql
-- GOOD: Nullable column, no lock
ALTER TABLE users ADD COLUMN avatar_url TEXT;

-- GOOD: Column with default (Postgres 11+ is instant, no rewrite)
ALTER TABLE users ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;

-- BAD: NOT NULL without default on existing table
-- (locks table + rewrites every row — never do this)
```

### Adding an index without downtime

```sql
-- BAD: blocks writes on large tables
CREATE INDEX idx_users_email ON users (email);

-- GOOD: non-blocking, allows concurrent writes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users (email);
-- Note: CONCURRENTLY cannot run inside a transaction block
```

### Renaming a column (zero-downtime)

Use expand-contract pattern:

```sql
-- Step 1: Add new column (migration 001)
ALTER TABLE events ADD COLUMN display_name TEXT;

-- Step 2: Backfill data (migration 002, data migration)
UPDATE events SET display_name = name WHERE display_name IS NULL;

-- Step 3: Update application code to read/write both columns
-- Deploy application changes

-- Step 4: Stop writing to old column, drop it (migration 003)
ALTER TABLE events DROP COLUMN name;
```

### Large data migration

```sql
-- BAD: updates all rows in one transaction (locks table)
UPDATE events SET processed = true;

-- GOOD: batch update with progress
DO $$
DECLARE
  batch_size INT := 10000;
  rows_updated INT;
BEGIN
  LOOP
    UPDATE events
    SET processed = true
    WHERE id IN (
      SELECT id FROM events
      WHERE processed = false
      LIMIT batch_size
      FOR UPDATE SKIP LOCKED
    );
    GET DIAGNOSTICS rows_updated = ROW_COUNT;
    RAISE NOTICE 'Updated % rows', rows_updated;
    EXIT WHEN rows_updated = 0;
    COMMIT;
  END LOOP;
END $$;
```

---

## Anti-Patterns

| Anti-Pattern | Why It Fails | Better Approach |
|---|---|---|
| Manual SQL in production | No audit trail, unrepeatable | Always use migration files |
| Editing deployed migrations | Causes drift between environments | Create new migration instead |
| NOT NULL without default | Locks table, rewrites all rows | Add nullable → backfill → add constraint |
| Inline index on large table | Blocks writes during build | `CREATE INDEX CONCURRENTLY` |
| Schema + data in one migration | Hard to rollback, long transactions | Separate migrations |
| Dropping column before removing code | Application errors on missing column | Remove code first, drop column next deploy |

---

## Zero-Downtime Migration Timeline

```
Phase 1: EXPAND
  Day 1: Migration adds new column (nullable)
  Day 1: Deploy app v2 — writes to both old and new columns

Phase 2: MIGRATE
  Day 2: Run backfill migration for existing rows
  Day 3: Deploy app v3 — reads from new column only

Phase 3: CONTRACT
  Day 7: Migration drops old column
```

---

## Project-Specific Rules

- All migrations live in `drizzle/` directory
- Migration files are immutable once applied — never edit
- Generate via `pnpm drizzle-kit generate`, apply via `pnpm drizzle-kit migrate`
- Schema changes always go through migrations, never direct push in production
- Foreign key indexes and JSONB GIN indexes are included in initial migration
- Audit timestamps (`createdAt`, `updatedAt`) on all tables — do not drop in future migrations