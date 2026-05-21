# Invitation Sending System Design

Date: 2026-05-22
Author: AI Agent (Brainstorming)
Status: Draft

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

| Channel | Implementation | Notes |
|---------|---------------|-------|
| **Zalo Mini App** | Zalo SDK webview launch | Best UX, requires Zalo app installed |
| **Zalo Bot + Deep Link** | Zalo API message + browser URL | Fallback when Mini App unavailable |
| **Email** | Resend API | Transactional email with tracking pixel |
| **Messenger** | Facebook Share dialog | Link-only sharing |

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

### 2.3 Database Schema Changes

#### New Table: `invite_deliveries`

```sql
CREATE TABLE invite_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_id UUID NOT NULL REFERENCES invites(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES guests(id),
  channel VARCHAR(20) NOT NULL, -- 'zalo_mini_app' | 'zalo_bot' | 'email' | 'messenger'
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending' | 'sent' | 'delivered' | 'opened' | 'failed'
  provider_message_id TEXT,
  provider_ref_id TEXT,
  metadata JSONB DEFAULT '{}',
  idempotency_key VARCHAR(255) UNIQUE,
  error TEXT,
  retry_count INTEGER DEFAULT 0,
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  opened_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_invite_deliveries_invite_id ON invite_deliveries(invite_id);
CREATE INDEX idx_invite_deliveries_status ON invite_deliveries(status);
CREATE INDEX idx_invite_deliveries_idempotency ON invite_deliveries(idempotency_key);
```

#### New Table: `invite_send_jobs`

```sql
CREATE TABLE invite_send_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  channel VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'queued', -- 'queued' | 'processing' | 'completed' | 'cancelled' | 'failed'
  total_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  error TEXT,
  scheduled_at TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_invite_send_jobs_event_id ON invite_send_jobs(event_id);
CREATE INDEX idx_invite_send_jobs_user_id ON invite_send_jobs(user_id);
```

#### Update `guests` table

```sql
ALTER TABLE guests ADD COLUMN IF NOT EXISTS zalo_id VARCHAR(100);
ALTER TABLE guests ADD COLUMN IF NOT EXISTS zalo_follower_id VARCHAR(100);
ALTER TABLE guests ADD COLUMN IF NOT EXISTS zalo_name VARCHAR(255);
```

---

## 3. Zalo Integration

### 3.1 Zalo Mini App

**Flow:**
1. User has Zalo app installed on their phone
2. Platform launches Zalo Mini App via Zalo SDK with invite URL as deep link
3. Guest sees invitation inside Zalo app (best experience)

**Implementation:**
- Zalo SDK integration for launching Mini App
- Deep link URL format: `zalosdk://zalo.app/{appId}?action=open&data={encodedPayload}`
- Fallback to web browser if Zalo SDK not available

### 3.2 Zalo Bot + Deep Link

**Flow:**
1. User has Zalo OA following
2. Bot sends message with invite link
3. Guest clicks link → opens in browser (fallback)

**Implementation:**
- Zalo OA API for sending messages
- Deep link URL: `https://invite.zalo.me/{inviteCode}`
- Tracking via query parameters for attribution

### 3.3 Environment Variables

```bash
ZALO_APP_ID=          # Zalo Mini App ID
ZALO_APP_SECRET=      # Zalo App Secret
ZALO_OA_ID=           # Zalo Official Account ID
ZALO_OA_SECRET=       # Zalo OA Secret
ZALO_BOT_TOKEN=       # Zalo Bot access token
ZALO_MINI_APP_ID=     # Mini App ID for SDK
ZALO_DEEP_LINK_BASE=   # Base URL for deep links (e.g., https://invite.zalo.me)
```

---

## 4. Email Integration (Resend)

### 4.1 Email Template

Transaction email with:
- Wedding couple names
- Event date and time
- Venue
- Direct invite link button
- QR code (optional)
- 1x1 tracking pixel for open detection

### 4.2 Implementation

```typescript
// src/lib/email.ts
interface InviteEmailData {
  guestName: string;
  groomName: string;
  brideName: string;
  eventDate: string;
  eventTime: string;
  venueName: string;
  venueAddress: string;
  inviteUrl: string;
  qrCodeDataUrl?: string;
}

async function sendInviteEmail(data: InviteEmailData): Promise<void>;
```

### 4.3 Environment Variables

```bash
RESEND_API_KEY=       # Resend API key
EMAIL_FROM=           # Sender email (e.g., hello@weddingplatform.com)
```

---

## 5. Tracking System

### 5.1 Tracking Pixel (Email)

**Endpoint:** `GET /api/track/open?deliveryId={deliveryId}`

- Returns 1x1 transparent GIF
- Updates `invite_deliveries.status` to 'opened'
- Updates `invite_deliveries.opened_at` timestamp

### 5.2 Webhook Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/webhooks/email` | POST | Resend webhook for email delivery/open |
| `/api/webhooks/zalo` | POST | Zalo OA webhook for message status |

### 5.3 Delivery Status Updates

**Via SSE stream:** `/api/events/[id]/invites/stream`
```typescript
type StreamEvent =
  | { type: 'delivery_updated'; deliveryId: string; status: string; timestamp: string }
  | { type: 'delivery_opened'; deliveryId: string; timestamp: string }
  | { type: 'job_progress'; jobId: string; sent: number; total: number }
```

---

## 6. API Design

### 6.1 Send Invites

**`POST /api/events/[id]/invites/send`**

```typescript
// Request
{
  inviteIds: string[];           // Specific invites to send (mutually exclusive with guestIds)
  guestIds?: string[];          // Send to all invites of these guests
  channel: 'zalo' | 'email' | 'messenger' | 'all';
  zaloChannel?: 'mini_app' | 'bot' | 'hybrid';
  scheduledAt?: string;          // ISO timestamp for scheduled sends
}

// Response (202 Accepted for async)
{
  jobId: string;                // For tracking via SSE
  totalCount: number;
  channel: string;
  status: 'queued' | 'processing';
  streamUrl: string;            // SSE endpoint for real-time updates
}
```

### 6.2 Preview Invite Link

**`POST /api/events/[id]/invites/preview`**

```typescript
// Request
{
  inviteId: string;
  channel: 'zalo' | 'email' | 'messenger';
}

// Response
{
  previewUrl: string;           // Pre-signed URL for preview
  shareUrl: string;             // Actual share URL
  shortUrl?: string;            // Shortened URL (optional)
}
```

### 6.3 Get Share URLs

**`GET /api/events/[id]/invites/share-urls`**

```typescript
// Response
{
  invites: Array<{
    inviteId: string;
    guestName: string;
    channels: {
      zalo: { miniAppUrl: string; botMessage: string; deepLink: string };
      email: string;
      messenger: string;
    };
  }>;
}
```

### 6.4 Cancel Send Job

**`POST /api/invite-jobs/[id]/cancel`**

```typescript
// Response
{
  jobId: string;
  status: 'cancelled';
  cancelledCount: number;  // How many were cancelled before sending
}
```

---

## 7. UI Design

### 7.1 Send Invites Modal

**Trigger:** "Gửi thiệp" button in invite list page

**Steps:**
1. **Channel Selection** (single page)
   - Radio group: Zalo (default), Email, Messenger, All
   - Zalo sub-options: Mini App / Bot / Hybrid
   - Guest filter: All, Pending only, Sent only

2. **Preview & Confirm**
   - Show selected invite count
   - Preview message for each channel
   - "Send Now" or "Schedule" buttons

3. **Progress View**
   - Real-time progress bar
   - Success/fail counters
   - Cancel button (if job is running)
   - SSE stream for live updates

### 7.2 Invite List Table

Columns:
- Guest name + contact info
- Invite code
- Status (pending/sent/delivered/opened/responded)
- Channel icons (what was sent via)
- Actions: Send, Preview, Copy Link, View Details

### 7.3 Guest Detail Drawer

**Slide-over panel showing:**
- Guest info (name, email, phone, Zalo ID)
- All invite deliveries with status timeline
- Send actions per channel
- RSVP response

---

## 8. Security

### 8.1 Signed Invite URLs

- Invite URL format: `/invite/{code}?sig={signature}&exp={expiry}`
- Signature: HMAC-SHA256(inviteCode + antiEnumCode + expiry, secret)
- Anti-enum code: per-invite random string (stored in DB)
- Expiry: 7 days default, configurable

### 8.2 Idempotency

- Each send attempt generates unique idempotency key
- Key format: `{inviteId}-{channel}-{timestamp}`
- Database constraint prevents duplicate sends
- Client can safely retry on failure

### 8.3 Rate Limiting

- Zalo API: 100 requests/minute per OA
- Resend: Based on plan limits
- Implement client-side rate limiting for bulk sends

---

## 9. Error Handling

### 9.1 Retry Strategy

| Error Type | Retry Behavior |
|-----------|----------------|
| Network timeout | Immediate retry (1x) |
| Rate limit | Exponential backoff (1m, 5m, 15m) |
| Invalid recipient | No retry, mark failed |
| Auth failure | No retry, alert admin |

### 9.2 Failure UI

- Show error message with retry option
- Allow manual retry for individual invites
- Log all errors for debugging

---

## 10. Testing Strategy

### 10.1 Unit Tests

- `invite-code.ts`: Code generation, URL signing
- `delivery-service.ts`: Channel dispatch logic
- `tracking-service.ts`: Status updates

### 10.2 Integration Tests

- Mock Zalo API responses
- Mock Resend webhook delivery
- Test SSE stream delivery

### 10.3 E2E Tests

- Complete send flow: select invites → send → verify delivery
- Webhook handling: delivery receipt → status update

---

## 11. Implementation Order

1. **Phase 1: Core Infrastructure**
   - Database schema (invite_deliveries, invite_send_jobs)
   - Environment variables for Zalo and Resend
   - Basic API routes structure

2. **Phase 2: Zalo Integration**
   - Zalo SDK integration (Mini App launch)
   - Zalo Bot API for messaging
   - Deep link URL generation

3. **Phase 3: Email Integration**
   - Resend API integration
   - Email template creation
   - Tracking pixel endpoint

4. **Phase 4: Delivery Tracking**
   - Webhook endpoints
   - SSE stream for real-time updates
   - Delivery status UI

5. **Phase 5: UI & Polish**
   - Send invites modal
   - Invite list table improvements
   - Guest detail drawer

---

## 12. Open Questions

1. Zalo Mini App ID and credentials from user
2. Whether to use short URLs (need URL shortener service)
3. Maximum batch size for real-time sends (recommend 50)
4. Whether to support SMS as fallback