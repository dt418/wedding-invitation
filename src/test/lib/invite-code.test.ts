import { describe, it, expect } from "vitest";
import { generateInviteCode, generateInviteUrl } from "@/lib/invite-code";

describe("invite-code", () => {
  describe("generateInviteCode", () => {
    it("generates an 8-character code", () => {
      const code = generateInviteCode();
      expect(code).toHaveLength(8);
    });

    it("generates codes with valid characters (no I, O, L)", () => {
      const code = generateInviteCode();
      expect(code).toMatch(/^[0123456789ABCDEFGHJKLMNPQRSTUVWXYZ]+$/);
    });

    it("generates different codes each time", () => {
      const code1 = generateInviteCode();
      const code2 = generateInviteCode();
      expect(code1).not.toBe(code2);
    });

    it("generates uppercase codes only", () => {
      const code = generateInviteCode();
      expect(code).toBe(code.toUpperCase());
    });
  });

  describe("generateInviteUrl", () => {
    it("generates correct URL format", () => {
      const url = generateInviteUrl("john-jane-wedding", "ABC12345");
      expect(url).toBe("/invite/ABC12345");
    });

    it("handles slug with special characters", () => {
      const url = generateInviteUrl("john-and-jane-2024", "XYZ98765");
      expect(url).toBe("/invite/XYZ98765");
    });
  });
});