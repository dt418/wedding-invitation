"use client";

import { useState } from "react";
import { translations, type Locale } from "@/lib/i18n";

interface RsvpFormProps {
  inviteCode: string;
  guestName?: string;
  colorTokens?: Record<string, string>;
  locale?: Locale;
}

export default function RsvpForm({ inviteCode, guestName, colorTokens, locale = "vi" }: RsvpFormProps) {
  const t = translations[locale];
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    const res = await fetch(`/api/invites/${inviteCode}/rsvp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        attendance: formData.get("attendance"),
        plusOnes: parseInt(formData.get("plusOnes") as string, 10) || 0,
        plusOneNames: formData.get("plusOneNames"),
        dietaryRestrictions: formData.get("dietaryRestrictions"),
        notes: formData.get("notes"),
      }),
    });

    setLoading(false);

    if (res.ok) {
      setSubmitted(true);
    } else {
      try {
        const data = await res.json();
        setError(data.error || "Failed to submit RSVP");
      } catch {
        setError("Failed to submit RSVP");
      }
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-16 px-8">
        <div className="text-5xl mb-4">✓</div>
        <h2 className="text-2xl font-semibold mb-2" style={{ color: colorTokens?.primary }}>
          {t.rsvp.thankYou}
        </h2>
        <p className="text-zinc-500">
          {guestName ? `${guestName}` : t.rsvp.thankYou}
        </p>
      </div>
    );
  }

  return (
    <div
      className="max-w-xl mx-auto py-16 px-8"
      style={{ backgroundColor: colorTokens?.background || "#FFF8F0" }}
    >
      <h2
        className="text-2xl font-semibold text-center mb-8"
        style={{ color: colorTokens?.primary }}
      >
        {t.rsvp.rsvpTitle}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2">{t.rsvp.attending} *</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "attending", label: t.rsvp.attending },
              { value: "not_attending", label: t.rsvp.notAttending },
              { value: "maybe", label: t.rsvp.maybe },
            ].map((opt) => (
              <label
                key={opt.value}
                className="flex items-center justify-center p-3 rounded-lg border cursor-pointer hover:border-rose-300 has-checked:border-rose-500 has-checked:bg-rose-50"
              >
                <input
                  type="radio"
                  name="attendance"
                  value={opt.value}
                  required
                  className="sr-only"
                />
                <span className="text-sm font-medium">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{t.rsvp.plusOnes}</label>
          <input
            name="plusOnes"
            type="number"
            min="0"
            max="5"
            defaultValue="0"
            className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{t.rsvp.plusOneNames}</label>
          <input
            name="plusOneNames"
            placeholder=""
            className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{t.rsvp.dietaryRestrictions}</label>
          <textarea
            name="dietaryRestrictions"
            rows={2}
            placeholder=""
            className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{t.rsvp.notes}</label>
          <textarea
            name="notes"
            rows={3}
            placeholder=""
            className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg font-medium text-white transition-colors disabled:opacity-50"
          style={{ backgroundColor: colorTokens?.primary || "#C41E3A" }}
        >
          {loading ? t.common.loading : t.rsvp.submit}
        </button>
      </form>
    </div>
  );
}
