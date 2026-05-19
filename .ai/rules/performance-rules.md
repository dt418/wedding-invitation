# Performance Rules

## Core Web Vitals Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| LCP | < 2.5s | 75th percentile |
| FID/INP | < 100ms | 75th percentile |
| CLS | < 0.1 | 75th percentile |

## Image Optimization

### Next.js Image
```typescript
import Image from 'next/image';

<Image
  src={imageUrl}
  alt={alt}
  width={800}
  height={600}
  placeholder="blur"
  blurDataURL={blurDataUrl}
/>
```

### Image Sizes
- Hero: 1920x1080 max
- Thumbnails: 400x300 max
- AVIF/WebP when possible

## Bundle Size

### Code Splitting
- Route-based splitting (automatic with App Router)
- Dynamic imports for large components
```typescript
const HeavyComponent = dynamic(() => import('./HeavyComponent'));
```

### Tree Shaking
- Named exports only
- Remove unused code
- No barrel imports

## Data Fetching

### Server Components
- Fetch data at render time
- Cache responses
```typescript
export default async function Page() {
  const data = await fetch('/api/data', {
    next: { revalidate: 3600 },
  }).then(r => r.json());
}
```

### Avoid Client Fetching
```typescript
// BAD
useEffect(() => {
  fetch('/api/data').then(r => r.json()).then(setData);
}, []);

// GOOD - Server Component
export default async function Page() {
  const data = await getData();
}
```

## Caching Strategy

### Static Data
- Templates, categories (rarely change)
- Cache: `revalidate: 86400` (24h)

### Dynamic Data
- Events, guests, RSVPs (change often)
- Cache: `revalidate: 0` or none

### User-Specific Data
- Never cache
- Always fetch fresh

## Rendering Optimization

### Suspense for Slow Data
```typescript
<Suspense fallback={<EventSkeleton />}>
  <EventList />
</Suspense>
```

### Streaming
- Stream from server for large responses
- Partial hydration

## Animation Performance

### CSS-First
- Use CSS transforms only
- GPU-accelerated properties

### Avoid Layout Jank
```css
/* BAD */
.element { transition: width 0.3s; }

/* GOOD */
.element { transition: transform 0.3s; }
```

## Monitoring

### Performance Marks
```typescript
performance.mark('event-render-start');
// render logic
performance.mark('event-render-end');
performance.measure('render-time', 'event-render-start', 'event-render-end');
```

### Core Web Vitals in Analytics
```typescript
// Track in analytics events
await db.insert(analyticsEvents).values({
  action: 'page_view',
  metadata: {
    lcp: coreVitalData.lcp,
    fid: coreVitalData.fid,
    cls: coreVitalData.cls,
  },
});
```
