# Canvas System Rules

## Overview

AI-powered content generation for wedding invitations using a structured prompt system.

## Prompt Building

### System Prompt
```typescript
static buildSystemPrompt(): string {
  return `You are an expert wedding invitation designer. Generate beautiful, 
  heartfelt content that matches the couple's style. Return valid JSON 
  matching the provided schema.`;
}
```

### User Prompt Structure
```typescript
{
  style: 'romantic' | 'modern' | 'classic' | 'minimal',
  tone: 'elegant' | 'playful' | 'warm' | 'formal',
  coupleInfo: { partner1Name, partner2Name, story? },
  sections: ['hero', 'venue', 'story', ...],
}
```

## Content Validation

### Schema Validation
```typescript
export function validateGeneratedContent(sectionType, content) {
  const schemas = {
    hero: heroContentSchema,
    venue: venueContentSchema,
    story: storyContentSchema,
  };
  const schema = schemas[sectionType];
  if (!schema) return { valid: true, data: content };
  
  const result = schema.safeParse(content);
  if (result.success) return { valid: true, data: result.data };
  return { valid: false, error: result.error.issues[0].message };
}
```

## Output Format

### Required Structure
```typescript
interface AIResponse {
  type: string;
  content: Record<string, unknown>;
  suggestions?: Record<string, unknown>[];
  metadata: {
    generatedAt: Date;
    model: string;
    tokens: number;
  };
}
```

## Section-Specific Prompts

### Hero Section
```typescript
{
  type: 'hero',
  prompt: `Create elegant couple names and tagline.
  Examples: "John & Jane", "Together Forever",
  Tone: romantic and elegant`,
}
```

### Venue Section
```typescript
{
  type: 'venue',
  prompt: `Generate venue details with ceremony and reception info.
  Include: venue name, address, time, dress code suggestions`,
}
```

### Story Section
```typescript
{
  type: 'story',
  prompt: `Create a romantic timeline of the couple's story.
  Include 3-5 key moments with dates and descriptions`,
}
```

## Usage Rules

1. **Never auto-apply** - Always show preview first
2. **Offer alternatives** - Provide 2-3 options per section
3. **Allow edits** - User can modify before applying
4. **Track metrics** - Log acceptance rate, iterations
5. **Respect style** - Match output to user preferences

## Rate Limiting

- Max 3 generations per event creation
- Cooldown: 30 seconds between requests
- Queue: First-come-first-served

## Error Handling

```typescript
async function generateSection(sectionType: string) {
  try {
    const result = await aiProvider.generate(prompt, schema);
    return { success: true, data: result };
  } catch (error) {
    if (error.code === 'RATE_LIMITED') {
      return { success: false, error: 'Please wait before trying again' };
    }
    return { success: false, error: 'Generation failed, please try again' };
  }
}
```

## Best Practices

1. **Start simple** - Generate one section first
2. **Show progress** - Stream responses when possible
3. **Save drafts** - Auto-save generated content
4. **Easy undo** - Allow reverting to original
5. **Clear UI** - Show exactly what will be applied
