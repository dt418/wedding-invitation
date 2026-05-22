# Multi-language System Implementation Plan

Date: 2026-05-23
Status: Draft
Spec: `docs/superpowers/specs/2026-05-23-multilingual-system-design.md`

---

## Overview

Implement multi-language support (vi, en, zh, ja, ko) for the wedding invitation platform:
- Application-level i18n expansion
- Database translation tables
- API support for language parameter
- Language selector UI

---

## Tasks

### Phase 1: Database Schema

- [ ] **1.1** Add `language_code` enum to `src/db/schema.ts`
  ```typescript
  export const languageCodeEnum = pgEnum("language_code", [
    "vi", "en", "zh", "ja", "ko"
  ]);
  ```

- [ ] **1.2** Create `event_translations` table
  - Fields: eventId, language, title, groomName, brideName, venueName, venueAddress, description, thankYouNote
  - Index: unique on (eventId, language)

- [ ] **1.3** Create `template_translations` table
  - Fields: templateId, language, name, description
  - Index: unique on (templateId, language)

- [ ] **1.4** Create `section_translations` table
  - Fields: sectionId, language, content (JSONB)
  - Index: unique on (sectionId, language)

### Phase 2: i18n Library

- [ ] **2.1** Expand `src/lib/i18n.ts` with:
  - Add `zh`, `ja`, `ko` translation objects
  - Wedding-specific UI strings (RSVP, timeline, gallery)
  - Type safety for Locale

### Phase 3: Migrations

- [ ] **3.1** Generate migration for enum
  ```bash
  pnpm db:generate
  ```

- [ ] **3.2** Generate migrations for translation tables

- [ ] **3.3** Run migrations
  ```bash
  pnpm db:migrate
  ```

### Phase 4: API Updates

- [ ] **4.1** Update event API with `?lang=` parameter
  - Fetch translations if available
  - Fallback to default (vi) if missing

- [ ] **4.2** Update template API with `?lang=` parameter

- [ ] **4.3** Add `POST /api/events/[id]/translations` endpoint

### Phase 5: UI Components

- [ ] **5.1** Create language selector component
  - Location: invitation page header
  - Flags + language codes
  - Cookie-based persistence

- [ ] **5.2** Add translation inputs to event wizard
  - Copy-from-primary button
  - Per-field translation inputs

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/db/schema.ts` | Add enum + 3 tables |
| `src/lib/i18n.ts` | Expand to 5 languages |
| `src/app/api/events/[id]/route.ts` | Add lang parameter |
| `src/app/api/templates/route.ts` | Add lang parameter |

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/ui/language-selector.tsx` | Language picker UI |
| `src/app/api/events/[id]/translations/route.ts` | Translation CRUD |
| `src/lib/i18n-server.ts` | Server-side i18n helper |

---

## Dependencies

- Drizzle ORM (existing)
- No new packages needed

---

## Testing Checklist

- [ ] Language selector changes locale
- [ ] Event page displays translated content
- [ ] Fallback works when translation missing
- [ ] API returns correct language data
- [ ] Migrations run successfully