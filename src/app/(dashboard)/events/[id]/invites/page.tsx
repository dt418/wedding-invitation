import { db } from "@/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { events, invites, guests } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EventInvitesPage({ params }: PageProps) {
  const { id } = await params;
  const token = (await cookies()).get("wedding_token")?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;

  const event = await db.query.events.findFirst({
    where: and(eq(events.id, id), eq(events.userId, payload.userId)),
  });
  if (!event) return null;

  const inviteRows = await db.query.invites.findMany({
    where: eq(invites.eventId, id),
  });

  const guestIds = inviteRows.map((i) => i.guestId);
  const guestRows = guestIds.length > 0
    ? await db.query.guests.findMany({ where: inArray(guests.id, guestIds) })
    : [];
  const guestMap = new Map(guestRows.map((g) => [g.id, g]));

  return (
    <div>
      <div className="mb-6">
        <Link href={`/events/${id}`} className="text-sm text-zinc-500 hover:text-zinc-700">
          ← {event.title}
        </Link>
        <h1 className="text-2xl font-semibold mt-1">Invites</h1>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 border-b">
            <tr>
              <th className="text-left py-3 px-4">Guest</th>
              <th className="text-left py-3 px-4">Code</th>
              <th className="text-left py-3 px-4">Status</th>
              <th className="text-left py-3 px-4">Link</th>
            </tr>
          </thead>
          <tbody>
            {inviteRows.map((invite) => (
              <tr key={invite.id} className="border-b last:border-0">
                <td className="py-3 px-4">{guestMap.get(invite.guestId)?.name || "—"}</td>
                <td className="py-3 px-4 font-mono text-xs">{invite.inviteCode}</td>
                <td className="py-3 px-4">{invite.status}</td>
                <td className="py-3 px-4">
                  <a
                    href={invite.inviteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-rose-600 hover:underline"
                  >
                    Open
                  </a>
                </td>
              </tr>
            ))}
            {inviteRows.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 px-4 text-center text-zinc-500">
                  No invites yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
