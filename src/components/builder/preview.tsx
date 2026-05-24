"use client";

import { useState } from "react";
import InviteRenderer from "@/components/classic-invite-renderer";

interface PreviewProps {
  sections: Array<{
    id: string;
    sectionType: string;
    customContent?: Record<string, unknown>;
    visibility: string;
  }>;
  colorTokens?: Record<string, string>;
  isFullPreview?: boolean;
}

export default function BuilderPreview({ sections, isFullPreview }: PreviewProps) {
  const [mode, setMode] = useState<"desktop" | "mobile">("desktop");

  if (isFullPreview) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-center gap-2 p-3 border-b bg-white">
          <button
            onClick={() => setMode("desktop")}
            className={`px-4 py-1.5 text-sm rounded-lg transition-all duration-200 ${
              mode === "desktop"
                ? "bg-rose-100 text-rose-700 font-medium shadow-sm"
                : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
            }`}
          >
            Desktop
          </button>
          <button
            onClick={() => setMode("mobile")}
            className={`px-4 py-1.5 text-sm rounded-lg transition-all duration-200 ${
              mode === "mobile"
                ? "bg-rose-100 text-rose-700 font-medium shadow-sm"
                : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
            }`}
          >
            Mobile
          </button>
        </div>

        <div className="flex-1 overflow-auto bg-zinc-100 p-6">
          <div className="bg-white rounded-xl shadow-xl overflow-hidden min-h-150">
            <InviteRenderer
              sections={sections}
              previewMode={mode}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 p-3 border-b bg-white">
        <span className="text-sm text-zinc-500 mr-auto">Preview</span>
        <button
          onClick={() => setMode("desktop")}
          className={`px-3 py-1 text-xs rounded-full transition-colors ${
            mode === "desktop"
              ? "bg-rose-100 text-rose-700"
              : "bg-zinc-100 text-zinc-500"
          }`}
        >
          Desktop
        </button>
        <button
          onClick={() => setMode("mobile")}
          className={`px-3 py-1 text-xs rounded-full transition-colors ${
            mode === "mobile"
              ? "bg-rose-100 text-rose-700"
              : "bg-zinc-100 text-zinc-500"
          }`}
        >
          Mobile
        </button>
      </div>

      <div className="flex-1 overflow-auto bg-zinc-100 p-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden min-h-150">
          <InviteRenderer
            sections={sections}
            previewMode={mode}
          />
        </div>
      </div>
    </div>
  );
}