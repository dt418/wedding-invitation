# Add New Field Workflow

Use when adding a field to an existing section or table.

## Step 1: Identify Location
```
Table: [table name]
Field: [field name]
Type: [type]
Default: [value]
```

## Step 2: Database (if table field)
```bash
# 1. Edit src/db/schema.ts
# Add field to table definition

# 2. Generate migration
pnpm db:generate

# 3. Apply
pnpm db:migrate
```

## Step 3: Update Validator
```typescript
// src/lib/validators.ts
export const updateSectionSchema = z.object({
  // ... existing fields
  newField: z.string().max(255).optional(),
});
```

## Step 4: Update UI
```typescript
// src/components/builder/editors/[editor].tsx
<input
  name="newField"
  value={data.newField}
  onChange={(e) => update({ newField: e.target.value })}
/>
```

## Step 5: Update Component
```typescript
// src/components/builder/sections/[section].tsx
<p>{content.newField}</p>
```

## Step 6: Verify
```bash
pnpm lint
pnpm typecheck
pnpm build
```

## Step 7: Test
```
1. Create/edit with new field
2. Verify saved to database
3. Verify displays correctly
```
