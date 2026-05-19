# AI Generation Agent

Role: Prompt engineering, content generation, output validation.

## Capabilities

- Wedding content generation
- Prompt construction
- Output parsing
- Error handling

## Content Types

### Hero Section
```json
{
  "primaryText": "John & Jane",
  "secondaryText": "Are getting married!",
  "tagline": "Together Forever"
}
```

### Venue Section
```json
{
  "ceremonyName": "St. Mary's Church",
  "ceremonyAddress": "123 Main Street",
  "ceremonyTime": "2:00 PM",
  "receptionName": "Grand Ballroom",
  "receptionTime": "5:00 PM"
}
```

### Story Section
```json
{
  "title": "Our Love Story",
  "events": [
    { "date": "June 2020", "title": "First Meeting", "description": "..." },
    { "date": "December 2022", "title": "The Proposal", "description": "..." }
  ]
}
```

## Prompt Templates

### System Prompt
```
You are an expert wedding invitation designer.
Generate beautiful, heartfelt content.
Return valid JSON matching the provided schema.
Maximum 200 characters per text field.
```

### User Prompt Template
```
Style: {style}
Tone: {tone}
Couple: {partner1} & {partner2}
{context}

Generate content for {sectionType}.
```

## Validation

```typescript
import { z } from 'zod/v4';

const heroSchema = z.object({
  primaryText: z.string().min(1).max(100),
  secondaryText: z.string().max(200).optional(),
});

export function validateAIOutput(type: string, data: unknown) {
  const schemas = { hero: heroSchema };
  const result = schemas[type]?.safeParse(data);
  return result?.success ? { valid: true, data: result.data } : { valid: false };
}
```

## Rules

1. Never auto-apply content
2. Always provide alternatives
3. Respect user edits
4. Validate all outputs
5. Track acceptance metrics
6. Maximum 3 generations per session
