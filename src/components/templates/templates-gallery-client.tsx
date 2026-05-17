"use client";

import { useState } from "react";
import Image from "next/image";
import { TemplateActionModal } from "./template-action-modal";

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
};

type GroupedTemplates = Record<string, Template[]>;

interface TemplatesGalleryClientProps {
  grouped: GroupedTemplates;
  categoryLabels: Record<string, string>;
}

export function TemplatesGalleryClient({
  grouped,
  categoryLabels,
}: TemplatesGalleryClientProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  return (
    <>
      <div className="max-w-6xl">
      <h1 className="text-2xl font-semibold mb-2">Template Gallery</h1>
      <p className="text-zinc-500 mb-8">Choose a template for your wedding invitation</p>

      {Object.entries(grouped).map(([cat, tmpls]) => (
        <div key={cat} className="mb-12">
          <h2 className="text-lg font-medium mb-4 text-zinc-700">
            {categoryLabels[cat] || cat}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tmpls.map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => setSelectedTemplate(tmpl)}
                className="group text-left w-full"
              >
                <div className="aspect-[4/3] bg-zinc-100 rounded-xl overflow-hidden mb-3 border">
                  {tmpl.thumbnailUrl ? (
                    <Image
                      src={tmpl.thumbnailUrl}
                      alt={tmpl.name}
                      width={640}
                      height={480}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400">
                      {tmpl.name}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">{tmpl.name}</span>
                  {tmpl.isPremium && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                      Premium
                    </span>
                  )}
                </div>
                <p className="text-sm text-zinc-500 mt-1">{tmpl.description}</p>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>

    {selectedTemplate && (
      <TemplateActionModal
        template={selectedTemplate}
        categoryLabel={categoryLabels[selectedTemplate.category] || selectedTemplate.category}
        onClose={() => setSelectedTemplate(null)}
      />
    )}
  </>
  );
}
