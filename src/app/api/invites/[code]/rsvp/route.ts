import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { invites, rsvps } from "@/db/schema";
import { rsvpSubmitSchema } from "@/lib/validators";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;

    const [invite] = await db
      .select()
      .from(invites)
      .where(eq(invites.inviteCode, code))
      .limit(1);

    if (!invite) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = rsvpSubmitSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    let rsvp;
    await db.transaction(async (tx) => {
      const [existing] = await tx
        .select()
        .from(rsvps)
        .where(eq(rsvps.inviteId, invite.id))
        .limit(1);

      if (existing) {
        [rsvp] = await tx
          .update(rsvps)
          .set({
            attendance: parsed.data.attendance,
            plusOnes: parsed.data.plusOnes,
            plusOneNames: parsed.data.plusOneNames,
            dietaryRestrictions: parsed.data.dietaryRestrictions,
            notes: parsed.data.notes,
            respondedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(rsvps.id, existing.id))
          .returning();
      } else {
        [rsvp] = await tx
          .insert(rsvps)
          .values({
            inviteId: invite.id,
            attendance: parsed.data.attendance,
            plusOnes: parsed.data.plusOnes,
            plusOneNames: parsed.data.plusOneNames,
            dietaryRestrictions: parsed.data.dietaryRestrictions,
            notes: parsed.data.notes,
          })
          .returning();
      }

      await tx
        .update(invites)
        .set({ status: "responded", updatedAt: new Date() })
        .where(eq(invites.id, invite.id));

      const { analyticsEvents } = await import("@/db/schema");
      await tx.insert(analyticsEvents).values({
        eventId: invite.eventId,
        visitorId: code,
        action: "rsvp",
        metadata: { inviteId: invite.id, attendance: parsed.data.attendance },
      });
    });

    return NextResponse.json({ success: true, rsvp });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}