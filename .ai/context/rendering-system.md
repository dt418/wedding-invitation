# Rendering System

## Overview

The rendering system handles the display of wedding invitations with support for desktop and mobile preview modes, scroll-triggered animations, and real-time content updates.

## Rendering Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                    Invite Renderer                         │
├─────────────────────────────────────────────────────────────┤
│  1. Fetch Event Data                                        │
│     - Load event by invite code                            │
│     - Get template and sections                            │
│     - Load customization overrides                        │
│                                                              │
│  2. Process Sections                                         │
│     - Filter visible sections                              │
│     - Sort by order                                        │
│     - Apply color tokens                                   │
│                                                              │
│  3. Render Output                                            │
│     - Server-side render for initial                       │
│     - Client hydration for animations                      │
│     - Preview mode indicators                              │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### Server-Side (Initial Render)

```typescript
// app/invite/[code]/page.tsx
export default async function InvitePage({ params }) {
  const invite = await getInviteByCode(params.code);
  const event = await getEvent(invite.eventId);
  const template = await getTemplate(event.templateId);
  
  return (
    <InviteRenderer
      sections={event.sections}
      colors={event.colorTokens}
      isPreview={false}
    />
  );
}
```

### Client-Side (Animations)

```typescript
'use client';

export function AnimatedInviteRenderer({ sections, colors }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [animated, setAnimated] = useState(false);
  
  useEffect(() => {
    if (!ref.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );
    
    const elements = ref.current.querySelectorAll('.animate-on-scroll');
    elements.forEach((el) => observer.observe(el));
    
    return () => observer.disconnect();
  }, []);
  
  return <div ref={ref}>{/* content */}</div>;
}
```

## Color System Integration

### Template Color Tokens

Templates define a color scheme:

```typescript
const colorScheme = {
  primary: "#1a1a2e",      // Deep navy
  secondary: "#16213e",    // Dark blue
  accent: "#e94560",       // Coral red
  background: "#fefefe",   // Off-white
  text: "#333333",          // Dark gray
  textMuted: "#666666",     // Medium gray
  border: "#e5e5e5",       // Light gray
};
```

### Dynamic Token Application

```typescript
// Apply to each section via props
<section 
  style={{
    backgroundColor: colors.background,
    color: colors.text,
    borderColor: colors.border,
  }}
>
  <h1 style={{ color: colors.primary }}>{title}</h1>
  <p style={{ color: colors.textMuted }}>{subtitle}</p>
</section>
```

## Animation System

### Scroll-Triggered Animations

Using IntersectionObserver for performance:

```typescript
// CSS class toggle approach
.animate-on-scroll {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

.animate-on-scroll.visible {
  opacity: 1;
  transform: translateY(0);
}
```

### Animation Types

| Type | Effect | CSS Property |
|------|--------|-------------|
| fade | Opacity change | opacity |
| slide-up | Y-axis movement | transform |
| slide-down | Y-axis movement | transform |
| scale | Size change | transform |
| parallax | Multi-layer depth | transform + position |

### Reduced Motion Support

```typescript
@media (prefers-reduced-motion: reduce) {
  .animate-on-scroll {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
```

## Preview Modes

### Desktop Preview (1920px)

```typescript
// Default desktop view
<div className="invite-desktop">
  <InviteRenderer {...props} />
</div>
```

### Mobile Preview (375px)

```typescript
// Mobile-optimized view
<div className="invite-mobile" style={{ maxWidth: 375 }}>
  <InviteRenderer {...props} />
</div>
```

### Preview Indicators

```typescript
{isPreview && (
  <div className="preview-badge">
    <span>{isPreview}</span>
  </div>
)}
```

## Performance Considerations

### Server-Side Rendering
- Initial HTML rendered server-side for fast FCP
- Animations enhance without blocking content

### Lazy Loading
- Images lazy-loaded via Next.js Image
- Sections below fold deferred

### Bundle Optimization
- Code-split by route
- Tree-shake unused section renderers

## Error Handling

```typescript
function InviteRenderer({ sections, colors }) {
  if (!sections?.length) {
    return (
      <div className="invite-empty">
        <p>No sections to display</p>
      </div>
    );
  }

  return sections.map((section) => {
    const Component = sectionRenderers[section.type];
    if (!Component) {
      console.warn(`Unknown section type: ${section.type}`);
      return null;
    }
    return <Component {...section} colors={colors} />;
  });
}
```

## Testing

```typescript
// Snapshot test
expect(rendered).toMatchSnapshot();

// Accessibility check
expect(rendered).toHaveAttribute('role', 'main');

// Animation class check
expect(element).toHaveClass('animate-on-scroll');
```