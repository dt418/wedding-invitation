"use client";

import { useState } from "react";
import { StepHeader } from "./wizard-components";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/ui/icons";

interface Template {
  id: string;
  name: string;
  slug: string;
  thumbnailUrl: string;
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
    slug: "double_dragon_red",
    thumbnailUrl: "/images/template-previews/listing/double_dragon_red.webp",
    category: "Truyền thống",
    isPremium: false,
  },
  {
    id: "2",
    name: "Long Phụng Đỏ",
    slug: "dragon_phoenix_red",
    thumbnailUrl: "/images/template-previews/listing/dragon_phoenix_red.webp",
    category: "Cổ điển",
    isPremium: true,
  },
  {
    id: "3",
    name: "Vườn Xuân Xanh",
    slug: "spring_garden_green",
    thumbnailUrl: "/images/template-previews/listing/spring_garden_green.webp",
    category: "Thiên nhiên",
    isPremium: false,
  },
  {
    id: "4",
    name: "Anh Đào Hồng",
    slug: "cherry_blossom_pink",
    thumbnailUrl: "/images/template-previews/listing/cherry_blossom_pink.webp",
    category: "Lãng mạn",
    isPremium: false,
  },
  {
    id: "5",
    name: "Thanh Diệp Xanh",
    slug: "elegant_leaf_green",
    thumbnailUrl: "/images/template-previews/listing/elegant_leaf_green.webp",
    category: "Hiện đại",
    isPremium: true,
  },
  {
    id: "6",
    name: "Hoàng Kim Đỏ",
    slug: "royal_red",
    thumbnailUrl: "/images/template-previews/listing/royal_red.webp",
    category: "Sang trọng",
    isPremium: true,
  },
];

const CATEGORIES = ["Tất cả", "Truyền thống", "Cổ điển", "Hiện đại", "Thiên nhiên", "Lãng mạn", "Sang trọng"];

export function StepTemplate({ selectedTemplateId, onTemplateSelect, templates = DEFAULT_TEMPLATES }: StepTemplateProps) {
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(
    selectedTemplateId ? (templates.find(t => t.id === selectedTemplateId) ?? null) : null
  );

  const filteredTemplates = selectedCategory === "Tất cả"
    ? templates
    : templates.filter(t => t.category === selectedCategory);

  const handleSelectTemplate = (template: Template) => {
    setPreviewTemplate(template);
    onTemplateSelect(template.id);
  };

  return (
    <div className="space-y-6">
      <StepHeader
        title="Chọn mẫu thiệp"
        description="Chọn mẫu thiệp phù hợp với phong cách đám cưới của bạn"
        step={0}
        totalSteps={7}
      />

      <div className="flex gap-6">
        {/* Template Grid */}
        <div className="flex-1">
          {/* Category Filter */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
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

          {/* Templates Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
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
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <Icons.image className="w-8 h-8" />
                  </div>
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
                  <div className="text-xs text-muted-foreground">{template.category}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Preview Panel */}
        {previewTemplate && (
          <div className="hidden lg:block w-80">
            <Card className="sticky top-4">
              <div className="p-4 border-b">
                <h3 className="font-medium">Xem trước</h3>
                <p className="text-sm text-muted-foreground">{previewTemplate.name}</p>
              </div>
              <div className="p-4">
                <div className="relative aspect-[3/4] bg-gradient-to-br from-rose-100 to-rose-200 rounded-lg overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center p-4">
                      <div className="text-4xl mb-4">囍</div>
                      <div className="text-sm font-medium">{previewTemplate.name}</div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Danh mục</span>
                    <span className="font-medium">{previewTemplate.category}</span>
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
    </div>
  );
}

export { DEFAULT_TEMPLATES };