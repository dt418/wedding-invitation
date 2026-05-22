import { db } from "@/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { events, invites } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EventDetailPage({ params }: PageProps) {
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

  const eventInvites = await db
    .select()
    .from(invites)
    .where(eq(invites.eventId, id));

  const guestCount = eventInvites.length;
  const sentCount = eventInvites.filter((i) => i.status !== "pending").length;
  const openedCount = eventInvites.filter((i) => i.status === "opened" || i.status === "responded").length;
  const respondedCount = eventInvites.filter((i) => i.status === "responded").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold">{event.title}</h1>
          <p className="text-zinc-500 mt-1">
            {new Date(event.eventDate).toLocaleDateString("vi-VN")}
            {event.venueName ? ` • ${event.venueName}` : ""}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/events/${id}/edit`}
            className="px-4 py-2 border rounded-lg font-medium text-sm hover:bg-zinc-50"
          >
            Edit
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Guests", value: guestCount },
          { label: "Invites Sent", value: sentCount },
          { label: "Opened", value: openedCount },
          { label: "RSVP'd", value: respondedCount },
        ].map((s) => (
          <div key={s.label} className="bg-white p-4 rounded-xl border text-center">
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-zinc-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Link
          href={`/events/${id}/guests`}
          className="bg-white p-6 rounded-xl border hover:shadow-md transition-shadow"
        >
          <h3 className="font-semibold mb-1">Guests</h3>
          <p className="text-sm text-zinc-500">Import + manage guest list</p>
        </Link>
        <Link
          href={`/events/${id}/invites`}
          className="bg-white p-6 rounded-xl border hover:shadow-md transition-shadow"
        >
          <h3 className="font-semibold mb-1">Invites</h3>
          <p className="text-sm text-zinc-500">View and share invite links</p>
        </Link>
        <Link
          href={`/events/${id}/analytics`}
          className="bg-white p-6 rounded-xl border hover:shadow-md transition-shadow"
        >
          <h3 className="font-semibold mb-1">Analytics</h3>
          <p className="text-sm text-zinc-500">Views and RSVP tracking</p>
        </Link>
      </div>
    </div>
  );
}
