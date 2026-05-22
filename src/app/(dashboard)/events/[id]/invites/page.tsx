import { db } from "@/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { events, invites, guests } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import Link from "next/link";
import { InvitesTable } from "@/components/invites-table";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EventInvitesPage({ params }: PageProps) {
  const { id } = await params;
  const token = (await cookies()).get("wedding_token")?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const [event] = await db
    .select()
    .from(events)
    .where(and(eq(events.id, id), eq(events.userId, payload.userId)))
    .limit(1);
  if (!event) return null;

  const inviteRows = await db
    .select()
    .from(invites)
    .where(eq(invites.eventId, id));

  const guestIds = inviteRows.map((i) => i.guestId);
  const guestRows =
    guestIds.length > 0
      ? await db.select().from(guests).where(inArray(guests.id, guestIds))
      : [];
  const guestMap = new Map(guestRows.map((g) => [g.id, g]));

  const invitesWithGuests = inviteRows.map((invite) => ({
    id: invite.id,
    inviteCode: invite.inviteCode,
    inviteUrl: invite.inviteUrl,
    status: invite.status,
    guestName: guestMap.get(invite.guestId)?.name || "—",
    guestEmail: guestMap.get(invite.guestId)?.email || null,
  }));

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/events/${id}`}
          className="text-sm text-zinc-500 hover:text-zinc-700"
        >
          ← {event.title}
        </Link>
        <h1 className="text-2xl font-semibold mt-1">Invites</h1>
      </div>

      <InvitesTable eventId={id} initialInvites={invitesWithGuests} />
    </div>
  );
}