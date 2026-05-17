import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-zinc-900 mb-2">404</h1>
        <p className="text-zinc-500 mb-6">This invitation was not found or has expired.</p>
        <Link
          href="/"
          className="text-rose-600 font-medium hover:underline"
        >
          Go to homepage
        </Link>
      </div>
    </div>
  );
}
