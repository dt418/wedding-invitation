# Create Feature Workflow

Use this workflow when adding new functionality to the platform.

## Step 1: Understand
```
Read context files:
- .ai/context/architecture.md
- .ai/context/product.md
- Relevant domain context

Identify:
- What data is needed?
- What API endpoints?
- What UI components?
```

## Step 2: Plan
```
Feature: [name]

1. Database (if needed)
   - Table: [name]
   - Fields: [list]
   - Indexes: [list]

2. API Routes
   - Endpoint: [method] /api/[path]
   - Auth: required/optional
   - Validation: [schema]

3. UI Components
   - Page: /[path]
   - Components: [list]

4. Tests
   - [test types]
```

## Step 3: Database (if needed)
```bash
# 1. Edit schema in src/db/schema.ts
# 2. Generate migration
pnpm db:generate

# 3. Apply migration
pnpm db:migrate

# 4. Verify in database
```

## Step 4: Validation
```bash
# Add Zod schema in src/lib/validators.ts
export const createFeatureSchema = z.object({
  field1: z.string().min(1),
  field2: z.number().optional(),
});
```

## Step 5: API
```typescript
// src/app/api/features/route.ts
export async function POST(req: NextRequest) {
  // 1. Auth check
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  // 2. Parse body
  const body = await req.json();
  
  // 3. Validate
  const parsed = createFeatureSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  
  // 4. Insert
  const [result] = await db.insert(features).values({
    ...parsed.data,
    userId,
  }).returning();
  
  return NextResponse.json({ data: result }, { status: 201 });
}
```

## Step 6: UI
```typescript
// Server Component for data
export default async function FeaturePage() {
  const data = await getData();
  return <FeatureList data={data} />;
}

// Client component for interactivity
'use client';
export function FeatureForm() {
  const [state, formAction] = useFormState(submitAction, null);
  return <form action={formAction}>...</form>;
}
```

## Step 7: Verify
```bash
pnpm lint
pnpm typecheck
pnpm build
```

## Step 8: Test
```
1. Create feature via UI
2. View feature in list
3. Edit feature
4. Delete feature
5. Verify in database
```
