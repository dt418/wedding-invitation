# Feature Checklist

## Planning
- [ ] User story written
- [ ] Technical requirements documented
- [ ] Dependencies identified
- [ ] Risks assessed

## Database (if needed)
- [ ] Schema changes use pgTable (PostgreSQL)
- [ ] UUID primary keys
- [ ] Timestamps defined
- [ ] Indexes for queries
- [ ] Migration generated (`pnpm db:generate`)
- [ ] Migration applied (`pnpm db:migrate`)

## Validation
- [ ] Zod schema defined in validators.ts
- [ ] Create schema defined
- [ ] Update schema defined
- [ ] Error messages user-friendly

## API
- [ ] Route handler created
- [ ] Auth check on protected routes
- [ ] Zod validation on inputs
- [ ] Proper HTTP status codes
- [ ] Error responses consistent format

## UI
- [ ] Server Components for data fetching
- [ ] Client components only for interactivity
- [ ] Design tokens used (not hardcoded)
- [ ] cn() for class composition
- [ ] Responsive (mobile-first)
- [ ] Loading states
- [ ] Error states

## Security
- [ ] User can only access own data
- [ ] JWT tokens verified
- [ ] Input validation with Zod
- [ ] No SQL injection

## Quality
- [ ] `pnpm lint` passes
- [ ] `pnpm typecheck` passes
- [ ] `pnpm build` succeeds
- [ ] Manual test in browser

## Documentation
- [ ] Context files updated
- [ ] Comments for complex logic
- [ ] README updated if needed
