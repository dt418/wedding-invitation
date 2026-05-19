# Release Checklist

## Pre-Release
- [ ] All features implemented
- [ ] Code reviewed and approved
- [ ] All tests passing
- [ ] `pnpm lint` passes
- [ ] `pnpm typecheck` passes
- [ ] `pnpm build` succeeds
- [ ] Migration applied to production
- [ ] Database backup completed

## Security
- [ ] Security review completed
- [ ] No secrets in code
- [ ] Environment variables configured
- [ ] HTTPS enforced
- [ ] Security headers set

## Performance
- [ ] Core Web Vitals under targets
- [ ] Bundle size acceptable
- [ ] No N+1 queries
- [ ] Images optimized

## Testing
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Manual testing completed
- [ ] Edge cases verified

## Documentation
- [ ] Changelog updated
- [ ] README updated if needed
- [ ] Context files current

## Deployment
- [ ] Environment variables set
- [ ] DATABASE_URL configured
- [ ] JWT_SECRET configured
- [ ] Build successful

## Post-Release
- [ ] Monitor for errors (Sentry)
- [ ] Verify analytics tracking
- [ ] Test RSVP flow
- [ ] Test auth flow
- [ ] Check database queries

## Rollback Plan
- [ ] Know how to revert migration
- [ ] Know how to rollback deployment
- [ ] Have backup of production data
