import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { db } from "@/db";
import { sendInvites } from "@/lib/delivery";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.cookies.get("wedding_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await verifyToken(token);
  if (!user) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const { id: eventId } = await params;
  const body = await request.json();

  const { inviteIds, channel, zaloChannel } = body;

  if (!inviteIds?.length || !channel) {
    return NextResponse.json(
      { error: "inviteIds and channel are required" },
      { status: 400 }
    );
  }

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
      channel,
      zaloChannel,
    });

    return NextResponse.json({
      jobId: result.jobId,
      totalCount: result.totalCount,
      successCount: result.successCount,
      failedCount: result.failedCount,
      status: "completed",
      streamUrl: `/api/events/${eventId}/invites/stream?jobId=${result.jobId}`,
    });
  } catch (error) {
    console.error("Send invites error:", error);
    return NextResponse.json(
      { error: "Failed to send invites" },
      { status: 500 }
    );
  }
}