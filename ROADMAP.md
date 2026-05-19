# Roadmap

> Current priorities and planned improvements. Ordered by immediate value / lowest effort.

## Phase 1 — Core Polish

### 1.1 Section Component Library
- **What**: Implement missing section renderers referenced in `invite-renderer.tsx` (`hero`, `couple`, `story`, `gallery`, `countdown`, `venue`, `wishes`, etc.)
- **Why**: Without these, the invitation engine renders no visual content beyond RSVP.
- **Effort**: Medium. Each section is a self-contained React component accepting `content` + `theme` props.

### 1.2 RSC Conversion for Landing Page
- **What**: Move static portions of `src/app/page.tsx` to Server Components; keep only scroll-animated islands as client components.
- **Why**: Landing page is 1100+ lines `use client` — hurts TTI and initial load.
- **Effort**: Low–Medium. Identify static sections, extract to separate components.

### 1.3 Analytics Dashboard
- **What**: Build `/events/[id]/analytics` page that reads `analytics_events` and renders charts.
- **Why**: Analytics are logged but never surfaced to users.
- **Effort**: Medium. Needs aggregation queries + chart component (Recharts or similar).

### 1.4 Loading / Error Boundaries
- **What**: Add `loading.tsx` and `error.tsx` for each route group.
- **Why**: Missing streaming boundaries — poor UX on slow connections.
- **Effort**: Low. Minimal skeleton UI required.

---

## Phase 2 — Guest Experience

### 2.1 Invite Delivery
- **What**: Integrate email (Resend) and WhatsApp/SMS (Twilio) for sending invites.
- **Why**: Invites are generated but not dispatched.
- **Effort**: Medium. Requires provider API keys, templating engine, delivery status tracking.

### 2.2 Repeat Visitor Tracking
- **What**: Populate `visitorId` on `/invite/[code]` via cookie or localStorage.
- **Why**: `visitorId` is optional — current tracking is single-visit only.
- **Effort**: Low. Add cookie-based fingerprinting.

### 2.3 Reminder System
- **What**: Cron job or scheduled function to send reminders for approaching events.
- **Why**: One-time invite is not enough for large guest lists.
- **Effort**: Medium. Requires scheduling infrastructure (Vercel Cron or similar).

### 2.4 QR Code Display
- **What**: Render `invites.qr_code_url` in invitation footer.
- **Why**: Field exists in DB, not rendered yet.
- **Effort**: Low. Add QR component to invitation footer section.

---

## Phase 3 — Builder Experience

### 3.1 Section Content Editor
- **What**: Form UI in dashboard edit page to modify `customContent` per section via `content_schema`.
- **Why**: Currently only visibility is editable. Content editing is the core builder value.
- **Effort**: High. Needs dynamic form generation from JSON schema definitions.

### 3.2 Guest Import Enhancements
- **What**: Add CSV validation, duplicate detection, partial import retry.
- **Why**: Current import may not handle malformed rows gracefully.
- **Effort**: Medium. Improve `guests/import` route with better error reporting.

### 3.3 Template Creation UI
- **What**: Admin interface to create new templates, define sections, and set defaults.
- **Why**: Templates are currently data-only; no UI to create them.
- **Effort**: High. Requires section type registry, schema builder, variant management.

### 3.4 Template Preview in Builder
- **What**: Live preview in the dashboard editor that reflects `customContent` changes in real time.
- **Why**: Current preview is static — reflects base template, not current edits.
- **Effort**: Medium. Requires state management bridging editor ↔ preview.

---

## Phase 4 — Scale & Reliability

### 4.1 Rate Limiting
- **What**: Add rate limiting on public invite/RSVP endpoints.
- **Why**: No protection against abuse on `/api/invites/[code]/rsvp`.
- **Effort**: Low. `@upstash/ratelimit` or similar.

### 4.2 GIN Indexes for JSONB
- **What**: Replace btree JSONB indexes with GIN for proper containment queries.
- **Why**: btree on JSONB is limited; GIN enables `@>`, `?`, `?|` operators.
- **Effort**: Low. Single migration with `using gin` clause.

### 4.3 Connection Pool Tuning
- **What**: Adjust `max` pool size per environment (serverless vs. self-hosted).
- **Why**: `max: 1` is overly conservative for self-hosted; too high for serverless.
- **Effort**: Low. Env-based config in `src/db/index.ts`.

### 4.4 Analytics Retention Policy
- **What**: Scheduled cleanup of old `analytics_events` rows.
- **Why**: Append-only table will grow unbounded.
- **Effort**: Low. PostgreSQL partition by month or `pg_cron` cleanup job.

### 4.5 CI/CD Pipeline
- **What**: GitHub Actions: lint → typecheck → build → deploy preview → deploy prod.
- **Why**: Manual deployments are error-prone.
- **Effort**: Medium. One workflow file with proper secrets management.

---

## Phase 5 — Growth

### 5.1 White Label / Agency Mode
- **What**: Allow agency users to set custom domain + logo for client-facing invites.
- **Why**: `users.white_label_domain`, `agency_logo_url` fields exist but unused.
- **Effort**: High. Requires DNS/SSL config, custom domain routing, logo injection.

### 5.2 Subscription Paywalls
- **What**: Implement tier gates on template access based on `user_subscriptions.tier`.
- **Why**: `is_premium` flag on templates exists but not enforced.
- **Effort**: Medium. Middleware or route-level guard for premium templates.

### 5.3 Multi-Language Invitations
- **What**: Store invitation language preference, load localized copy based on locale.
- **Why**: Current UI text is hardcoded Vietnamese.
- **Effort**: Medium. i18n library integration + translation data model.

### 5.4 Theme Presets
- **What**: Curated palette sets applied across templates, stored in `theme_presets` table.
- **Why**: Users want curated looks, not raw token editing.
- **Effort**: Medium. New table + preset selector UI.

---

## Backlog (Unordered)

- Dark mode for invitation rendering
- PDF export of invitation
- WhatsApp message previews
- Email open tracking (pixel)
- SMS delivery receipts
- Guest table assignment UI
- Seating chart visualization
- Export RSVP data to CSV
- Template rating / favorites
- Referral program for agencies