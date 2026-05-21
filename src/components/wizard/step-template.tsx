"use client";

import { useState } from "react";
import Image from "next/image";
import { StepHeader } from "./wizard-components";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/ui/icons";

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

// Mock data for templates - in real app, this would come from API
const DEFAULT_TEMPLATES: Template[] = [
  {
    id: "1",
    name: "Song Long Đỏ",
    slug: "song-long-do",
    thumbnailUrl: null,
    category: "Truyền thống",
    isPremium: false,
  },
  {
    id: "2",
    name: "Long Phụng Đỏ",
    slug: "long-phung-do",
    thumbnailUrl: null,
    category: "Cổ điển",
    isPremium: true,
  },
  {
    id: "3",
    name: "Vườn Xuân Xanh",
    slug: "vuon-xuan-xanh",
    thumbnailUrl: null,
    category: "Thiên nhiên",
    isPremium: false,
  },
  {
    id: "4",
    name: "Anh Đào Hồng",
    slug: "anh-dao-hong",
    thumbnailUrl: null,
    category: "Lãng mạn",
    isPremium: false,
  },
  {
    id: "5",
    name: "Thanh Diệp Xanh",
    slug: "thanh-diep-xanh",
    thumbnailUrl: null,
    category: "Hiện đại",
    isPremium: true,
  },
  {
    id: "6",
    name: "Hoàng Kim Đỏ",
    slug: "hoang-kim-do",
    thumbnailUrl: null,
    category: "Sang trọng",
    isPremium: true,
  },
];

const CATEGORY_MAP: Record<string, string> = {
  truyen_thong: "Truyền thống",
  thien_nhien: "Thiên nhiên",
  hien_dai: "Hiện đại",
  lang_man: "Lãng mạn",
  co_phuc: "Cổ điển",
  sang_trong: "Sang trọng",
  toi_gian: "Tối giản",
  de_thuong: "Dễ thương",
  typography: "Typography",
};

const CATEGORIES = ["Tất cả", ...Object.values(CATEGORY_MAP)];

const getCategoryKey = (label: string): string => {
  const entry = Object.entries(CATEGORY_MAP).find(([, v]) => v === label);
  return entry ? entry[0] : label;
};

export function StepTemplate({ selectedTemplateId, onTemplateSelect, templates = DEFAULT_TEMPLATES }: StepTemplateProps) {
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(
    selectedTemplateId ? (templates.find(t => t.id === selectedTemplateId) ?? null) : null
  );
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const filteredTemplates = selectedCategory === "Tất cả"
    ? templates
    : templates.filter(t => t.category === getCategoryKey(selectedCategory));

  const visibleTemplates = filteredTemplates.slice(0, visibleCount);
  const hasMore = visibleCount < filteredTemplates.length;

  const handleSelectTemplate = (template: Template) => {
    setPreviewTemplate(template);
    onTemplateSelect(template.id);
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

      <div className="flex flex-1 gap-6 min-h-0">
        {/* Template Grid */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Category Filter */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2 shrink-0">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
                  ${selectedCategory === category
                    ? "bg-rose-600 text-white"
                    : "bg-muted hover:bg-muted/80 text-muted-foreground"}
                `}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Scrollable Templates Grid */}
          <div className="flex-1 min-h-0">
            <div className="h-full overflow-y-auto pr-2 -mr-2">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
              {visibleTemplates.map((template) => (
              <Card
                key={template.id}
                onClick={() => handleSelectTemplate(template)}
                className={`
                  cursor-pointer transition-all overflow-hidden p-0 relative
                  ${selectedTemplateId === template.id
                    ? "ring-2 ring-rose-600 shadow-lg"
                    : "hover:shadow-md hover:-translate-y-1"}
                `}
              >
                <div className="relative aspect-[3/4] bg-muted">
                  {template.thumbnailUrl ? (
                    <Image
                      src={template.thumbnailUrl}
                      alt={template.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                      <Icons.image className="w-8 h-8" />
                    </div>
                  )}
                  {template.isPremium && (
                    <Badge className="absolute top-2 right-2 bg-amber-500">
                      Premium
                    </Badge>
                  )}
                  {selectedTemplateId === template.id && (
                    <div className="absolute top-2 left-2 z-10">
                      <div className="w-6 h-6 bg-rose-600 rounded-full flex items-center justify-center shadow-md">
                        <Icons.check className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <div className="font-medium text-sm">{template.name}</div>
                  <div className="text-xs text-muted-foreground">{CATEGORY_MAP[template.category] || template.category}</div>
                </div>
              </Card>
            ))}
          </div>
          </div>
        </div>

        {/* Preview Panel */}
        {previewTemplate && (
          <div className="hidden lg:block w-80 shrink-0">
            <Card className="sticky top-0">
              <div className="p-4 border-b">
                <h3 className="font-medium">Xem trước</h3>
                <p className="text-sm text-muted-foreground">{previewTemplate.name}</p>
              </div>
              <div className="p-4">
                <div className="relative aspect-[3/4] bg-gradient-to-br from-rose-100 to-rose-200 rounded-lg overflow-hidden">
                  {previewTemplate.thumbnailUrl ? (
                    <Image
                      src={previewTemplate.thumbnailUrl}
                      alt={previewTemplate.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center p-4">
                        <div className="text-4xl mb-4">囍</div>
                        <div className="text-sm font-medium">{previewTemplate.name}</div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Danh mục</span>
                    <span className="font-medium">{CATEGORY_MAP[previewTemplate.category] || previewTemplate.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Kiểu</span>
                    <span>{previewTemplate.isPremium ? "Premium" : "Miễn phí"}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="pt-4 mt-4 border-t shrink-0">
        <div className="flex items-center justify-end gap-4">
          {hasMore && (
            <Button
              variant="outline"
              onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
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