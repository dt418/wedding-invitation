"use client";

interface SectionItem {
  id: string;
  sectionType: string;
  visibility: string;
}

interface SectionListProps {
  sections: SectionItem[];
  onToggleVisibility: (id: string) => void;
}

export default function SectionList({ sections, onToggleVisibility }: SectionListProps) {
  return (
    <div className="space-y-2">
      {sections.map((sec) => (
        <div
          key={sec.id}
          className="px-3 py-2 rounded-lg border hover:border-rose-300 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {sec.sectionType.replace("-", " ")}
            </span>
            <button
              onClick={() => onToggleVisibility(sec.id)}
              className="text-xs text-zinc-400 hover:text-zinc-600"
            >
              {sec.visibility === "hidden" ? "Show" : "Hide"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
