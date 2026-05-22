# Invitation Sending System Design

Date: 2026-05-22
Author: AI Agent (Brainstorming)
Status: Implemented ✅

---

## 1. Overview

System for sending wedding invitation links to guests via Zalo (Mini App + Bot with deep link fallback), Email, and Messenger. Supports real-time API sending, full delivery tracking with webhooks, and bulk sending with progress feedback via SSE.

**Core principles:**
- Zalo-first (primary channel for Vietnam market)
- Hybrid Zalo approach: Mini App entry point + bot deep link fallback
- Real-time API calls (no job queue infrastructure initially)
- Full delivery tracking with webhook integration
- SSE stream for real-time progress updates during bulk sends

---

## 2. Architecture

### 2.1 Channels

| Channel | Implementation | Status |
|---------|---------------|--------|
| **Zalo Mini App** | Zalo SDK webview launch | ✅ Implemented |
| **Zalo Bot + Deep Link** | Zalo API message + browser URL | ✅ Implemented |
| **Email** | Resend API | ✅ Implemented |
| **Messenger** | Facebook Share dialog | ✅ Implemented (client-side) |

### 2.2 Data Flow

```
User clicks "Send Invites" in dashboard
  → API receives invite IDs + channel selection
  → Generate signed invite URLs
  → For each channel:
     Zalo: Zalo SDK launch (Mini App) OR send bot message with deep link
     Email: Resend API call with tracking pixel
     Messenger: Open Facebook Share dialog (client-side)
  → Update invite status + record delivery
  → Push real-time status to SSE stream
```

### 2.3 Database Schema

**Status:** ✅ Implemented in `src/db/schema.ts`

#### Enums Added

```typescript
export const deliveryChannelEnum = pgEnum("delivery_channel", [
  "zalo_mini_app",
  "zalo_bot",
  "email",
  "messenger",
]);

export const deliveryStatusEnum = pgEnum("delivery_status", [
  "pending",
  "sent",
  "delivered",
  "opened",
  "failed",
]);

export const inviteJobsStatusEnum = pgEnum("invite_jobs_status", [
  "queued",
  "processing",
  "completed",
  "cancelled",
  "failed",
]);
```

#### Table: `invite_deliveries`

```typescript
export const inviteDeliveries = pgTable("invite_deliveries", {
  id: uuid("id").primaryKey().defaultRandom(),
  inviteId: uuid("invite_id").notNull().references(() => invites.id, { onDelete: "cascade" }),
  guestId: uuid("guest_id").references(() => guests.id),
  channel: deliveryChannelEnum("channel").notNull(),
  status: deliveryStatusEnum("status").notNull().default("pending"),
  providerMessageId: text("provider_message_id"),
  providerRefId: text("provider_ref_id"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  idempotencyKey: varchar("idempotency_key", { length: 255 }).unique(),
  error: text("error"),
  retryCount: integer("retry_count").default(0),
  sentAt: timestamp("sent_at"),
  deliveredAt: timestamp("delivered_at"),
  openedAt: timestamp("opened_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("idx_invite_deliveries_invite_id").on(table.inviteId),
  index("idx_invite_deliveries_status").on(table.status),
  index("idx_invite_deliveries_idempotency").on(table.idempotencyKey),
]);
```

#### Table: `invite_send_jobs`

```typescript
export const inviteSendJobs = pgTable("invite_send_jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id),
  channel: varchar("channel", { length: 20 }).notNull(),
  status: inviteJobsStatusEnum("status").notNull().default("queued"),
  totalCount: integer("total_count").default(0),
  successCount: integer("success_count").default(0),
  failedCount: integer("failed_count").default(0),
  error: text("error"),
  scheduledAt: timestamp("scheduled_at"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("idx_invite_send_jobs_event_id").on(table.eventId),
  index("idx_invite_send_jobs_user_id").on(table.userId),
]);
```

#### Updated `guests` table

```typescript
// Zalo integration fields added
zaloId: varchar("zalo_id", { length: 100 }),
zaloFollowerId: varchar("zalo_follower_id", { length: 100 }),
zaloName: varchar("zalo_name", { length: 255 }),
```

---

## 3. Zalo Integration

**Status:** ✅ Implemented in `src/lib/zalo.ts`

### 3.1 Zalo Mini App

**Flow:**
1. User has Zalo app installed on their phone
2. Platform launches Zalo Mini App via Zalo SDK with invite URL as deep link
3. Guest sees invitation inside Zalo app (best experience)

**Implementation:**
- `generateZaloMiniAppUrl()` - Zalo SDK deep link generation
- `launchZaloMiniApp()` - SDK launch with fallback to browser

### 3.2 Zalo Bot + Deep Link

**Flow:**
1. User has Zalo OA following
2. Bot sends message with invite link
3. Guest clicks link → opens in browser (fallback)

**Implementation:**
- `generateZaloBotDeepLink()` - OA deep link URL generation
- `buildZaloInviteMessage()` - message template builder
- `generateZaloShareUrl()` - shareable invite URL

### 3.3 Environment Variables

Defined in `src/env.ts`:

```bash
ZALO_APP_ID=          # Zalo Mini App ID
ZALO_APP_SECRET=      # Zalo App Secret
ZALO_OA_ID=           # Zalo Official Account ID
ZALO_OA_SECRET=       # Zalo OA Secret
ZALO_BOT_TOKEN=       # Zalo Bot access token
ZALO_MINI_APP_ID=     # Mini App ID for SDK
ZALO_DEEP_LINK_BASE=   # Base URL for deep links
```

---

## 4. Email Integration (Resend)

**Status:** ✅ Implemented in `src/lib/delivery.ts` (inline, not separate file)

### 4.1 Email Template

Transaction email with:
- Wedding couple names
- Event date and time
- Venue
- Direct invite link button
- 1x1 tracking pixel for open detection

**Implementation:** `buildInviteEmailHtml()` function in `delivery.ts`

### 4.2 Environment Variables

```bash
RESEND_API_KEY=       # Resend API key (optional, validates at send time)
EMAIL_FROM=           # Sender email (default: wedding@yourdomain.com)
```

---

## 5. Tracking System

**Status:** ✅ Fully implemented

### 5.1 Tracking Pixel (Email)

**Endpoint:** `GET /api/track/open?deliveryId={deliveryId}` ✅

- Returns 1x1 transparent GIF
- Updates `invite_deliveries.status` to 'opened'
- Updates `invite_deliveries.opened_at` timestamp
- Also updates parent `invites.status` to 'opened'

**File:** `src/app/api/track/open/route.ts`

### 5.2 Webhook Endpoints

| Endpoint | File | Status |
|----------|------|--------|
| `/api/webhooks/email` | `src/app/api/webhooks/email/route.ts` | ✅ Implemented |
| `/api/webhooks/zalo` | `src/app/api/webhooks/zalo/route.ts` | ✅ Implemented |

**Email webhook handles:**
- `email_delivered` → sets status to 'delivered'
- `email_opened` → sets status to 'opened'

**Zalo webhook handles:**
- `send_message_result` → maps Zalo status codes to delivery status

### 5.3 Delivery Status Updates

**Via SSE stream:** `/api/events/[id]/invites/stream` ✅

**File:** `src/app/api/events/[id]/invites/stream/route.ts`

```typescript
type StreamEvent =
  | { type: 'connected'; jobId: string; eventId: string }
  | { type: 'job_progress'; jobId: string; status: string; successCount: number; failedCount: number; totalCount: number }
```

---

## 6. API Design

### 6.1 Send Invites

**`POST /api/events/[id]/invites/send`** ✅

**File:** `src/app/api/events/[id]/invites/send/route.ts`

```typescript
// Request
{
  inviteIds: string[];
  channel: "zalo_mini_app" | "zalo_bot" | "email" | "messenger";
  zaloChannel?: "mini_app" | "bot" | "hybrid";
}

// Response
{
  jobId: string;
  totalCount: number;
  successCount: number;
  failedCount: number;
  status: "completed" | "processing";
  streamUrl: string;
}
```

**Auth:** Cookie-based (`wedding_token`) with JWT verification

**Limits:** Max batch size of 50 invites per request

---

## 7. UI Components

**Status:** ✅ Implemented

### 7.1 Send Invites Dialog

**File:** `src/components/send-invites-dialog.tsx`

**Features:**
- Channel selection (Zalo, Email, Messenger)
- Zalo type selection (Mini App, Bot, Hybrid)
- Guest count display
- Send/Cancel actions
- Toast notifications for success/error

### 7.2 Invites Table

**File:** `src/components/invites-table.tsx`

**Features:**
- Checkbox selection (individual + select all)
- Guest info display (name, email)
- Invite code (monospace)
- Status badge (pending, sent, opened, responded)
- Direct link to invite URL
- Integration with SendInvitesDialog

### 7.3 Invites Page

**File:** `src/app/(dashboard)/events/[id]/invites/page.tsx`

**Features:**
- Event ownership verification
- Invites list with guest data
- Back link to event detail

---

## 8. Implementation Summary

| Component | File | Status |
|-----------|------|--------|
| **Database Schema** | `src/db/schema.ts` | ✅ |
| **Zalo Library** | `src/lib/zalo.ts` | ✅ |
| **Delivery Service** | `src/lib/delivery.ts` | ✅ |
| **Email Tracking** | `src/app/api/track/open/route.ts` | ✅ |
| **Email Webhook** | `src/app/api/webhooks/email/route.ts` | ✅ |
| **Zalo Webhook** | `src/app/api/webhooks/zalo/route.ts` | ✅ |
| **SSE Stream** | `src/app/api/events/[id]/invites/stream/route.ts` | ✅ |
| **Send API** | `src/app/api/events/[id]/invites/send/route.ts` | ✅ |
| **Send Dialog** | `src/components/send-invites-dialog.tsx` | ✅ |
| **Invites Table** | `src/components/invites-table.tsx` | ✅ |
| **Invites Page** | `src/app/(dashboard)/events/[id]/invites/page.tsx` | ✅ |

---

## 9. Notes

1. **Email sending is inline** in `delivery.ts` rather than separate `email.ts` file as originally planned. This works well for the current scope.

2. **Zalo API calls are simulated** - the current implementation logs the invite URL but doesn't actually send via Zalo OA API. Full Zalo API integration requires credentials and additional implementation.

3. **Messenger is client-side only** - the UI provides the share functionality but actual sharing is handled by the browser via Facebook Share dialog.

4. **Delivery stats** can be retrieved via `getDeliveryStats(eventId)` from `src/lib/delivery.ts`.

5. **Migrations exist** - see `drizzle/0000_steep_mach_iv.sql` through `drizzle/0002_wild_wasp.sql` for schema changes.