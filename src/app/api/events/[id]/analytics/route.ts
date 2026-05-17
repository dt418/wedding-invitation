import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { analyticsEvents, invites, rsvps } from "@/db/schema";
import { verifyToken } from "@/lib/auth";
import { eq, and, sql } from "drizzle-orm";

async function getUserId(req: NextRequest) {
  const token = req.cookies.get("wedding_token")?.value;
  if (!token) return null;
  return verifyToken(token)?.userId ?? null;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: eventId } = await params;

  const pageViews = await db
    .select({ count: sql<number>`count(*)` })
    .from(analyticsEvents)
    .where(and(eq(analyticsEvents.eventId, eventId), eq(analyticsEvents.action, "page_view")));

  const rsvpCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(invites)
    .innerJoin(rsvps, eq(rsvps.inviteId, invites.id))
    .where(eq(invites.eventId, eventId));

  const inviteStats = await db
    .select({
      status: invites.status,
      count: sql<number>`count(*)`,
    })
    .from(invites)
    .where(eq(invites.eventId, eventId))
    .groupBy(invites.status);

  const attendanceStats = await db
    .select({
      attendance: rsvps.attendance,
      count: sql<number>`count(*)`,
    })
    .from(rsvps)
    .innerJoin(invites, eq(invites.id, rsvps.inviteId))
    .where(eq(invites.eventId, eventId))
    .groupBy(rsvps.attendance);

  const dailyViews = await db
    .select({
      date: sql<string>`date(created_at)`,
      count: sql<number>`count(*)`,
    })
    .from(analyticsEvents)
    .where(
      and(
        eq(analyticsEvents.eventId, eventId),
        eq(analyticsEvents.action, "page_view")
      )
    )
    .groupBy(sql`date(created_at)`)
    .orderBy(sql`date(created_at) DESC`)
    .limit(30);

  return NextResponse.json({
    pageViews: pageViews[0]?.count || 0,
    rsvpCount: rsvpCount[0]?.count || 0,
    inviteStats,
    attendanceStats,
    dailyViews,
  });
}