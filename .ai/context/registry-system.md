# Component Registry System

## Overview

The invitation renderer uses a **component registry pattern** to dynamically render different section types. This pattern enables O(1) lookup and easy extensibility.

## Pattern Implementation

### Registry Map

```typescript
// src/components/invite-renderer.tsx

import { HeroSection } from "./builder/sections/hero";
import { VenueSection } from "./builder/sections/venue";
import { GallerySection } from "./builder/sections/gallery";
import { CountdownSection } from "./builder/sections/countdown";
import { CoupleSection } from "./builder/sections/couple";
import { StorySection } from "./builder/sections/story";
import { GiftSection } from "./builder/sections/gift";
import { GuestbookSection } from "./builder/sections/guestbook";

interface SectionProps {
  content: Record<string, unknown>;
  colors: ColorTokens;
  animation?: AnimationConfig;
  isPreview?: boolean;
}

const sectionRenderers: Record<string, React.ComponentType<SectionProps>> = {
  hero: HeroSection,
  venue: VenueSection,
  gallery: GallerySection,
  countdown: CountdownSection,
  couple: CoupleSection,
  story: StorySection,
  gift: GiftSection,
  guestbook: GuestbookSection,
};

export function InviteRenderer({ sections, colors }: InviteRendererProps) {
  return (
    <div className="invite-content">
      {sections
        .filter(s => s.visible)
        .sort((a, b) => a.order - b.order)
        .map(section => {
          const Component = sectionRenderers[section.type];
          if (!Component) return null;
          return (
            <Component
              key={section.id}
              content={section.content}
              colors={colors}
              animation={section.animation}
              isPreview={isPreview}
            />
          );
        })}
    </div>
  );
}
```

## Available Section Types

| Type | Component | Purpose |
|------|-----------|---------|
| `hero` | HeroSection | Main invitation header with names |
| `venue` | VenueSection | Event location details |
| `gallery` | GallerySection | Photo gallery |
| `countdown` | CountdownSection | Countdown timer |
| `couple` | CoupleSection | Couple introduction |
| `story` | StorySection | Love story timeline |
| `gift` | GiftSection | Gift registry info |
| `guestbook` | GuestbookSection | Guest messages |

## Color Token System

Sections receive a `colors` prop with theme tokens:

```typescript
interface ColorTokens {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  textMuted: string;
  border: string;
}
```

## Animation Configuration

```typescript
interface AnimationConfig {
  type: "fade" | "slide" | "scale" | "parallax";
  direction?: "up" | "down" | "left" | "right";
  duration?: number;
  delay?: number;
  easing?: string;
}
```

## Adding New Sections

### 1. Create Component

```typescript
// src/components/builder/sections/new-section.tsx

import { SectionWrapper } from "@/components/ui/section-wrapper";
import { cn } from "@/lib/utils";

interface NewSectionProps {
  content: {
    title?: string;
    description?: string;
    items?: string[];
  };
  colors: ColorTokens;
  animation?: AnimationConfig;
  isPreview?: boolean;
}

export function NewSection({ content, colors }: NewSectionProps) {
  return (
    <SectionWrapper colors={colors}>
      <h2 style={{ color: colors.primary }}>{content.title}</h2>
      <p style={{ color: colors.text }}>{content.description}</p>
    </SectionWrapper>
  );
}
```

### 2. Register in Renderer

```typescript
import { NewSection } from "./builder/sections/new-section";

const sectionRenderers = {
  // ... existing
  newSection: NewSection,
};
```

### 3. Add Schema Definition

```typescript
// In validators.ts or database schema
const newSectionSchema = z.object({
  type: z.literal("newSection"),
  content: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    items: z.array(z.string()).optional(),
  }),
  visible: z.boolean().default(true),
  order: z.number(),
  animation: animationConfigSchema.optional(),
});
```

## Preview Mode

Sections support preview rendering:

```typescript
// Desktop preview (1920px width)
// Mobile preview (375px width)

{isPreview && (
  <div className="preview-indicator">
    Preview Mode
  </div>
)}
```

## Visibility Control

Sections include a `visible` flag for conditional rendering:

```typescript
{sections
  .filter(s => s.visible)
  .sort((a, b) => a.order - b.order)
  .map(section => ...)}
```

## Best Practices

1. **Always use SectionWrapper** - Provides consistent padding and layout
2. **Extract colors from prop** - Never hardcode colors
3. **Handle missing content** - Use optional chaining and defaults
4. **Support preview mode** - Show/hide debug info based on prop
5. **SSR compatible** - No browser-only APIs in component body