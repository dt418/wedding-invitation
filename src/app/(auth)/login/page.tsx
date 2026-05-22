import LoginFormClient from "@/components/login-form";
import AuthToaster from "@/components/auth-toaster";
import { Toaster } from "sonner";
import { getLocale, t } from "@/lib/i18n-server";

export default async function LoginPage() {
  const locale = await getLocale();
  const translations = t("auth", locale) as { welcomeBack?: string; noAccount?: string; createAccount?: string };

  return (
    <>
      <Toaster position="top-right" richColors closeButton theme="light" />
      <AuthToaster />
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-sm border">
          <h1 className="text-2xl font-semibold mb-6">
            {translations.welcomeBack || "Welcome Back"}
          </h1>
          <LoginFormClient locale={locale} />
          <p className="mt-4 text-center text-sm text-zinc-500">
            {translations.noAccount || "No account yet?"}{" "}
            <a href="/register" className="text-rose-600 font-medium">
              {translations.createAccount || "Create one"}
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
