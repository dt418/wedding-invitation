import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { events, templateSections, sections } from "@/db/schema";
import { verifyToken } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

async function getUserId(req: NextRequest) {
  const token = req.cookies.get("wedding_token")?.value;
  if (!token) return null;
  return verifyToken(token)?.userId ?? null;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: eventId } = await params;

  const [event] = await db
    .select()
    .from(events)
    .where(and(eq(events.userId, userId), eq(events.id, eventId)))
    .limit(1);
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const all = await db.select().from(sections);
  const overrides = await db
    .select()
    .from(templateSections)
    .where(eq(templateSections.eventId, eventId));

  const overrideMap = new Map(overrides.map((o) => [o.sectionType, o]));

  const result = all.map((s) => {
    const ov = overrideMap.get(s.sectionType);
    return {
      id: ov?.id || s.id,
      sectionType: s.sectionType,
      customContent: ov?.customContent || s.defaultContent,
      customTheme: ov?.customTheme,
      visibility: ov?.visibility || "visible",
      order: s.order,
      isRequired: s.isRequired,
    };
  }).sort((a, b) => (a.order as number) - (b.order as number));

  return NextResponse.json(result);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: eventId } = await params;

  const [event] = await db
    .select()
    .from(events)
    .where(and(eq(events.userId, userId), eq(events.id, eventId)))
    .limit(1);
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();

  const { sectionType, customContent, customTheme, visibility } = body;

  const [existing] = await db
    .select()
    .from(templateSections)
    .where(and(
      eq(templateSections.eventId, eventId),
      eq(templateSections.sectionType, sectionType)
    ))
    .limit(1);

  if (existing) {
    await db
      .update(templateSections)
      .set({ customContent, customTheme, visibility, updatedAt: new Date() })
      .where(eq(templateSections.id, existing.id));
  } else {
    await db.insert(templateSections).values({
      eventId,
      sectionType,
      customContent,
      customTheme,
      visibility,
    });
  }

  return NextResponse.json({ success: true });
}