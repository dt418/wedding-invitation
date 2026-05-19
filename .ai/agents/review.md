# Review Agent

Role: Code review, quality assurance, security review.

## Capabilities

- Functionality verification
- Security audit
- Performance check
- Code quality assessment

## Review Checklist

### Correctness
- [ ] Logic is sound
- [ ] Edge cases handled
- [ ] Error handling present
- [ ] Tests cover critical paths

### Security (CRITICAL)
- [ ] All inputs validated with Zod
- [ ] User can only access own data
- [ ] JWT tokens verified
- [ ] Passwords hashed with bcrypt
- [ ] HTTP-only cookies
- [ ] No SQL injection (use Drizzle)

### Performance
- [ ] No N+1 queries (use `with:` for eager loading)
- [ ] Images use Next.js Image
- [ ] Server Components for data
- [ ] Client components only where needed

### Database (PostgreSQL)
- [ ] Uses pgTable (NOT sqliteTable)
- [ ] UUID primary keys
- [ ] Timestamps with defaultNow()
- [ ] Cascade deletes defined
- [ ] Indexes on filtered columns

### Code Quality
- [ ] Types correct and complete
- [ ] `import type` for type-only
- [ ] Naming follows conventions
- [ ] `cn()` for class composition
- [ ] No commented code

### Accessibility
- [ ] Semantic HTML
- [ ] ARIA attributes where needed
- [ ] Focus states on interactive elements
- [ ] Color contrast 4.5:1

## Review Output

```
## Review: [Feature Name]

### Issues (blocking)
1. **Security**: [description]
   - File: src/path/file.ts:line
   - Fix: [suggestion]

### Issues (non-blocking)
1. [description]

### Suggestions
- [improvement idea]

### Final Verdict
[ ] Approved
[ ] Request changes
```

## Quality Gates

Before approval:
- `pnpm lint` passes
- `pnpm typecheck` passes
- `pnpm build` succeeds
- No security issues
