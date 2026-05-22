import { registerAction } from "../actions";
import { getLocale, t } from "@/lib/i18n-server";

export default async function RegisterPage() {
  const locale = await getLocale();
  const translations = t("auth", locale) as { registerTitle?: string; name?: string; email?: string; password?: string; alreadyHaveAccount?: string; signInLink?: string };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-sm border">
        <h1 className="text-2xl font-semibold mb-6">
          {translations.registerTitle || "Create Account"}
        </h1>
        <form action={registerAction} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              {translations.name || "Name"}
            </label>
            <input
              name="name"
              type="text"
              required
              className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              {translations.email || "Email"}
            </label>
            <input
              name="email"
              type="email"
              required
              className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              {translations.password || "Password"}
            </label>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-colors"
          >
            {translations.registerTitle || "Create Account"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-zinc-500">
          {translations.alreadyHaveAccount || "Already have an account?"}{" "}
          <a href="/login" className="text-rose-600 font-medium">
            {translations.signInLink || "Sign in"}
          </a>
        </p>
      </div>
    </div>
  );
}
