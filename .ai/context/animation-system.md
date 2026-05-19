# Animation System

## Overview

Scroll-triggered animations using IntersectionObserver with CSS transitions. No Framer Motion dependency. Focus on performance and accessibility.

## Animation Philosophy

1. **Performance First** - CSS transforms only, no layout thrashing
2. **Accessible** - Respect `prefers-reduced-motion`
3. **Progressive** - Content visible without JS
4. **Composable** - Multiple animation types supported

## Implementation Pattern

### IntersectionObserver Hook

```typescript
// src/lib/useInView.ts
import { useEffect, useRef, useState } from 'react';

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

### Scroll Reveal Component

```typescript
// src/components/scroll-reveal.tsx
'use client';

interface ScrollRevealProps {
  children: React.ReactNode;
  animation?: 'fade' | 'slide-up' | 'slide-down' | 'scale';
  delay?: number;
  className?: string;
}

export function ScrollReveal({ 
  children, 
  animation = 'fade',
  delay = 0,
  className = '',
}: ScrollRevealProps) {
  const { ref, inView } = useInView();

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`animate-on-scroll ${animation} ${inView ? 'visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
```

## CSS Animation Classes

```css
/* Base animation class */
.animate-on-scroll {
  opacity: 0;
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

/* Animation variants */
.animate-on-scroll.fade {
  opacity: 0;
}

.animate-on-scroll.fade.visible {
  opacity: 1;
}

.animate-on-scroll.slide-up {
  opacity: 0;
  transform: translateY(30px);
}

.animate-on-scroll.slide-up.visible {
  opacity: 1;
  transform: translateY(0);
}

.animate-on-scroll.slide-down {
  opacity: 0;
  transform: translateY(-30px);
}

.animate-on-scroll.slide-down.visible {
  opacity: 1;
  transform: translateY(0);
}

.animate-on-scroll.scale {
  opacity: 0;
  transform: scale(0.95);
}

.animate-on-scroll.scale.visible {
  opacity: 1;
  transform: scale(1);
}

/* Accessibility: reduced motion */
@media (prefers-reduced-motion: reduce) {
  .animate-on-scroll {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
```

## Staggered Animations

```typescript
export function StaggeredList({ items, children }: Props) {
  return (
    <div className="stagger-container">
      {items.map((item, index) => (
        <ScrollReveal key={item.id} delay={index * 100}>
          {children(item)}
        </ScrollReveal>
      ))}
    </div>
  );
}
```

## Animation Configuration Schema

```typescript
// Animation configuration stored in JSONB
interface AnimationConfig {
  type: 'fade' | 'slide-up' | 'slide-down' | 'scale' | 'parallax';
  duration?: number;      // ms, default 600
  delay?: number;          // ms, default 0
  easing?: string;         // CSS easing, default 'ease-out'
  threshold?: number;      // 0-1, default 0.1
  once?: boolean;          // default true
}

const defaultAnimation: AnimationConfig = {
  type: 'fade',
  duration: 600,
  delay: 0,
  easing: 'ease-out',
  threshold: 0.1,
  once: true,
};
```

## Usage in Section Components

```typescript
export function HeroSection({ content, colors, animation }: Props) {
  return (
    <SectionWrapper colors={colors}>
      <ScrollReveal animation={animation?.type || 'fade'} delay={0}>
        <h1 className="font-heading text-5xl">{content.primaryText}</h1>
      </ScrollReveal>
      
      <ScrollReveal animation="slide-up" delay={200}>
        <p className="text-muted">{content.secondaryText}</p>
      </ScrollReveal>
      
      <ScrollReveal animation="fade" delay={400}>
        <div className="mt-8">
          <CountdownTimer targetDate={content.weddingDate} />
        </div>
      </ScrollReveal>
    </SectionWrapper>
  );
}
```

## Parallax Effect

```typescript
// For depth effects on images
export function ParallaxImage({ src, alt, speed = 0.5 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const scrolled = window.scrollY;
      setOffset(rect.top * speed);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return (
    <div ref={ref} className="parallax-container overflow-hidden">
      <img
        src={src}
        alt={alt}
        style={{ transform: `translateY(${offset}px)` }}
      />
    </div>
  );
}
```

## Best Practices

1. **Use `will-change` sparingly** - Only when animating
2. **Prefer transform over position** - GPU-accelerated
3. **Avoid animating layout properties** - width, height, margin
4. **Use `passive` scroll listeners** - Better scrolling performance
5. **Test with reduced motion** - Ensure content is accessible

## Anti-Patterns

```typescript
// BAD: Animating layout properties
<div style={{ height: expanded ? '100px' : '0' }}>
  
// GOOD: Use transform
<div style={{ transform: expanded ? 'scaleY(1)' : 'scaleY(0)' }}>
```

## Performance Monitoring

```typescript
// Check if animations are causing jank
performance.getEntriesByType('frame').forEach(frame => {
  if (frame.duration > 16.67) {
    console.warn('Frame took longer than 16.67ms:', frame.duration);
  }
});
```