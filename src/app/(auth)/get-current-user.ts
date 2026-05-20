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

  const user = await db.query.users.findFirst({
    where: eq(users.id, payload.userId),
    columns: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      role: true,
    },
  });

  return user ?? null;
}
