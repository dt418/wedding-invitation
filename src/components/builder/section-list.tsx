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
  onContentChange?: (id: string, content: Record<string, unknown>) => void;
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

export default function SectionList({ sections, onToggleVisibility, onSectionUpdate, onContentChange }: SectionListProps) {
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
    const newContent = {
      ...(localContent[sectionId] || {}),
      [field]: value,
    };
    setLocalContent((prev) => ({
      ...prev,
      [sectionId]: newContent,
    }));
    if (onContentChange) {
      const section = sections.find((s) => s.id === sectionId);
      onContentChange(sectionId, {
        ...section?.customContent,
        ...newContent,
      });
    }
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

                {/* Wedding Card Fields */}
                {customData.groomName && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-500">Tên chú rể</label>
                    <Input
                      value={(customData.groomName as string) || ""}
                      onChange={(e) => handleContentChange(section.id, "groomName", e.target.value)}
                      placeholder="Nhập tên chú rể..."
                      className="h-8 bg-white"
                    />
                  </div>
                )}

                {customData.brideName && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-500">Tên cô dâu</label>
                    <Input
                      value={(customData.brideName as string) || ""}
                      onChange={(e) => handleContentChange(section.id, "brideName", e.target.value)}
                      placeholder="Nhập tên cô dâu..."
                      className="h-8 bg-white"
                    />
                  </div>
                )}

                {customData.groomNickname && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-500">Biệt danh chú rể</label>
                    <Input
                      value={(customData.groomNickname as string) || ""}
                      onChange={(e) => handleContentChange(section.id, "groomNickname", e.target.value)}
                      placeholder="Nhập biệt danh..."
                      className="h-8 bg-white"
                    />
                  </div>
                )}

                {customData.brideNickname && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-500">Biệt danh cô dâu</label>
                    <Input
                      value={(customData.brideNickname as string) || ""}
                      onChange={(e) => handleContentChange(section.id, "brideNickname", e.target.value)}
                      placeholder="Nhập biệt danh..."
                      className="h-8 bg-white"
                    />
                  </div>
                )}

                {customData.groomFather && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-500">Bố chú rể</label>
                    <Input
                      value={(customData.groomFather as string) || ""}
                      onChange={(e) => handleContentChange(section.id, "groomFather", e.target.value)}
                      placeholder="Nhập tên bố chú rể..."
                      className="h-8 bg-white"
                    />
                  </div>
                )}

                {customData.groomMother && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-500">Mẹ chú rể</label>
                    <Input
                      value={(customData.groomMother as string) || ""}
                      onChange={(e) => handleContentChange(section.id, "groomMother", e.target.value)}
                      placeholder="Nhập tên mẹ chú rể..."
                      className="h-8 bg-white"
                    />
                  </div>
                )}

                {customData.brideFather && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-500">Bố cô dâu</label>
                    <Input
                      value={(customData.brideFather as string) || ""}
                      onChange={(e) => handleContentChange(section.id, "brideFather", e.target.value)}
                      placeholder="Nhập tên bố cô dâu..."
                      className="h-8 bg-white"
                    />
                  </div>
                )}

                {customData.brideMother && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-500">Mẹ cô dâu</label>
                    <Input
                      value={(customData.brideMother as string) || ""}
                      onChange={(e) => handleContentChange(section.id, "brideMother", e.target.value)}
                      placeholder="Nhập tên mẹ cô dâu..."
                      className="h-8 bg-white"
                    />
                  </div>
                )}

                {customData.groomAddress && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-500">Địa chỉ nhà gái</label>
                    <Input
                      value={(customData.groomAddress as string) || ""}
                      onChange={(e) => handleContentChange(section.id, "groomAddress", e.target.value)}
                      placeholder="Nhập địa chỉ..."
                      className="h-8 bg-white"
                    />
                  </div>
                )}

                {customData.brideAddress && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-500">Địa chỉ nhà trai</label>
                    <Input
                      value={(customData.brideAddress as string) || ""}
                      onChange={(e) => handleContentChange(section.id, "brideAddress", e.target.value)}
                      placeholder="Nhập địa chỉ..."
                      className="h-8 bg-white"
                    />
                  </div>
                )}

                {customData.eventDate && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-500">Ngày cưới</label>
                    <Input
                      value={(customData.eventDate as string) || ""}
                      onChange={(e) => handleContentChange(section.id, "eventDate", e.target.value)}
                      type="date"
                      className="h-8 bg-white"
                    />
                  </div>
                )}

                {customData.eventTime && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-500">Giờ tổ chức</label>
                    <Input
                      value={(customData.eventTime as string) || ""}
                      onChange={(e) => handleContentChange(section.id, "eventTime", e.target.value)}
                      placeholder="VD: 18:00"
                      className="h-8 bg-white"
                    />
                  </div>
                )}

                {customData.venueName && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-500">Địa điểm</label>
                    <Input
                      value={(customData.venueName as string) || ""}
                      onChange={(e) => handleContentChange(section.id, "venueName", e.target.value)}
                      placeholder="Nhập tên nhà hàng..."
                      className="h-8 bg-white"
                    />
                  </div>
                )}

                {customData.mapUrl && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-500">Link bản đồ</label>
                    <Input
                      value={(customData.mapUrl as string) || ""}
                      onChange={(e) => handleContentChange(section.id, "mapUrl", e.target.value)}
                      placeholder="https://..."
                      className="h-8 bg-white"
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