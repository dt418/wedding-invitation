# Performance Review Prompt

Use for analyzing and optimizing performance.

## Metrics to Check

### Core Web Vitals
- LCP < 2.5s
- INP < 100ms
- CLS < 0.1

### Bundle Size
- Route-based splitting (automatic)
- No large dependencies
- Tree-shaking works

### Database
- No N+1 queries
- Indexes on WHERE/ORDER BY
- Pagination on large datasets

## Performance Patterns

### Good
```typescript
// Eager loading
const events = await db.query.events.findMany({
  with: { guests: true },
});

// Pagination
const limit = 10;
const offset = (page - 1) * limit;

// Server Components
export default async function Page() {
  const data = await getData();
  return <Component data={data} />;
}
```

### Bad
```typescript
// N+1 query
for (const event of events) {
  const guests = await db.query.guests.findMany({ where: eq(guests.eventId, event.id) });
}

// Large bundle
import _ from 'lodash'; // NO

// Unoptimized images
<img src={largeImage} /> // Use Next.js Image
```

## Optimization Checklist

```
Database:
[ ] No N+1 queries (use with: for relations)
[ ] Indexes on filtered columns
[ ] Pagination on large lists

Frontend:
[ ] Next.js Image for images
[ ] Server Components for data
[ ] Client components only where needed
[ ] Lazy loading for heavy components

Bundle:
[ ] No lodash (use lodash-es)
[ ] No moment.js (use date-fns)
[ ] Tree-shaking enabled
```

## Investigation Commands

```bash
# Bundle analyzer
pnpm build && pnpm analyze

# Database query analysis
# Check slow queries in Neon dashboard

# Lighthouse
npx lighthouse https://app.url --view
```
