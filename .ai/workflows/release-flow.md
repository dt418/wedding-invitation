# Release Flow Workflow

Use when preparing and executing a release.

## Pre-Release (1 week before)

### Code Freeze
- [ ] Feature freeze date communicated
- [ ] All PRs merged to main
- [ ] No new features in progress

### Testing
- [ ] Full test suite passing
- [ ] Manual testing completed
- [ ] Regression tests passed
- [ ] Performance tests passed

### Documentation
- [ ] Changelog updated
- [ ] README updated if needed
- [ ] Migration guide prepared

## Release Day

### Pre-Deployment
```bash
# 1. Final checks
pnpm lint
pnpm typecheck
pnpm build

# 2. Tag release
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# 3. Backup database
# (If applicable)
```

### Deployment
```bash
# 1. Deploy to staging
# 2. Run smoke tests
# 3. Deploy to production
```

### Post-Deployment
- [ ] Verify app loads
- [ ] Test critical paths
- [ ] Check error monitoring
- [ ] Verify analytics

## Rollback Plan

### If Issues Found
```bash
# 1. Stop deployment
# 2. Identify issue
# 3. Fix or rollback

# Rollback migration (if needed)
pnpm db:rollback
```

### Common Issues
- Database migration failure
- Environment variables missing
- Build fails on production
- Runtime errors

## Post-Release

### 24 Hours After
- [ ] No new errors
- [ ] Performance metrics normal
- [ ] Users reporting issues?

### 1 Week After
- [ ] Review analytics
- [ ] Gather feedback
- [ ] Plan next release
