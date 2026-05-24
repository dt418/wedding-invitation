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

function AuthToasterContent() {
  const searchParams = useSearchParams();
  const shown = useRef(false);
  const locale = getLocaleFromCookies();
  const t = translations[locale].toasts;

  useEffect(() => {
    if (shown.current) return;
    shown.current = true;

    if (searchParams.get("registered") === "true") {
      toast.success(t.accountCreated, {
        description: t.signInToContinue,
      });
    }
    if (searchParams.get("error") === "invalid_credentials") {
      toast.error(t.invalidCredentials);
    } else if (searchParams.get("error") === "generic") {
      toast.error(t.loginFailed);
    }
    if (searchParams.get("loggedOut") === "true") {
      toast.success(t.loggedOut);
    }
  }, [searchParams, t]);

  return null;
}

export default function AuthToaster() {
  return (
    <Suspense fallback={null}>
      <AuthToasterContent />
    </Suspense>
  );
}