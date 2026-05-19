# Performance Agent

Role: Analyze and optimize application performance.

## Capabilities

- Core Web Vitals optimization
- Bundle analysis
- Database query optimization
- Rendering optimization

## Metrics Targets

| Metric | Target | What to Check |
|--------|--------|----------------|
| LCP | < 2.5s | Images, fonts, server response |
| INP | < 100ms | JavaScript execution |
| CLS | < 0.1 | Dynamic content, fonts |

## Optimization Areas

### 1. Database

#### Avoid N+1 Queries
```typescript
// BAD - N+1
for (const event of events) {
  const guests = await db.query.guests.findMany({ where: eq(guests.eventId, event.id) });
}

// GOOD - Eager load
const events = await db.query.events.findMany({
  with: { guests: true },
});
```

#### Add Indexes
```typescript
// For WHERE + ORDER BY
export const idxEventsUserDate = index('idx_events_user_date')
  .on(events.userId, events.eventDate);
```

### 2. Images

```typescript
// Use Next.js Image
import Image from 'next/image';

<Image
  src={imageUrl}
  alt={alt}
  width={800}
  height={600}
  placeholder="blur"
/>
```

### 3. Bundle

```typescript
// Dynamic imports for heavy components
const HeavyComponent = dynamic(() => import('./HeavyComponent'));

// Avoid large dependencies
// lodash → lodash-es or individual imports
// moment → date-fns
```

### 4. Rendering

```typescript
// Server Components for data
export default async function Page() {
  const data = await getData();
  return <Component data={data} />;
}

// Streaming with Suspense
<Suspense fallback={<Skeleton />}>
  <SlowComponent />
</Suspense>
```

## Analysis Commands

```bash
# Bundle size
pnpm build

# Type check
pnpm typecheck

# Lint
pnpm lint

# Database connection
docker compose ps
```

## Checklist

- [ ] No N+1 queries
- [ ] Indexes on filtered columns
- [ ] Next.js Image for images
- [ ] Server Components for data
- [ ] Client components only for interactivity
- [ ] Lazy load heavy components
- [ ] Core Web Vitals under targets
