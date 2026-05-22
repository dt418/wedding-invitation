"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";

interface Step {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const STEPS: Step[] = [
  { id: "template", label: "Mẫu thiệp", icon: <Icons.layout className="w-4 h-4" /> },
  { id: "couple-info", label: "Cặp đôi", icon: <Icons.heart className="w-4 h-4" /> },
  { id: "event-details", label: "Sự kiện", icon: <Icons.calendar className="w-4 h-4" /> },
  { id: "timeline", label: "Lịch trình", icon: <Icons.clock className="w-4 h-4" /> },
  { id: "gallery", label: "Album ảnh", icon: <Icons.image className="w-4 h-4" /> },
  { id: "messages", label: "Lời nhắn", icon: <Icons.messageSquare className="w-4 h-4" /> },
  { id: "preview", label: "Xem trước", icon: <Icons.eye className="w-4 h-4" /> },
];

interface StepperProps {
  currentStep: number;
  onStepClick: (index: number) => void;
  errors?: string[];
  completedSteps?: number[];
}

export function Stepper({ currentStep, onStepClick, errors = [], completedSteps = [] }: StepperProps) {
  return (
    <div className="flex flex-col gap-2 p-4 bg-muted/50 rounded-xl">
      {STEPS.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = completedSteps.includes(index);
        const hasError = errors.includes(step.id);
        const isClickable = index <= currentStep || isCompleted;

        return (
          <button
            key={step.id}
            onClick={() => isClickable && onStepClick(index)}
            disabled={!isClickable}
            className={`
              flex items-center gap-3 p-3 rounded-lg text-left transition-all
              ${isActive ? "bg-white shadow-md" : "hover:bg-white/50"}
              ${!isClickable ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              ${hasError ? "ring-2 ring-red-500" : ""}
            `}
          >
            <div
              className={`
                flex items-center justify-center w-8 h-8 rounded-full
                ${isActive ? "bg-rose-600 text-white" : isCompleted ? "bg-green-500 text-white" : "bg-white text-muted-foreground"}
              `}
            >
              {isCompleted ? <Icons.check className="w-4 h-4" /> : step.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-medium ${isActive ? "" : "text-muted-foreground"}`}>
                {step.label}
              </div>
              {hasError && (
                <div className="text-xs text-red-500">Cần điền thông tin</div>
              )}
            </div>
            {isActive && (
              <div className="w-2 h-2 rounded-full bg-rose-600" />
            )}
          </button>
        );
      })}
    </div>
  );
}

interface StepNavigationProps {
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  isLoading?: boolean;
}

export function StepNavigation({
  onBack,
  onNext,
  onSaveDraft,
  isFirstStep,
  isLastStep,
  isLoading = false,
}: StepNavigationProps) {
  return (
    <div className="flex items-center justify-between pt-6 border-t mt-6">
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onSaveDraft}
          disabled={isLoading}
        >
          <Icons.save className="w-4 h-4 mr-2" />
          Lưu nháp
        </Button>
      </div>

      <div className="flex gap-2">
        {!isFirstStep && (
          <Button
            variant="outline"
            onClick={onBack}
            disabled={isLoading}
          >
            <Icons.arrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
        )}
        <Button
          variant="default"
          onClick={onNext}
          disabled={isLoading}
          size={isLastStep ? "lg" : "default"}
          className={isLastStep ? "bg-rose-600 hover:bg-rose-700" : ""}
        >
          {isLoading ? (
            <>
              <Icons.loader2 className="w-4 h-4 mr-2 animate-spin" />
              Đang lưu...
            </>
          ) : isLastStep ? (
            <>
              Xuất bản
              <Icons.rocket className="w-4 h-4 ml-2" />
            </>
          ) : (
            <>
              Tiếp tục
              <Icons.arrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

interface StepHeaderProps {
  title: string;
  description?: string;
  step: number;
  totalSteps: number;
}

export function StepHeader({ title, description, step, totalSteps }: StepHeaderProps) {
  return (
    <div className="mb-6">
      <div className="text-sm text-rose-600 font-medium mb-1">
        Bước {step + 1} / {totalSteps}
      </div>
      <h2 className="text-2xl font-semibold">{title}</h2>
      {description && (
        <p className="text-muted-foreground mt-1">{description}</p>
      )}
    </div>
  );
}

interface StepContentProps {
  children: React.ReactNode;
  className?: string;
}

export function StepContent({ children, className = "" }: StepContentProps) {
  return (
    <Card className={className}>
      <CardContent className="p-6">{children}</CardContent>
    </Card>
  );
}

export { STEPS };