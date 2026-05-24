"use client";

import { useState } from "react";
import Image from "next/image";
import { TemplateActionModal } from "./template-action-modal";
import { translations, type Locale } from "@/lib/i18n";

type Template = {
  id: string;
  name: string;
  slug: string;
  category: string;
  thumbnailUrl: string | null;
  description: string | null;
  isActive: boolean;
  isPremium: boolean;
  createdAt: Date;
  metadata?: unknown;
};


interface TemplatesGalleryClientProps {
  templates: Template[];
  locale?: Locale;
}

function getLocaleFromCookies(): Locale {
  if (typeof document === "undefined") return "vi";
  const match = document.cookie.match(/locale=([^;]+)/);
  return (match?.[1] as Locale) || "vi";
}

export function TemplatesGalleryClient({
  templates,
  locale = getLocaleFromCookies(),
}: TemplatesGalleryClientProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const t = translations[locale].home;
  const cats = translations[locale].categories;

  return (
    <>
      <div className="w-full">
        <h1 className="text-2xl font-semibold mb-2">{t.viewAll}</h1>
        <p className="text-zinc-500 mb-8">{t.featuresSubtitle.split(".")[0]}</p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {templates.map((tmpl) => (
            <div
              key={tmpl.id}
              onClick={() => setSelectedTemplate(tmpl)}
              className="group w-full cursor-pointer overflow-hidden rounded-lg shadow-md transition-all duration-300 hover:shadow-xl bg-white"
            >
              <div className="block relative aspect-9/16 w-full overflow-hidden bg-zinc-100">
                {tmpl.thumbnailUrl ? (
                  <Image
                    src={tmpl.thumbnailUrl}
                    alt={tmpl.name}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1280px) 25vw, 20vw"
                    className="h-full w-full object-cover object-top transition-[object-position] duration-[12s] ease-in-out group-hover:object-bottom"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-zinc-400">
                    {tmpl.name}
                  </div>
                )}

                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300" />

                <div className="absolute bottom-0 left-0 right-0 p-4 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                  <h3 className="mb-1 text-sm font-semibold text-white">{tmpl.name}</h3>
                  <div className="mb-2 flex flex-wrap gap-1">
                    <span className="rounded bg-white/20 px-1.5 py-0.5 text-[10px] text-white">
                      {cats[tmpl.category as keyof typeof cats] || tmpl.category}
                    </span>
                    {tmpl.isPremium && (
                      <span className="rounded bg-amber-500/80 px-1.5 py-0.5 text-[10px] text-white">
                        Premium
                      </span>
                    )}
                  </div>
                  {tmpl.description && <p className="text-xs text-white/80 line-clamp-2">{tmpl.description}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    {selectedTemplate && (
      <TemplateActionModal
        template={selectedTemplate}
        onClose={() => setSelectedTemplate(null)}
      />
    )}
  </>
  );
}
