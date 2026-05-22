import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { inviteDeliveries } from "@/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const signature = request.headers.get("resend-signature");

  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
  if (webhookSecret && signature) {
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(JSON.stringify(body))
      .digest("hex");

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  if (body.type === "email_delivered") {
    const { message_id, delivered_at } = body.data;

    await db
      .update(inviteDeliveries)
      .set({
        status: "delivered",
        deliveredAt: new Date(delivered_at),
        providerMessageId: message_id,
      })
      .where(eq(inviteDeliveries.providerMessageId, message_id));
  }

  if (body.type === "email_opened") {
    const { message_id, opened_at } = body.data;

    await db
      .update(inviteDeliveries)
      .set({
        status: "opened",
        openedAt: new Date(opened_at),
      })
      .where(eq(inviteDeliveries.providerMessageId, message_id));
  }

  return NextResponse.json({ received: true });
}