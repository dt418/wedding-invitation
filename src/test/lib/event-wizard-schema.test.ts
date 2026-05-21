import { describe, it, expect } from "vitest";
import {
  timelineTypes,
  ceremonyTypes,
  DEFAULT_TIMELINE,
  DEFAULT_THANK_YOU,
  type TimelineType,
  type CeremonyType,
} from "@/lib/schemas/event-wizard-schema";

describe("event-wizard-schema", () => {
  describe("timelineTypes", () => {
    it("contains expected timeline types", () => {
      const types = timelineTypes.map((t) => t.value);
      expect(types).toContain("arrival");
      expect(types).toContain("ceremony");
      expect(types).toContain("reception");
      expect(types).toContain("cake");
      expect(types).toContain("dance");
      expect(types).toContain("end");
      expect(types).toContain("custom");
    });

    it("has labels for all types", () => {
      timelineTypes.forEach((type) => {
        expect(type.label).toBeTruthy();
        expect(typeof type.label).toBe("string");
      });
    });

    it("has unique values", () => {
      const values = timelineTypes.map((t) => t.value);
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(values.length);
    });
  });

  describe("ceremonyTypes", () => {
    it("contains expected ceremony types", () => {
      const types = ceremonyTypes.map((t) => t.value);
      expect(types).toContain("le_nap_tai");
      expect(types).toContain("le_vu_quy");
      expect(types).toContain("le_thanh_hon");
      expect(types).toContain("le_dam");
      expect(types).toContain("le_nhao");
      expect(types).toContain("other");
    });

    it("has Vietnamese labels", () => {
      ceremonyTypes.forEach((type) => {
        expect(type.label).toBeTruthy();
        expect(type.label.length).toBeGreaterThan(0);
      });
    });
  });

  describe("DEFAULT_TIMELINE", () => {
    it("has at least 4 timeline items", () => {
      expect(DEFAULT_TIMELINE.length).toBeGreaterThanOrEqual(4);
    });

    it("has valid time format (HH:MM)", () => {
      DEFAULT_TIMELINE.forEach((item) => {
        expect(item.time).toMatch(/^\d{2}:\d{2}$/);
      });
    });

    it("has chronological order", () => {
      for (let i = 1; i < DEFAULT_TIMELINE.length; i++) {
        const prev = DEFAULT_TIMELINE[i - 1].time;
        const curr = DEFAULT_TIMELINE[i].time;
        expect(prev <= curr).toBe(true);
      }
    });

    it("has title for all items", () => {
      DEFAULT_TIMELINE.forEach((item) => {
        expect(item.title).toBeTruthy();
      });
    });

    it("starts with arrival type", () => {
      expect(DEFAULT_TIMELINE[0].type).toBe("arrival");
    });

    it("ends with end type", () => {
      expect(DEFAULT_TIMELINE[DEFAULT_TIMELINE.length - 1].type).toBe("end");
    });
  });

  describe("DEFAULT_THANK_YOU", () => {
    it("is a non-empty string", () => {
      expect(DEFAULT_THANK_YOU).toBeTruthy();
      expect(typeof DEFAULT_THANK_YOU).toBe("string");
      expect(DEFAULT_THANK_YOU.length).toBeGreaterThan(0);
    });

    it("contains gratitude message", () => {
      expect(DEFAULT_THANK_YOU.toLowerCase()).toContain("cảm ơn");
    });
  });

  describe("TypeScript types", () => {
    it("TimelineType accepts valid values", () => {
      const type: TimelineType = "ceremony";
      expect(type).toBe("ceremony");
    });

    it("CeremonyType accepts valid values", () => {
      const type: CeremonyType = "le_thanh_hon";
      expect(type).toBe("le_thanh_hon");
    });
  });
});