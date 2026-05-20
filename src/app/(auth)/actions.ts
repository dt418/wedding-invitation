"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword, signToken } from "@/lib/auth";
import { registerSchema, loginSchema } from "@/lib/validators";
import { eq } from "drizzle-orm";

export async function registerAction(formData: FormData) {
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return;
  }

  const { email, password, name } = parsed.data;

  const existing = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existing) {
    return;
  }

  const passwordHash = await hashPassword(password);

  const [user] = await db
    .insert(users)
    .values({ email, passwordHash, name, role: "user" })
    .returning();

  const token = signToken({ userId: user.id, email: user.email, role: user.role });

  const cookieStore = await cookies();
  cookieStore.set("wedding_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect("/login?registered=true");
}

export async function loginAction(_prevState: unknown, formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect("/login?error=invalid_credentials");
  }

  const { email, password } = parsed.data;

  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    redirect("/login?error=invalid_credentials");
  }

  const { verifyPassword } = await import("@/lib/auth");
  const valid = await verifyPassword(password, user.passwordHash);

  if (!valid) {
    redirect("/login?error=invalid_credentials");
  }

  const token = signToken({ userId: user.id, email: user.email, role: user.role });

  const cookieStore = await cookies();
  cookieStore.set("wedding_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect("/events");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("wedding_token");
  redirect("/login?loggedOut=true");
}
