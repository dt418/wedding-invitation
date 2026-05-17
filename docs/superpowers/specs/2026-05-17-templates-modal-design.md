# Template Gallery Modal — Design Spec

**Date:** 2026-05-17
**Author:** AI Assistant
**Status:** Approved

## Overview

Add a modal to the `/templates` page so that clicking a template card shows a details modal with two actions instead of navigating directly to create.

## Current Behavior

Template cards in `/templates` are wrapped in `<Link href="/events/new?templateId=[id]">`. Clicking a card navigates directly to the event creation page.

## New Behavior

1. Clicking a template card opens a modal showing:
   - Template thumbnail / preview image
   - Template name
   - Description
   - Category badge
   - Premium badge (if applicable)
   - Two action buttons
2. The two action buttons open new pages:
   - **Create New** → `/events/new?templateId=[templateId]`
   - **View Demo** → `/invite/[templateSlug]/demo` (preset, no auth required)
3. Modal has a close button and closes on backdrop click or Escape key.
4. On mobile, modal is bottom-sheet style. On desktop, centered dialog.

## URL Strategy

- **Create New**: `/events/new?templateId=[id]` (existing route, passes template ID as param)
- **View Demo**: `/invite/[templateSlug]/demo` — a new public route that renders the template with sample/fake data. Uses template's `slug` field.
- If a template has no slug, fall back to `/invite/[templateId]/demo` using the ID.

## Components

### TemplateCard (interactive wrapper)
- Remove `<Link>` wrapper around the card
- Add `onClick` that opens the modal with the selected template's data
- Keep card UI (image, name, badges) visually the same
- Add hover effect: scale, shadow lift

### TemplateModal (new component)
- States: `open`, `closed`
- Props: `template: TemplateWithVariants | null`, `onClose`
- Renders: backdrop + dialog
- Content:
  - Template image (large)
  - Name (h2)
  - Description paragraph
  - Category + Premium badges
  - Two buttons:
    - Primary: "Create New" (navigates to `/events/new?templateId=[id]`)
    - Secondary: "View Demo" (navigates to `/invite/[slug]/demo`)
- Keyboard: Escape closes
- Focus trap while open

### DemoPage (new route)
- Route: `/invite/[slug]/demo`
- Public (no auth required)
- Loads template by slug
- Renders a sample invite using template's section data + fake placeholder content
- Shows "Preview Mode" banner indicating this is a demo
- No RSVP submission, no guest tracking

## Implementation Steps

1. Create `src/app/invite/[slug]/demo/page.tsx` — demo preview page (public)
2. Create `src/components/templates/template-modal.tsx` — modal component
3. Modify `src/app/(dashboard)/templates/page.tsx`:
   - Convert card `<Link>` to `<div onClick>`
   - Add modal state (`selectedTemplate`)
   - Render `<TemplateModal>` with selected template
4. Add smooth transition (fade/scale) for modal open/close

## Schema Note

The demo page reads from `templates` table using `slug` field. The `templateVariants` table is not needed for demo — we use the template's base section data.

## Non-Goals

- No authentication on demo page
- No RSVP functionality on demo page
- No template editing inside modal
- Modal content is read-only; actions navigate away