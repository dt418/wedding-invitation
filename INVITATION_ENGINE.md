# Invitation Engine

> Drives the public invitation rendering pipeline from a template schema definition to a fully customized guest-facing page with RSVP support.

## Design Principle

**One template engine, infinite layouts.** The system does not hardcode page structures. Instead, each template defines a list of sections with content schemas and defaults. Events layer their own content and theme overrides on top. A dynamic renderer maps section types to components at runtime.

```
Template → Sections (content_schema + defaults)
   + Event → Section Overrides (custom_content + custom_theme + visibility)
   + Variant → Color Tokens
   ↓
InviteRenderer → Dynamic component mapping → Rendered page
```

## Section System

### Section Model

From `sections` table:

- `section_type`: identifier key (e.g., `hero`, `gallery`, `countdown`)
- `content_schema`: JSON schema defining editable fields
- `default_content`: default field values
- `order`: sort order within invitation
- `is_required`: locks section as mandatory
- `is_editable`: controls whether content can be modified per event
- `animations`: animation config (entrance effects, etc.)

### Override Model

From `template_sections` table:

- `section_type`: matches base section
- `custom_content`: event-specific field overrides
- `custom_theme`: section-level color/style overrides
- `visibility`: `"visible"` | `"hidden"` | `"auto"` (future)

### Visibility Toggle

Dashboard editor (`src/components/builder/section-list.tsx`) exposes per-section hide/show toggle. Persisted to `template_sections.visibility`. Invite renderer filters `visibility === "hidden"` before display.

## Section Renderer

From `src/components/invite-renderer.tsx`:

```tsx
const sectionRenderers: Record<string, React.ComponentType<SectionProps>> = {
  hero: HeroSection,
  couple: CoupleSection,
  story: StorySection,
  // ...
};

function InviteRenderer({ sections, colorTokens, previewMode }) {
  const visible = sections.filter(s => s.visibility !== "hidden");
  return (
    <div className={previewMode === "mobile" ? "max-w-sm mx-auto" : ""}>
      {visible.map(section => {
        const Component = sectionRenderers[section.sectionType];
        return Component ? (
          <Component
            key={section.sectionType}
            content={{ ...section.defaultContent, ...section.customContent }}
            theme={{ ...colorTokens, ...section.customTheme }}
          />
        ) : null;
      })}
    </div>
  );
}
```

**Extensibility rule:** To add a new section type, add it to the `sectionRenderers` map. No new pages or templates needed.

## Invite Status Lifecycle

```
pending → sent → opened → responded
```

- `pending`: invite created, not yet delivered
- `sent`: marked as delivered via delivery method (email/sms/whatsapp/link)
- `opened`: guest visited `/invite/[code]` — status auto-updated server-side
- `responded`: guest submitted RSVP

## Analytics Pipeline

Triggered in `/api/invites/[code]` (GET):

```ts
await db.insert(analyticsEvents).values({
  eventId: invite.eventId,
  visitorId: visitorId ?? undefined,
  action: "page_view",
  metadata: { inviteId, inviteCode, status: newStatus },
});
await db.update(invites).set({ status: "opened", openedAt: new Date() }).where(...);
```

RSVP submit triggers its own analytics event in `/api/invites/[code]/rsvp`:

```ts
action: "rsvp",
metadata: { inviteId, attendance, plusOnes, dietaryRestrictions }
```

## Invite Code Generation

From `src/lib/invite-code.ts`:

```ts
const ALPHABET = "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ";
// Excludes confusing characters: I, O, L
// Length: 8 → 32^8 = ~1.1 trillion combinations
```

## Current Implementation

### What's Working
- Dynamic section rendering via type-keyed component map
- Per-event section override with visibility control
- Status auto-transition on page open
- Analytics event logging at every guest interaction point
- RSVP upsert with transactional guarantee
- Invite code entropy matches realistic collision resistance

### Known Gaps

1. **No section component implementations**: `InviteRenderer` references section components (`hero`, `couple`, etc.) but only `RsvpForm` is actually implemented. Section-specific components need to be built.

2. **No analytics aggregation**: analytics_events are inserted but no dashboard aggregates or reports them.

3. **No invite delivery**: invites are created but no actual email/SMS/whatsapp dispatch is implemented.

4. **Visitor ID is optional**: `visitorId` can be null — useful for GDPR compliance but limits tracking fidelity.

## Recommended Incremental Improvements

1. Build section components for each `section_type` defined in seed data.
2. Add an analytics aggregation endpoint or job for dashboard charts.
3. Integrate email/SMS provider (e.g., Resend, Twilio) for invite delivery.
4. Add `visitorId` population via cookie or localStorage for repeat visitor tracking.
5. Implement `delivery_method` dispatch queue if scale requires async delivery.
6. Add a `template_sections.visibility = "hidden"` fallback for sections that should be opt-in per template rather than opt-out.