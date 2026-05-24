"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";

interface EventCardLabels {
  view: string;
  edit: string;
  delete: string;
  confirmDelete: string;
  deleteWarning: string;
  cancel: string;
  confirmDeleteBtn: string;
}

interface Event {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  eventDate: string;
  status: string;
}

interface EventListClientProps {
  events: Event[];
  labels: Record<string, string>;
  eventLabels: EventCardLabels;
  locale: string;
}

export function EventListClient({
  events,
  labels,
  eventLabels,
  locale,
}: EventListClientProps) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/events/${deleteId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to delete event", error);
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const getLocaleForDate = (loc: string) => {
    switch (loc) {
      case "zh":
        return "zh-CN";
      case "ja":
        return "ja-JP";
      case "ko":
        return "ko-KR";
      default:
        return loc;
    }
  };

  const statusClasses: Record<string, string> = {
    published: "bg-green-100 text-green-700",
    draft: "bg-amber-100 text-amber-700",
    archived: "bg-zinc-100 text-zinc-500",
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-white rounded-xl border p-6 hover:shadow-md transition-shadow"
          >
            {event.thumbnailUrl && (
              <Link href={`/events/${event.id}`}>
                <div className="aspect-video bg-zinc-100 rounded-lg mb-4 overflow-hidden cursor-pointer">
                  <Image
                    src={event.thumbnailUrl}
                    alt={event.title}
                    width={640}
                    height={360}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </Link>
            )}
            <div className="flex items-start justify-between gap-2">
              <Link href={`/events/${event.id}`} className="flex-1">
                <h2 className="font-semibold text-lg mb-1 hover:text-rose-600 transition-colors">
                  {event.title}
                </h2>
              </Link>
              <span
                className={`inline-block text-xs px-2 py-1 rounded-full shrink-0 ${
                  statusClasses[event.status] || statusClasses.archived
                }`}
              >
                {labels[event.status] || event.status}
              </span>
            </div>
            <p className="text-sm text-zinc-500 mb-1">
              {new Date(event.eventDate).toLocaleDateString(getLocaleForDate(locale))}
            </p>

            <div className="flex items-center gap-2 mt-4 pt-4 border-t">
              <Link
                href={`/events/${event.id}`}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <Icons.eye className="w-4 h-4" />
                {eventLabels.view}
              </Link>
              <Link
                href={`/events/${event.id}/edit`}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <Icons.edit className="w-4 h-4" />
                {eventLabels.edit}
              </Link>
              <button
                onClick={() => setDeleteId(event.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-auto"
              >
                <Icons.trash className="w-4 h-4" />
                {eventLabels.delete}
              </button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{eventLabels.confirmDelete}</DialogTitle>
            <DialogDescription>{eventLabels.deleteWarning}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)} disabled={isDeleting}>
              {eventLabels.cancel}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting && <Icons.loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {eventLabels.confirmDeleteBtn}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}