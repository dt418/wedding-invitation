import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  varchar,
  integer,
  jsonb,
  date,
  time,
  index,
  uniqueIndex,
  pgEnum,
} from "drizzle-orm/pg-core";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", ["user", "agency", "admin"]);

export const subscriptionTierEnum = pgEnum("subscription_tier", [
  "free",
  "agency",
]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "cancelled",
  "expired",
]);

export const eventStatusEnum = pgEnum("event_status", [
  "draft",
  "published",
  "archived",
]);

export const inviteStatusEnum = pgEnum("invite_status", [
  "pending",
  "sent",
  "opened",
  "responded",
]);

export const rsvpAttendanceEnum = pgEnum("rsvp_attendance", [
  "attending",
  "not_attending",
  "maybe",
]);

export const deliveryMethodEnum = pgEnum("delivery_method", [
  "email",
  "sms",
  "whatsapp",
  "link",
]);

export const templateCategoryEnum = pgEnum("template_category", [
  "truyen_thong",
  "thien_nhien",
  "hien_dai",
  "lang_man",
  "co_phuc",
  "sang_trong",
  "toi_gian",
  "typography",
  "de_thuong",
]);

// ─── Users ────────────────────────────────────────────────────────────────────

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    name: varchar("name", { length: 255 }),
    avatarUrl: text("avatar_url"),
    role: userRoleEnum("role").notNull().default("user"),

    // Agency-only fields
    agencyName: varchar("agency_name", { length: 255 }),
    whiteLabelDomain: varchar("white_label_domain", { length: 255 }),
    agencyLogoUrl: text("agency_logo_url"),

    // Timestamps
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [index("idx_users_email").on(table.email)],
);

// ─── Events ───────────────────────────────────────────────────────────────────

export const events = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    slug: varchar("slug", { length: 100 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    templateId: uuid("template_id").notNull(),

    // Event details
    eventDate: date("event_date").notNull(),
    eventTime: time("event_time"),
    timezone: varchar("timezone", { length: 50 }).default("Asia/Ho_Chi_Minh"),
    venueName: varchar("venue_name", { length: 255 }),
    venueAddress: text("venue_address"),
    mapUrl: text("map_url"),

    // Visual
    thumbnailUrl: text("thumbnail_url"),

    // Status
    status: eventStatusEnum("status").notNull().default("draft"),

    // Timestamps
    createdAt: timestamp("created_at").notNull().defaultNow(),
    publishedAt: timestamp("published_at"),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    // Slug unique per user (white-label safe)
    uniqueIndex("idx_events_user_slug").on(table.userId, table.slug),
    // Published events lookup
    index("idx_events_published").on(table.status),
    // User's events
    index("idx_events_user_id").on(table.userId),
    // Template lookup
    index("idx_events_template_id").on(table.templateId),
  ],
);

// ─── Templates ─────────────────────────────────────────────────────────────────

export const templates = pgTable(
  "templates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    category: templateCategoryEnum("category").notNull(),
    description: text("description"),
    tags: text("tags").array(),
    thumbnailUrl: text("thumbnail_url"),
    isPremium: boolean("is_premium").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    // JSON: sections list, theme refs
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_templates_category").on(table.category),
    index("idx_templates_is_premium").on(table.isPremium),
    index("idx_templates_is_active").on(table.isActive),
    // JSONB GIN for metadata queries
    index("idx_templates_metadata").on(table.metadata),
  ],
);

// ─── Template Variants ─────────────────────────────────────────────────────────

export const templateVariants = pgTable(
  "template_variants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    templateId: uuid("template_id")
      .notNull()
      .references(() => templates.id, { onDelete: "cascade" }),
    variantName: varchar("variant_name", { length: 50 }).notNull(),
    // JSON: primary, secondary, accent, bg, text colors
    colorTokens: jsonb("color_tokens"),
    isDefault: boolean("is_default").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_template_variants_template_id").on(table.templateId),
    // JSONB GIN for color queries
    index("idx_template_variants_colors").on(table.colorTokens),
  ],
);

// ─── Sections ─────────────────────────────────────────────────────────────────

export const sections = pgTable(
  "sections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    templateId: uuid("template_id")
      .notNull()
      .references(() => templates.id, { onDelete: "cascade" }),
    sectionType: varchar("section_type", { length: 50 }).notNull(),
    // JSON: Zod schema
    contentSchema: jsonb("content_schema"),
    // JSON: default values
    defaultContent: jsonb("default_content"),
    order: integer("order").notNull().default(0),
    isRequired: boolean("is_required").notNull().default(false),
    isEditable: boolean("is_editable").notNull().default(true),
    // JSON: animations
    animations: jsonb("animations"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_sections_template_id").on(table.templateId),
    // JSONB GIN for content schema queries
    index("idx_sections_content_schema").on(table.contentSchema),
  ],
);

// ─── Template Sections (event-level overrides) ─────────────────────────────────

export const templateSections = pgTable(
  "template_sections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    sectionType: varchar("section_type", { length: 50 }).notNull(),
    // JSON: user edits
    customContent: jsonb("custom_content"),
    // JSON: color/font overrides
    customTheme: jsonb("custom_theme"),
    visibility: varchar("visibility", { length: 20 })
      .notNull()
      .default("visible"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_template_sections_event_id").on(table.eventId),
  ],
);

// ─── Guests ───────────────────────────────────────────────────────────────────

export const guests = pgTable(
  "guests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 20 }),
    address: text("address"),

    // Grouping
    relation: varchar("relation", { length: 50 }), // groom_side | bride_side | friend
    tableNumber: integer("table_number"),
    seatCount: integer("seat_count").default(1),
    groupName: varchar("group_name", { length: 255 }),

    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_guests_event_id").on(table.eventId),
    index("idx_guests_relation").on(table.relation),
    index("idx_guests_table_number").on(table.tableNumber),
  ],
);

// ─── Invites ──────────────────────────────────────────────────────────────────

export const invites = pgTable(
  "invites",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    guestId: uuid("guest_id")
      .notNull()
      .references(() => guests.id, { onDelete: "cascade" }),

    inviteCode: varchar("invite_code", { length: 50 }).notNull().unique(),
    inviteUrl: text("invite_url").notNull(),
    qrCodeUrl: text("qr_code_url"),

    status: inviteStatusEnum("status").notNull().default("pending"),
    deliveryMethod: deliveryMethodEnum("delivery_method"),

    sentAt: timestamp("sent_at"),
    openedAt: timestamp("opened_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    // Fast invite code lookup (public pages)
    uniqueIndex("idx_invites_code").on(table.inviteCode),
    // Event + guest composite
    index("idx_invites_event_guest").on(table.eventId, table.guestId),
    // Status filtering
    index("idx_invites_status").on(table.status),
  ],
);

// ─── RSVPs ────────────────────────────────────────────────────────────────────

export const rsvps = pgTable(
  "rsvps",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    inviteId: uuid("invite_id")
      .notNull()
      .references(() => invites.id, { onDelete: "cascade" }),

    attendance: rsvpAttendanceEnum("attendance"),
    dietaryRestrictions: text("dietary_restrictions"),
    notes: text("notes"),
    plusOnes: integer("plus_ones").default(0),
    plusOneNames: text("plus_one_names"),

    respondedAt: timestamp("responded_at").notNull().defaultNow(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("idx_rsvps_invite_id").on(table.inviteId),
  ],
);

// ─── User Subscriptions ────────────────────────────────────────────────────────

export const userSubscriptions = pgTable(
  "user_subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tier: subscriptionTierEnum("tier").notNull().default("free"),
    // JSON: template_count, invite_limit, etc.
    features: jsonb("features"),
    expiresAt: timestamp("expires_at"),
    status: subscriptionStatusEnum("status").notNull().default("active"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_user_subscriptions_user_id").on(table.userId),
    index("idx_user_subscriptions_status").on(table.status),
  ],
);

// ─── Analytics Events ─────────────────────────────────────────────────────────

export const analyticsEvents = pgTable(
  "analytics_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id").references(() => events.id, {
      onDelete: "cascade",
    }),
    visitorId: varchar("visitor_id", { length: 100 }),
    action: varchar("action", { length: 50 }).notNull(), // page_view | rsvp | share | download
    // JSON: extra context
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    // Time-series queries: event + time
    index("idx_analytics_event_time").on(table.eventId, table.createdAt),
    // Visitor deduplication
    index("idx_analytics_visitor_id").on(table.visitorId),
    // Action filtering
    index("idx_analytics_action").on(table.action),
  ],
);
