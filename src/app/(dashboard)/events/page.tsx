import { cookies } from "next/headers";
import { db } from "@/db";
import { events } from "@/db/schema";
import { verifyToken } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { getLocale, t } from "@/lib/i18n-server";
import { EventListClient } from "@/components/events/event-list-client";

export default async function EventsPage() {
  const token = (await cookies()).get("wedding_token")?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const locale = await getLocale();
  const labels = t("eventsPage", locale) as {
    title: string;
    eventCount: string;
    createEvent: string;
    noEvents: string;
    createFirst: string;
    published: string;
    draft: string;
    archived: string;
    view: string;
    edit: string;
    delete: string;
    confirmDelete: string;
    deleteWarning: string;
    cancel: string;
    confirmDeleteBtn: string;
  };

  const userEvents = await db
    .select()
    .from(events)
    .where(eq(events.userId, payload.userId))
    .orderBy(desc(events.createdAt));

  const eventCountText = `${userEvents.length} ${labels.eventCount}`;
  const statusLabels: Record<string, string> = {
    published: labels.published,
    draft: labels.draft,
    archived: labels.archived,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold">{labels.title}</h1>
          <p className="text-zinc-500 mt-1">{eventCountText}</p>
        </div>
        <Link
          href="/events/new"
          className="px-5 py-2.5 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-colors"
        >
          {labels.createEvent}
        </Link>
      </div>

      {userEvents.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border">
          <p className="text-zinc-500 mb-4">{labels.noEvents}</p>
          <Link
            href="/events/new"
            className="text-rose-600 font-medium hover:underline"
          >
            {labels.createFirst} →
          </Link>
        </div>
      ) : (
        <EventListClient
          events={userEvents}
          labels={statusLabels}
          eventLabels={{
            view: labels.view,
            edit: labels.edit,
            delete: labels.delete,
            confirmDelete: labels.confirmDelete,
            deleteWarning: labels.deleteWarning,
            cancel: labels.cancel,
            confirmDeleteBtn: labels.confirmDeleteBtn,
          }}
          locale={locale}
        />
      )}
    </div>
  );
}
