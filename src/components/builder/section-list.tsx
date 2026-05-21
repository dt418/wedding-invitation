"use client";

import { useState } from "react";
import { EyeIcon, EyeOffIcon, SparklesIcon, HeartIcon, CalendarIcon, MapPinIcon, ImagesIcon, BookOpenIcon, CheckCircleIcon, ClockIcon, MessageSquareIcon, FileTextIcon } from "lucide-react";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

interface SectionItem {
  id: string;
  sectionType: string;
  customContent?: Record<string, unknown>;
  visibility: string;
}

interface SectionListProps {
  sections: SectionItem[];
  onToggleVisibility: (id: string) => void;
  onSectionUpdate?: (id: string, updates: Partial<SectionItem>) => void;
}

const SECTION_LABELS: Record<string, string> = {
  "hero": "Hero",
  "couple-info": "Cô dâu & Chú rể",
  "timeline": "Lịch trình",
  "location": "Địa điểm",
  "gallery": "Bộ sưu tập",
  "guestbook": "Sổ phước",
  "rsvp": "Xác nhận tham dự",
  "countdown": "Đếm ngược",
  "quote": "Lời chúc",
  "footer": "Footer",
};

const SECTION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "hero": SparklesIcon,
  "couple-info": HeartIcon,
  "timeline": CalendarIcon,
  "location": MapPinIcon,
  "gallery": ImagesIcon,
  "guestbook": BookOpenIcon,
  "rsvp": CheckCircleIcon,
  "countdown": ClockIcon,
  "quote": MessageSquareIcon,
  "footer": FileTextIcon,
};

export default function SectionList({ sections, onToggleVisibility, onSectionUpdate }: SectionListProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [localContent, setLocalContent] = useState<Record<string, Record<string, unknown>>>({});

  const toggleExpanded = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const handleContentChange = (sectionId: string, field: string, value: unknown) => {
    setLocalContent((prev) => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        [field]: value,
      },
    }));
  };

  const handleSave = (sectionId: string) => {
    if (onSectionUpdate) {
      const section = sections.find((s) => s.id === sectionId);
      onSectionUpdate(sectionId, {
        customContent: {
          ...section?.customContent,
          ...localContent[sectionId],
        },
      });
    }
    setExpandedSections((prev) => {
      const next = new Set(prev);
      next.delete(sectionId);
      return next;
    });
  };

  const getSectionLabel = (sectionType: string) => {
    return SECTION_LABELS[sectionType] || sectionType.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const getSectionIcon = (sectionType: string) => {
    const IconComponent = SECTION_ICONS[sectionType];
    if (!IconComponent) return <FileTextIcon className="size-5 text-rose-500" />;
    return <IconComponent className="size-5 text-rose-500" />;
  };

  return (
    <div className="space-y-2">
      {sections.map((section) => {
        const isExpanded = expandedSections.has(section.id);
        const isVisible = section.visibility !== "hidden";
        const localData = localContent[section.id] || {};
        const customData = { ...section.customContent, ...localData } as Record<string, string | number | boolean | null | undefined>;

        return (
          <div
            key={section.id}
            className={cn(
              "rounded-xl border transition-all duration-200",
              isExpanded
                ? "border-rose-300 bg-rose-50/50 shadow-sm"
                : "border-zinc-200 bg-white hover:border-rose-300 hover:shadow-sm"
            )}
          >
            {/* Header Row - Always Visible */}
            <button
              onClick={() => toggleExpanded(section.id)}
              className="w-full px-4 py-3 flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
                  {getSectionIcon(section.sectionType)}
                </div>
                <span className="text-sm font-medium text-zinc-700">
                  {getSectionLabel(section.sectionType)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full",
                    isVisible
                      ? "bg-green-100 text-green-700"
                      : "bg-zinc-100 text-zinc-500"
                  )}
                >
                  {isVisible ? "Hiển thị" : "Ẩn"}
                </span>
                {isExpanded ? (
                  <ChevronUpIcon className="size-4 text-zinc-400" />
                ) : (
                  <ChevronDownIcon className="size-4 text-zinc-400" />
                )}
              </div>
            </button>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="px-4 pb-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
                {/* Preview Input */}
                {customData.title && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-500">Tiêu đề</label>
                    <Input
                      value={(customData.title as string) || ""}
                      onChange={(e) => handleContentChange(section.id, "title", e.target.value)}
                      placeholder="Nhập tiêu đề..."
                      className="h-8 bg-white"
                    />
                  </div>
                )}

                {/* Subtitle Input */}
                {customData.subtitle && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-500">Phụ đề</label>
                    <Input
                      value={(customData.subtitle as string) || ""}
                      onChange={(e) => handleContentChange(section.id, "subtitle", e.target.value)}
                      placeholder="Nhập phụ đề..."
                      className="h-8 bg-white"
                    />
                  </div>
                )}

                {/* Description Input */}
                {customData.description && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-500">Mô tả</label>
                    <textarea
                      value={(customData.description as string) || ""}
                      onChange={(e) => handleContentChange(section.id, "description", e.target.value)}
                      placeholder="Nhập mô tả..."
                      rows={3}
                      className="w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-none"
                    />
                  </div>
                )}

                {/* Visibility Toggle */}
                <div className="flex items-center justify-between py-2 border-t border-zinc-200">
                  <div className="flex items-center gap-2">
                    {isVisible ? (
                      <EyeIcon className="size-4 text-zinc-400" />
                    ) : (
                      <EyeOffIcon className="size-4 text-zinc-400" />
                    )}
                    <span className="text-sm text-zinc-600">Hiển thị trên thiệp</span>
                  </div>
                  <Switch
                    checked={isVisible}
                    onCheckedChange={() => onToggleVisibility(section.id)}
                    size="sm"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpanded(section.id)}
                    className="flex-1"
                  >
                    Hủy
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleSave(section.id)}
                    className="flex-1"
                  >
                    Lưu
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}