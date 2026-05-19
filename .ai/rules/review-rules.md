# Code Review Rules

## Review Checklist

### Functionality
- [ ] Feature works as specified
- [ ] Edge cases handled
- [ ] Error states display correctly
- [ ] Loading states implemented

### Security
- [ ] All inputs validated
- [ ] User can only access own data
- [ ] No sensitive data exposed
- [ ] SQL injection prevented

### Performance
- [ ] No N+1 queries
- [ ] Images optimized
- [ ] Bundle size reasonable
- [ ] Server Components used

### Code Quality
- [ ] Types are correct
- [ ] No commented-out code
- [ ] Naming follows conventions
- [ ] Error handling present

### Accessibility
- [ ] Semantic HTML
- [ ] ARIA attributes
- [ ] Focus states
- [ ] Color contrast

## Reviewer Responsibilities

### Be Constructive
- Suggest improvements, not just criticism
- Explain why changes needed
- Provide examples

### Focus on Impact
- Blocking issues: security, bugs
- Non-blocking: style preferences
- Document exceptions

## PR Requirements

### Size
- Under 400 lines of changes
- Single logical change
- Clear description

### Tests
- Unit tests for new logic
- Integration tests for flows
- No tests for simple UI changes

### Documentation
- Update docs for API changes
- Comment complex logic
- No commented code

## Approval Rules

### Required
- 1 approval for trivial changes
- 2 approvals for significant changes
- Security review for auth changes

### Merge Conditions
- All CI checks passing
- No unresolved comments
- Up to date with main
