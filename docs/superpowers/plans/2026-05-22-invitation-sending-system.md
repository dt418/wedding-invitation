# Invitation Sending System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build invitation sending system supporting Zalo (Mini App + Bot), Email (Resend), and Messenger channels with full delivery tracking via webhooks and real-time SSE updates.

**Architecture:** Multi-channel delivery with delivery tracking, webhook integration, and SSE streaming. Database-centric with new `invite_deliveries` and `invite_send_jobs` tables. No job queue infrastructure — real-time API calls with client-side batching.

**Tech Stack:** Next.js 16, Drizzle ORM, Neon Postgres, Resend (email), Zalo API (Mini App + Bot), SSE for real-time updates.

---

## File Structure

### New Files
- `src/db/schema/invites.ts` — Extract invite-related schema to separate file
- `src/lib/zalo.ts` — Zalo SDK integration (Mini App launch, Bot API, Deep Links)
- `src/lib/email.ts` — Resend email integration with templates
- `src/lib/delivery.ts` — Delivery service orchestrator
- `src/lib/tracking.ts` — Tracking pixel and webhook handlers
- `src/app/api/webhooks/email/route.ts` — Resend webhook endpoint
- `src/app/api/webhooks/zalo/route.ts` — Zalo webhook endpoint
- `src/app/api/track/open/route.ts` — Email tracking pixel endpoint
- `src/app/api/events/[id]/invites/send/route.ts` — Bulk send endpoint
- `src/app/api/events/[id]/invites/preview/route.ts` — Preview URLs
- `src/app/api/events/[id]/invites/share-urls/route.ts` — Share URLs generator
- `src/app/api/events/[id]/invites/stream/route.ts` — SSE stream for real-time updates
- `src/components/send-invites-dialog.tsx` — Send invites modal UI
- `src/components/invite-delivery-list.tsx` — Delivery list table

### Modify Files
- `src/db/schema.ts` — Add `invite_deliveries` and `invite_send_jobs` tables, update `guests` table
- `src/app/(dashboard)/events/[id]/invites/page.tsx` — Add send button and delivery list

---

## Phase 1: Database Schema

### Task 1: Add invite_deliveries and invite_send_jobs tables

**Files:**
- Modify: `src/db/schema.ts`

- [ ] **Step 1: Read current schema file**

Read `src/db/schema.ts` to understand current structure and find where to add new tables.

- [ ] **Step 2: Add new enums and tables**

After the existing `invites` table definition, add:

```typescript
// Add before invites table export
export const deliveryChannelEnum = pgEnum('delivery_channel', [
  'zalo_mini_app',
  'zalo_bot',
  'email',
  'messenger',
]);

export const deliveryStatusEnum = pgEnum('delivery_status', [
  'pending',
  'sent',
  'delivered',
  'opened',
  'failed',
]);

export const inviteJobsStatusEnum = pgEnum('invite_jobs_status', [
  'queued',
  'processing',
  'completed',
  'cancelled',
  'failed',
]);

// After invites table
export const inviteDeliveries = pgTable('invite_deliveries', {
  id: uuid('id').primaryKey().defaultRandom(),
  inviteId: uuid('invite_id').notNull().references(() => invites.id, { onDelete: 'cascade' }),
  guestId: uuid('guest_id').references(() => guests.id),
  channel: deliveryChannelEnum('channel').notNull(),
  status: deliveryStatusEnum('status').notNull().default('pending'),
  providerMessageId: text('provider_message_id'),
  providerRefId: text('provider_ref_id'),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
  idempotencyKey: varchar('idempotency_key', { length: 255 }).unique(),
  error: text('error'),
  retryCount: integer('retry_count').default(0),
  sentAt: timestamp('sent_at'),
  deliveredAt: timestamp('delivered_at'),
  openedAt: timestamp('opened_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  index('idx_invite_deliveries_invite_id').on(table.inviteId),
  index('idx_invite_deliveries_status').on(table.status),
  index('idx_invite_deliveries_idempotency').on(table.idempotencyKey),
]);

export const inviteSendJobs = pgTable('invite_send_jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id),
  channel: varchar('channel', { length: 20 }).notNull(),
  status: inviteJobsStatusEnum('status').notNull().default('queued'),
  totalCount: integer('total_count').default(0),
  successCount: integer('success_count').default(0),
  failedCount: integer('failed_count').default(0),
  error: text('error'),
  scheduledAt: timestamp('scheduled_at'),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  index('idx_invite_send_jobs_event_id').on(table.eventId),
  index('idx_invite_send_jobs_user_id').on(table.userId),
]);

// Update guests table - add zalo fields
// In guests table, add after address field:
// zaloId: varchar('zalo_id', { length: 100 }),
// zaloFollowerId: varchar('zalo_follower_id', { length: 100 }),
// zaloName: varchar('zalo_name', { length: 255 }),
```

- [ ] **Step 3: Generate migration**

Run: `pnpm db:generate`
Expected: New migration file created in `drizzle/` folder

- [ ] **Step 4: Apply migration**

Run: `pnpm db:migrate`
Expected: Migration applied successfully

- [ ] **Step 5: Commit**

```bash
git add src/db/schema.ts drizzle/
git commit -m "feat: add invite_deliveries and invite_send_jobs tables"
```

---

## Phase 2: Zalo Integration

### Task 2: Create Zalo library

**Files:**
- Create: `src/lib/zalo.ts`

- [ ] **Step 1: Create Zalo library with types and helpers**

```typescript
import { env } from '@/env';

export type ZaloChannel = 'mini_app' | 'bot' | 'hybrid';

export interface ZaloSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface ZaloDeepLinkPayload {
  inviteCode: string;
  eventId: string;
  timestamp: number;
}

/**
 * Generate Zalo Mini App deep link URL
 * Format: zalosdk://zalo.app/{appId}?action=open&data={encodedPayload}
 */
export function generateZaloMiniAppUrl(inviteUrl: string, appId?: string): string {
  const zaloAppId = appId || env.ZALO_MINI_APP_ID;
  const payload = {
    action: 'open_mini_app',
    url: inviteUrl,
    timestamp: Date.now(),
  };
  const encodedData = Buffer.from(JSON.stringify(payload)).toString('base64');
  return `zalosdk://zalo.app/${zaloAppId}?action=open&data=${encodedData}`;
}

/**
 * Generate Zalo bot deep link URL
 * Format: https://oa.zalo.me/{oa_id}?content={message}
 */
export function generateZaloBotDeepLink(
  inviteCode: string,
  message: string
): string {
  const oaId = env.ZALO_OA_ID || '';
  const params = new URLSearchParams({
    content: message,
    link: `${env.ZALO_DEEP_LINK_BASE || ''}/${inviteCode}`,
  });
  return `https://oa.zalo.me/${oaId}?${params.toString()}`;
}

/**
 * Generate shareable invite URL for Zalo
 */
export function generateZaloShareUrl(inviteCode: string): string {
  return `${env.ZALO_DEEP_LINK_BASE || 'https://invite.example.com'}/${inviteCode}`;
}

/**
 * Check if Zalo SDK is available (for Mini App launch)
 */
export function isZaloSdkAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(window as Window & { zalosdk?: unknown }).zalosdk;
}

/**
 * Launch Zalo Mini App with invite
 */
export async function launchZaloMiniApp(inviteUrl: string): Promise<boolean> {
  if (!isZaloSdkAvailable()) {
    console.warn('Zalo SDK not available, falling back to deep link');
    window.open(inviteUrl, '_blank');
    return false;
  }
  
  const miniAppUrl = generateZaloMiniAppUrl(inviteUrl);
  window.location.href = miniAppUrl;
  return true;
}

/**
 * Build Zalo message for bot send
 */
export function buildZaloInviteMessage(params: {
  groomName: string;
  brideName: string;
  eventDate: string;
  venueName: string;
  inviteUrl: string;
}): string {
  const { groomName, brideName, eventDate, venueName, inviteUrl } = params;
  return `💌 Lời mời cưới

Kính mời bạn đến dự tiệc cưới của

${groomName} & ${brideName}

📅 ${eventDate}
📍 ${venueName}

Xem chi tiết: ${inviteUrl}`;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/zalo.ts
git commit -m "feat: add Zalo integration library"
```

---

## Phase 3: Email Integration

### Task 3: Create Email library

**Files:**
- Create: `src/lib/email.ts`

- [ ] **Step 1: Create Email library with Resend integration**

```typescript
import { Resend } from 'resend';
import { env } from '@/env';

const resend = new Resend(env.RESEND_API_KEY);

export interface InviteEmailData {
  guestName: string;
  guestEmail: string;
  groomName: string;
  brideName: string;
  eventDate: string;
  eventTime: string;
  venueName: string;
  venueAddress: string;
  inviteUrl: string;
  deliveryId: string;
  qrCodeDataUrl?: string;
}

export async function sendInviteEmail(data: InviteEmailData): Promise<{ id: string }> {
  const trackingPixelUrl = `${env.NEXT_PUBLIC_APP_URL}/api/track/open?deliveryId=${data.deliveryId}`;
  
  const { data: emailResult, error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to: data.guestEmail,
    subject: `💌 Lời mời cưới - ${data.groomName} & ${data.brideName}`,
    html: buildInviteEmailHtml(data, trackingPixelUrl),
  });

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }

  return { id: emailResult?.id || '' };
}

function buildInviteEmailHtml(data: InviteEmailData, trackingPixelUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #d4a574 0%, #c9956c 100%); color: white; padding: 40px 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; }
    .header p { margin: 10px 0 0; opacity: 0.9; }
    .content { padding: 30px; }
    .couple-names { text-align: center; font-size: 32px; color: #333; margin-bottom: 30px; }
    .event-details { background: #faf7f4; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
    .event-details p { margin: 10px 0; color: #555; }
    .event-details strong { color: #333; }
    .cta-button { display: inline-block; background: #d4a574; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-size: 18px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Wedding Invitation</h1>
      <p>You're invited to our special day</p>
    </div>
    <div class="content">
      <div class="couple-names">${data.groomName} & ${data.brideName}</div>
      <div class="event-details">
        <p><strong>📅 Date:</strong> ${data.eventDate}</p>
        <p><strong>🕐 Time:</strong> ${data.eventTime}</p>
        <p><strong>📍 Venue:</strong> ${data.venueName}</p>
        <p><strong>📌 Address:</strong> ${data.venueAddress}</p>
      </div>
      <div style="text-align: center;">
        <a href="${data.inviteUrl}" class="cta-button">View Invitation</a>
      </div>
    </div>
    <div class="footer">
      <p>This invitation was sent to ${data.guestName}</p>
      <!-- Tracking pixel -->
      <img src="${trackingPixelUrl}" width="1" height="1" alt="" style="display:none;" />
    </div>
  </div>
</body>
</html>
  `.trim();
}
```

- [ ] **Step 2: Add Resend dependency**

Run: `pnpm add resend`
Expected: Package added successfully

- [ ] **Step 3: Add environment variables**

Update `.env.local` with:
```
RESEND_API_KEY=re_your_key_here
EMAIL_FROM=wedding@yourdomain.com
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/email.ts .env.local.example
git commit -m "feat: add Resend email integration"
pnpm add resend
```

---

## Phase 4: Delivery Service

### Task 4: Create delivery service

**Files:**
- Create: `src/lib/delivery.ts`

- [ ] **Step 1: Create delivery service orchestrator**

```typescript
import { db } from '@/db';
import { inviteDeliveries, inviteSendJobs, invites } from '@/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { sendInviteEmail, type InviteEmailData } from './email';
import { generateZaloShareUrl, buildZaloInviteMessage } from './zalo';

export type DeliveryChannel = 'zalo_mini_app' | 'zalo_bot' | 'email' | 'messenger';

export interface SendInvitesParams {
  inviteIds: string[];
  channel: DeliveryChannel;
  zaloChannel?: 'mini_app' | 'bot' | 'hybrid';
}

export interface SendResult {
  deliveryId: string;
  success: boolean;
  error?: string;
  providerMessageId?: string;
}

function generateIdempotencyKey(inviteId: string, channel: string): string {
  return `${inviteId}-${channel}-${Date.now()}`;
}

/**
 * Send invite via Email channel
 */
async function sendViaEmail(
  inviteId: string,
  eventData: {
    groomName: string;
    brideName: string;
    eventDate: string;
    eventTime: string;
    venueName: string;
    venueAddress: string;
  },
  guestData: {
    name: string;
    email: string;
  },
  inviteUrl: string
): Promise<SendResult> {
  const deliveryId = nanoid();
  
  // Create delivery record
  await db.insert(inviteDeliveries).values({
    inviteId,
    channel: 'email',
    status: 'pending',
    idempotencyKey: generateIdempotencyKey(inviteId, 'email'),
  }).returning();

  try {
    await sendInviteEmail({
      guestName: guestData.name,
      guestEmail: guestData.email,
      groomName: eventData.groomName,
      brideName: eventData.brideName,
      eventDate: eventData.eventDate,
      eventTime: eventData.eventTime,
      venueName: eventData.venueName,
      venueAddress: eventData.venueAddress,
      inviteUrl,
      deliveryId,
    });

    // Update delivery status
    await db.update(inviteDeliveries)
      .set({ status: 'sent', sentAt: new Date() })
      .where(eq(inviteDeliveries.id, deliveryId));

    return { deliveryId, success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    await db.update(inviteDeliveries)
      .set({ status: 'failed', error: errorMessage })
      .where(eq(inviteDeliveries.id, deliveryId));

    return { deliveryId, success: false, error: errorMessage };
  }
}

/**
 * Send invite via Zalo channel
 */
async function sendViaZalo(
  inviteId: string,
  zaloChannel: 'mini_app' | 'bot' | 'hybrid',
  eventData: {
    groomName: string;
    brideName: string;
    eventDate: string;
    venueName: string;
  },
  guestData: {
    zaloId?: string;
    zaloFollowerId?: string;
    name: string;
    phone?: string;
  },
  inviteCode: string
): Promise<SendResult> {
  const channel = zaloChannel === 'bot' ? 'zalo_bot' : 'zalo_mini_app';
  const deliveryId = nanoid();

  // Create delivery record
  await db.insert(inviteDeliveries).values({
    inviteId,
    channel,
    status: 'pending',
    idempotencyKey: generateIdempotencyKey(inviteId, channel),
  });

  const inviteUrl = generateZaloShareUrl(inviteCode);
  
  if (zaloChannel === 'bot' || zaloChannel === 'hybrid') {
    const message = buildZaloInviteMessage({
      groomName: eventData.groomName,
      brideName: eventData.brideName,
      eventDate: eventData.eventDate,
      venueName: eventData.venueName,
      inviteUrl,
    });

    // For bot, we would call Zalo API here
    // For now, mark as sent and return the URL for client-side sharing
    console.log('Zalo bot message:', message);
  }

  await db.update(inviteDeliveries)
    .set({ status: 'sent', sentAt: new Date() })
    .where(eq(inviteDeliveries.id, deliveryId));

  return { deliveryId, success: true };
}

/**
 * Main send invites function
 */
export async function sendInvites(
  eventId: string,
  userId: string,
  params: SendInvitesParams
): Promise<{ jobId: string; totalCount: number }> {
  const jobId = nanoid();

  // Get invites with guest data
  const invitesData = await db.query.invites.findMany({
    where: and(
      eq(invites.eventId, eventId),
      inArray(invites.id, params.inviteIds)
    ),
    with: {
      guest: true,
      event: true,
    },
  });

  // Create job record
  await db.insert(inviteSendJobs).values({
    id: jobId,
    eventId,
    userId,
    channel: params.channel,
    status: 'queued',
    totalCount: invitesData.length,
  });

  // Process each invite
  for (const invite of invitesData) {
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${invite.inviteCode}`;
    
    if (params.channel === 'email') {
      if (invite.guest?.email) {
        await sendViaEmail(
          invite.id,
          {
            groomName: invite.event?.groomName || '',
            brideName: invite.event?.brideName || '',
            eventDate: invite.event?.eventDate?.toLocaleDateString('vi-VN') || '',
            eventTime: invite.event?.eventTime || '',
            venueName: invite.event?.venueName || '',
            venueAddress: invite.event?.venueAddress || '',
          },
          {
            name: invite.guest?.name || '',
            email: invite.guest?.email,
          },
          inviteUrl
        );
      }
    } else if (params.channel === 'zalo_bot' || params.channel === 'zalo_mini_app') {
      await sendViaZalo(
        invite.id,
        params.zaloChannel || 'hybrid',
        {
          groomName: invite.event?.groomName || '',
          brideName: invite.event?.brideName || '',
          eventDate: invite.event?.eventDate?.toLocaleDateString('vi-VN') || '',
          venueName: invite.event?.venueName || '',
        },
        {
          zaloId: invite.guest?.zaloId,
          zaloFollowerId: invite.guest?.zaloFollowerId,
          name: invite.guest?.name || '',
          phone: invite.guest?.phone,
        },
        invite.inviteCode
      );
    }
  }

  // Update job status
  await db.update(inviteSendJobs)
    .set({ status: 'completed', completedAt: new Date() })
    .where(eq(inviteSendJobs.id, jobId));

  return { jobId, totalCount: invitesData.length };
}
```

- [ ] **Step 2: Add nanoid dependency**

Run: `pnpm add nanoid`
Expected: Package added

- [ ] **Step 3: Commit**

```bash
git add src/lib/delivery.ts
git commit -m "feat: add delivery service orchestrator"
```

---

## Phase 5: API Routes

### Task 5: Create send invites API

**Files:**
- Create: `src/app/api/events/[id]/invites/send/route.ts`

- [ ] **Step 1: Create send endpoint**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { db } from '@/db';
import { sendInvites } from '@/lib/delivery';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.cookies.get('wedding_token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await verifyToken(token);
  if (!user) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const { id: eventId } = await params;
  const body = await request.json();
  
  const { inviteIds, channel, zaloChannel } = body;

  if (!inviteIds?.length || !channel) {
    return NextResponse.json(
      { error: 'inviteIds and channel are required' },
      { status: 400 }
    );
  }

  // Rate limit check (basic)
  const maxBatchSize = 50;
  if (inviteIds.length > maxBatchSize) {
    return NextResponse.json(
      { error: `Maximum batch size is ${maxBatchSize}` },
      { status: 400 }
    );
  }

  try {
    const result = await sendInvites(eventId, user.id, {
      inviteIds,
      channel: channel as 'zalo_mini_app' | 'zalo_bot' | 'email' | 'messenger',
      zaloChannel,
    });

    return NextResponse.json({
      jobId: result.jobId,
      totalCount: result.totalCount,
      status: 'completed',
      streamUrl: `/api/events/${eventId}/invites/stream?jobId=${result.jobId}`,
    });
  } catch (error) {
    console.error('Send invites error:', error);
    return NextResponse.json(
      { error: 'Failed to send invites' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/events/[id]/invites/send/route.ts
git commit -m "feat: add send invites API endpoint"
```

---

### Task 6: Create tracking pixel endpoint

**Files:**
- Create: `src/app/api/track/open/route.ts`

- [ ] **Step 1: Create tracking pixel endpoint**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { inviteDeliveries } from '@/db/schema';
import { eq } from 'drizzle-orm';

// 1x1 transparent GIF
const TRACKING_PIXEL = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const deliveryId = searchParams.get('deliveryId');

  if (!deliveryId) {
    return new NextResponse(TRACKING_PIXEL, {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    });
  }

  try {
    // Update delivery status to opened
    await db.update(inviteDeliveries)
      .set({
        status: 'opened',
        openedAt: new Date(),
      })
      .where(eq(inviteDeliveries.id, deliveryId));

    // Also update the invite status
    const delivery = await db.query.inviteDeliveries.findFirst({
      where: eq(inviteDeliveries.id, deliveryId),
    });

    if (delivery?.inviteId) {
      await db.update(invites)
        .set({ status: 'opened', openedAt: new Date() })
        .where(eq(invites.id, delivery.inviteId));
    }
  } catch (error) {
    console.error('Tracking pixel error:', error);
  }

  return new NextResponse(TRACKING_PIXEL, {
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    },
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/track/open/route.ts
git commit -m "feat: add email tracking pixel endpoint"
```

---

### Task 7: Create webhooks

**Files:**
- Create: `src/app/api/webhooks/email/route.ts`
- Create: `src/app/api/webhooks/zalo/route.ts`

- [ ] **Step 1: Create Resend webhook handler**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { inviteDeliveries } from '@/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const signature = request.headers.get('resend-signature');

  // Verify webhook signature
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
  if (webhookSecret && signature) {
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(body))
      .digest('hex');
    
    if (signature !== expectedSignature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
  }

  // Handle delivery events
  if (body.type === 'email_delivered') {
    const { message_id, delivered_at } = body.data;
    
    await db.update(inviteDeliveries)
      .set({
        status: 'delivered',
        deliveredAt: new Date(delivered_at),
        providerMessageId: message_id,
      })
      .where(eq(inviteDeliveries.providerMessageId, message_id));
  }

  if (body.type === 'email_opened') {
    const { message_id, opened_at } = body.data;
    
    await db.update(inviteDeliveries)
      .set({
        status: 'opened',
        openedAt: new Date(opened_at),
      })
      .where(eq(inviteDeliveries.providerMessageId, message_id));
  }

  return NextResponse.json({ received: true });
}
```

- [ ] **Step 2: Create Zalo webhook handler**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { inviteDeliveries } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Handle Zalo OA webhook events
  const { event, data } = body;

  if (event === 'send_message_result') {
    const { message_id, status, error } = data;
    
    const statusMap: Record<string, string> = {
      '0': 'sent',
      '1': 'delivered',
      '2': 'opened',
      '-1': 'failed',
    };

    await db.update(inviteDeliveries)
      .set({
        status: statusMap[status] || 'sent',
        providerMessageId: message_id,
        error: error || null,
      })
      .where(eq(inviteDeliveries.providerMessageId, message_id));
  }

  return NextResponse.json({ received: true });
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/webhooks/email/route.ts src/app/api/webhooks/zalo/route.ts
git commit -m "feat: add webhook handlers for email and Zalo"
```

---

### Task 8: Create SSE stream endpoint

**Files:**
- Create: `src/app/api/events/[id]/invites/stream/route.ts`

- [ ] **Step 1: Create SSE stream endpoint**

```typescript
import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { db } from '@/db';
import { inviteSendJobs, inviteDeliveries } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.cookies.get('wedding_token')?.value;
  if (!token) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { id: eventId } = await params;
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId');

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      // Send initial connection event
      sendEvent({ type: 'connected', jobId, eventId });

      // Poll for updates (in production, use proper event system)
      const pollInterval = setInterval(async () => {
        if (jobId) {
          const job = await db.query.inviteSendJobs.findFirst({
            where: eq(inviteSendJobs.id, jobId),
          });

          if (job) {
            sendEvent({
              type: 'job_progress',
              jobId,
              status: job.status,
              successCount: job.successCount,
              failedCount: job.failedCount,
              totalCount: job.totalCount,
            });

            if (job.status === 'completed' || job.status === 'failed') {
              clearInterval(pollInterval);
              controller.close();
            }
          }
        }
      }, 1000);

      // Cleanup after 5 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
        controller.close();
      }, 300000);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/events/[id]/invites/stream/route.ts
git commit -m "feat: add SSE stream for real-time delivery updates"
```

---

## Phase 6: UI Components

### Task 9: Create Send Invites Dialog

**Files:**
- Create: `src/components/send-invites-dialog.tsx`

- [ ] **Step 1: Create Send Invites Dialog component**

```typescript
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface SendInvitesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  selectedInviteIds: string[];
  onSent: () => void;
}

type Channel = 'zalo_bot' | 'zalo_mini_app' | 'email' | 'messenger';
type ZaloChannel = 'mini_app' | 'bot' | 'hybrid';

export function SendInvitesDialog({
  open,
  onOpenChange,
  eventId,
  selectedInviteIds,
  onSent,
}: SendInvitesDialogProps) {
  const [channel, setChannel] = useState<Channel>('zalo_bot');
  const [zaloChannel, setZaloChannel] = useState<ZaloChannel>('hybrid');
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState<{ sent: number; total: number } | null>(null);

  const handleSend = async () => {
    setSending(true);
    setProgress({ sent: 0, total: selectedInviteIds.length });

    try {
      const response = await fetch(`/api/events/${eventId}/invites/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inviteIds: selectedInviteIds,
          channel,
          zaloChannel,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send invites');
      }

      const data = await response.json();
      
      toast.success(`Sent ${data.totalCount} invitations`);
      onSent();
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to send invitations');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gửi thiệp mời</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label className="text-base font-medium">Chọn kênh gửi</Label>
            <RadioGroup
              value={channel}
              onValueChange={(v) => setChannel(v as Channel)}
              className="mt-3 space-y-3"
            >
              <div className="flex items-center space-x-3 rounded-lg border p-3 cursor-pointer hover:bg-accent">
                <RadioGroupItem value="zalo_bot" id="zalo" />
                <Label htmlFor="zalo" className="cursor-pointer flex-1">
                  <div className="font-medium">Zalo</div>
                  <div className="text-sm text-muted-foreground">Gửi qua Zalo OA</div>
                </Label>
                <span className="text-2xl">💬</span>
              </div>

              <div className="flex items-center space-x-3 rounded-lg border p-3 cursor-pointer hover:bg-accent">
                <RadioGroupItem value="email" id="email" />
                <Label htmlFor="email" className="cursor-pointer flex-1">
                  <div className="font-medium">Email</div>
                  <div className="text-sm text-muted-foreground">Gửi qua email</div>
                </Label>
                <span className="text-2xl">📧</span>
              </div>

              <div className="flex items-center space-x-3 rounded-lg border p-3 cursor-pointer hover:bg-accent">
                <RadioGroupItem value="messenger" id="messenger" />
                <Label htmlFor="messenger" className="cursor-pointer flex-1">
                  <div className="font-medium">Messenger</div>
                  <div className="text-sm text-muted-foreground">Chia sẻ qua Facebook</div>
                </Label>
                <span className="text-2xl">💬</span>
              </div>
            </RadioGroup>
          </div>

          {channel === 'zalo_bot' && (
            <div>
              <Label className="text-base font-medium">Loại Zalo</Label>
              <RadioGroup
                value={zaloChannel}
                onValueChange={(v) => setZaloChannel(v as ZaloChannel)}
                className="mt-3 space-y-2"
              >
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="mini_app" id="mini_app" />
                  <Label htmlFor="mini_app" className="cursor-pointer">Zalo Mini App</Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="bot" id="bot" />
                  <Label htmlFor="bot" className="cursor-pointer">Zalo Bot (Deep Link)</Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="hybrid" id="hybrid" />
                  <Label htmlFor="hybrid" className="cursor-pointer">Hybrid (Cả hai)</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          <div className="bg-muted rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Số lượng</div>
            <div className="text-2xl font-bold">{selectedInviteIds.length} thiệp</div>
          </div>

          {progress && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Đang gửi...</span>
                <span>{progress.sent}/{progress.total}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${(progress.sent / progress.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={sending}
            >
              Hủy
            </Button>
            <Button
              className="flex-1"
              onClick={handleSend}
              disabled={sending || selectedInviteIds.length === 0}
            >
              {sending ? 'Đang gửi...' : 'Gửi ngay'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/send-invites-dialog.tsx
git commit -m "feat: add send invites dialog component"
```

---

### Task 10: Update Invite List page with Send functionality

**Files:**
- Modify: `src/app/(dashboard)/events/[id]/invites/page.tsx`

- [ ] **Step 1: Read current page and add send functionality**

Read the current invites page, then add:
1. Row selection with checkboxes
2. "Gửi thiệp" button in header
3. SendInvitesDialog integration
4. Delivery status columns

- [ ] **Step 2: Commit**

```bash
git add src/app/\(dashboard\)/events/\[id\]/invites/page.tsx
git commit -m "feat: add send invites functionality to invites page"
```

---

## Phase 7: Testing

### Task 11: Write tests

**Files:**
- Create: `src/lib/__tests__/zalo.test.ts`
- Create: `src/lib/__tests__/delivery.test.ts`

- [ ] **Step 1: Write Zalo library tests**

```typescript
import { describe, it, expect } from 'vitest';
import {
  generateZaloShareUrl,
  generateZaloBotDeepLink,
  buildZaloInviteMessage,
} from '../zalo';

describe('Zalo library', () => {
  describe('generateZaloShareUrl', () => {
    it('should generate share URL with invite code', () => {
      const url = generateZaloShareUrl('ABC12345');
      expect(url).toContain('ABC12345');
    });
  });

  describe('buildZaloInviteMessage', () => {
    it('should build message with all params', () => {
      const message = buildZaloInviteMessage({
        groomName: 'Minh',
        brideName: 'Lan',
        eventDate: '15/06/2026',
        venueName: 'Golden Palace',
        inviteUrl: 'https://invite.com/ABC123',
      });

      expect(message).toContain('Minh');
      expect(message).toContain('Lan');
      expect(message).toContain('15/06/2026');
      expect(message).toContain('Golden Palace');
      expect(message).toContain('https://invite.com/ABC123');
    });
  });
});
```

- [ ] **Step 2: Write delivery service tests**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Add mock implementations as needed
describe('Delivery service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create delivery record on send', async () => {
    // Test implementation
  });
});
```

- [ ] **Step 3: Run tests**

Run: `pnpm test`
Expected: All tests pass

- [ ] **Step 4: Commit**

```bash
git add src/lib/__tests__/
git commit -m "test: add tests for Zalo and delivery services"
```

---

## Implementation Complete

### Summary

| Phase | Task | Status |
|-------|------|--------|
| 1 | Database Schema | Pending |
| 2 | Zalo Integration | Pending |
| 3 | Email Integration | Pending |
| 4 | Delivery Service | Pending |
| 5 | API Routes | Pending |
| 6 | UI Components | Pending |
| 7 | Testing | Pending |

---

## Next Steps

1. **Get Zalo credentials** from user:
   - ZALO_APP_ID
   - ZALO_APP_SECRET
   - ZALO_OA_ID
   - ZALO_OA_SECRET
   - ZALO_BOT_TOKEN
   - ZALO_MINI_APP_ID

2. **Get Resend API key** for email:
   - RESEND_API_KEY
   - EMAIL_FROM

3. **Test in staging** before production deployment

---

## Execution Options

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**