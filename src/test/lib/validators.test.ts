import { describe, it, expect } from "vitest";

describe("Validators", () => {
  describe("loginSchema", () => {
    it("validates correct email and password", async () => {
      const { loginSchema } = await import("@/lib/validators");
      const result = loginSchema.safeParse({
        email: "user@example.com",
        password: "password123",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid email", async () => {
      const { loginSchema } = await import("@/lib/validators");
      const result = loginSchema.safeParse({
        email: "not-an-email",
        password: "password123",
      });
      expect(result.success).toBe(false);
    });

    it("rejects empty password", async () => {
      const { loginSchema } = await import("@/lib/validators");
      const result = loginSchema.safeParse({
        email: "user@example.com",
        password: "",
      });
      expect(result.success).toBe(false);
    });

    it("rejects missing email", async () => {
      const { loginSchema } = await import("@/lib/validators");
      const result = loginSchema.safeParse({
        password: "password123",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("registerSchema", () => {
    it("validates correct registration data", async () => {
      const { registerSchema } = await import("@/lib/validators");
      const result = registerSchema.safeParse({
        email: "newuser@example.com",
        password: "SecurePassword123",
        name: "John Doe",
      });
      expect(result.success).toBe(true);
    });

    it("rejects short password", async () => {
      const { registerSchema } = await import("@/lib/validators");
      const result = registerSchema.safeParse({
        email: "user@example.com",
        password: "short",
        name: "John",
      });
      expect(result.success).toBe(false);
    });

    it("rejects empty name", async () => {
      const { registerSchema } = await import("@/lib/validators");
      const result = registerSchema.safeParse({
        email: "user@example.com",
        password: "SecurePassword123",
        name: "",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("createEventSchema", () => {
    it("validates valid event data", async () => {
      const { createEventSchema } = await import("@/lib/validators");
      const result = createEventSchema.safeParse({
        title: "My Wedding",
        slug: "john-jane-wedding",
        templateId: "550e8400-e29b-41d4-a716-446655440000",
        eventDate: "2026-06-15",
        eventTime: "14:00",
        venueName: "Grand Ballroom",
        venueAddress: "123 Main St",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid slug with uppercase", async () => {
      const { createEventSchema } = await import("@/lib/validators");
      const result = createEventSchema.safeParse({
        title: "My Wedding",
        slug: "Invalid-SLUG",
        templateId: "550e8400-e29b-41d4-a716-446655440000",
        eventDate: "2026-06-15",
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid slug with spaces", async () => {
      const { createEventSchema } = await import("@/lib/validators");
      const result = createEventSchema.safeParse({
        title: "My Wedding",
        slug: "invalid slug",
        templateId: "550e8400-e29b-41d4-a716-446655440000",
        eventDate: "2026-06-15",
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid UUID for templateId", async () => {
      const { createEventSchema } = await import("@/lib/validators");
      const result = createEventSchema.safeParse({
        title: "My Wedding",
        slug: "valid-slug",
        templateId: "not-a-uuid",
        eventDate: "2026-06-15",
      });
      expect(result.success).toBe(false);
    });

    it("rejects empty title", async () => {
      const { createEventSchema } = await import("@/lib/validators");
      const result = createEventSchema.safeParse({
        title: "",
        slug: "valid-slug",
        templateId: "550e8400-e29b-41d4-a716-446655440000",
        eventDate: "2026-06-15",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("rsvpSubmitSchema", () => {
    it("validates attending RSVP", async () => {
      const { rsvpSubmitSchema } = await import("@/lib/validators");
      const result = rsvpSubmitSchema.safeParse({
        attendance: "attending",
        plusOnes: 2,
        plusOneNames: "John, Jane",
      });
      expect(result.success).toBe(true);
    });

    it("validates not attending RSVP", async () => {
      const { rsvpSubmitSchema } = await import("@/lib/validators");
      const result = rsvpSubmitSchema.safeParse({
        attendance: "not_attending",
        notes: "Sorry, can't make it",
      });
      expect(result.success).toBe(true);
    });

    it("validates maybe RSVP", async () => {
      const { rsvpSubmitSchema } = await import("@/lib/validators");
      const result = rsvpSubmitSchema.safeParse({
        attendance: "maybe",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid attendance value", async () => {
      const { rsvpSubmitSchema } = await import("@/lib/validators");
      const result = rsvpSubmitSchema.safeParse({
        attendance: "yes",
      });
      expect(result.success).toBe(false);
    });

    it("rejects negative plusOnes", async () => {
      const { rsvpSubmitSchema } = await import("@/lib/validators");
      const result = rsvpSubmitSchema.safeParse({
        attendance: "attending",
        plusOnes: -1,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("guestImportRowSchema", () => {
    it("validates minimal guest data", async () => {
      const { guestImportRowSchema } = await import("@/lib/validators");
      const result = guestImportRowSchema.safeParse({
        name: "John Doe",
      });
      expect(result.success).toBe(true);
    });

    it("validates complete guest data", async () => {
      const { guestImportRowSchema } = await import("@/lib/validators");
      const result = guestImportRowSchema.safeParse({
        name: "John Doe",
        email: "john@example.com",
        phone: "+1234567890",
        relation: "friend",
        tableNumber: 5,
        seatCount: 2,
        groupName: "College Friends",
        notes: "Vegetarian",
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty name", async () => {
      const { guestImportRowSchema } = await import("@/lib/validators");
      const result = guestImportRowSchema.safeParse({
        name: "",
      });
      expect(result.success).toBe(false);
    });

    it("validates optional email can be empty string", async () => {
      const { guestImportRowSchema } = await import("@/lib/validators");
      const result = guestImportRowSchema.safeParse({
        name: "John Doe",
        email: "",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid relation enum", async () => {
      const { guestImportRowSchema } = await import("@/lib/validators");
      const result = guestImportRowSchema.safeParse({
        name: "John Doe",
        relation: "enemy",
      });
      expect(result.success).toBe(false);
    });
  });
});