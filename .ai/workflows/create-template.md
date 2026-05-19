# Create Template Workflow

Use when creating a new invitation template.

## Step 1: Design in Figma
```
- Layout sketch
- Color palette
- Typography
- Sections
- Animations
```

## Step 2: Create Template Data
```typescript
// src/data/templates/[template-name].ts
export const templateData = {
  id: 'template-[name]-001',
  name: 'Template Name',
  category: 'classic' | 'modern' | 'minimal' | 'floral' | 'luxury',
  thumbnail: '/templates/[name]/thumbnail.jpg',
  contentSchema: {
    sections: [
      { type: 'hero', required: ['primaryText'] },
      { type: 'venue', required: ['ceremonyName', 'ceremonyAddress'] },
      // ... other sections
    ],
  },
  defaultColors: {
    primary: '#color',
    secondary: '#color',
    accent: '#color',
    background: '#color',
    text: '#color',
    textMuted: '#color',
    border: '#color',
  },
  variants: [
    { id: 'variant-1', name: 'Variant 1', colors: { ... } },
  ],
};
```

## Step 3: Create Section Components
```typescript
// src/components/builder/sections/[template-name]/hero.tsx
// ... section components for this template
```

## Step 4: Register in Renderer
```typescript
// src/components/invite-renderer.tsx
import { TemplateHero } from "./builder/sections/[template-name]/hero";
// ... imports

const sectionRenderers = {
  // ... existing
  'template-[name]-hero': TemplateHero,
};
```

## Step 5: Register Template
```typescript
// src/lib/templates.ts
import { templateData } from '@/data/templates/[template-name]';

export const templates = {
  [templateName]: templateData,
};
```

## Step 6: Create Thumbnail
```
- Export at 400x300px
- Place in /public/templates/[name]/
- Optimize for web
```

## Step 7: Seed Database (if needed)
```typescript
// src/db/seed.ts
await db.insert(templates).values(templateData);
```

## Step 8: Verify
```bash
pnpm lint
pnpm typecheck
pnpm build
```

## Step 9: Test
```
1. Browse templates
2. Select new template
3. Preview invitation
4. Test customization
5. Test animations
```
