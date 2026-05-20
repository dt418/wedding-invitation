import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/db", () => ({
  db: {
    query: {
      users: {
        findFirst: vi.fn(),
      },
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  signToken: vi.fn(() => "mocked_token"),
  verifyPassword: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({
    set: vi.fn(),
  })),
}));

vi.mock("@/lib/validators", () => ({
  loginSchema: {
    safeParse: vi.fn(),
  },
}));

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function importRoute() {
    const { POST } = await import("@/app/api/auth/login/route");
    return { POST };
  }

  it("returns redirect to /login?error=invalid_credentials when email is missing", async () => {
    const { loginSchema } = await import("@/lib/validators");
    vi.mocked(loginSchema.safeParse).mockReturnValue({
      success: false,
    } as never);

    const { POST } = await importRoute();
    const req = new NextRequest("http://localhost/api/auth/login", {
      method: "POST",
      body: new FormData(),
    });
    const res = await POST(req);
    expect(res.status).toBeGreaterThanOrEqual(300);
    expect(res.status).toBeLessThan(400);
    expect(res.headers.get("location")).toContain("/login?error=invalid_credentials");
  });

  it("returns redirect to /login?error=invalid_credentials when user not found", async () => {
    const { loginSchema } = await import("@/lib/validators");
    const { db } = await import("@/db");

    vi.mocked(loginSchema.safeParse).mockReturnValue({
      success: true,
      data: { email: "test@test.com", password: "password123" },
    } as never);
    vi.mocked(db.query.users.findFirst).mockResolvedValue(null);

    const { POST } = await importRoute();
    const formData = new FormData();
    formData.set("email", "test@test.com");
    formData.set("password", "password123");
    const req = new NextRequest("http://localhost/api/auth/login", {
      method: "POST",
      body: formData,
    });
    const res = await POST(req);
    expect(res.status).toBeGreaterThanOrEqual(300);
    expect(res.status).toBeLessThan(400);
    expect(res.headers.get("location")).toContain("/login?error=invalid_credentials");
  });

  it("returns redirect to /login?error=invalid_credentials when password is wrong", async () => {
    const { loginSchema } = await import("@/lib/validators");
    const { db } = await import("@/db");
    const { verifyPassword } = await import("@/lib/auth");

    vi.mocked(loginSchema.safeParse).mockReturnValue({
      success: true,
      data: { email: "test@test.com", password: "wrongpassword" },
    } as never);
    vi.mocked(db.query.users.findFirst).mockResolvedValue({
      id: "user_1",
      email: "test@test.com",
      passwordHash: "hashed_password",
      role: "user",
    } as never);
    vi.mocked(verifyPassword).mockResolvedValue(false);

    const { POST } = await importRoute();
    const formData = new FormData();
    formData.set("email", "test@test.com");
    formData.set("password", "wrongpassword");
    const req = new NextRequest("http://localhost/api/auth/login", {
      method: "POST",
      body: formData,
    });
    const res = await POST(req);
    expect(res.status).toBeGreaterThanOrEqual(300);
    expect(res.status).toBeLessThan(400);
    expect(res.headers.get("location")).toContain("/login?error=invalid_credentials");
  });

  it("returns redirect to /events when login succeeds", async () => {
    const { loginSchema } = await import("@/lib/validators");
    const { db } = await import("@/db");
    const { verifyPassword } = await import("@/lib/auth");
    const { signToken } = await import("@/lib/auth");

    vi.mocked(loginSchema.safeParse).mockReturnValue({
      success: true,
      data: { email: "test@test.com", password: "correctpassword" },
    } as never);
    vi.mocked(db.query.users.findFirst).mockResolvedValue({
      id: "user_1",
      email: "test@test.com",
      passwordHash: "hashed_password",
      role: "user",
    } as never);
    vi.mocked(verifyPassword).mockResolvedValue(true);
    vi.mocked(signToken).mockReturnValue("valid_jwt_token");

    const { POST } = await importRoute();
    const formData = new FormData();
    formData.set("email", "test@test.com");
    formData.set("password", "correctpassword");
    const req = new NextRequest("http://localhost/api/auth/login", {
      method: "POST",
      body: formData,
    });
    const res = await POST(req);
    expect(res.status).toBeGreaterThanOrEqual(300);
    expect(res.status).toBeLessThan(400);
    expect(res.headers.get("location")).toContain("/events");
  });

  it("returns redirect to /login?error=generic on unexpected error", async () => {
    const { loginSchema } = await import("@/lib/validators");
    vi.mocked(loginSchema.safeParse).mockImplementation(() => {
      throw new Error("Unexpected error");
    });

    const { POST } = await importRoute();
    const req = new NextRequest("http://localhost/api/auth/login", {
      method: "POST",
      body: new FormData(),
    });
    const res = await POST(req);
    expect(res.status).toBeGreaterThanOrEqual(300);
    expect(res.status).toBeLessThan(400);
    expect(res.headers.get("location")).toContain("/login?error=generic");
  });
});
