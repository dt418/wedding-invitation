# Debugging Prompt

Use for diagnosing and fixing bugs.

## Debugging Steps

### 1. Reproduce
- Can you reproduce the bug?
- What are the exact steps?
- What's the expected vs actual behavior?

### 2. Isolate
- Which component/file has the issue?
- Is it in frontend, API, or database?
- Can you narrow it down?

### 3. Investigate
- Read relevant context files
- Check similar patterns for comparison
- Look at error messages carefully

### 4. Fix
- Apply minimal fix
- Don't introduce new issues
- Consider edge cases

### 5. Verify
- Test the fix
- Check edge cases
- Run lint and build

## Common Issues

### Database
```typescript
// Issue: Data not saving
// Check: Transaction commit, validation errors

// Issue: Query returns wrong data
// Check: WHERE clause, eager loading, pagination
```

### API
```typescript
// Issue: 401 Unauthorized
// Check: JWT token, cookie settings, middleware

// Issue: 400 Bad Request
// Check: Zod validation, missing fields
```

### UI
```typescript
// Issue: Component not rendering
// Check: Server/Client component boundary, import errors

// Issue: State not updating
// Check: React strict mode double-render, proper setState
```

## Debug Tools

```bash
# Check server logs
pnpm dev
# Look at terminal output

# Lint
pnpm lint

# TypeScript
pnpm typecheck

# Build
pnpm build

# Database check
docker compose ps
```

## Documentation

For tricky bugs, add comments explaining the fix:
```typescript
// Fixed: IntersectionObserver threshold too high for mobile
// Reduced from 0.3 to 0.1 to trigger earlier
const observer = new IntersectionObserver(
  callback,
  { threshold: 0.1 } // Was 0.3, mobile didn't trigger
);
```
