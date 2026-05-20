import { describe, it, expect, vi, beforeEach } from "vitest";

describe("Auth Utils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset env
    vi.stubEnv("JWT_SECRET", "test-secret-key-for-testing-purposes-only-32ch");
  });

  describe("verifyToken", () => {
    it("returns null for invalid token", async () => {
      const { verifyToken } = await import("@/lib/auth");
      expect(verifyToken("invalid-token")).toBeNull();
    });

    it("returns null for empty token", async () => {
      const { verifyToken } = await import("@/lib/auth");
      expect(verifyToken("")).toBeNull();
    });

    it("returns payload for valid token", async () => {
      const { signToken, verifyToken } = await import("@/lib/auth");
      const token = signToken({
        userId: "user_123",
        email: "test@example.com",
        role: "user",
      });
      const payload = verifyToken(token);
      expect(payload).toBeTruthy();
      expect(payload?.userId).toBe("user_123");
      expect(payload?.email).toBe("test@example.com");
      expect(payload?.role).toBe("user");
    });

    it("returns null for expired token", async () => {
      vi.useFakeTimers();
      const { signToken, verifyToken } = await import("@/lib/auth");
      const token = signToken({
        userId: "user_123",
        email: "test@example.com",
        role: "user",
      });
      vi.advanceTimersByTime(8 * 24 * 60 * 60 * 1000); // 8 days
      const payload = verifyToken(token);
      expect(payload).toBeNull();
      vi.useRealTimers();
    });
  });

  describe("signToken", () => {
    it("creates a non-empty token", async () => {
      const { signToken } = await import("@/lib/auth");
      const token = signToken({
        userId: "user_456",
        email: "user@test.com",
        role: "admin",
      });
      expect(token).toBeTruthy();
      expect(typeof token).toBe("string");
      expect(token.length).toBeGreaterThan(10);
    });

    it("creates different tokens for different users", async () => {
      const { signToken } = await import("@/lib/auth");
      const token1 = signToken({ userId: "user_1", email: "a@test.com", role: "user" });
      const token2 = signToken({ userId: "user_2", email: "b@test.com", role: "user" });
      expect(token1).not.toBe(token2);
    });
  });

  describe("getTokenFromCookies", () => {
    it("returns null for null cookie header", async () => {
      const { getTokenFromCookies } = await import("@/lib/auth");
      expect(getTokenFromCookies(null)).toBeNull();
    });

    it("returns null when wedding_token not found", async () => {
      const { getTokenFromCookies } = await import("@/lib/auth");
      expect(getTokenFromCookies("other_token=abc; session=xyz")).toBeNull();
    });

    it("extracts token from cookie header", async () => {
      const { getTokenFromCookies } = await import("@/lib/auth");
      expect(getTokenFromCookies("wedding_token=myjwt123; other=value")).toBe("myjwt123");
    });

    it("handles cookie with no trailing semicolon", async () => {
      const { getTokenFromCookies } = await import("@/lib/auth");
      expect(getTokenFromCookies("wedding_token=abc123")).toBe("abc123");
    });
  });

  describe("hashPassword & verifyPassword", () => {
    it("hashes password and verifies correctly", async () => {
      const { hashPassword, verifyPassword } = await import("@/lib/auth");
      const hash = await hashPassword("MySecurePassword123");
      expect(hash).toBeTruthy();
      expect(hash).not.toBe("MySecurePassword123");

      const isValid = await verifyPassword("MySecurePassword123", hash);
      expect(isValid).toBe(true);
    });

    it("returns false for wrong password", async () => {
      const { hashPassword, verifyPassword } = await import("@/lib/auth");
      const hash = await hashPassword("CorrectPassword");
      const isValid = await verifyPassword("WrongPassword", hash);
      expect(isValid).toBe(false);
    });
  });
});