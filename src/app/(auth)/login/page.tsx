import LoginFormClient from "@/components/login-form";
import AuthToaster from "@/components/auth-toaster";
import { Toaster } from "sonner";

export default function LoginPage() {
  return (
    <>
      <Toaster position="top-right" richColors closeButton theme="light" />
      <AuthToaster />
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-sm border">
          <h1 className="text-2xl font-semibold mb-6">Welcome Back</h1>
          <LoginFormClient />
          <p className="mt-4 text-center text-sm text-zinc-500">
            No account yet?{" "}
            <a href="/register" className="text-rose-600 font-medium">
              Create one
            </a>
          </p>
        </div>
      </div>
    </>
  );
}