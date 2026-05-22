"use server";

import { cookies } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { verifyToken, getTokenFromCookies } from "@/lib/auth";
import { eq } from "drizzle-orm";

export interface CurrentUser {
  id: string;
  name: string | null;
  email: string;
  avatarUrl: string | null;
  role: "user" | "agency" | "admin";
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const token = getTokenFromCookies(cookieHeader);

  if (!token) {
    return null;
  }

  const payload = verifyToken(token);
  if (!payload) {
    return null;
  }

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      avatarUrl: users.avatarUrl,
      role: users.role,
    })
    .from(users)
    .where(eq(users.id, payload.userId))
    .limit(1);

  return user ?? null;
}
