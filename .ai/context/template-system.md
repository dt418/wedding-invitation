# Template System

## Overview

The template system provides pre-designed invitation layouts with customizable content and colors. Templates define the structure; events define the content.

## Template Model

```typescript
interface Template {
  id: string;
  name: string;
  category: TemplateCategory;
  thumbnail: string;
  contentSchema: TemplateContentSchema;
  defaultColors: ColorTokens;
  variants: TemplateVariant[];
  isPremium: boolean;
  isActive: boolean;
}

interface TemplateVariant {
  id: string;
  templateId: string;
  name: string;
  colors: ColorTokens;
}

interface TemplateContentSchema {
  sections: SectionDefinition[];
}
```

## Template Categories

| Category | Description | Examples |
|----------|-------------|----------|
| `classic` | Traditional elegance | Gold accents, serif fonts |
| `modern` | Clean and minimal | Sans-serif, whitespace |
| `floral` | Nature-inspired | Floral patterns, soft colors |
| `rustic` | Country charm | Textures, warm tones |
| `tropical` | Beach/outdoor | Vibrant, playful |
| `luxury` | Premium feel | Rich colors, gold details |
| `minimalist` | Ultra simple | Black/white, basic |

## Template Schema Structure

Each template defines its sections and content requirements:

```typescript
const romanticTemplateSchema: TemplateContentSchema = {
  sections: [
    {
      type: 'hero',
      content: {
        primaryText: 'string',      // Required: Couple names
        secondaryText: 'string',     // Optional: Tagline
        backgroundImage: 'string',   // Optional: Hero image
      },
      order: 1,
      required: ['primaryText'],
    },
    {
      type: 'couple',
      content: {
        partner1Name: 'string',
        partner1Image: 'string',
        partner2Name: 'string', 
        partner2Image: 'string',
        storyText: 'string',
      },
      order: 2,
      required: ['partner1Name', 'partner2Name'],
    },
    {
      type: 'venue',
      content: {
        ceremonyName: 'string',
        ceremonyAddress: 'string',
        ceremonyTime: 'string',
        receptionName: 'string',
        receptionAddress: 'string',
        receptionTime: 'string',
      },
      order: 3,
      required: ['ceremonyName', 'ceremonyAddress'],
    },
    {
      type: 'countdown',
      content: {
        targetDate: 'date',
        showDays: 'boolean',
        showHours: 'boolean',
      },
      order: 4,
      required: ['targetDate'],
    },
    {
      type: 'gallery',
      content: {
        images: 'array',
        layout: 'grid' | 'carousel' | 'masonry',
        columns: 'number',
      },
      order: 5,
    },
    {
      type: 'rsvp',
      content: {
        title: 'string',
        deadline: 'date',
        formFields: 'array',
      },
      order: 6,
      required: ['title'],
    },
  ],
};
```

## Creating New Templates

### 1. Design Phase

```
┌─────────────────────────────────────────────────────────────┐
│                    Template Design                          │
├─────────────────────────────────────────────────────────────┤
│  1. Sketch layout in Figma                                │
│  2. Define color palette                                   │
│  3. Choose fonts                                           │
│  4. Plan sections                                          │
│  5. Create thumbnail preview                               │
└─────────────────────────────────────────────────────────────┘
```

### 2. Implementation Phase

```typescript
// src/data/templates/romantic.ts
export const romanticTemplate = {
  id: 'template-romantic-001',
  name: 'Romantic Elegance',
  category: 'classic',
  thumbnail: '/templates/romantic-thumb.jpg',
  contentSchema: romanticTemplateSchema,
  defaultColors: {
    primary: '#8B5A5A',      // Dusty rose
    secondary: '#2C3E50',   // Navy
    accent: '#D4AF37',       // Gold
    background: '#FDF8F5',   // Cream
    text: '#333333',
    textMuted: '#666666',
    border: '#E8DDD5',
  },
  variants: [
    {
      id: 'romantic-blush',
      name: 'Blush',
      colors: { primary: '#E8B4B8', ... },
    },
    {
      id: 'romantic-navy',
      name: 'Navy Gold',
      colors: { primary: '#2C3E50', ... },
    },
  ],
};
```

### 3. Register Template

```typescript
// src/lib/templates.ts
import { romanticTemplate } from '@/data/templates/romantic';

export const templates = {
  romantic: romanticTemplate,
  // Add more...
};

export function getTemplate(id: string) {
  return Object.values(templates).find(t => t.id === id);
}
```

## Template Variants

Variants provide color scheme alternatives:

```typescript
// User selects variant during event creation
const event = await createEvent({
  templateId: 'template-romantic-001',
  templateVariantId: 'romantic-navy',  // Optional - overrides colors
});
```

## Customization Levels

| Level | What | How |
|-------|------|-----|
| Color | Theme colors | Color picker in builder |
| Content | Text, images | Form fields in builder |
| Font | Typography | Select from presets |
| Layout | Section order | Drag-drop in builder |
| Visibility | Show/hide sections | Toggle in builder |

## Template Preview

```typescript
// src/components/templates/TemplatePreview.tsx
export function TemplatePreview({ templateId }: { templateId: string }) {
  const template = getTemplate(templateId);
  if (!template) return null;
  
  return (
    <div className="template-preview">
      <Image src={template.thumbnail} alt={template.name} />
      <div className="preview-overlay">
        <button onClick={() => selectTemplate(template.id)}>
          Use This Template
        </button>
      </div>
    </div>
  );
}
```

## Template Performance

- Lazy load thumbnails
- Use Next.js Image for optimization
- Preload critical fonts
- Cache template schemas

## Template Analytics

Track template usage:

```typescript
// Track template selection
await db.insert(analyticsEvents).values({
  eventId: event.id,
  action: 'template_selected',
  metadata: { templateId, variantId },
});
```