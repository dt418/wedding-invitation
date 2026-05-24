"use client";

import { useFormStatus } from "react-dom";
import { translations, type Locale } from "@/lib/i18n";

interface LoginFormProps {
  locale?: Locale;
}

function SubmitButton({ locale = "en" }: { locale?: Locale }) {
  const { pending } = useFormStatus();
  const t = translations[locale];

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-3 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-colors disabled:opacity-50"
    >
      {pending ? t.common.loading : t.auth.signIn}
    </button>
  );
}

export default function LoginFormClient({ locale = "en" }: LoginFormProps) {
  const t = translations[locale];

  return (
    <form action="/api/auth/login" method="POST" className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">{t.auth.email}</label>
        <input
          name="email"
          type="email"
          required
          className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">{t.auth.password}</label>
        <input
          name="password"
          type="password"
          required
          className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
        />
      </div>
      <SubmitButton locale={locale} />
    </form>
  );
}