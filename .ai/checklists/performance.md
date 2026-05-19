# Performance Checklist

## Core Web Vitals

### LCP (Largest Contentful Paint) < 2.5s
- [ ] Server response fast
- [ ] Images optimized with next/image
- [ ] Fonts preloaded
- [ ] Critical CSS inlined

### INP (Interaction to Next Paint) < 100ms
- [ ] No long JavaScript tasks
- [ ] Event handlers fast
- [ ] No blocking main thread
- [ ] Efficient event delegation

### CLS (Cumulative Layout Shift) < 0.1
- [ ] Image dimensions set
- [ ] Font fallbacks defined
- [ ] No dynamic content insertion
- [ ] Reserved space for async content

## Database

### Queries
- [ ] No N+1 queries (use `with:`)
- [ ] Indexes on WHERE columns
- [ ] Pagination on large lists
- [ ] Query results cached where appropriate

### Schema (PostgreSQL)
- [ ] UUID primary keys
- [ ] Timestamps indexed
- [ ] Composite indexes for multi-column filters

## Bundle Size

### Code Splitting
- [ ] Route-based splitting
- [ ] Dynamic imports for heavy components
- [ ] No large dependencies

### Tree Shaking
- [ ] Named exports
- [ ] No barrel imports
- [ ] lodash-es instead of lodash

## Images
- [ ] next/image component used
- [ ] Appropriate sizes
- [ ] AVIF/WebP formats
- [ ] Lazy loading below fold
- [ ] Blur placeholders

## Rendering

### Server Components
- [ ] Data fetching in Server Components
- [ ] Minimal client boundaries
- [ ] Streaming with Suspense

### Client Components
- [ ] Only where interactivity needed
- [ ] Memoized expensive computations
- [ ] Event handlers optimized

## Caching

- [ ] Static data cached (revalidate)
- [ ] Dynamic data fresh
- [ ] User-specific data never cached
