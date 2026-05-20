"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { EventWizard } from "@/components/wizard/event-wizard";

function WizardContent() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get("templateId") || undefined;

  return <EventWizard templateId={templateId} />;
}

export default function NewEventPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    }>
      <WizardContent />
    </Suspense>
  );
}