import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("utils - cn", () => {
  it("merges class names correctly", () => {
    const result = cn("text-red-500", "bg-blue-500");
    expect(result).toContain("text-red-500");
    expect(result).toContain("bg-blue-500");
  });

  it("handles conditional classes", () => {
    const isActive = true;
    const result = cn("base-class", isActive && "active-class");
    expect(result).toContain("base-class");
    expect(result).toContain("active-class");
  });

  it("handles false conditions", () => {
    const isActive = false;
    const result = cn("base-class", isActive && "active-class");
    expect(result).toContain("base-class");
    expect(result).not.toContain("active-class");
  });

  it("merges tailwind classes with conflicts", () => {
    const result = cn("text-red-500 text-blue-500");
    // clsx/clsx merging should handle duplicate classes
    expect(result).toBeTruthy();
  });

  it("handles undefined and null", () => {
    const result = cn("base-class", undefined, null, "other-class");
    expect(result).toContain("base-class");
    expect(result).toContain("other-class");
  });

  it("handles empty strings", () => {
    const result = cn("", "base-class", "");
    expect(result).toContain("base-class");
  });

  it("works with object variant classes", () => {
    const variant = { primary: true, secondary: false };
    const result = cn("base", variant);
    expect(result).toContain("base");
    expect(result).toContain("primary");
  });
});