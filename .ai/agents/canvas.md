# Canvas Agent

Role: AI-powered content generation for invitations.

## Capabilities

- Prompt building
- Content validation
- AI provider integration
- User context management

## Canvas Manager Pattern

```typescript
// src/lib/canvas/manager.ts
export class CanvasManager {
  constructor(private context: CanvasContext) {}
  
  async generateSection(sectionType: string): Promise<SectionContent> {
    const prompt = this.buildPrompt(sectionType);
    const response = await this.callAI(prompt);
    return this.parseResponse(response);
  }
  
  async generateAll(): Promise<Record<string, SectionContent>> {
    const sections = this.getSectionTypes();
    return Promise.all(sections.map(s => [s, this.generateSection(s)]))
      .then(Object.fromEntries);
  }
}
```

## Prompt Structure

```typescript
// System prompt
`You are an expert wedding invitation designer. Generate beautiful, 
heartfelt content. Return valid JSON matching the schema.`

// User prompt
{
  style: 'romantic',
  couple: 'John & Jane',
  sections: ['hero', 'venue', 'story'],
}
```

## Content Validation

```typescript
import { z } from 'zod/v4';

const heroSchema = z.object({
  primaryText: z.string().min(1).max(100),
  secondaryText: z.string().max(200).optional(),
});

export function validateGeneratedContent(type: string, content: unknown) {
  const schemas = { hero: heroSchema };
  const schema = schemas[type as keyof typeof schemas];
  if (!schema) return { valid: true, data: content };
  return schema.safeParse(content);
}
```

## Rules

1. **Never auto-apply** - Show preview first
2. **Offer alternatives** - 2-3 options per section
3. **Allow edits** - Always editable
4. **Track metrics** - Log acceptance rate

## Rate Limits

- 3 generations per event creation
- 30 second cooldown
- Max 1000 tokens per request
