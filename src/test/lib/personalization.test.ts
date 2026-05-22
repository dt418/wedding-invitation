import { describe, it, expect } from "vitest";
import type { TemplateVariables } from "@/lib/personalization";
import {
  getGuestPronouns,
  formatSalutation,
  formatFamilySalutation,
  buildTemplateVariables,
  replaceTemplateVars,
  hasUnresolvedVars,
} from "@/lib/personalization";

const mockVars: TemplateVariables = {
  GUEST_NAME: "Minh",
  GUEST_PRONOUN: "anh",
  GUEST_PRONOUN_FULL: "Kính mời anh Minh",
  COUPLE_NAMES: "Minh & Lan",
  GROOM_NAME: "Minh",
  BRIDE_NAME: "Lan",
  EVENT_DATE: "15/06/2025",
  EVENT_TIME: "11:00",
  VENUE_NAME: "ABC",
  VENUE_ADDRESS: "XYZ",
  MAP_URL: "",
  INVITE_CODE: "ABC123",
  INVITE_URL: "https://example.com/invite/ABC123",
  THANK_YOU_NOTE: "Cảm ơn",
  TIMELINE: "",
};

describe("getGuestPronouns", () => {
  it("should return 'bạn' for friends", () => {
    const pronouns = getGuestPronouns("Nguyễn Văn A", null, "friend");
    expect(pronouns.formal).toBe("bạn");
    expect(pronouns.salutation).toBe("Kính mời bạn");
  });

  it("should return 'anh chị em' for family", () => {
    const pronouns = getGuestPronouns("Nguyễn Văn B", null, "family");
    expect(pronouns.formal).toBe("anh chị em");
    expect(pronouns.salutation).toBe("Kính mời anh chị em");
  });

  it("should return 'anh' for groom_side", () => {
    const pronouns = getGuestPronouns("Nguyễn Văn C", null, "groom_side");
    expect(pronouns.formal).toBe("anh");
    expect(pronouns.salutation).toBe("Kính mời anh");
  });

  it("should return 'cô' for bride_side", () => {
    const pronouns = getGuestPronouns("Trần Thị D", null, "bride_side");
    expect(pronouns.formal).toBe("cô");
    expect(pronouns.salutation).toBe("Kính mời cô");
  });

  it("should detect female from name containing 'Thị'", () => {
    const pronouns = getGuestPronouns("Nguyễn Thị Mai", "female", null);
    expect(pronouns.formal).toBe("cô");
    expect(pronouns.salutation).toBe("Kính mời cô");
  });

  it("should detect male from name containing 'Văn' or 'Minh'", () => {
    const pronouns1 = getGuestPronouns("Nguyễn Văn A", null, null);
    expect(pronouns1.formal).toBe("anh");

    const pronouns2 = getGuestPronouns("Trần Minh", null, null);
    expect(pronouns2.formal).toBe("anh");
  });

  it("should return 'anh chị' for unknown gender", () => {
    const pronouns = getGuestPronouns("XYZ Unknown", null, null);
    expect(pronouns.formal).toBe("anh chị");
    expect(pronouns.salutation).toBe("Kính mời anh chị");
  });
});

describe("formatSalutation", () => {
  it("should format salutation with guest name", () => {
    const pronouns = getGuestPronouns("Nguyễn Văn A", null, "friend");
    const salutation = formatSalutation(pronouns, "Nguyễn Văn A");
    expect(salutation).toBe("Kính mời bạn Nguyễn Văn A");
  });
});

describe("formatFamilySalutation", () => {
  it("should format family salutation", () => {
    const pronouns = getGuestPronouns("", null, "groom_side");
    const salutation = formatFamilySalutation(pronouns, "Minh");
    expect(salutation).toContain("Kính mời");
    expect(salutation).toContain("gia đình anh");
  });
});

describe("replaceTemplateVars", () => {
  it("should replace single variable", () => {
    const result = replaceTemplateVars("Hello {{GUEST_NAME}}!", mockVars);
    expect(result).toBe("Hello Minh!");
  });

  it("should replace multiple variables", () => {
    const result = replaceTemplateVars(
      "{{GUEST_NAME}} - {{GUEST_PRONOUN}}",
      { ...mockVars, GUEST_NAME: "Nguyễn Văn A", GUEST_PRONOUN: "anh" }
    );
    expect(result).toBe("Nguyễn Văn A - anh");
  });

  it("should preserve unresolved variables", () => {
    const result = replaceTemplateVars("Hello {{GUEST_NAME}} and {{MISSING}}!", mockVars);
    expect(result).toBe("Hello Minh and {{MISSING}}!");
  });

  it("should handle null/undefined values", () => {
    const result = replaceTemplateVars("Hello {{GUEST_NAME}}!", { ...mockVars, GUEST_NAME: null as unknown as string });
    expect(result).toBe("Hello !");
  });
});

describe("hasUnresolvedVars", () => {
  it("should return true if unresolved vars exist", () => {
    expect(hasUnresolvedVars("Hello {{GUEST_NAME}}!")).toBe(true);
  });

  it("should return false if no unresolved vars", () => {
    expect(hasUnresolvedVars("Hello World!")).toBe(false);
  });

  it("should return false for empty template", () => {
    expect(hasUnresolvedVars("")).toBe(false);
  });
});

describe("buildTemplateVariables", () => {
  it("should build variables from event and guest data", () => {
    const eventData = {
      title: "Minh & Lan",
      groomName: "Nguyễn Văn Minh",
      brideName: "Trần Thị Lan",
      eventDate: new Date("2025-06-15"),
      eventTime: "11:00",
      venueName: "Nhà hàng ABC",
      venueAddress: "123 Đường XYZ",
      mapUrl: "https://maps.google.com/abc",
    };

    const guestData = {
      name: "Lê Văn B",
      gender: "male" as const,
      relation: "friend" as const,
    };

    const vars = buildTemplateVariables(eventData, guestData, "ABC123", "https://example.com");

    expect(vars.GUEST_NAME).toBe("Lê Văn B");
    expect(vars.GUEST_PRONOUN).toBe("bạn");
    expect(vars.GUEST_PRONOUN_FULL).toBe("Kính mời bạn Lê Văn B");
    expect(vars.COUPLE_NAMES).toBe("Nguyễn Văn Minh & Trần Thị Lan");
    expect(vars.INVITE_CODE).toBe("ABC123");
    expect(vars.INVITE_URL).toBe("https://example.com/invite/ABC123");
  });

  it("should handle eventContent data", () => {
    const eventData = {
      title: "Minh & Lan",
      groomName: null,
      brideName: null,
      eventDate: new Date("2025-06-15"),
      eventContent: {
        groomName: "Nguyễn Văn Minh",
        brideName: "Trần Thị Lan",
        thankYouNote: "Cảm ơn bạn!",
        groomBank: "Vietcombank",
        groomAccount: "123456789",
      },
    };

    const guestData = {
      name: "Test Guest",
      gender: null,
      relation: null,
    };

    const vars = buildTemplateVariables(eventData, guestData, "TEST", "https://example.com");

    expect(vars.GROOM_NAME).toBe("Nguyễn Văn Minh");
    expect(vars.BRIDE_NAME).toBe("Trần Thị Lan");
    expect(vars.THANK_YOU_NOTE).toBe("Cảm ơn bạn!");
    expect(vars.GROOM_BANK).toBe("Vietcombank");
    expect(vars.GROOM_ACCOUNT).toBe("123456789");
  });
});