import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { invites, events, guests, templateVariants, sections, templateSections } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  const invite = await db.query.invites.findFirst({
    where: eq(invites.inviteCode, code),
  });

  if (!invite) {
    return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  }

  const guest = await db.query.guests.findFirst({
    where: eq(guests.id, invite.guestId),
  });

  const event = await db.query.events.findFirst({
    where: eq(events.id, invite.eventId),
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const templateSectionsList = await db.query.sections.findMany({
    where: eq(sections.templateId, event.templateId),
  });

  const overrides = await db.query.templateSections.findMany({
    where: eq(templateSections.eventId, event.id),
  });

  const overrideMap = new Map(overrides.map((o) => [o.sectionType, o]));

  const sectionsWithOverrides = templateSectionsList.map((s) => {
    const ov = overrideMap.get(s.sectionType);
    return {
      id: ov?.id || s.id,
      sectionType: s.sectionType,
      customContent: ov?.customContent || s.defaultContent,
      customTheme: ov?.customTheme,
      visibility: ov?.visibility || "visible",
      order: s.order,
    };
  }).sort((a, b) => (a.order as number) - (b.order as number));

  const variants = await db.query.templateVariants.findMany({
    where: eq(templateVariants.templateId, event.templateId),
  });

  const defaultVariant = variants.find((v) => v.isDefault) || variants[0];

  const { analyticsEvents } = await import("@/db/schema");
  await db.insert(analyticsEvents).values({
    eventId: event.id,
    visitorId: req.headers.get("x-visitor-id") || code,
    action: "page_view",
    metadata: { inviteId: invite.id },
  });

  if (invite.status === "sent" || invite.status === "pending") {
    await db
      .update(invites)
      .set({ status: "opened", openedAt: new Date() })
      .where(eq(invites.id, invite.id));
  }

  return NextResponse.json({
    invite: {
      id: invite.id,
      code: invite.inviteCode,
      guestName: guest?.name,
      guestRelation: guest?.relation,
    },
    event: {
      id: event.id,
      title: event.title,
      eventDate: event.eventDate,
      eventTime: event.eventTime,
      venueName: event.venueName,
      venueAddress: event.venueAddress,
      mapUrl: event.mapUrl,
      description: event.description,
      slug: event.slug,
    },
    sections: sectionsWithOverrides,
    variant: defaultVariant,
  });
}