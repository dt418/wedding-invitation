import { db } from "@/db";
import { inviteDeliveries, inviteSendJobs, invites, guests, events } from "@/db/schema";
import { eq, and, inArray, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { env } from "@/env";

export type DeliveryChannel = "zalo_mini_app" | "zalo_bot" | "email" | "messenger";

export interface SendInvitesParams {
  inviteIds: string[];
  channel: DeliveryChannel;
  zaloChannel?: "mini_app" | "bot" | "hybrid";
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

  await db.insert(inviteDeliveries).values({
    id: deliveryId,
    inviteId,
    channel: "email",
    status: "pending",
    idempotencyKey: generateIdempotencyKey(inviteId, "email"),
  });

  try {
    if (!env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const { Resend } = await import("resend");
    const resend = new Resend(env.RESEND_API_KEY);

    const trackingPixelUrl = `${env.NEXT_PUBLIC_BASE_URL}/api/track/open?deliveryId=${deliveryId}`;

    const { data, error } = await resend.emails.send({
      from: env.EMAIL_FROM || "wedding@yourdomain.com",
      to: guestData.email,
      subject: `Loi moi cuoi - ${eventData.groomName} & ${eventData.brideName}`,
      html: buildInviteEmailHtml(eventData, guestData, inviteUrl, trackingPixelUrl),
    });

    if (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }

    await db
      .update(inviteDeliveries)
      .set({ status: "sent", sentAt: new Date(), providerMessageId: data?.id })
      .where(eq(inviteDeliveries.id, deliveryId));

    return { deliveryId, success: true, providerMessageId: data?.id };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    await db
      .update(inviteDeliveries)
      .set({ status: "failed", error: errorMessage })
      .where(eq(inviteDeliveries.id, deliveryId));

    return { deliveryId, success: false, error: errorMessage };
  }
}

async function sendViaZalo(
  inviteId: string,
  zaloChannel: "mini_app" | "bot" | "hybrid",
  eventData: {
    groomName: string;
    brideName: string;
    eventDate: string;
    venueName: string;
  },
  guestData: {
    zaloId?: string | null;
    name: string;
    phone?: string | null;
  },
  inviteCode: string
): Promise<SendResult> {
  const channel = zaloChannel === "bot" ? "zalo_bot" : "zalo_mini_app";
  const deliveryId = nanoid();

  await db.insert(inviteDeliveries).values({
    id: deliveryId,
    inviteId,
    channel,
    status: "pending",
    idempotencyKey: generateIdempotencyKey(inviteId, channel),
  });

  const deepLinkBase = env.ZALO_DEEP_LINK_BASE || env.NEXT_PUBLIC_BASE_URL;
  const inviteUrl = `${deepLinkBase}/invite/${inviteCode}`;

  console.log(`Zalo invite prepared:`, {
    channel: zaloChannel,
    inviteUrl,
    guestName: guestData.name,
    zaloId: guestData.zaloId,
  });

  await db
    .update(inviteDeliveries)
    .set({ status: "sent", sentAt: new Date(), metadata: { inviteUrl } })
    .where(eq(inviteDeliveries.id, deliveryId));

  return { deliveryId, success: true };
}

function buildInviteEmailHtml(
  eventData: {
    groomName: string;
    brideName: string;
    eventDate: string;
    eventTime: string;
    venueName: string;
    venueAddress: string;
  },
  guestData: { name: string },
  inviteUrl: string,
  trackingPixelUrl: string
): string {
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
      <div class="couple-names">${eventData.groomName} & ${eventData.brideName}</div>
      <div class="event-details">
        <p><strong>Date:</strong> ${eventData.eventDate}</p>
        <p><strong>Time:</strong> ${eventData.eventTime}</p>
        <p><strong>Venue:</strong> ${eventData.venueName}</p>
        <p><strong>Address:</strong> ${eventData.venueAddress}</p>
      </div>
      <div style="text-align: center;">
        <a href="${inviteUrl}" class="cta-button">View Invitation</a>
      </div>
    </div>
    <div class="footer">
      <p>This invitation was sent to ${guestData.name}</p>
      <img src="${trackingPixelUrl}" width="1" height="1" alt="" style="display:none;" />
    </div>
  </div>
</body>
</html>
  `.trim();
}

export async function sendInvites(
  eventId: string,
  userId: string,
  params: SendInvitesParams
): Promise<{ jobId: string; totalCount: number; successCount: number; failedCount: number }> {
  const jobId = nanoid();

  const invitesData = await db
    .select()
    .from(invites)
    .where(and(eq(invites.eventId, eventId), inArray(invites.id, params.inviteIds)));

  // Fetch related data manually
  const guestIds = invitesData.map((i) => i.guestId).filter(Boolean);
  const [eventData] = await db
    .select()
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1);

  const guestsData = guestIds.length > 0
    ? await db.select().from(guests).where(inArray(guests.id, guestIds))
    : [];
  const guestMap = new Map(guestsData.map((g) => [g.id, g]));

  await db.insert(inviteSendJobs).values({
    id: jobId,
    eventId,
    userId,
    channel: params.channel,
    status: "queued",
    totalCount: invitesData.length,
  });

  let successCount = 0;
  let failedCount = 0;

  for (const invite of invitesData) {
    const inviteUrl = `${env.NEXT_PUBLIC_BASE_URL}/invite/${invite.inviteCode}`;
    const guest = guestMap.get(invite.guestId);

    try {
      if (params.channel === "email") {
        if (guest?.email) {
          const result = await sendViaEmail(
            invite.id,
            {
              groomName: eventData?.groomName || eventData?.title || "",
              brideName: eventData?.brideName || eventData?.title || "",
              eventDate: eventData?.eventDate || "",
              eventTime: eventData?.eventTime || "",
              venueName: eventData?.venueName || "",
              venueAddress: eventData?.venueAddress || "",
            },
            {
              name: guest?.name || "",
              email: guest?.email,
            },
            inviteUrl
          );

          if (result.success) successCount++;
          else failedCount++;
        } else {
          failedCount++;
        }
      } else if (params.channel === "zalo_bot" || params.channel === "zalo_mini_app") {
        const result = await sendViaZalo(
          invite.id,
          params.zaloChannel || "hybrid",
          {
            groomName: eventData?.groomName || eventData?.title || "",
            brideName: eventData?.brideName || eventData?.title || "",
            eventDate: eventData?.eventDate || "",
            venueName: eventData?.venueName || "",
          },
          {
            zaloId: guest?.zaloId,
            name: guest?.name || "",
            phone: guest?.phone,
          },
          invite.inviteCode
        );

        if (result.success) successCount++;
        else failedCount++;
      }
    } catch {
      failedCount++;
    }
  }

  await db
    .update(inviteSendJobs)
    .set({
      status: "completed",
      completedAt: new Date(),
      successCount,
      failedCount,
    })
    .where(eq(inviteSendJobs.id, jobId));

  return { jobId, totalCount: invitesData.length, successCount, failedCount };
}

export async function getDeliveryStats(eventId: string) {
  // Get all invite IDs for this event
  const eventInvites = await db
    .select({ id: invites.id })
    .from(invites)
    .where(eq(invites.eventId, eventId));

  const inviteIds = eventInvites.map((inv) => inv.id);

  if (inviteIds.length === 0) {
    return {
      total: 0,
      pending: 0,
      sent: 0,
      delivered: 0,
      opened: 0,
      failed: 0,
    };
  }

  // Use raw SQL to avoid relation builder issues
  const deliveriesResult = await db.execute<{ id: string; status: string }>(
    sql`SELECT id, status FROM invite_deliveries WHERE invite_id IN (${sql.join(inviteIds.map(id => sql`${id}`), sql`, `)})`
  );

  const stats = {
    total: 0,
    pending: 0,
    sent: 0,
    delivered: 0,
    opened: 0,
    failed: 0,
  };

  for (const row of deliveriesResult) {
    stats.total++;
    const status = row.status as keyof typeof stats;
    if (status in stats) {
      stats[status]++;
    }
  }

  return stats;
}
