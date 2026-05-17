"use client";

import { useState } from "react";
import InviteRenderer from "@/components/invite-renderer";

interface PreviewProps {
  sections: Array<{
    id: string;
    sectionType: string;
    customContent?: Record<string, unknown>;
    visibility: string;
  }>;
  colorTokens?: Record<string, string>;
}

export default function BuilderPreview({ sections, colorTokens }: PreviewProps) {
  const [mode, setMode] = useState<"desktop" | "mobile">("desktop");

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
        <div className="bg-white rounded-lg shadow-lg overflow-hidden min-h-[600px]">
          <InviteRenderer
            sections={sections}
            colorTokens={colorTokens}
            previewMode={mode}
          />
        </div>
      </div>
    </div>
  );
}