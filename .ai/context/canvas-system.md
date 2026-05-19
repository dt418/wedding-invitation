# Canvas System - AI Generation

## Overview

The canvas system enables AI-powered content generation for wedding invitations. Users can describe their vision, and the AI generates content that matches the template structure.

## System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Canvas System                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   Canvas    │───▶│   Prompt    │───▶│   AI Model  │     │
│  │   Manager   │    │   Builder   │    │   (LLM)     │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│         │                  │                  │             │
│         ▼                  ▼                  ▼             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   Content   │    │   Schema    │    │   Output    │     │
│  │   Store     │    │   Validator │    │   Parser   │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Canvas Manager

```typescript
// src/lib/canvas/manager.ts
interface CanvasContext {
  templateId: string;
  eventType: 'wedding' | 'birthday' | 'anniversary' | 'other';
  style: 'formal' | 'casual' | 'romantic' | 'modern';
  tone: 'elegant' | 'playful' | 'warm' | 'minimal';
  colorPalette?: string[];
  coupleInfo?: {
    partner1Name: string;
    partner2Name: string;
    story?: string;
  };
}

interface CanvasState {
  context: CanvasContext;
  generatedContent: Record<string, unknown>;
  selectedSections: string[];
  reviewStatus: 'draft' | 'reviewing' | 'approved' | 'applied';
}

export class CanvasManager {
  private context: CanvasContext;
  
  constructor(context: CanvasContext) {
    this.context = context;
  }
  
  async generateSection(sectionType: string): Promise<SectionContent> {
    const prompt = this.buildPrompt(sectionType);
    const response = await this.callAI(prompt);
    return this.parseResponse(response, sectionType);
  }
  
  async generateAll(): Promise<Record<string, SectionContent>> {
    const sections = this.getSectionTypes();
    const results = await Promise.all(
      sections.map(type => this.generateSection(type))
    );
    return Object.fromEntries(
      sections.map((type, i) => [type, results[i]])
    );
  }
  
  private buildPrompt(sectionType: string): string {
    const base = `Generate content for a ${this.context.style} ${this.context.eventType} invitation.`;
    const sectionPrompts: Record<string, string> = {
      hero: `Create elegant couple names and tagline for ${this.context.coupleInfo?.partner1Name} & ${this.context.coupleInfo?.partner2Name}`,
      venue: 'Generate venue details with ceremony and reception info',
      story: 'Create a romantic timeline of the couple\'s story',
      gallery: 'Suggest photo themes and captions',
      countdown: 'Calculate and display a compelling countdown message',
    };
    return `${base} ${sectionPrompts[sectionType] || ''}`;
  }
  
  private async callAI(prompt: string): Promise<string> {
    // Implementation using AI SDK
    return '';
  }
  
  private parseResponse(response: string, sectionType: string): SectionContent {
    // Parse and validate AI response against schema
    return JSON.parse(response);
  }
}
```

## Prompt Builder

```typescript
// src/lib/canvas/prompt-builder.ts
interface PromptOptions {
  templateSchema: TemplateContentSchema;
  userContext: CanvasContext;
  contentRequirements?: Record<string, string>;
}

export class PromptBuilder {
  static buildSystemPrompt(): string {
    return `You are an expert wedding invitation designer. Generate beautiful, 
    heartfelt content that matches the couple's style. Return valid JSON 
    matching the provided schema.`;
  }
  
  static buildUserPrompt(options: PromptOptions): string {
    const { templateSchema, userContext } = options;
    
    return `Create content for a ${userContext.style} wedding invitation.
    
    Style: ${userContext.style}
    Tone: ${userContext.tone}
    
    Couple: ${userContext.coupleInfo?.partner1Name} & ${userContext.coupleInfo?.partner2Name}
    ${userContext.coupleInfo?.story ? `Their story: ${userContext.coupleInfo.story}` : ''}
    
    Template sections to fill:
    ${templateSchema.sections.map(s => `- ${s.type}`).join('\n')}
    
    Return JSON with content for each section.`;
  }
  
  static buildSectionPrompt(
    sectionType: string,
    requirements: string
  ): string {
    return `Generate content for section: ${sectionType}
    
    Requirements: ${requirements}
    
    Return valid JSON with the exact structure:
    {
      "type": "${sectionType}",
      "content": { /* section-specific content */ },
      "suggestions": [ /* alternative options */ ]
    }`;
  }
}
```

## Content Validation

```typescript
// src/lib/canvas/validator.ts
import { z } from 'zod/v4';

// Section-specific schemas
export const heroContentSchema = z.object({
  primaryText: z.string().min(1).max(100),
  secondaryText: z.string().max(200).optional(),
  imageUrl: z.string().url().optional(),
});

export const venueContentSchema = z.object({
  ceremonyName: z.string().min(1).max(255),
  ceremonyAddress: z.string().min(1),
  ceremonyTime: z.string().regex(/^\d{1,2}:\d{2}\s*(AM|PM)$/i),
  receptionName: z.string().max(255).optional(),
  receptionAddress: z.string().optional(),
  receptionTime: z.string().optional(),
});

export const storyContentSchema = z.object({
  title: z.string().max(100).optional(),
  events: z.array(z.object({
    date: z.string(),
    title: z.string(),
    description: z.string(),
  })).min(2).max(5),
});

// Validates AI response
export function validateGeneratedContent(
  sectionType: string,
  content: unknown
): { valid: boolean; data?: unknown; error?: string } {
  const schemas: Record<string, z.ZodType> = {
    hero: heroContentSchema,
    venue: venueContentSchema,
    story: storyContentSchema,
  };
  
  const schema = schemas[sectionType];
  if (!schema) {
    return { valid: true, data: content }; // No schema, allow
  }
  
  const result = schema.safeParse(content);
  if (result.success) {
    return { valid: true, data: result.data };
  }
  
  return { 
    valid: false, 
    error: result.error.issues[0].message 
  };
}
```

## Content Store

```typescript
// src/lib/canvas/content-store.ts
interface GeneratedContent {
  id: string;
  sectionType: string;
  content: Record<string, unknown>;
  status: 'generating' | 'ready' | 'reviewed' | 'applied';
  alternatives: Record<string, unknown>[];
  metadata: {
    generatedAt: Date;
    model: string;
    tokens: number;
  };
}

export class ContentStore {
  private content: Map<string, GeneratedContent> = new Map();
  
  set(sectionType: string, content: GeneratedContent): void {
    this.content.set(sectionType, content);
  }
  
  get(sectionType: string): GeneratedContent | undefined {
    return this.content.get(sectionType);
  }
  
  getAll(): Record<string, GeneratedContent> {
    return Object.fromEntries(this.content);
  }
  
  update(sectionType: string, updates: Partial<GeneratedContent>): void {
    const existing = this.content.get(sectionType);
    if (existing) {
      this.content.set(sectionType, { ...existing, ...updates });
    }
  }
  
  apply(sectionType: string): void {
    const content = this.content.get(sectionType);
    if (content) {
      content.status = 'applied';
    }
  }
  
  clear(): void {
    this.content.clear();
  }
}
```

## AI Provider Integration

```typescript
// src/lib/canvas/provider.ts
import { generateText, streamText } from 'ai';

export interface AIProvider {
  generate(prompt: string, schema?: z.ZodType): Promise<unknown>;
  stream(prompt: string): AsyncIterable<string>;
}

export class OpenAIProvider implements AIProvider {
  async generate(prompt: string, schema?: z.ZodType) {
    const result = await generateText({
      model: 'gpt-4o',
      prompt,
      system: PromptBuilder.buildSystemPrompt(),
    });
    
    const data = JSON.parse(result.text);
    if (schema) {
      return schema.parse(data);
    }
    return data;
  }
  
  async *stream(prompt: string): AsyncIterable<string> {
    const { textStream } = await streamText({
      model: 'gpt-4o',
      prompt,
    });
    
    for await (const chunk of textStream) {
      yield chunk;
    }
  }
}
```

## UI Integration

```typescript
// src/components/builder/canvas-panel.tsx
'use client';

import { useState } from 'react';
import { CanvasManager } from '@/lib/canvas/manager';

interface CanvasPanelProps {
  templateId: string;
  onApply: (content: Record<string, unknown>) => void;
}

export function CanvasPanel({ templateId, onApply }: CanvasPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [content, setContent] = useState<Record<string, unknown> | null>(null);
  const [canvas] = useState(() => new CanvasManager({ templateId }));
  
  async function handleGenerate() {
    setIsGenerating(true);
    try {
      const result = await canvas.generateAll();
      setContent(result);
    } finally {
      setIsGenerating(false);
    }
  }
  
  function handleApply() {
    if (content) {
      onApply(content);
    }
  }
  
  return (
    <div className="canvas-panel">
      <div className="canvas-header">
        <h3>AI Content Generation</h3>
        <button onClick={handleGenerate} disabled={isGenerating}>
          {isGenerating ? 'Generating...' : 'Generate All'}
        </button>
      </div>
      
      {content && (
        <div className="canvas-preview">
          {Object.entries(content).map(([type, data]) => (
            <div key={type} className="canvas-section">
              <h4>{type}</h4>
              <pre>{JSON.stringify(data, null, 2)}</pre>
              <button onClick={() => canvas.apply(type as never)}>
                Apply to Invitation
              </button>
            </div>
          ))}
        </div>
      )}
      
      <button onClick={handleApply} disabled={!content}>
        Apply All to Invitation
      </button>
    </div>
  );
}
```

## Usage Flow

```
1. User opens canvas panel in event builder
   ↓
2. User provides context (couple names, style preferences)
   ↓
3. User clicks "Generate Content"
   ↓
4. AI generates content for all sections
   ↓
5. User reviews generated content
   ↓
6. User edits/adjusts as needed
   ↓
7. User clicks "Apply to Invitation"
   ↓
8. Content applied to event sections
```

## Best Practices

1. **Start simple** - Generate one section first, expand later
2. **Show alternatives** - Give users choice between options
3. **Allow edits** - Never force AI content, always editable
4. **Track metrics** - Monitor acceptance rate, iteration count
5. **Respect tone** - Match AI output to user's style preference