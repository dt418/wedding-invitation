# Architecture Review Prompt

Use for reviewing system design decisions.

## Review Areas

### 1. Component Architecture
- Server vs Client Component boundary correct?
- Data fetching happens at appropriate layer?
- State management tiered correctly?

### 2. Database Design
- PostgreSQL schema (not SQLite)?
- Indexes for common queries?
- Cascade deletes defined?
- JSONB for flexible data?

### 3. API Design
- RESTful endpoints?
- Proper authentication?
- Error responses consistent?

### 4. Security
- Authorization checks on all protected routes?
- Input validation with Zod?
- SQL injection prevented (Drizzle)?

## Review Checklist

```
[ ] Schema uses pgTable (PostgreSQL)
[ ] UUID primary keys with defaultRandom()
[ ] Timestamps with defaultNow()
[ ] Cascade deletes on user-owned data
[ ] Composite indexes for query patterns
[ ] Server Components for data fetching
[ ] Client components only for interactivity
[ ] Auth middleware protecting dashboard routes
[ ] Zod validation on all API boundaries
[ ] Error responses follow consistent format
```

## Architecture Decision Record (ADR)

For significant decisions, create ADR in `.ai/decisions/`:

```markdown
# ADR-[number]: Title

## Status
Proposed | Accepted | Deprecated

## Context
What problem are we solving?

## Decision
What are we deciding?

## Consequences
- Positive: ...
- Negative: ...
```
