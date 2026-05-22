import { db } from "@/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { events } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EventAnalyticsPage({ params }: PageProps) {
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

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/events/${id}/analytics`, {
    headers: { cookie: `wedding_token=${token}` },
    cache: "no-store",
  });

  const stats = res.ok ? await res.json() : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link
            href={`/events/${id}`}
            className="text-sm text-zinc-500 hover:text-zinc-700"
          >
            ← {event.title}
          </Link>
          <h1 className="text-2xl font-semibold mt-1">Analytics</h1>
        </div>
      </div>

      {stats ? (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-xl border">
              <p className="text-3xl font-bold">{stats.pageViews}</p>
              <p className="text-sm text-zinc-500 mt-1">Page views</p>
            </div>
            <div className="bg-white p-6 rounded-xl border">
              <p className="text-3xl font-bold">{stats.rsvpCount}</p>
              <p className="text-sm text-zinc-500 mt-1">RSVPs submitted</p>
            </div>
            <div className="bg-white p-6 rounded-xl border">
              <div className="space-y-2">
                {(stats.inviteStats as Array<{ status: string; count: number }>)?.map((s) => (
                  <div key={s.status} className="flex justify-between text-sm">
                    <span className="text-zinc-500">{s.status}</span>
                    <span className="font-medium">{s.count}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-zinc-500 mt-2">Invite status breakdown</p>
            </div>
          </div>

          {stats.attendanceStats && stats.attendanceStats.length > 0 && (
            <div className="bg-white p-6 rounded-xl border">
              <h3 className="font-medium mb-4">RSVP Responses</h3>
              <div className="space-y-3">
                {(stats.attendanceStats as Array<{ attendance: string; count: number }>)?.map((a) => (
                  <div key={a.attendance} className="flex items-center gap-4">
                    <span className="w-32 text-sm text-zinc-500">{a.attendance}</span>
                    <div className="flex-1 bg-zinc-100 rounded-full h-6 overflow-hidden">
                      <div
                        className="h-full bg-rose-500 rounded-full"
                        style={{
                          width: `${(a.count / (stats.rsvpCount || 1)) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium">{a.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-zinc-500">Loading analytics...</div>
      )}
    </div>
  );
}
