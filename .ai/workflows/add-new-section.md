# Add New Section Workflow

Use when adding a new section type to the invitation renderer.

## Step 1: Design Section
```
Section Type: [name]
Content Schema: [fields]
Animation: [type]
```

## Step 2: Create Component
```typescript
// src/components/builder/sections/[section-name].tsx
import { SectionWrapper } from "@/components/ui/section-wrapper";

interface SectionProps {
  content: {
    // Define content fields
  };
  colors: ColorTokens;
  animation?: AnimationConfig;
  isPreview?: boolean;
}

export function SectionName({ content, colors }: SectionProps) {
  return (
    <SectionWrapper colors={colors}>
      {/* Section content */}
    </SectionWrapper>
  );
}
```

## Step 3: Register in Renderer
```typescript
// src/components/invite-renderer.tsx
import { SectionName } from "./builder/sections/[section-name]";

const sectionRenderers = {
  // ... existing
  [sectionType]: SectionName,
};
```

## Step 4: Add Validation Schema
```typescript
// src/lib/validators.ts
export const sectionContentSchema = z.object({
  type: z.literal("[sectionType]"),
  content: z.object({
    // Content fields
  }),
  visible: z.boolean().default(true),
  order: z.number(),
});
```

## Step 5: Add Section Definition
```typescript
// In template schema
{
  type: "[sectionType]",
  content: {
    field1: "string",
    field2: "number",
  },
  required: ["field1"],
}
```

## Step 6: Create Editor Component
```typescript
// src/components/builder/editors/[section-name]-editor.tsx
export function SectionNameEditor({ section, onUpdate }: Props) {
  return (
    <div>
      <label>Field 1</label>
      <input
        value={section.content.field1}
        onChange={(e) => onUpdate({ content: { ...section.content, field1: e.target.value } })}
      />
    </div>
  );
}
```

## Step 7: Verify
```bash
pnpm lint
pnpm typecheck
pnpm build
```

## Step 8: Test
```
1. View invitation with new section
2. Preview on desktop/mobile
3. Test scroll animation
4. Test visibility toggle
```
