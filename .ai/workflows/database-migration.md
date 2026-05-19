# Database Migration Workflow

Use when making schema changes.

## Before Starting
```
- Backup production database
- Test on local database first
- Plan rollback strategy
```

## Step 1: Edit Schema
```typescript
// src/db/schema.ts
export const tableName = pgTable('table_name', {
  // ... existing columns
  
  // Add new column
  newColumn: varchar('new_column', { length: 255 }).optional(),
});
```

## Step 2: Generate Migration
```bash
pnpm db:generate
# Creates file in drizzle/ folder
```

## Step 3: Review Migration
```
# Check drizzle/ folder
# Review generated SQL
# Ensure it's correct
```

## Step 4: Apply Locally
```bash
# Ensure docker is running
docker compose up -d

# Apply migration
pnpm db:migrate

# Verify
docker compose exec postgres psql -U wedding -d wedding_invitation -c "\d table_name"
```

## Step 5: Test
```bash
# Run application
pnpm dev

# Test CRUD operations
# Verify new column works
```

## Step 6: Production
```
# Only after local testing complete
# Coordinate with team
# Schedule maintenance window if needed
```

## Rollback (If Needed)
```bash
# If migration needs to be reverted
# Edit schema to remove column
pnpm db:generate
pnpm db:migrate

# WARNING: This drops data!
# Only if acceptable
```

## Common Patterns

### Add Column
```typescript
// Schema
newColumn: varchar('new_column', { length: 255 }).optional()

// Migration auto-generated
ALTER TABLE table_name ADD COLUMN new_column varchar(255);
```

### Rename Column
```typescript
// 1. Add new column
// 2. Copy data
// 3. Drop old column
```

### Add Index
```typescript
// Schema
}, (table) => ({
  idxName: index('idx_name').on(table.column),
}));
```
