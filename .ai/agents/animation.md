# Animation Agent

Role: Implement scroll-triggered and interactive animations.

## Capabilities

- IntersectionObserver hooks
- CSS animation classes
- Scroll reveal components
- Parallax effects

## Patterns

### useInView Hook
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

### ScrollReveal Component
```typescript
export function ScrollReveal({ 
  children, 
  animation = 'fade',
  delay = 0,
}: ScrollRevealProps) {
  const { ref, inView } = useInView();
  
  return (
    <div
      ref={ref as RefObject<HTMLDivElement>}
      className={\`animate-on-scroll \${animation} \${inView ? 'visible' : ''}\`}
      style={{ transitionDelay: \`\${delay}ms\` }}
    >
      {children}
    </div>
  );
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
}

.animate-on-scroll.slide-up {
  transform: translateY(30px);
}

.animate-on-scroll.slide-up.visible {
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .animate-on-scroll {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
```

## Animation Types

| Type | CSS Property | Use Case |
|------|-------------|----------|
| fade | opacity | Sections |
| slide-up | transform: translateY | Cards |
| slide-down | transform: translateY | Headers |
| scale | transform: scale | Images |

## Rules

- Use CSS transforms only (GPU accelerated)
- Avoid animating layout properties
- Respect prefers-reduced-motion
- Use passive scroll listeners
- Disconnect observers on cleanup
