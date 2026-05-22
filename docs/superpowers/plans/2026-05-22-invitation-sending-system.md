# Invitation Sending System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build invitation sending system supporting Zalo (Mini App + Bot), Email (Resend), and Messenger channels with full delivery tracking via webhooks and real-time SSE updates.

**Architecture:** Multi-channel delivery with delivery tracking, webhook integration, and SSE streaming. Database-centric with new `invite_deliveries` and `invite_send_jobs` tables. No job queue infrastructure — real-time API calls with client-side batching.

**Tech Stack:** Next.js 16, Drizzle ORM, Neon Postgres, Resend (email), Zalo API (Mini App + Bot), SSE for real-time updates.

**Status:** ✅ IMPLEMENTED

---

## File Structure

### Created Files
| File | Status |
|------|--------|
| `src/lib/zalo.ts` | ✅ Created |
| `src/lib/delivery.ts` | ✅ Created (email inline, not separate file) |
| `src/app/api/webhooks/email/route.ts` | ✅ Created |
| `src/app/api/webhooks/zalo/route.ts` | ✅ Created |
| `src/app/api/track/open/route.ts` | ✅ Created |
| `src/app/api/events/[id]/invites/send/route.ts` | ✅ Created |
| `src/app/api/events/[id]/invites/stream/route.ts` | ✅ Created |
| `src/components/send-invites-dialog.tsx` | ✅ Created |
| `src/components/invites-table.tsx` | ✅ Created |

### Not Created (Not Needed)
| File | Note |
|------|------|
| `src/db/schema/invites.ts` | Not needed - schema stays in main schema.ts |
| `src/lib/email.ts` | Email logic inline in delivery.ts |
| `src/lib/tracking.ts` | Webhook logic in separate route files |
| `src/app/api/events/[id]/invites/preview/route.ts` | Not implemented |
| `src/app/api/events/[id]/invites/share-urls/route.ts` | Not implemented |
| `src/components/invite-delivery-list.tsx` | Not implemented - current invites-table covers needs |

### Modified Files
| File | Changes |
|------|---------|
| `src/db/schema.ts` | Added enums, invite_deliveries, invite_send_jobs tables, Zalo fields on guests |
| `src/app/(dashboard)/events/[id]/invites/page.tsx` | Added send button and InvitesTable |

---

## Phase 1: Database Schema ✅

### Task 1: Add invite_deliveries and invite_send_jobs tables

**Status:** ✅ COMPLETED

**Implementation:** All enums and tables added to `src/db/schema.ts`

- [x] Add new enums (deliveryChannelEnum, deliveryStatusEnum, inviteJobsStatusEnum)
- [x] Add inviteDeliveries table with all fields
- [x] Add inviteSendJobs table with all fields
- [x] Add Zalo fields to guests table (zaloId, zaloFollowerId, zaloName)
- [x] Run migrations (drizzle/0000 through drizzle/0002)

---

## Phase 2: Zalo Integration ✅

### Task 2: Create Zalo library

**Status:** ✅ COMPLETED

**File:** `src/lib/zalo.ts`

**Functions implemented:**
- [x] `ZaloChannel` type
- [x] `ZaloSendResult` interface
- [x] `ZaloDeepLinkPayload` interface
- [x] `generateZaloMiniAppUrl()` - Zalo SDK deep link
- [x] `generateZaloBotDeepLink()` - OA deep link
- [x] `generateZaloShareUrl()` - shareable URL
- [x] `isZaloSdkAvailable()` - SDK detection
- [x] `launchZaloMiniApp()` - SDK launch with fallback
- [x] `buildZaloInviteMessage()` - message template

---

## Phase 3: Email Integration ✅

### Task 3: Email integration

**Status:** ✅ COMPLETED (inline in delivery.ts, not separate file)

**Implementation:** `buildInviteEmailHtml()` function in `src/lib/delivery.ts`

**Features:**
- [x] HTML email template with styling
- [x] Wedding couple names, date, venue display
- [x] CTA button for invite link
- [x] Tracking pixel inclusion

---

## Phase 4: Delivery Service ✅

### Task 4: Create delivery service

**Status:** ✅ COMPLETED

**File:** `src/lib/delivery.ts`

**Functions implemented:**
- [x] `DeliveryChannel` type
- [x] `SendInvitesParams` interface
- [x] `SendResult` interface
- [x] `generateIdempotencyKey()` - idempotency key generation
- [x] `sendViaEmail()` - email delivery with Resend
- [x] `sendViaZalo()` - Zalo delivery (simulated)
- [x] `buildInviteEmailHtml()` - email template builder
- [x] `sendInvites()` - main orchestration function
- [x] `getDeliveryStats()` - delivery statistics

---

## Phase 5: API Routes ✅

### Task 5: Send invites API ✅

**File:** `src/app/api/events/[id]/invites/send/route.ts`

- [x] POST endpoint with auth check
- [x] Validates inviteIds and channel
- [x] Rate limiting (max 50 per batch)
- [x] Calls sendInvites from delivery.ts
- [x] Returns jobId, counts, streamUrl

### Task 6: Tracking pixel endpoint ✅

**File:** `src/app/api/track/open/route.ts`

- [x] GET endpoint returning 1x1 GIF
- [x] Updates invite_deliveries status to 'opened'
- [x] Updates parent invites status to 'opened'

### Task 7: Webhook handlers ✅

**Files:** 
- `src/app/api/webhooks/email/route.ts` ✅
- `src/app/api/webhooks/zalo/route.ts` ✅

**Email webhook:**
- [x] Signature verification
- [x] `email_delivered` event handling
- [x] `email_opened` event handling

**Zalo webhook:**
- [x] `send_message_result` event handling
- [x] Status code mapping

### Task 8: SSE stream endpoint ✅

**File:** `src/app/api/events/[id]/invites/stream/route.ts`

- [x] GET endpoint with auth
- [x] SSE stream with `connected` event
- [x] Polling for job progress
- [x] `job_progress` events with status/counts

---

## Phase 6: UI Components ✅

### Task 9: Send Invites Dialog ✅

**File:** `src/components/send-invites-dialog.tsx`

**Features:**
- [x] Channel selection (Zalo, Email, Messenger)
- [x] Zalo type sub-selection (Mini App, Bot, Hybrid)
- [x] Guest count display
- [x] Send/Cancel buttons
- [x] Toast notifications
- [x] API integration

### Task 10: Invites Table ✅

**File:** `src/components/invites-table.tsx`

**Features:**
- [x] Checkbox selection
- [x] Select all functionality
- [x] Guest name/email display
- [x] Invite code (monospace)
- [x] Status badges with colors
- [x] Direct link to invite
- [x] SendInvitesDialog integration

### Task 11: Invites Page ✅

**File:** `src/app/(dashboard)/events/[id]/invites/page.tsx`

**Features:**
- [x] Auth check
- [x] Event ownership verification
- [x] Invites list with guest data
- [x] InvitesTable component

---

## Implementation Notes

### Completed Features

1. **Multi-channel support**: Zalo (Mini App + Bot), Email, Messenger
2. **Delivery tracking**: Full lifecycle (pending → sent → delivered → opened)
3. **Webhooks**: Email (Resend) and Zalo webhook handlers
4. **SSE streaming**: Real-time job progress updates
5. **Idempotency**: Unique keys prevent duplicate sends
6. **Rate limiting**: Max 50 invites per batch

### Known Limitations

1. **Zalo API is simulated**: Logs invite URL but doesn't actually send via Zalo OA API
2. **Messenger is client-side**: Uses Facebook Share dialog, not API
3. **No preview/share-urls endpoints**: Not implemented (not critical for MVP)
4. **No invite-delivery-list component**: Current invites-table covers needs

### Migrations

Schema changes applied via migrations:
- `drizzle/0000_steep_mach_iv.sql`
- `drizzle/0001_milky_daimon_hellstrom.sql`
- `drizzle/0002_wild_wasp.sql`

---

## Testing

To verify the implementation:

```bash
# Start dev server
pnpm dev

# Build to check for errors
pnpm build

# Run tests
pnpm test
```

### Manual Testing Steps

1. Create an event
2. Import/add guests
3. Go to invites page
4. Select invites
5. Click "Send Invites"
6. Choose channel and send
7. Check delivery status via SSE stream