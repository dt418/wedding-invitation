"use client";

import Image from "next/image";
import { translations, type Locale } from "@/lib/i18n";
import { getGuestPronouns, formatSalutation, type Gender, type Relation } from "@/lib/personalization";
import { Icons } from "@/components/ui/icons";

interface SectionData {
  id: string;
  sectionType: string;
  customContent?: Record<string, unknown>;
  visibility: string;
}

interface RendererProps {
  sections: SectionData[];
  colorTokens?: Record<string, string>;
  previewMode?: "desktop" | "mobile";
  locale?: Locale;
  guestName?: string;
  guestGender?: Gender | null;
  guestRelation?: Relation | null;
}

interface SectionRendererProps {
  content: Record<string, unknown>;
  colors: Record<string, string>;
  personalization?: {
    guestName: string;
    personalizedGreeting: string;
  };
  locale?: Locale;
}

const sectionRenderers: Record<string, React.FC<SectionRendererProps>> = {
  hero: ({ content, colors, personalization }) => (
    <section
      className="min-h-[60vh] flex items-center justify-center text-center px-8 py-20"
      style={{ backgroundColor: colors.background || "var(--color-background)" }}
    >
      <div>
        {personalization && (
          <p 
            className="text-lg mb-6 opacity-80" 
            style={{ color: colors.text || "#1A1A1A" }}
          >
            {personalization.personalizedGreeting}
          </p>
        )}
        {(content.coupleNames as string) && (
          <h1 className="text-5xl font-bold mb-4" style={{ color: colors.primary || "var(--color-primary)" }}>
            {String(content.coupleNames)}
          </h1>
        )}
        {(content.invitationText as string) && (
          <p className="text-xl mt-4" style={{ color: colors.text || "#1A1A1A" }}>
            {String(content.invitationText)}
          </p>
        )}
      </div>
    </section>
  ),
  "couple-names": ({ content, colors, personalization }) => (
    <section className="py-16 px-8 text-center">
      {personalization && (
        <p className="text-lg mb-4 opacity-70" style={{ color: colors.text }}>
          {personalization.personalizedGreeting}
        </p>
      )}
      <h2 className="text-4xl font-semibold" style={{ color: colors.primary }}>
        {String(content.names || "Name 1 & Name 2")}
      </h2>
    </section>
  ),
  "event-info": ({ content, colors }) => (
    <section className="py-12 px-8">
      <div className="max-w-xl mx-auto text-center">
        <p className="text-2xl font-medium" style={{ color: colors.text }}>
          {String(content.date || "Ngày XX tháng XX năm XXXX")}
        </p>
        {(content.time as string) && (
          <p className="text-lg mt-2" style={{ color: colors.text }}>
            {String(content.time)}
          </p>
        )}
      </div>
    </section>
  ),
  venue: ({ content, colors, locale = "vi" }) => {
    const t = translations[locale];
    return (
      <section className="py-12 px-8">
        <div className="max-w-xl mx-auto text-center">
          <h3 className="text-lg font-medium mb-2" style={{ color: colors.primary }}>
            {t.events.venue}
          </h3>
          <p className="text-xl font-semibold" style={{ color: colors.text }}>
            {String(content.venueName || t.events.venue)}
          </p>
          {(content.address as string) && <p className="text-zinc-500 mt-1">{String(content.address)}</p>}
          {(content.mapUrl as string) && (
            <a
              href={String(content.mapUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 text-sm text-rose-600 hover:underline"
            >
              {t.common.copy}
            </a>
          )}
        </div>
      </section>
    );
  },
  rsvp: ({ locale = "vi" }) => {
    const t = translations[locale];
    return (
      <section className="py-16 px-8 text-center">
        <h3 className="text-2xl font-semibold mb-4 text-rose-600">{t.rsvp.rsvpTitle}</h3>
        <p className="text-zinc-500">{t.common.loading}</p>
      </section>
    );
  },
  timeline: ({ content, locale = "vi" }) => {
    const t = translations[locale];
    return (
      <section className="py-12 px-8">
        <div className="max-w-xl mx-auto">
          <h3 className="text-xl font-semibold mb-6 text-center">{t.timeline.title}</h3>
          <div className="space-y-4">
            {(content.events as Array<{ time: string; label: string }> || []).map((item, i) => (
              <div key={i} className="flex gap-4">
                <span className="font-medium text-rose-600">{item.time}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  },
  gallery: ({ content, locale = "vi" }) => {
    const t = translations[locale];
    const images = content.images as Array<{ url: string; caption: string }> || [];
    return (
      <section className="py-12 px-8 bg-linear-to-b from-rose-50 to-white">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-xl font-semibold mb-6 text-center">{t.gallery.title}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.slice(0, 6).map((img, i) => (
              <div key={i} className="aspect-square rounded-lg overflow-hidden bg-muted">
                {img.url ? (
                  <Image src={img.url} alt={img.caption || ""} fill className="object-cover" sizes="(max-width: 768px) 50vw, 33vw" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <Icons.image className="w-8 h-8" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  },
  "thank-you": ({ content, locale = "vi" }) => {
    const t = translations[locale];
    return (
      <section className="py-16 px-8 text-center bg-linear-to-b from-white to-rose-50">
        <div className="max-w-xl mx-auto">
          <div className="text-4xl mb-4">💝</div>
          <p className="text-lg" style={{ color: "var(--color-text)" }}>
            {String(content.message || t.thankYou?.message || "Cảm ơn quý khách đã đến chia vui cùng chúng tôi!")}
          </p>
        </div>
      </section>
    );
  },
};

export default function InviteRenderer({ 
  sections, 
  colorTokens = {}, 
  previewMode = "desktop",
  locale = "vi",
  guestName,
  guestGender,
  guestRelation 
}: RendererProps) {
  const visibleSections = sections.filter((s) => s.visibility !== "hidden");
  const containerClass = previewMode === "mobile" ? "w-[375px] mx-auto border-x" : "w-full max-w-5xl mx-auto";

  const personalizationContext = guestName 
    ? {
        guestName,
        personalizedGreeting: formatSalutation(
          getGuestPronouns(guestName, guestGender, guestRelation),
          guestName
        ),
      }
    : undefined;

  return (
    <div className={containerClass}>
      {visibleSections.map((section) => {
        const Renderer = sectionRenderers[section.sectionType];
        if (!Renderer) return null;

        return (
          <div key={section.id}>
            <Renderer 
              content={(section.customContent || {}) as Record<string, unknown>} 
              colors={colorTokens}
              personalization={personalizationContext}
              locale={locale}
            />
          </div>
        );
      })}
    </div>
  );
}