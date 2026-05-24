# Multi-language Support System Design

Date: 2026-05-23
Author: AI Agent
Status: Draft

---

## 1. Overview

System for supporting 5 languages (Vietnamese, English, Chinese, Japanese, Korean) across the wedding invitation platform.

**Scope:**
- Application-level i18n: UI labels, buttons, static text
- Database-level translations: Event metadata, section content, template descriptions
- Hybrid storage: JSONB for rich content, separate translation tables for metadata

---

## 2. Supported Languages

| Code | Language | Native Name |
|------|----------|-------------|
| `vi` | Vietnamese | Tiếng Việt |
| `en` | English | English |
| `zh` | Chinese (Simplified) | 简体中文 |
| `ja` | Japanese | 日本語 |
| `ko` | Korean | 한국어 |

---

## 3. Architecture

### 3.1 Storage Strategy

**Hybrid Approach:**

| Data Type | Storage | Example |
|-----------|---------|---------|
| UI translations | JSON file (`i18n.ts`) | Button labels, page titles |
| Metadata (short text) | Translation tables | Event name, venue name, template title |
| Rich content | JSONB in translation tables | Section content, timeline items, gallery captions |

### 3.2 Database Schema

#### Enum: `language_code`

```sql
CREATE TYPE language_code AS ENUM ('vi', 'en', 'zh', 'ja', 'ko');
```

#### Table: `event_translations`

```typescript
export const eventTranslations = pgTable("event_translations", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  language: languageCodeEnum("language").notNull(),
  // Metadata fields
  title: varchar("title", { length: 255 }),
  groomName: varchar("groom_name", { length: 100 }),
  brideName: varchar("bride_name", { length: 100 }),
  venueName: varchar("venue_name", { length: 255 }),
  venueAddress: text("venue_address"),
  description: text("description"),
  // Rich content
  thankYouNote: text("thank_you_note"),
  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  uniqueIndex("idx_event_translations_event_lang").on(table.eventId, table.language),
]);
```

#### Table: `template_translations`

```typescript
export const templateTranslations = pgTable("template_translations", {
  id: uuid("id").primaryKey().defaultRandom(),
  templateId: uuid("template_id")
    .notNull()
    .references(() => templates.id, { onDelete: "cascade" }),
  language: languageCodeEnum("language").notNull(),
  name: varchar("name", { length: 255 }),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  uniqueIndex("idx_template_translations_template_lang").on(table.templateId, table.language),
]);
```

#### Table: `section_translations`

```typescript
export const sectionTranslations = pgTable("section_translations", {
  id: uuid("id").primaryKey().defaultRandom(),
  sectionId: uuid("section_id")
    .notNull()
    .references(() => sections.id, { onDelete: "cascade" }),
  language: languageCodeEnum("language").notNull(),
  // JSONB for flexible rich content
  content: jsonb("content").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  uniqueIndex("idx_section_translations_section_lang").on(table.sectionId, table.language),
]);
```

### 3.3 Application-Level i18n

**File:** `src/lib/i18n.ts`

```typescript
export type Locale = "vi" | "en" | "zh" | "ja" | "ko";

export const translations = {
  vi: { /* existing */ },
  en: { /* existing */ },
  zh: { /* Chinese translations */ },
  ja: { /* Japanese translations */ },
  ko: { /* Korean translations */ },
} as const;
```

---

## 4. API Design

### 4.1 Language Detection

**Priority Order:**
1. Query param: `?lang=vi`
2. Cookie: `locale`
3. Accept-Language header
4. Default: `vi`

### 4.2 Endpoints

#### `GET /api/events/[id]?lang=en`

Returns event with translations for specified language.
Falls back to Vietnamese if requested language not available.

#### `GET /api/templates/[id]?lang=zh`

Returns template with translations for specified language.

#### `POST /api/events/[id]/translations`

```typescript
// Request
{
  language: "en",
  title: "Wedding of John & Jane",
  groomName: "John Doe",
  brideName: "Jane Smith",
  venueName: "Grand Ballroom",
  thankYouNote: "Thank you for attending..."
}

// Response
{ success: true, translationId: "uuid" }
```

---

## 5. UI Components

### 5.1 Language Selector

**Location:** Invitation page header
**Options:** vi | en | zh | ja | ko
**Behavior:** Sets cookie + reloads with new locale

### 5.2 Translation Input (Dashboard)

Event editor should allow:
- Primary language input (Vietnamese)
- Secondary language inputs with copy-from-primary button

---

## 6. Implementation Checklist

- [ ] Add `language_code` enum to schema
- [ ] Create `event_translations` table
- [ ] Create `template_translations` table
- [ ] Create `section_translations` table
- [ ] Expand `i18n.ts` with zh, ja, ko
- [ ] Add migration files
- [ ] Update API routes for language parameter
- [ ] Add language selector component