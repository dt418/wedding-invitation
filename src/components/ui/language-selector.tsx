"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { supportedLocales, localeNames, type Locale } from "@/lib/i18n";

interface LanguageSelectorProps {
  currentLocale: Locale;
  className?: string;
}

const localeFlags: Record<Locale, string> = {
  vi: "🇻🇳",
  en: "🇬🇧",
  zh: "🇨🇳",
  ja: "🇯🇵",
  ko: "🇰🇷",
};

export default function LanguageSelector({ 
  currentLocale, 
  className = "" 
}: LanguageSelectorProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLocaleChange = (locale: Locale) => {
    startTransition(() => {
      // Set cookie for server-side detection
      document.cookie = `locale=${locale};path=/;max-age=31536000`;
      // Refresh the page to apply new locale
      router.refresh();
      setIsOpen(false);
    });
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/80 backdrop-blur-sm border border-zinc-200 hover:bg-white transition-colors disabled:opacity-50"
        aria-label="Select language"
      >
        <span>{localeFlags[currentLocale]}</span>
        <span className="text-sm font-medium">{currentLocale.toUpperCase()}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 z-50 bg-white rounded-lg shadow-lg border border-zinc-200 py-1 min-w-[140px]">
            {supportedLocales.map((locale) => (
              <button
                key={locale}
                onClick={() => handleLocaleChange(locale)}
                className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-zinc-100 transition-colors ${
                  locale === currentLocale ? "bg-rose-50 text-rose-600" : ""
                }`}
              >
                <span>{localeFlags[locale]}</span>
                <span className="text-sm">{localeNames[locale]}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}