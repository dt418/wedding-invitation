"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { EyeIcon, PencilIcon, ChevronLeftIcon } from "lucide-react";
import BuilderPreview from "@/components/builder/preview";
import SectionList from "@/components/builder/section-list";
import Link from "next/link";
import { cn } from "@/lib/utils";

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
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");

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

  const handleSectionUpdate = useCallback(async (sectionId: string, updates: Partial<SectionData>) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId ? { ...s, ...updates } : s
      )
    );

    const section = sections.find((s) => s.id === sectionId);
    if (section) {
      await fetch(`/api/events/${id}/sections`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionType: section.sectionType,
          customContent: { ...section.customContent, ...updates.customContent },
        }),
      });
    }
  }, [sections, id]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[calc(100vh-73px)]">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    </div>
  );
  
  if (!event) return (
    <div className="flex items-center justify-center min-h-[calc(100vh-73px)]">
      <div className="text-center">
        <p className="text-destructive mb-4">Event not found</p>
        <Link href="/events" className="text-sm text-rose-600 hover:underline">
          ← Quay lại danh sách
        </Link>
      </div>
    </div>
  );

  return (
    <div className="h-[calc(100vh-73px)] flex flex-col">
      {/* Header */}
      <div className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <Link href={`/events/${id}`} className="text-sm text-zinc-500 hover:text-zinc-700 flex items-center gap-1">
            <ChevronLeftIcon className="size-4" />
            Quay lại
          </Link>
          <h1 className="text-xl font-semibold font-serif">{event.title}</h1>
          <div className="w-20" /> {/* Spacer for balance */}
        </div>

        {/* Tab Buttons */}
        <div className="flex justify-center border-b border-border">
          <button
            onClick={() => setActiveTab("editor")}
            className={cn(
              "px-6 py-2 text-sm font-medium inline-flex items-center gap-2 border-b-2 -mb-px transition-colors",
              activeTab === "editor"
                ? "border-rose-500 text-rose-700"
                : "border-transparent text-zinc-500 hover:text-zinc-700"
            )}
          >
            <PencilIcon className="size-4" />
            Editor
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={cn(
              "px-6 py-2 text-sm font-medium inline-flex items-center gap-2 border-b-2 -mb-px transition-colors",
              activeTab === "preview"
                ? "border-rose-500 text-rose-700"
                : "border-transparent text-zinc-500 hover:text-zinc-700"
            )}
          >
            <EyeIcon className="size-4" />
            Preview
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {/* Editor Tab */}
        <div className={cn("h-full", activeTab !== "editor" && "hidden")}>
          <div className="flex h-full">
            <div className="w-96 border-r bg-white flex flex-col">
              <div className="p-4 border-b bg-muted/30">
                <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Sections</h3>
                <p className="text-xs text-zinc-400 mt-1">Click để chỉnh sửa nội dung</p>
              </div>
              <div className="flex-1 overflow-auto p-4">
                <SectionList
                  sections={sections}
                  onToggleVisibility={handleToggleVisibility}
                  onSectionUpdate={handleSectionUpdate}
                  onContentChange={(id, content) => {
                    setSections((prev) =>
                      prev.map((s) =>
                        s.id === id ? { ...s, customContent: content } : s
                      )
                    );
                  }}
                />
              </div>
            </div>
            <div className="flex-1 flex flex-col bg-zinc-50">
              <BuilderPreview
                sections={sections}
                colorTokens={{}}
              />
            </div>
          </div>
        </div>

        {/* Preview Tab */}
        <div className={cn("h-full", activeTab !== "preview" && "hidden")}>
          <BuilderPreview
            sections={sections}
            colorTokens={{}}
            isFullPreview
          />
        </div>
      </div>
    </div>
  );
}