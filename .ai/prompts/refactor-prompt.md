# Refactor Prompt

Use for improving existing code without changing functionality.

## Refactoring Principles

1. **Incremental** - Small, testable changes
2. **Preserve behavior** - Don't fix what works
3. **Test first** - Verify existing behavior
4. **Document** - Note why refactoring

## Common Refactors

### Extract Function
```typescript
// Before
function handleSubmit(data: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(data));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  await db.insert(table).values(parsed.data);
  return { success: true };
}

// After
function parseAndValidate(data: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(data));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  return { data: parsed.data };
}
```

### Replace Prop Drilling
```typescript
// Before - too deep
<Parent data={data}><Child /><GrandChild /><Deepest data={data} /></Parent>

// After - use context or store
const data = useContext(DataContext);
```

### Improve Type Safety
```typescript
// Before
function handle(data: any) { ... }

// After
function handle(data: MyType) { ... }
```

## Refactor Checklist

- [ ] Behavior preserved (tests pass)
- [ ] No new dependencies
- [ ] No commented code left behind
- [ ] Types improved
- [ ] Names clearer

## When NOT to Refactor

- Working code with no issues
- Stable code used by many
- Deadline approaching
- Understanding incomplete
