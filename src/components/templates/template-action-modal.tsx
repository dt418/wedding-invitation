"use client";

import { useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

type Template = {
  id: string;
  name: string;
  slug: string;
  category: string;
  thumbnailUrl: string | null;
  description: string | null;
  isPremium: boolean;
};

interface TemplateActionModalProps {
  template: Template;
  categoryLabel: string;
  onClose: () => void;
}

export function TemplateActionModal({
  template,
  categoryLabel,
  onClose,
}: TemplateActionModalProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [handleEscape]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 hover:bg-white text-zinc-500 hover:text-zinc-700 transition-colors"
          aria-label="Close modal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="aspect-[4/3] bg-zinc-100">
          {template.thumbnailUrl ? (
            <Image
              src={template.thumbnailUrl}
              alt={template.name}
              width={640}
              height={480}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-400">
              {template.name}
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full">
              {categoryLabel}
            </span>
            {template.isPremium && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                Premium
              </span>
            )}
          </div>

          <h2 id="modal-title" className="text-xl font-semibold mb-2">
            {template.name}
          </h2>
          <p className="text-zinc-500 mb-6">{template.description}</p>

          <div className="flex gap-3">
            <Link
              href={`/events/new?templateId=${template.id}`}
              className="flex-1 px-4 py-2.5 bg-rose-500 text-white text-center font-medium rounded-lg hover:bg-rose-600 transition-colors"
            >
              Create New
            </Link>
            <Link
              href={`/invite/${template.slug}/demo`}
              className="flex-1 px-4 py-2.5 bg-zinc-100 text-zinc-700 text-center font-medium rounded-lg hover:bg-zinc-200 transition-colors"
            >
              View Demo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}