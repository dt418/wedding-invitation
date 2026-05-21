"use client";

import { useState } from "react";
import Image from "next/image";
import { StepHeader } from "./wizard-components";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 12;

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
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const filteredTemplates =
    selectedCategory === "Tất cả"
      ? templates
      : templates.filter((t) => t.category === getCategoryKey(selectedCategory));

  const visibleTemplates = filteredTemplates.slice(0, visibleCount);
  const hasMore = visibleCount < filteredTemplates.length;

  const handleSelectTemplate = (template: Template) => {
    onTemplateSelect(template.id);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setVisibleCount(ITEMS_PER_PAGE);
  };

return (
    <div className="flex flex-col">
      <StepHeader
        title="Chọn mẫu thiệp"
        description="Chọn mẫu thiệp phù hợp với phong cách đám cưới của bạn"
        step={0}
        totalSteps={7}
      />

      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
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

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {visibleTemplates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            isSelected={selectedTemplateId === template.id}
            onSelect={() => handleSelectTemplate(template)}
          />
        ))}
      </div>

      {hasMore && (
        <div className="mt-4 flex justify-center">
          <Button
            variant="outline"
            onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}
            className="gap-2"
          >
            <Icons.arrowDown className="w-4 h-4" />
            Xem thêm ({filteredTemplates.length - visibleCount})
          </Button>
        </div>
      )}
    </div>
  );
}

export { DEFAULT_TEMPLATES };
