"use client";

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
}

const sectionRenderers: Record<string, React.ComponentType<{
  content: Record<string, unknown>;
  colors: Record<string, string>;
}>> = {
  hero: ({ content, colors }) => (
    <section
      className="min-h-[60vh] flex items-center justify-center text-center px-8 py-20"
      style={{ backgroundColor: colors.background || "#FFF8F0" }}
    >
      <div>
        {(content.coupleNames as string) && (
          <h1 className="text-5xl font-bold mb-4" style={{ color: colors.primary || "#C41E3A" }}>
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
  "couple-names": ({ content, colors }) => (
    <section className="py-16 px-8 text-center">
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
  venue: ({ content, colors }) => (
    <section className="py-12 px-8">
      <div className="max-w-xl mx-auto text-center">
        <h3 className="text-lg font-medium mb-2" style={{ color: colors.primary }}>
          Địa điểm
        </h3>
        <p className="text-xl font-semibold" style={{ color: colors.text }}>
          {String(content.venueName || "Tên nhà hàng")}
        </p>
        {(content.address as string) && <p className="text-zinc-500 mt-1">{String(content.address)}</p>}
        {(content.mapUrl as string) && (
          <a
            href={String(content.mapUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 text-sm text-rose-600 hover:underline"
          >
            Xem bản đồ →
          </a>
        )}
      </div>
    </section>
  ),
  rsvp: () => (
    <section className="py-16 px-8 text-center">
      <h3 className="text-2xl font-semibold mb-4 text-rose-600">Xác nhận tham dự</h3>
      <p className="text-zinc-500">Form RSVP sẽ hiển thị ở đây</p>
    </section>
  ),
  timeline: ({ content }) => (
    <section className="py-12 px-8">
      <div className="max-w-xl mx-auto">
        <h3 className="text-xl font-semibold mb-6 text-center">Thời gian</h3>
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
  ),
};

export default function InviteRenderer({ sections, colorTokens = {}, previewMode = "desktop" }: RendererProps) {
  const visibleSections = sections.filter((s) => s.visibility !== "hidden");
  const containerClass = previewMode === "mobile" ? "w-[375px] mx-auto border-x" : "w-full max-w-5xl mx-auto";

  return (
    <div className={containerClass}>
      {visibleSections.map((section) => {
        const Renderer = sectionRenderers[section.sectionType];
        if (!Renderer) return null;

        return (
          <div key={section.id}>
            <Renderer content={(section.customContent || {}) as Record<string, unknown>} colors={colorTokens} />
          </div>
        );
      })}
    </div>
  );
}
