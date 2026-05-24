"use client";

import { useEffect, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { translations, type Locale } from "@/lib/i18n";

function getLocaleFromCookies(): Locale {
  if (typeof document === "undefined") return "vi";
  const match = document.cookie.match(/locale=([^;]+)/);
  return (match?.[1] as Locale) || "vi";
}

function LoginSuccessToast() {
  const searchParams = useSearchParams();
  const shown = useRef(false);
  const locale = getLocaleFromCookies();
  const t = translations[locale].toasts;

  useEffect(() => {
    if (shown.current) return;
    shown.current = true;

    if (searchParams.get("justLoggedIn") === "true") {
      toast.success(t.welcomeBack, {
        description: t.loginSuccess,
      });
    }
  }, [searchParams, t]);

  return null;
}

export default function LoginSuccessToastWrapper() {
  return (
    <Suspense fallback={null}>
      <LoginSuccessToast />
    </Suspense>
  );
}