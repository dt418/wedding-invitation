# Code Review Checklist

## Functionality
- [ ] Feature works as specified
- [ ] Edge cases handled
- [ ] Error states display correctly
- [ ] Loading states implemented
- [ ] Success states clear

## Security (CRITICAL)
- [ ] All inputs validated with Zod
- [ ] User can only access own data
- [ ] JWT tokens verified on protected routes
- [ ] Passwords hashed with bcrypt
- [ ] HTTP-only cookies
- [ ] No SQL injection
- [ ] Security headers set
- [ ] Sensitive data not logged

## Database (PostgreSQL)
- [ ] Uses pgTable (NOT sqliteTable)
- [ ] UUID primary keys with defaultRandom()
- [ ] Timestamps with defaultNow()
- [ ] Cascade deletes on ownership
- [ ] Indexes for common queries
- [ ] No N+1 queries (use `with:`)

## Performance
- [ ] No N+1 queries
- [ ] Images use Next.js Image
- [ ] Bundle size reasonable
- [ ] Server Components for data
- [ ] Client components only where needed
- [ ] Lazy loading for heavy components

## Code Quality
- [ ] Types correct and complete
- [ ] `import type` for type-only imports
- [ ] Naming follows conventions
- [ ] Error handling present
- [ ] No commented-out code
- [ ] `cn()` for class composition

## Accessibility
- [ ] Semantic HTML
- [ ] ARIA attributes
- [ ] Focus states on interactive elements
- [ ] Color contrast 4.5:1
- [ ] Keyboard navigation

## Testing
- [ ] Unit tests for validators
- [ ] Integration tests for API
- [ ] E2E tests for user flows
- [ ] Error cases covered

## Commands
- [ ] `pnpm lint` passes
- [ ] `pnpm typecheck` passes
- [ ] `pnpm build` succeeds

## Merge Conditions
- [ ] CI checks passing
- [ ] No unresolved comments
- [ ] Up to date with main
- [ ] Security review for auth changes
