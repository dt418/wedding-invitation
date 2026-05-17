import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { events } from "@/db/schema";
import { verifyToken } from "@/lib/auth";
import { createEventSchema } from "@/lib/validators";
import { eq, and } from "drizzle-orm";

async function getUserId(req: NextRequest) {
  const token = req.cookies.get("wedding_token")?.value;
  if (!token) return null;
  return verifyToken(token)?.userId ?? null;
}

export async function GET(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const all = await db.query.events.findMany({
    where: eq(events.userId, userId),
    orderBy: (e, { desc }) => [desc(e.createdAt)],
  });

  return NextResponse.json(all);
}

export async function POST(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createEventSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { title, slug, templateId, eventDate, eventTime, venueName, venueAddress, mapUrl, description } = parsed.data;

  const existing = await db.query.events.findFirst({
    where: and(eq(events.userId, userId), eq(events.slug, slug)),
  });

  if (existing) {
    return NextResponse.json(
      { error: "This slug is already taken. Choose another." },
      { status: 409 }
    );
  }

  const [created] = await db
    .insert(events)
    .values({
      userId,
      title,
      slug,
      templateId,
      eventDate,
      eventTime,
      venueName,
      venueAddress,
      mapUrl,
      description,
      status: "draft",
    })
    .returning();

  return NextResponse.json(created, { status: 201 });
}