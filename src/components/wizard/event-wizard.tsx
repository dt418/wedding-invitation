"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Stepper } from "./wizard-components";
import { StepTemplate } from "./step-template";
import { StepCoupleInfo } from "./step-couple-info";
import { StepEventDetails } from "./step-event-details";
import { StepTimeline } from "./step-timeline";
import { StepGallery } from "./step-gallery";
import { StepMessages } from "./step-messages";
import { StepPreview } from "./step-preview";
import { Icons } from "@/components/ui/icons";
import { Button } from "../ui/button";

interface TemplateFromApi {
  id: string;
  name: string;
  slug: string;
  thumbnailUrl: string | null;
  category: string;
  isPremium: boolean;
}

interface FormData {
  templateId: string;
  templateVariantId: string;
  groomName: string;
  brideName: string;
  groomFather: string;
  groomMother: string;
  brideFather: string;
  brideMother: string;
  groomAddress: string;
  brideAddress: string;
  eventDate: string;
  eventTime: string;
  ceremonyType: string;
  venueName: string;
  venueAddress: string;
  mapUrl: string;
  timeline: Array<{ time: string; type: string; title: string; description: string }>;
  images: Array<{ url: string; caption: string }>;
  thankYouNote: string;
  groomBank: string;
  groomAccount: string;
  brideBank: string;
  brideAccount: string;
  musicEnabled: boolean;
  musicUrl: string;
  rsvpEnabled: boolean;
  guestbookEnabled: boolean;
}

const INITIAL_DATA: FormData = {
  templateId: "",
  templateVariantId: "",
  groomName: "",
  brideName: "",
  groomFather: "",
  groomMother: "",
  brideFather: "",
  brideMother: "",
  groomAddress: "",
  brideAddress: "",
  eventDate: "",
  eventTime: "",
  ceremonyType: "",
  venueName: "",
  venueAddress: "",
  mapUrl: "",
  timeline: [],
  images: [],
  thankYouNote: "",
  groomBank: "",
  groomAccount: "",
  brideBank: "",
  brideAccount: "",
  musicEnabled: true,
  musicUrl: "",
  rsvpEnabled: true,
  guestbookEnabled: true,
};

const STEPS_TITLES = [
  "Mẫu thiệp",
  "Cặp đôi",
  "Sự kiện",
  "Lịch trình",
  "Album ảnh",
  "Lời nhắn",
  "Xem trước",
];

interface EventWizardProps {
  templateId?: string;
}

export function EventWizard({ templateId }: EventWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);

  // Initialize with default values to avoid hydration mismatch
  const [formData, setFormData] = useState<FormData>({
    ...INITIAL_DATA,
    templateId: templateId || "",
  });

  // Load from localStorage after hydration
  useEffect(() => {
    const saved = localStorage.getItem("eventWizardDraft");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const newFormData = { ...parsed, templateId: templateId || parsed.templateId || "" };
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFormData(newFormData);
      } catch (e) {
        console.error("Failed to parse saved draft", e);
      }
    }
    setIsHydrated(true);
  }, [templateId]);

  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [templates, setTemplates] = useState<TemplateFromApi[]>([]);

  const isLastStep = currentStep === 6;

  // Fetch templates from API
  useEffect(() => {
    async function fetchTemplates() {
      try {
        const res = await fetch("/api/templates");
        const data = await res.json();
        setTemplates(data);
      } catch (error) {
        console.error("Failed to fetch templates", error);
      }
    }
    fetchTemplates();
  }, []);

  // Save to localStorage with debounce
  useEffect(() => {
    if (isHydrated) {
      const timeout = setTimeout(() => {
        localStorage.setItem("eventWizardDraft", JSON.stringify(formData));
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [formData, isHydrated]);

  const updateField = useCallback((field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => prev.filter((e) => e !== field));
  }, []);

  const validateStep = (step: number): boolean => {
    const newErrors: string[] = [];

    switch (step) {
      case 0: // Template
        if (!formData.templateId) newErrors.push("templateId");
        break;
      case 1: // Couple Info
        if (!formData.groomName) newErrors.push("groomName");
        if (!formData.brideName) newErrors.push("brideName");
        break;
      case 2: // Event Details
        if (!formData.eventDate) newErrors.push("eventDate");
        if (!formData.venueName) newErrors.push("venueName");
        break;
      // Other steps are optional
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      return;
    }

    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps((prev) => [...prev, currentStep]);
    }

    if (currentStep < 6) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };


  const handleStepClick = (index: number) => {
    if (index <= currentStep || completedSteps.includes(index)) {
      setCurrentStep(index);
    }
  };

  const handleSaveDraft = async () => {
    setIsLoading(true);
    try {
      // Save draft logic here
      console.log("Saving draft...", formData);
      // TODO: API call to save draft
    } catch (error) {
      console.error("Failed to save draft", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${formData.groomName} & ${formData.brideName}`,
          slug: `${formData.groomName.toLowerCase().replace(/\s+/g, "-")}-${formData.brideName.toLowerCase().replace(/\s+/g, "-")}`,
          templateId: formData.templateId,
          eventDate: formData.eventDate,
          eventTime: formData.eventTime,
          venueName: formData.venueName,
          venueAddress: formData.venueAddress,
          mapUrl: formData.mapUrl,
          customData: formData,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create event");
      }

      const event = await res.json();
      localStorage.removeItem("eventWizardDraft");
      router.push(`/events/${event.id}/edit`);
    } catch (error) {
      console.error("Failed to create event", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <StepTemplate
            selectedTemplateId={formData.templateId}
            onTemplateSelect={(id) => updateField("templateId", id)}
            templates={templates}
          />
        );
      case 1:
        return (
          <StepCoupleInfo
            data={formData}
            onChange={updateField}
          />
        );
      case 2:
        return (
          <StepEventDetails
            data={formData}
            onChange={updateField}
          />
        );
      case 3:
        return (
          <StepTimeline
            data={formData.timeline}
            onChange={(timeline) => updateField("timeline", timeline)}
          />
        );
      case 4:
        return (
          <StepGallery
            data={formData.images}
            onChange={(images) => updateField("images", images)}
          />
        );
      case 5:
        return (
          <StepMessages
            data={formData}
            onChange={updateField}
          />
        );
      case 6:
        return (
          <StepPreview
            data={formData}
            onChange={updateField}
            eventData={{
              groomName: formData.groomName,
              brideName: formData.brideName,
              eventDate: formData.eventDate,
              venueName: formData.venueName,
              timeline: formData.timeline,
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar - Stepper */}
      <div className="hidden lg:flex flex-col w-72 border-r bg-muted/30 p-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold">Tạo thiệp cưới</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Hoàn thành các bước để tạo thiệp của bạn
          </p>
        </div>

        <Stepper
          currentStep={currentStep}
          onStepClick={handleStepClick}
          errors={errors}
          completedSteps={completedSteps}
        />

        <div className="mt-auto pt-4">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <Icons.eye className="w-4 h-4" />
            {showPreview ? "Ẩn" : "Hiện"} xem trước
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden border-b p-4 flex items-center justify-between">
          <div>
            <h1 className="font-semibold">Tạo thiệp cưới</h1>
            <p className="text-xs text-muted-foreground">
              Bước {currentStep + 1}: {STEPS_TITLES[currentStep]}
            </p>
          </div>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="p-2 rounded-lg hover:bg-muted"
          >
            <Icons.eye className="w-5 h-5" />
          </button>
        </div>

{/* Form Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto p-6 pb-24">
            {renderStep()}
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 z-50">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isLoading}
            >
              <Icons.save className="w-4 h-4 mr-2" />
              Lưu nháp
            </Button>
            <Button
              onClick={handleNext}
              disabled={isLoading}
              size="lg"
              className="min-w-45"
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
                  Lưu & Tiếp tục
                  <Icons.arrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Panel */}
      {showPreview && (
        <div className="hidden xl:block w-96 border-l bg-muted/30 p-6 overflow-auto">
          <h3 className="font-semibold mb-4">Xem trước</h3>
          <div className="sticky top-6">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Mini Preview */}
              <div className="p-4">
                <div className="aspect-3/4 bg-linear-to-br from-rose-100 to-amber-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl mb-4">
                    </div>
                    <div className="text-lg font-semibold">
                      {formData.groomName || "..."} & {formData.brideName || "..."}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Info */}
              <div className="p-4 border-t space-y-2 text-sm">
                {formData.eventDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ngày</span>
                    <span>{new Date(formData.eventDate).toLocaleDateString("vi-VN")}</span>
                  </div>
                )}
                {formData.venueName && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Địa điểm</span>
                    <span className="truncate ml-2">{formData.venueName}</span>
                  </div>
                )}
                {formData.timeline.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lịch trình</span>
                    <span>{formData.timeline.length} hoạt động</span>
                  </div>
                )}
                {formData.images.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Album</span>
                    <span>{formData.images.length} ảnh</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}