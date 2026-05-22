import { describe, it, expect } from "vitest";
import { slugify, generateEventSlug } from "@/lib/slug";

describe("slug", () => {
  describe("slugify", () => {
    it("converts text to lowercase", () => {
      expect(slugify("John Doe")).toBe("john-doe");
    });

    it("converts spaces to hyphens", () => {
      expect(slugify("John Doe Smith")).toBe("john-doe-smith");
    });

    it("removes special characters", () => {
      expect(slugify("John & Jane's Wedding!")).toBe("john-janes-wedding");
    });

    it("removes Vietnamese diacritics", () => {
      expect(slugify("Nguyễn Văn A")).toBe("nguyen-van-a");
      expect(slugify("Trần Thị B")).toBe("tran-thi-b");
    });

    it("replaces multiple spaces with single hyphen", () => {
      expect(slugify("John    Doe")).toBe("john-doe");
    });

    it("removes leading and trailing hyphens", () => {
      expect(slugify("  John Doe  ")).toBe("john-doe");
    });

    it("handles empty string", () => {
      expect(slugify("")).toBe("");
    });

    it("handles single word", () => {
      expect(slugify("Wedding")).toBe("wedding");
    });

    it("handles numbers", () => {
      expect(slugify("2024 Wedding")).toBe("2024-wedding");
    });
  });

  describe("generateEventSlug", () => {
    it("generates slug with bride-groom-suffix format", () => {
      const slug = generateEventSlug("John", "Jane");
      expect(slug).toMatch(/^jane-john-[a-z0-9]{4}$/);
    });

    it("generates unique slugs each time", () => {
      const slug1 = generateEventSlug("John", "Jane");
      const slug2 = generateEventSlug("John", "Jane");
      expect(slug1).not.toBe(slug2);
    });

    it("handles Vietnamese names", () => {
      const slug = generateEventSlug("Nguyen", "Tran");
      expect(slug).toMatch(/^tran-nguyen-[a-z0-9]{4}$/);
    });

    it("handles names with special characters", () => {
      const slug = generateEventSlug("O'Brien", "Smith");
      expect(slug).toMatch(/^smith-obrien-[a-z0-9]{4}$/);
    });

    it("includes 4-character suffix", () => {
      const slug = generateEventSlug("John", "Jane");
      const suffix = slug.split("-").pop() || "";
      expect(suffix).toHaveLength(4);
      expect(suffix).toMatch(/^[a-z0-9]+$/);
    });
  });
});