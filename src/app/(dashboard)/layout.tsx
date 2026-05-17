import { logoutAction } from "@/app/(auth)/actions";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="sticky top-0 z-50 bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-semibold">
              Wedding Invite
            </Link>
            <nav className="flex gap-6 text-sm">
              <Link
                href="/events"
                className="text-zinc-600 hover:text-zinc-900"
              >
                Events
              </Link>
              <Link
                href="/templates"
                className="text-zinc-600 hover:text-zinc-900"
              >
                Templates
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/settings"
              className="text-sm text-zinc-600 hover:text-zinc-900"
            >
              Settings
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="text-sm text-zinc-500 hover:text-zinc-700"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
