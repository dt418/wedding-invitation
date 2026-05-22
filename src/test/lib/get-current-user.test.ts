import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({
    toString: vi.fn(() => "wedding_token=mock_token"),
  })),
}));

vi.mock("@/db", () => ({
  db: {
    select: vi.fn(),
  },
}));

vi.mock("@/lib/auth", () => ({
  verifyToken: vi.fn(),
  getTokenFromCookies: vi.fn(),
}));

describe("getCurrentUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when no token in cookies", async () => {
    const { getTokenFromCookies } = await import("@/lib/auth");
    vi.mocked(getTokenFromCookies).mockReturnValue(null);

    const { getCurrentUser } = await import("@/app/(auth)/get-current-user");
    const result = await getCurrentUser();
    expect(result).toBeNull();
  });

  it("returns null when token is invalid", async () => {
    const { getTokenFromCookies, verifyToken } = await import("@/lib/auth");
    vi.mocked(getTokenFromCookies).mockReturnValue("invalid_token");
    vi.mocked(verifyToken).mockReturnValue(null);

    const { getCurrentUser } = await import("@/app/(auth)/get-current-user");
    const result = await getCurrentUser();
    expect(result).toBeNull();
  });

  it("returns user data when token is valid", async () => {
    const { getTokenFromCookies, verifyToken } = await import("@/lib/auth");
    const { db } = await import("@/db");

    vi.mocked(getTokenFromCookies).mockReturnValue("valid_token");
    vi.mocked(verifyToken).mockReturnValue({
      userId: "user_123",
      email: "test@example.com",
      role: "user",
    });

    // Mock db.select().from().where().limit() chain for Drizzle
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{
            id: "user_123",
            email: "test@example.com",
            name: "Test User",
            avatarUrl: null,
            role: "user",
          }]),
        }),
      }),
    } as never);

    const { getCurrentUser } = await import("@/app/(auth)/get-current-user");
    const result = await getCurrentUser();

    expect(result).toEqual({
      id: "user_123",
      email: "test@example.com",
      name: "Test User",
      avatarUrl: null,
      role: "user",
    });
  });

  it("returns null when user not found in database", async () => {
    const { getTokenFromCookies, verifyToken } = await import("@/lib/auth");
    const { db } = await import("@/db");

    vi.mocked(getTokenFromCookies).mockReturnValue("valid_token");
    vi.mocked(verifyToken).mockReturnValue({
      userId: "user_not_exists",
      email: "ghost@example.com",
      role: "user",
    });

    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    } as never);

    const { getCurrentUser } = await import("@/app/(auth)/get-current-user");
    const result = await getCurrentUser();
    expect(result).toBeNull();
  });
});