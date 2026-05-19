# AI Template Generation Workflow

Use when using AI to generate invitation content.

## Step 1: Prepare Context
```
- Couple names: [names]
- Style: [romantic/modern/classic/etc]
- Tone: [elegant/playful/warm]
- Language: [vi/en]
- Sections to generate: [list]
```

## Step 2: Build Prompt
```typescript
const systemPrompt = `You are an expert wedding invitation designer.
Generate beautiful, heartfelt content matching the style.
Return valid JSON. Maximum 200 chars per text field.`;

const userPrompt = `Generate content for ${sectionType}.

Couple: ${partner1} & ${partner2}
Style: ${style}
Tone: ${tone}

Requirements:
${requirements}

Return JSON with content and 2 alternatives.`;
```

## Step 3: Generate
```typescript
const result = await aiProvider.generate(prompt);
const parsed = JSON.parse(result);

// Validate against schema
const validation = validateGeneratedContent(sectionType, parsed);
if (!validation.valid) {
  return { error: validation.error };
}
```

## Step 4: Present to User
```
[Generated Content Preview]

Option 1: [Content]
Option 2: [Alternative]
Option 3: [Alternative]

[Edit] [Use This] [Regenerate]
```

## Step 5: Apply
```typescript
// Only after user confirms
await updateSection(eventId, sectionId, {
  content: selectedContent,
});
```

## Rate Limits
- 3 generations per event
- 30 second cooldown
- Max 1000 tokens

## Best Practices
1. Start with hero section
2. Offer 2-3 alternatives
3. Always allow manual edit
4. Respect style/tone
5. Track acceptance rate
