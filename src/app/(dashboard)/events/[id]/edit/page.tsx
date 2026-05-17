"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import BuilderPreview from "@/components/builder/preview";
import SectionList from "@/components/builder/section-list";
import Link from "next/link";

interface SectionData {
  id: string;
  sectionType: string;
  customContent?: Record<string, unknown>;
  visibility: string;
}

interface EventData {
  id: string;
  title: string;
  eventDate: string;
  eventTime?: string;
  venueName?: string;
  venueAddress?: string;
}

export default function EventEditPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventData | null>(null);
  const [sections, setSections] = useState<SectionData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvent = useCallback(async () => {
    const res = await fetch(`/api/events/${id}`);
    if (res.ok) {
      const data = await res.json();
      setEvent(data);
      const sectionsRes = await fetch(`/api/events/${id}/sections`);
      if (sectionsRes.ok) {
        setSections(await sectionsRes.json());
      }
    }
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await fetchEvent();
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [fetchEvent]);

  const handleToggleVisibility = useCallback(async (sectionId: string) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;

    const newVisibility = section.visibility === "hidden" ? "visible" : "hidden";

    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId ? { ...s, visibility: newVisibility } : s
      )
    );

    await fetch(`/api/events/${id}/sections`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sectionType: section.sectionType,
        visibility: newVisibility,
      }),
    });
  }, [sections, id]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!event) return <div className="p-8">Event not found</div>;

  return (
    <div className="flex h-[calc(100vh-73px)] gap-0">
      <div className="w-80 border-r bg-white flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <Link href={`/events/${id}`} className="text-sm text-zinc-500 hover:text-zinc-700">
              ← Back
            </Link>
            <h2 className="font-semibold mt-1">{event.title}</h2>
            <p className="text-sm text-zinc-500">Template Builder</p>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <h3 className="text-sm font-medium text-zinc-500 mb-3">SECTIONS</h3>
          <SectionList
            sections={sections}
            onToggleVisibility={handleToggleVisibility}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <BuilderPreview
          sections={sections}
          colorTokens={{}}
        />
      </div>
    </div>
  );
}