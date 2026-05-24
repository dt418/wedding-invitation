import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { events, templateSections as eventOverrides, sections } from "@/db/schema";
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

  // Get sections for this event's template
  const templateSections = event.templateId
    ? await db
        .select()
        .from(sections)
        .where(eq(sections.templateId, event.templateId))
        .orderBy(sections.order)
    : [];

  // Get event-specific overrides
  const overrides = await db
    .select()
    .from(eventOverrides)
    .where(eq(eventOverrides.eventId, eventId));

  const overrideMap = new Map(overrides.map((o) => [o.sectionType, o]));

  // Get eventContent for classic invite data
  const eventContent = event.eventContent as Record<string, unknown> || {};

  // Build sections with event-specific data
  const result = templateSections.map((s) => {
    const ov = overrideMap.get(s.sectionType);
    const defaultContent = (s.defaultContent || {}) as Record<string, unknown>;
    
    // Merge event data into all sections (for classic invite preview)
    const mergedContent = {
      ...defaultContent,
      ...(ov?.customContent || {}),
      groomName: event.groomName || eventContent.groomName || defaultContent.groomName || "",
      brideName: event.brideName || eventContent.brideName || defaultContent.brideName || "",
      groomFather: eventContent.groomFather || defaultContent.groomFather || "",
      groomMother: eventContent.groomMother || defaultContent.groomMother || "",
      brideFather: eventContent.brideFather || defaultContent.brideFather || "",
      brideMother: eventContent.brideMother || defaultContent.brideMother || "",
      groomAddress: eventContent.groomAddress || defaultContent.groomAddress || "",
      brideAddress: eventContent.brideAddress || defaultContent.brideAddress || "",
      eventDate: event.eventDate?.toString() || "",
      eventTime: event.eventTime?.toString() || "",
      ceremonyTime: event.eventTime?.toString() || "",
      venueName: event.venueName || "",
      venueAddress: event.venueAddress || "",
      mapUrl: event.mapUrl || "",
      ...eventContent,
    };

    return {
      id: ov?.id || s.id,
      sectionType: s.sectionType,
      customContent: mergedContent,
      customTheme: ov?.customTheme,
      visibility: ov?.visibility || "visible",
      order: s.order,
      isRequired: s.isRequired,
    };
  });

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
    .from(eventOverrides)
    .where(and(
      eq(eventOverrides.eventId, eventId),
      eq(eventOverrides.sectionType, sectionType)
    ))
    .limit(1);

  if (existing) {
    await db
      .update(eventOverrides)
      .set({ customContent, customTheme, visibility, updatedAt: new Date() })
      .where(eq(eventOverrides.id, existing.id));
  } else {
    await db.insert(eventOverrides).values({
      eventId,
      sectionType,
      customContent,
      customTheme,
      visibility,
    });
  }

  return NextResponse.json({ success: true });
}