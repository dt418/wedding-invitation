import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { events } from "@/db/schema";
import { verifyToken } from "@/lib/auth";
import { updateEventSchema } from "@/lib/validators";
import { eq, and } from "drizzle-orm";

async function getUserId(req: NextRequest) {
  const token = req.cookies.get("wedding_token")?.value;
  if (!token) return null;
  return verifyToken(token)?.userId ?? null;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const [event] = await db
    .select()
    .from(events)
    .where(and(eq(events.id, id), eq(events.userId, userId)))
    .limit(1);

  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(event);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = updateEventSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  // Handle eventContent separately since it's JSONB
  const { eventContent, ...rest } = parsed.data;

  const updateData: Record<string, unknown> = { ...rest, updatedAt: new Date() };
  if (eventContent !== undefined) {
    updateData.eventContent = eventContent;
  }

  const [updated] = await db
    .update(events)
    .set(updateData)
    .where(and(eq(events.id, id), eq(events.userId, userId)))
    .returning();

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await db.delete(events).where(and(eq(events.id, id), eq(events.userId, userId)));
  return NextResponse.json({ success: true });
}