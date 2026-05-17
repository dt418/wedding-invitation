import { z } from "zod";

export const registerSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 chars"),
  name: z.string().min(1, "Name is required").max(255),
});

export const loginSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export const createEventSchema = z.object({
  title: z.string().min(1).max(255),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens"),
  templateId: z.uuid("Invalid template ID"),
  eventDate: z.string(),
  eventTime: z.string().optional(),
  venueName: z.string().max(255).optional(),
  venueAddress: z.string().optional(),
  mapUrl: z.url().optional(),
  description: z.string().optional(),
});

export const updateEventSchema = createEventSchema.partial();

export const guestImportRowSchema = z.object({
  name: z.string().min(1, "Name required"),
  email: z.email().optional().or(z.literal("")),
  phone: z.string().max(20).optional().or(z.literal("")),
  relation: z.enum(["groom_side", "bride_side", "friend", "family"]).optional(),
  tableNumber: z.number().int().positive().optional(),
  seatCount: z.number().int().min(1).default(1).optional(),
  groupName: z.string().max(255).optional(),
  notes: z.string().optional(),
});

export const rsvpSubmitSchema = z.object({
  attendance: z.enum(["attending", "not_attending", "maybe"]),
  plusOnes: z.number().int().min(0).default(0),
  plusOneNames: z.string().max(500).optional(),
  dietaryRestrictions: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
});
