"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";

interface SectionGroup {
  step: number;
  stepName: string;
  stepIcon: React.ReactNode;
  sections: {
    id: string;
    name: string;
    preview: string;
    hasContent: boolean;
  }[];
}

interface SectionEditorProps {
  sections: SectionGroup[];
  currentStep: number;
  onSectionClick: (step: number, sectionId?: string) => void;
  onSectionUpdate?: (sectionId: string, field: string, value: unknown) => void;
  className?: string;
}

const STEP_NAMES = [
  { name: "Chọn mẫu", icon: <Icons.layout className="w-4 h-4" /> },
  { name: "Cặp đôi", icon: <Icons.heart className="w-4 h-4" /> },
  { name: "Sự kiện", icon: <Icons.calendar className="w-4 h-4" /> },
  { name: "Lịch trình", icon: <Icons.clock className="w-4 h-4" /> },
  { name: "Bộ sưu tập", icon: <Icons.image className="w-4 h-4" /> },
  { name: "Lời nhắn", icon: <Icons.messageSquare className="w-4 h-4" /> },
  { name: "Xem trước", icon: <Icons.eye className="w-4 h-4" /> },
];

export function SectionEditor({
  sections,
  currentStep,
  onSectionClick,
  onSectionUpdate,
  className,
}: SectionEditorProps) {
  const [expandedStep, setExpandedStep] = useState<number | null>(currentStep);

  const toggleStep = (step: number) => {
    setExpandedStep(expandedStep === step ? null : step);
  };

  const handleJumpToStep = (step: number) => {
    onSectionClick(step);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <h3 className="text-sm font-medium text-muted-foreground mb-3">
        Quản lý nội dung
      </h3>

      {sections.map((group) => {
        const isExpanded = expandedStep === group.step;
        const isCurrentStep = currentStep === group.step;
        const hasContent = group.sections.some((s) => s.hasContent);

        return (
          <div key={group.step} className="border rounded-lg overflow-hidden">
            {/* Step Header */}
            <button
              onClick={() => toggleStep(group.step)}
              className={cn(
                "w-full flex items-center justify-between p-3 transition-colors",
                isCurrentStep
                  ? "bg-rose-50 text-rose-700"
                  : "bg-muted/50 hover:bg-muted"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    hasContent
                      ? "bg-rose-100 text-rose-600"
                      : isCurrentStep
                        ? "bg-rose-200 text-rose-700"
                        : "bg-muted text-muted-foreground"
                  )}
                >
                  {group.stepIcon}
                </div>
                <div className="text-left">
                  <div className="font-medium text-sm">{group.stepName}</div>
                  <div className="text-xs text-muted-foreground">
                    {group.sections.length} section
                    {hasContent ? " • Đã có nội dung" : ""}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {hasContent && (
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                )}
                <Icons.chevronDown
                  className={cn(
                    "w-4 h-4 transition-transform",
                    isExpanded && "rotate-180"
                  )}
                />
              </div>
            </button>

            {/* Sections List */}
            {isExpanded && (
              <div className="border-t bg-background">
                {group.sections.map((section) => (
                  <div
                    key={section.id}
                    className="flex items-center justify-between p-3 border-b last:border-b-0 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{section.name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {section.preview || "Chưa có nội dung"}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-3">
                      {/* Quick Edit Button */}
                      {onSectionUpdate && section.hasContent && (
                        <button
                          onClick={() => onSectionClick(group.step, section.id)}
                          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="Chỉnh sửa nhanh"
                        >
                          <Icons.edit className="w-4 h-4" />
                        </button>
                      )}

                      {/* Jump to Step Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleJumpToStep(group.step)}
                        className="text-xs"
                      >
                        <Icons.arrowRight className="w-3 h-3 mr-1" />
                        Sửa
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Quick Actions */}
                <div className="p-3 bg-muted/30 flex items-center justify-between">
                  <button
                    onClick={() => handleJumpToStep(group.step)}
                    className="text-sm text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1"
                  >
                    <Icons.edit className="w-4 h-4" />
                    Chỉnh sửa bước này
                  </button>
                  {group.step < currentStep && (
                    <button
                      onClick={() => handleJumpToStep(group.step)}
                      className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                      Quay lại và sửa
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Quick Navigation */}
      <div className="pt-4 border-t">
        <h4 className="text-xs font-medium text-muted-foreground mb-2">
          Nhảy nhanh
        </h4>
        <div className="grid grid-cols-4 gap-1">
          {STEP_NAMES.map((step, index) => (
            <button
              key={index}
              onClick={() => handleJumpToStep(index)}
              disabled={index > currentStep}
              className={cn(
                "p-2 rounded-md text-center transition-colors",
                index === currentStep
                  ? "bg-rose-100 text-rose-700"
                  : index < currentStep
                    ? "bg-muted hover:bg-muted/80 text-foreground"
                    : "bg-muted/50 text-muted-foreground cursor-not-allowed"
              )}
              title={step.name}
            >
              <div className="w-5 h-5 mx-auto mb-1">{step.icon}</div>
              <div className="text-[10px] truncate">{step.name.split(" ")[0]}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

interface QuickEditPanelProps {
  sectionId: string;
  sectionName: string;
  fields: Array<{
    key: string;
    label: string;
    type: "text" | "textarea" | "date" | "time";
    value: string;
  }>;
  onFieldChange: (key: string, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function QuickEditPanel({
  sectionName,
  fields,
  onFieldChange,
  onSave,
  onCancel,
}: QuickEditPanelProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Chỉnh sửa: {sectionName}</h3>
          <button
            onClick={onCancel}
            className="p-1 rounded-md hover:bg-muted"
          >
            <Icons.x className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-[60vh] overflow-auto">
          {fields.map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium mb-1.5">
                {field.label}
              </label>
              {field.type === "textarea" ? (
                <textarea
                  value={field.value}
                  onChange={(e) => onFieldChange(field.key, e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
                  rows={3}
                />
              ) : (
                <input
                  type={field.type}
                  value={field.value}
                  onChange={(e) => onFieldChange(field.key, e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end gap-3 p-4 border-t bg-muted/30">
          <Button variant="outline" onClick={onCancel}>
            Hủy
          </Button>
          <Button onClick={onSave}>Lưu thay đổi</Button>
        </div>
      </div>
    </div>
  );
}