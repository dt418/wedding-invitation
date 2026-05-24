import { cookies, headers } from "next/headers";
import { translations, type Locale } from "@/lib/i18n";

const SUPPORTED_LOCALES: Locale[] = ["vi", "en", "zh", "ja", "ko"];
const DEFAULT_LOCALE: Locale = "vi";

export async function getLocale(): Promise<Locale> {
  // Priority: 1. Cookie, 2. Header, 3. Default
  const cookieStore = await cookies();
  const headersList = await headers();

  // Check cookie first
  const localeCookie = cookieStore.get("locale");
  if (localeCookie && SUPPORTED_LOCALES.includes(localeCookie.value as Locale)) {
    return localeCookie.value as Locale;
  }

  // Check Accept-Language header
  const acceptLanguage = headersList.get("accept-language");
  if (acceptLanguage) {
    // Parse Accept-Language header
    const locales = acceptLanguage
      .split(",")
      .map((lang) => {
        const [code] = lang.trim().split(";");
        return code.split("-")[0].toLowerCase();
      });

    for (const locale of locales) {
      if (SUPPORTED_LOCALES.includes(locale as Locale)) {
        return locale as Locale;
      }
    }
  }

  return DEFAULT_LOCALE;
}

export function t(
  key: string,
  locale: Locale = DEFAULT_LOCALE,
  params?: Record<string, string | number>
): string | Record<string, string> {
  const keys = key.split(".");
  let value: unknown = translations[locale];

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      // Fallback to Vietnamese
      value = translations[DEFAULT_LOCALE];
      for (const k2 of keys) {
        if (value && typeof value === "object" && k2 in value) {
          value = (value as Record<string, unknown>)[k2];
        } else {
          return key;
        }
      }
      break;
    }
  }

  let result = value as string | Record<string, string>;
  
  // Handle parameterized translations with pluralization
  if (typeof result === "string" && params) {
    // Check for plural forms like "count_one", "count_other"
    // Result might be a nested object with plural forms
    const resultObj = result as unknown as Record<string, string> | undefined;
    
    if (params.count !== undefined && resultObj && typeof resultObj === "object") {
      const count = Number(params.count);
      const pluralKey = getPluralKey(count, locale);
      const pluralValue = resultObj[pluralKey];
      if (pluralValue) {
        result = pluralValue;
      }
    }
    
    // Replace all {{param}} placeholders
    for (const [paramKey, paramValue] of Object.entries(params)) {
      result = (result as string).replace(new RegExp(`\\{\\{${paramKey}\\}\\}`, "g"), String(paramValue));
    }
  }
  
  return result;
}

// ICU plural rules by language
function getPluralKey(count: number, locale: Locale): string {
  // Vietnamese: only "other" for everything
  if (locale === "vi") {
    return "other";
  }
  
  // Chinese, Japanese, Korean: no plural forms
  if (locale === "zh" || locale === "ja" || locale === "ko") {
    return "other";
  }
  
  // English: 1 = one, everything else = other
  if (locale === "en") {
    return count === 1 ? "one" : "other";
  }
  
  return "other";
}

export { SUPPORTED_LOCALES, DEFAULT_LOCALE };
export type { Locale };