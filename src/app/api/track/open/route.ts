import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { inviteDeliveries, invites } from "@/db/schema";
import { eq } from "drizzle-orm";

const TRACKING_PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const deliveryId = searchParams.get("deliveryId");

  if (!deliveryId) {
    return new NextResponse(TRACKING_PIXEL, {
      headers: {
        "Content-Type": "image/gif",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    });
  }

  try {
    await db
      .update(inviteDeliveries)
      .set({
        status: "opened",
        openedAt: new Date(),
      })
      .where(eq(inviteDeliveries.id, deliveryId));

    const [delivery] = await db
      .select()
      .from(inviteDeliveries)
      .where(eq(inviteDeliveries.id, deliveryId))
      .limit(1);

    if (delivery?.inviteId) {
      await db
        .update(invites)
        .set({ status: "opened", openedAt: new Date() })
        .where(eq(invites.id, delivery.inviteId));
    }
  } catch (error) {
    console.error("Tracking pixel error:", error);
  }

  return new NextResponse(TRACKING_PIXEL, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    },
  });
}