import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { inviteDeliveries } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const { event, data } = body;

  if (event === "send_message_result") {
    const { message_id, status, error } = data;

    const statusMap: Record<string, string> = {
      "0": "sent",
      "1": "delivered",
      "2": "opened",
      "-1": "failed",
    };

    await db
      .update(inviteDeliveries)
      .set({
        status: statusMap[status] || "sent",
        providerMessageId: message_id,
        error: error || null,
      })
      .where(eq(inviteDeliveries.providerMessageId, message_id));
  }

  return NextResponse.json({ received: true });
}