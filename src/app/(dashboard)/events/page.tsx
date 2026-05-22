import { cookies } from "next/headers";
import { db } from "@/db";
import { events } from "@/db/schema";
import { verifyToken } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import Image from "next/image";

export default async function EventsPage() {
  const token = (await cookies()).get("wedding_token")?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const userEvents = await db
    .select()
    .from(events)
    .where(eq(events.userId, payload.userId))
    .orderBy(desc(events.createdAt));

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold">My Events</h1>
          <p className="text-zinc-500 mt-1">
            {userEvents.length} event{userEvents.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/events/new"
          className="px-5 py-2.5 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-colors"
        >
          Create Event
        </Link>
      </div>

      {userEvents.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border">
          <p className="text-zinc-500 mb-4">No events yet</p>
          <Link
            href="/events/new"
            className="text-rose-600 font-medium hover:underline"
          >
            Create your first event →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userEvents.map((event) => (
            <Link
              key={event.id}
              href={`/events/${event.id}`}
              className="bg-white rounded-xl border p-6 hover:shadow-md transition-shadow"
            >
              {event.thumbnailUrl && (
                <div className="aspect-video bg-zinc-100 rounded-lg mb-4 overflow-hidden">
                  <Image
                    src={event.thumbnailUrl}
                    alt={event.title}
                    width={640}
                    height={360}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <h2 className="font-semibold text-lg mb-1">{event.title}</h2>
              <p className="text-sm text-zinc-500">
                {new Date(event.eventDate).toLocaleDateString("vi-VN")}
              </p>
              <span
                className={`inline-block mt-3 text-xs px-2 py-1 rounded-full ${
                  event.status === "published"
                    ? "bg-green-100 text-green-700"
                    : event.status === "draft"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-zinc-100 text-zinc-500"
                }`}
              >
                {event.status}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
