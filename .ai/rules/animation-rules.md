# Animation Rules

## Philosophy

1. **Performance First** - CSS transforms only, no layout thrashing
2. **Accessible** - Respect `prefers-reduced-motion`
3. **Progressive** - Content visible without JS
4. **Composable** - Multiple animation types

## CSS-First Approach

### Allowed Properties
- opacity
- transform (translate, scale, rotate)
- filter (blur, brightness)

### Forbidden Properties
- width, height
- margin, padding
- position (except for parallax)

## Scroll-Triggered Animation

### Pattern
```typescript
// src/lib/useInView.ts
export function useInView(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, ...options }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, inView };
}
```

### CSS Classes
```css
.animate-on-scroll {
  opacity: 0;
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

.animate-on-scroll.visible {
  opacity: 1;
  transform: translateY(0);
}

.animate-on-scroll.slide-up {
  transform: translateY(30px);
}

.animate-on-scroll.fade {
  opacity: 0;
}
```

### Usage
```typescript
<ScrollReveal animation="slide-up" delay={100}>
  <Content />
</ScrollReveal>
```

## Animation Types

| Type | Effect | Use Case |
|------|--------|----------|
| fade | Opacity 0→1 | Sections |
| slide-up | Y-axis movement | Cards, text |
| slide-down | Y-axis movement | Headers |
| scale | Scale 0.95→1 | Images, buttons |

## Staggered Animations

```typescript
{items.map((item, i) => (
  <ScrollReveal key={item.id} delay={i * 100}>
    <ItemCard item={item} />
  </ScrollReveal>
))}
```

## Parallax Effect

```typescript
// Only for decorative elements
function ParallaxImage({ src, speed = 0.5 }) {
  const [offset, setOffset] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      const rect = ref.current?.getBoundingClientRect();
      if (rect) setOffset(rect.top * speed);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);
  
  return <img src={src} style={{ transform: \`translateY(\${offset}px)\` }} />;
}
```

## Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .animate-on-scroll {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
```

## Performance Tips

1. Use `will-change` sparingly - only when animating
2. Prefer transform over position
3. Use passive scroll listeners
4. Avoid animating layout properties
5. Test on low-end devices

## Animation Config

Stored in JSONB:
```typescript
interface AnimationConfig {
  type: 'fade' | 'slide-up' | 'slide-down' | 'scale' | 'parallax';
  duration?: number;
  delay?: number;
  easing?: string;
  threshold?: number;
  once?: boolean;
}
```

## Anti-Patterns

```typescript
// BAD - animating layout
<div style={{ height: expanded ? '100px' : '0' }}>

// GOOD - use transform
<div style={{ transform: expanded ? 'scaleY(1)' : 'scaleY(0)' }}>
```
