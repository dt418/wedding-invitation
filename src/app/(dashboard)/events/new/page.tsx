"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function NewEventForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("templateId") || "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const body = {
      title: formData.get("title"),
      slug: formData.get("slug"),
      templateId: templateId || formData.get("templateId"),
      eventDate: formData.get("eventDate"),
      eventTime: formData.get("eventTime") || undefined,
      venueName: formData.get("venueName") || undefined,
      venueAddress: formData.get("venueAddress") || undefined,
      mapUrl: formData.get("mapUrl") || undefined,
    };

    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to create event");
      setLoading(false);
      return;
    }

    const event = await res.json();
    router.push(`/events/${event.id}/edit`);
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link
          href="/templates"
          className="text-sm text-zinc-500 hover:text-zinc-700"
        >
          ← Back to templates
        </Link>
      </div>

      <h1 className="text-2xl font-semibold mb-6">Create New Event</h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-2xl border">
        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Event Title *</label>
          <input
            name="title"
            required
            placeholder="Hân & Minh Wedding"
            className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            URL Slug * <span className="text-zinc-400 font-normal">(han-minh)</span>
          </label>
          <input
            name="slug"
            required
            pattern="[a-z0-9-]+"
            placeholder="han-minh"
            className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Event Date *</label>
            <input
              name="eventDate"
              type="date"
              required
              className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Time</label>
            <input
              name="eventTime"
              type="time"
              className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Venue Name</label>
          <input
            name="venueName"
            placeholder="Nhà hàng莲花"
            className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Venue Address</label>
          <textarea
            name="venueAddress"
            rows={2}
            className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-colors disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Event"}
        </button>
      </form>
    </div>
  );
}

export default function NewEventPage() {
  return (
    <Suspense fallback={<div className="max-w-2xl p-8">Loading...</div>}>
      <NewEventForm />
    </Suspense>
  );
}