# Feature Planning Prompt

Use for planning new features or significant changes.

## Planning Steps

### 1. Understand the Feature
- What is the user trying to accomplish?
- What data is involved?
- What are the edge cases?

### 2. Identify Components
- Database schema changes?
- New API endpoints?
- New UI components?
- New validation rules?

### 3. Plan Implementation Order
1. Database schema (if needed)
2. API routes
3. Server Actions
4. UI Components
5. Tests

## Feature Template

```markdown
## Feature: [Name]

### User Story
As a [user type], I want to [action], so that [benefit].

### Technical Requirements

#### Database
- Table: [name]
- Fields: [list]
- Indexes: [list]
- Relations: [list]

#### API
- Endpoint: POST /api/[resource]
- Auth: Required
- Validation: [schema]
- Response: [format]

#### UI
- Page: /[page]
- Components: [list]
- State: [management approach]

### Implementation Steps
1. Create migration
2. Add validator schema
3. Create API route
4. Build UI
5. Test

### Testing
- Unit tests for validators
- Integration tests for API
- E2E for user flow
```

## Dependencies

- Check existing patterns in `.ai/context/`
- Reuse existing components
- Follow established conventions

## Risks

- What could go wrong?
- How to mitigate?
- Fallback options?
