import { logoutAction } from "@/app/(auth)/actions";
import { getCurrentUser } from "@/app/(auth)/get-current-user";
import Link from "next/link";
import { Toaster } from "sonner";
import LoginSuccessToastWrapper from "@/components/login-success-toast";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { User } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <>
      <Toaster position="top-right" richColors closeButton theme="light" />
      <LoginSuccessToastWrapper />
      <div className="min-h-screen bg-zinc-50">
        <header className="sticky top-0 z-50 bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-8">
              <Link href="/" className="text-xl font-semibold text-rose-600">
                Wedding Invite
              </Link>
              <nav className="flex gap-6 text-sm">
                <Link
                  href="/events"
                  className="text-zinc-600 hover:text-zinc-900 transition-colors"
                >
                  Events
                </Link>
                <Link
                  href="/templates"
                  className="text-zinc-600 hover:text-zinc-900 transition-colors"
                >
                  Templates
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <Link
                    href="/settings"
                    className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
                  >
                    Settings
                  </Link>
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="relative">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.name || "User"}
                          className="w-9 h-9 rounded-full object-cover border-2 border-rose-100"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                          {user.name ? (
                            <span className="text-sm font-medium">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          ) : (
                            <User className="w-5 h-5" />
                          )}
                        </div>
                      )}
                    </div>
                    {/* User info */}
                    <div className="hidden sm:block">
                      <p className="text-sm font-medium text-zinc-900 leading-tight">
                        {user.name || "User"}
                      </p>
                      <p className="text-xs text-zinc-500 leading-tight">
                        {user.email}
                      </p>
                    </div>
                    {/* Divider */}
                    <div className="w-px h-8 bg-zinc-200" />
                    {/* Logout */}
                    <form action={logoutAction}>
                      <button
                        type="submit"
                        className="text-sm text-zinc-500 hover:text-zinc-700 transition-colors"
                      >
                        Logout
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      <Icons.user className="w-4 h-4 mr-2" />
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm">Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
      </div>
    </>
  );
}