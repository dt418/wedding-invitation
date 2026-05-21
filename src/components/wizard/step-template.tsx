"use client";

import { useState } from "react";
import Image from "next/image";
import { StepHeader } from "./wizard-components";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 12;

type ViewMode = "editor" | "preview";

interface Template {
  id: string;
  name: string;
  slug: string;
  thumbnailUrl: string | null;
  category: string;
  isPremium: boolean;
  colorTokens?: Record<string, string>;
}

interface StepTemplateProps {
  selectedTemplateId: string;
  onTemplateSelect: (templateId: string, variantId?: string) => void;
  templates?: Template[];
}

const CATEGORY_MAP: Record<string, string> = {
  truyen_thong: "Truyền thống",
  thien_nhien: "Thiên nhiên",
  hien_dai: "Hiện đại",
  lang_man: "Lãng mạn",
  co_phuc: "Cổ điển",
  sang_trong: "Sang trọng",
  toi_gian: "Tối giản",
  de_thuong: "Dễ thương",
};

const CATEGORIES = ["Tất cả", ...Object.values(CATEGORY_MAP)];

function getCategoryKey(label: string): string {
  return Object.entries(CATEGORY_MAP).find(([, v]) => v === label)?.[0] ?? label;
}

function TemplateCard({
  template,
  isSelected,
  onSelect,
}: {
  template: Template;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        "group w-full cursor-pointer overflow-hidden rounded-lg shadow-md transition-all duration-300 bg-white",
        isSelected ? "ring-2 ring-rose-600 shadow-lg shadow-rose-200" : "hover:shadow-xl"
      )}
    >
      <div className="relative aspect-9/16 w-full overflow-hidden bg-zinc-100">
        {template.thumbnailUrl ? (
          <Image
            src={template.thumbnailUrl}
            alt={template.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 25vw, 20vw"
            className="h-full w-full object-cover object-top transition-[object-position] duration-[12s] ease-in-out group-hover:object-bottom"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-zinc-400">
            <div className="text-4xl mb-2">囍</div>
            <span className="text-sm">{template.name}</span>
          </div>
        )}

        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute bottom-0 left-0 right-0 p-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
          {isSelected && (
            <div className="w-6 h-6 bg-rose-600 rounded-full flex items-center justify-center shadow-md mb-2">
              <Icons.check className="w-4 h-4 text-white" />
            </div>
          )}
          {template.isPremium && (
            <span className="rounded bg-amber-500/80 px-2 py-0.5 text-[10px] text-white">
              Premium
            </span>
          )}
        </div>

        {!isSelected && template.isPremium && (
          <span className="absolute top-2 right-2 rounded bg-amber-500 px-2 py-0.5 text-[10px] text-white">
            Premium
          </span>
        )}
        {isSelected && !template.isPremium && (
          <div className="absolute top-2 left-2 z-10">
            <div className="w-6 h-6 bg-rose-600 rounded-full flex items-center justify-center shadow-md">
              <Icons.check className="w-4 h-4 text-white" />
            </div>
          </div>
        )}
      </div>
      <div className="p-2">
        <div className="font-medium text-sm truncate">{template.name}</div>
        <div className="text-xs text-muted-foreground truncate">
          {CATEGORY_MAP[template.category] || template.category}
        </div>
      </div>
    </div>
  );
}

function TemplatePreview({ template }: { template: Template }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="relative w-full max-w-md aspect-[3/4] bg-gradient-to-br from-rose-100 to-amber-100 rounded-xl shadow-2xl overflow-hidden">
          {template.thumbnailUrl ? (
            <Image
              src={template.thumbnailUrl}
              alt={template.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-6">
                <div className="text-6xl mb-4">囍</div>
                <div className="text-lg font-medium">{template.name}</div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="p-6 border-t bg-background">
        <h3 className="text-lg font-semibold mb-2">{template.name}</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Danh mục</span>
            <span className="font-medium">
              {CATEGORY_MAP[template.category] || template.category}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Loại</span>
            <span>{template.isPremium ? "Premium" : "Miễn phí"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const DEFAULT_TEMPLATES: Template[] = [
  { id: "1", name: "Song Long Đỏ", slug: "song-long-do", thumbnailUrl: null, category: "Truyền thống", isPremium: false },
  { id: "2", name: "Long Phụng Đỏ", slug: "long-phung-do", thumbnailUrl: null, category: "Cổ điển", isPremium: true },
  { id: "3", name: "Vườn Xuân Xanh", slug: "vuon-xuan-xanh", thumbnailUrl: null, category: "Thiên nhiên", isPremium: false },
  { id: "4", name: "Anh Đào Hồng", slug: "anh-dao-hong", thumbnailUrl: null, category: "Lãng mạn", isPremium: false },
  { id: "5", name: "Thanh Diệp Xanh", slug: "thanh-diep-xanh", thumbnailUrl: null, category: "Hiện đại", isPremium: true },
  { id: "6", name: "Hoàng Kim Đỏ", slug: "hoang-kim-do", thumbnailUrl: null, category: "Sang trọng", isPremium: true },
];

export function StepTemplate({
  selectedTemplateId,
  onTemplateSelect,
  templates = DEFAULT_TEMPLATES,
}: StepTemplateProps) {
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [viewMode, setViewMode] = useState<ViewMode>("editor");
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const previewTemplate = selectedTemplateId
    ? templates.find((t) => t.id === selectedTemplateId) ?? null
    : null;

  const filteredTemplates =
    selectedCategory === "Tất cả"
      ? templates
      : templates.filter((t) => t.category === getCategoryKey(selectedCategory));

  const visibleTemplates = filteredTemplates.slice(0, visibleCount);
  const hasMore = visibleCount < filteredTemplates.length;

  const handleSelectTemplate = (template: Template) => {
    onTemplateSelect(template.id);
    setViewMode("preview");
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setVisibleCount(ITEMS_PER_PAGE);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <StepHeader
        title="Chọn mẫu thiệp"
        description="Chọn mẫu thiệp phù hợp với phong cách đám cưới của bạn"
        step={0}
        totalSteps={7}
      />

      <div className="flex items-center gap-2 mb-4 border-b pb-4 shrink-0">
        <button
          onClick={() => setViewMode("editor")}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            viewMode === "editor"
              ? "bg-rose-600 text-white"
              : "bg-muted hover:bg-muted/80"
          )}
        >
          <span className="flex items-center gap-2">
            <Icons.edit className="w-4 h-4" />
            Editor
          </span>
        </button>
        <button
          onClick={() => setViewMode("preview")}
          disabled={!previewTemplate}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            viewMode === "preview"
              ? "bg-rose-600 text-white"
              : "bg-muted hover:bg-muted/80",
            !previewTemplate && "opacity-50 cursor-not-allowed"
          )}
        >
          <span className="flex items-center gap-2">
            <Icons.eye className="w-4 h-4" />
            Preview
          </span>
        </button>
      </div>

      <div className="flex-1 min-h-0">
        {viewMode === "editor" ? (
          <div className="flex flex-col h-full">
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 shrink-0">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                    selectedCategory === category
                      ? "bg-rose-600 text-white"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground"
                  )}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="flex-1 min-h-0 overflow-hidden">
              <div className="h-full overflow-y-auto pr-2 -mr-2">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pb-4">
                  {visibleTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      isSelected={selectedTemplateId === template.id}
                      onSelect={() => handleSelectTemplate(template)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full bg-muted/30 rounded-xl overflow-hidden">
            {previewTemplate ? (
              <TemplatePreview template={previewTemplate} />
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Chưa chọn mẫu thiệp
              </div>
            )}
          </div>
        )}
      </div>

      <div className="pt-4 mt-4 border-t shrink-0">
        <div className="flex items-center justify-end gap-4">
          {hasMore && viewMode === "editor" && (
            <Button
              variant="outline"
              onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}
              className="gap-2"
            >
              <Icons.arrowDown className="w-4 h-4" />
              Xem thêm ({filteredTemplates.length - visibleCount})
            </Button>
          )}
          <Button
            size="lg"
            onClick={() => {
              if (selectedTemplateId) {
                onTemplateSelect(selectedTemplateId);
              }
            }}
            disabled={!selectedTemplateId}
            className="min-w-[160px]"
          >
            Lưu & Tiếp tục
            <Icons.arrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export { DEFAULT_TEMPLATES };
