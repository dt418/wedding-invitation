import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { inviteDeliveries } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const { event, data } = body;

  if (event === "send_message_result") {
    const { message_id, status, error } = data;

    const statusMap: Record<string, "sent" | "delivered" | "opened" | "failed"> = {
      "0": "sent",
      "1": "delivered",
      "2": "opened",
      "-1": "failed",
    };

    const mappedStatus = statusMap[status] || "sent";

    await db
      .update(inviteDeliveries)
      .set({
        status: mappedStatus,
        providerMessageId: message_id,
        error: error || null,
      })
      .where(eq(inviteDeliveries.providerMessageId, message_id));
  }

  return NextResponse.json({ received: true });
}