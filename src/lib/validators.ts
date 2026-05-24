
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

// Timeline entry schema
export const timelineEntrySchema = z.object({
  time: z.string(),
  type: z.string(),
  title: z.string(),
  description: z.string().optional(),
});

// Image entry schema
export const imageEntrySchema = z.object({
  url: z.string().url(),
  caption: z.string().optional(),
});

// Extended event content (wizard data)
export const eventContentSchema = z.object({
  groomName: z.string().max(100).optional(),
  brideName: z.string().max(100).optional(),
  groomFather: z.string().max(100).optional(),
  groomMother: z.string().max(100).optional(),
  brideFather: z.string().max(100).optional(),
  brideMother: z.string().max(100).optional(),
  groomAddress: z.string().optional(),
  brideAddress: z.string().optional(),
  ceremonyType: z.string().optional(),
  timeline: z.array(timelineEntrySchema).optional(),
  images: z.array(imageEntrySchema).optional(),
  thankYouNote: z.string().optional(),
  groomBank: z.string().optional(),
  groomAccount: z.string().optional(),
  brideBank: z.string().optional(),
  brideAccount: z.string().optional(),
  musicEnabled: z.boolean().optional(),
  musicUrl: z.string().optional(),
  rsvpEnabled: z.boolean().optional(),
  guestbookEnabled: z.boolean().optional(),
});

export const createEventSchema = z.object({
  title: z.string().min(1).max(255),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens"),
  templateId: z.string().uuid("Invalid template ID"),
  eventDate: z.string(),
  eventTime: z.string().optional(),
  venueName: z.string().max(255).optional().nullable(),
  venueAddress: z.string().optional().nullable(),
  mapUrl: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  groomName: z.string().max(100).optional(),
  brideName: z.string().max(100).optional(),
  // Extended event content from wizard
  eventContent: eventContentSchema.optional(),
});

export const updateEventSchema = createEventSchema.partial();

export const guestImportRowSchema = z.object({
  name: z.string().min(1, "Name required"),
  email: z.email().optional().or(z.literal("")),
  phone: z.string().max(20).optional().or(z.literal("")),
  relation: z.enum(["groom_side", "bride_side", "friend", "family"]).optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
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
