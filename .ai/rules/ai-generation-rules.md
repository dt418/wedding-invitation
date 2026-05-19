# AI Generation Rules

## Prompt Structure

### System Prompt Template
```
You are an expert wedding invitation designer for [Platform Name].
Generate beautiful, heartfelt content that matches the couple's style.

Rules:
1. Return valid JSON matching the provided schema
2. Content must be culturally appropriate
3. Generate alternatives for user selection
4. Respect the requested tone and style
5. Maximum 500 characters per text field
```

### User Prompt Template
```
Context:
- Couple: [partner1] & [partner2]
- Style: [style]
- Tone: [tone]
- Language: [language]

Generate content for:
- Section type: [type]
- Requirements: [specific requirements]

Return JSON with:
{
  "content": { /* section content */ },
  "alternatives": [ /* 2-3 alternatives */ ]
}
```

## Content Validation

### Schema Validation
```typescript
// Must validate all AI responses
const parsed = sectionSchema.safeParse(aiOutput);
if (!parsed.success) {
  return { valid: false, error: 'Invalid AI output format' };
}
```

### Content Rules
- No personal data in prompts
- No PII in generated content
- Respect cultural sensitivities
- Maximum field lengths enforced

## Output Formats

### Hero Section
```json
{
  "type": "hero",
  "content": {
    "primaryText": "John & Jane",
    "secondaryText": "Are getting married!",
    "tagline": "Together Forever"
  },
  "alternatives": [...]
}
```

### Venue Section
```json
{
  "type": "venue",
  "content": {
    "ceremonyName": "St. Mary's Church",
    "ceremonyAddress": "123 Main Street",
    "ceremonyTime": "2:00 PM",
    "receptionName": "Grand Ballroom",
    "receptionTime": "5:00 PM"
  }
}
```

## Generation Limits

### Rate Limits
- 3 generations per event creation
- 1 generation per section edit
- Cooldown: 30 seconds

### Token Limits
- Max 1000 tokens per request
- Max 200 tokens per text field
- Summarize if exceeded

## Error Handling

### API Errors
```typescript
try {
  const result = await aiProvider.generate(prompt);
  return { success: true, data: result };
} catch (error) {
  if (error.status === 429) {
    return { error: 'Rate limit exceeded. Please wait.' };
  }
  return { error: 'Generation failed. Please try again.' };
}
```

### Invalid Output
```typescript
const validation = validateGeneratedContent(type, output);
if (!validation.valid) {
  // Retry or show error to user
  return { error: validation.error };
}
```

## Best Practices

1. **Context Window** - Provide enough context but don't overwhelm
2. **Examples** - Include examples in prompts when ambiguous
3. **Constraints** - Be explicit about constraints (length, tone)
4. **Fallback** - Always provide manual input option
5. **Review** - Show generated content before applying
