import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { events, invites, guests, templates, templateVariants, templateSections } from "@/db/schema";
import { eq } from "drizzle-orm";
import { buildTemplateVariables, replaceTemplateVars, hasUnresolvedVars } from "@/lib/personalization";

/**
 * POST /api/invites/generate
 * Generate personalized invite content for a specific invite
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { inviteId, inviteCode } = body;

  if (!inviteId && !inviteCode) {
    return NextResponse.json(
      { error: "Either inviteId or inviteCode is required" },
      { status: 400 }
    );
  }

  // Fetch invite
  let invite;
  if (inviteId) {
    [invite] = await db
      .select()
      .from(invites)
      .where(eq(invites.id, inviteId))
      .limit(1);
  } else {
    [invite] = await db
      .select()
      .from(invites)
      .where(eq(invites.inviteCode, inviteCode!))
      .limit(1);
  }

  if (!invite) {
    return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  }

  // Fetch guest for personalization
  const [guest] = await db
    .select()
    .from(guests)
    .where(eq(guests.id, invite.guestId))
    .limit(1);

  // Fetch event with full data
  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.id, invite.eventId))
    .limit(1);

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  // Fetch template
  const [template] = await db
    .select()
    .from(templates)
    .where(eq(templates.id, event.templateId))
    .limit(1);

  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  // Fetch default variant
  const [variant] = await db
    .select()
    .from(templateVariants)
    .where(eq(templateVariants.templateId, template.id))
    .limit(1);

  // Fetch event sections (customized content)
  const sections = await db
    .select()
    .from(templateSections)
    .where(eq(templateSections.eventId, event.id));

  // Build personalization variables
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const templateVars = buildTemplateVariables(
    {
      title: event.title,
      groomName: event.groomName,
      brideName: event.brideName,
      eventDate: event.eventDate,
      eventTime: event.eventTime,
      venueName: event.venueName,
      venueAddress: event.venueAddress,
      mapUrl: event.mapUrl,
      eventContent: event.eventContent as Record<string, unknown> | undefined,
    },
    {
      name: guest?.name || "",
      gender: guest?.gender as "male" | "female" | "other" | null,
      relation: guest?.relation as "groom_side" | "bride_side" | "friend" | "family" | null,
    },
    invite.inviteCode,
    baseUrl
  );

  // Process sections with personalization
  const processedSections = sections.map((section) => {
    const content = section.customContent as Record<string, unknown> || {};
    const processed: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(content)) {
      if (typeof value === "string") {
        processed[key] = replaceTemplateVars(value, templateVars);
      } else if (Array.isArray(value)) {
        processed[key] = value.map((item) => {
          if (typeof item === "string") return replaceTemplateVars(item, templateVars);
          if (typeof item === "object" && item !== null) {
            const processedItem: Record<string, unknown> = {};
            for (const [k, v] of Object.entries(item)) {
              processedItem[k] = typeof v === "string" ? replaceTemplateVars(v, templateVars) : v;
            }
            return processedItem;
          }
          return item;
        });
      } else {
        processed[key] = value;
      }
    }

    return {
      ...section,
      customContent: processed,
    };
  });

  // Check for unresolved variables (warnings)
  const warnings: string[] = [];
  for (const section of processedSections) {
    const content = section.customContent as Record<string, unknown>;
    for (const [key, value] of Object.entries(content)) {
      if (typeof value === "string" && hasUnresolvedVars(value)) {
        warnings.push(`Section ${section.sectionType}: ${key} has unresolved variables`);
      }
    }
  }

  return NextResponse.json({
    invite: {
      id: invite.id,
      code: invite.inviteCode,
      url: invite.inviteUrl,
    },
    guest: {
      name: guest?.name,
      gender: guest?.gender,
      relation: guest?.relation,
    },
    template: {
      id: template.id,
      name: template.name,
      slug: template.slug,
    },
    variant: variant ? {
      id: variant.id,
      colorTokens: variant.colorTokens,
    } : null,
    sections: processedSections,
    variables: templateVars,
    warnings: warnings.length > 0 ? warnings : undefined,
  });
}

/**
 * GET /api/invites/generate?code=xxx
 * Generate personalized invite content by invite code
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json(
      { error: "Invite code is required" },
      { status: 400 }
    );
  }

  return POST(new NextRequest(req.url, {
    method: "POST",
    body: JSON.stringify({ inviteCode: code }),
    headers: { "Content-Type": "application/json" },
  }));
}