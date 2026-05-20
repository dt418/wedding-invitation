import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { signToken, verifyPassword } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const parsed = loginSchema.safeParse({ email, password });

    if (!parsed.success) {
      return NextResponse.redirect(
        new URL("/login?error=invalid_credentials", request.url)
      );
    }

    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      return NextResponse.redirect(
        new URL("/login?error=invalid_credentials", request.url)
      );
    }

    const valid = await verifyPassword(password, user.passwordHash);

    if (!valid) {
      return NextResponse.redirect(
        new URL("/login?error=invalid_credentials", request.url)
      );
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    const cookieStore = await cookies();
    cookieStore.set("wedding_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.redirect(new URL("/events?justLoggedIn=true", request.url));
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.redirect(
      new URL("/login?error=generic", request.url)
    );
  }
}