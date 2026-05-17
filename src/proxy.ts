import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("wedding_token")?.value;

  const isAuthRoute = ["/login", "/register"].some((r) =>
    request.nextUrl.pathname.startsWith(r)
  );
  const isPublicRoute = request.nextUrl.pathname.startsWith("/invite");

  if (!token && !isAuthRoute && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL("/events", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images).*)"],
};