CREATE TYPE "public"."delivery_method" AS ENUM('email', 'sms', 'whatsapp', 'link');--> statement-breakpoint
CREATE TYPE "public"."event_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."invite_status" AS ENUM('pending', 'sent', 'opened', 'responded');--> statement-breakpoint
CREATE TYPE "public"."rsvp_attendance" AS ENUM('attending', 'not_attending', 'maybe');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'cancelled', 'expired');--> statement-breakpoint
CREATE TYPE "public"."subscription_tier" AS ENUM('free', 'agency');--> statement-breakpoint
CREATE TYPE "public"."template_category" AS ENUM('truyen_thong', 'thien_nhien', 'hien_dai', 'lang_man', 'co_phuc', 'sang_trong', 'toi_gian', 'typography', 'de_thuong');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'agency', 'admin');--> statement-breakpoint
CREATE TABLE "analytics_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid,
	"visitor_id" varchar(100),
	"action" varchar(50) NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"slug" varchar(100) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"template_id" uuid NOT NULL,
	"event_date" date NOT NULL,
	"event_time" time,
	"timezone" varchar(50) DEFAULT 'Asia/Ho_Chi_Minh',
	"venue_name" varchar(255),
	"venue_address" text,
	"map_url" text,
	"thumbnail_url" text,
	"status" "event_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"published_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255),
	"phone" varchar(20),
	"address" text,
	"relation" varchar(50),
	"table_number" integer,
	"seat_count" integer DEFAULT 1,
	"group_name" varchar(255),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"guest_id" uuid NOT NULL,
	"invite_code" varchar(50) NOT NULL,
	"invite_url" text NOT NULL,
	"qr_code_url" text,
	"status" "invite_status" DEFAULT 'pending' NOT NULL,
	"delivery_method" "delivery_method",
	"sent_at" timestamp,
	"opened_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invites_invite_code_unique" UNIQUE("invite_code")
);
--> statement-breakpoint
CREATE TABLE "rsvps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invite_id" uuid NOT NULL,
	"attendance" "rsvp_attendance",
	"dietary_restrictions" text,
	"notes" text,
	"plus_ones" integer DEFAULT 0,
	"plus_one_names" text,
	"responded_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_id" uuid NOT NULL,
	"section_type" varchar(50) NOT NULL,
	"content_schema" jsonb,
	"default_content" jsonb,
	"order" integer DEFAULT 0 NOT NULL,
	"is_required" boolean DEFAULT false NOT NULL,
	"is_editable" boolean DEFAULT true NOT NULL,
	"animations" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "template_sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"section_type" varchar(50) NOT NULL,
	"custom_content" jsonb,
	"custom_theme" jsonb,
	"visibility" varchar(20) DEFAULT 'visible' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "template_variants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_id" uuid NOT NULL,
	"variant_name" varchar(50) NOT NULL,
	"color_tokens" jsonb,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"category" "template_category" NOT NULL,
	"description" text,
	"tags" text[],
	"thumbnail_url" text,
	"is_premium" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "templates_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "user_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"tier" "subscription_tier" DEFAULT 'free' NOT NULL,
	"features" jsonb,
	"expires_at" timestamp,
	"status" "subscription_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"name" varchar(255),
	"avatar_url" text,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"agency_name" varchar(255),
	"white_label_domain" varchar(255),
	"agency_logo_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guests" ADD CONSTRAINT "guests_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invites" ADD CONSTRAINT "invites_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invites" ADD CONSTRAINT "invites_guest_id_guests_id_fk" FOREIGN KEY ("guest_id") REFERENCES "public"."guests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rsvps" ADD CONSTRAINT "rsvps_invite_id_invites_id_fk" FOREIGN KEY ("invite_id") REFERENCES "public"."invites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sections" ADD CONSTRAINT "sections_template_id_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_sections" ADD CONSTRAINT "template_sections_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_variants" ADD CONSTRAINT "template_variants_template_id_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_analytics_event_time" ON "analytics_events" USING btree ("event_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_analytics_visitor_id" ON "analytics_events" USING btree ("visitor_id");--> statement-breakpoint
CREATE INDEX "idx_analytics_action" ON "analytics_events" USING btree ("action");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_events_user_slug" ON "events" USING btree ("user_id","slug");--> statement-breakpoint
CREATE INDEX "idx_events_published" ON "events" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_events_user_id" ON "events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_events_template_id" ON "events" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "idx_guests_event_id" ON "guests" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "idx_guests_relation" ON "guests" USING btree ("relation");--> statement-breakpoint
CREATE INDEX "idx_guests_table_number" ON "guests" USING btree ("table_number");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_invites_code" ON "invites" USING btree ("invite_code");--> statement-breakpoint
CREATE INDEX "idx_invites_event_guest" ON "invites" USING btree ("event_id","guest_id");--> statement-breakpoint
CREATE INDEX "idx_invites_status" ON "invites" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_rsvps_invite_id" ON "rsvps" USING btree ("invite_id");--> statement-breakpoint
CREATE INDEX "idx_sections_template_id" ON "sections" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "idx_sections_content_schema" ON "sections" USING btree ("content_schema");--> statement-breakpoint
CREATE INDEX "idx_template_sections_event_id" ON "template_sections" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "idx_template_variants_template_id" ON "template_variants" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "idx_template_variants_colors" ON "template_variants" USING btree ("color_tokens");--> statement-breakpoint
CREATE INDEX "idx_templates_category" ON "templates" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_templates_is_premium" ON "templates" USING btree ("is_premium");--> statement-breakpoint
CREATE INDEX "idx_templates_is_active" ON "templates" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_templates_metadata" ON "templates" USING btree ("metadata");--> statement-breakpoint
CREATE INDEX "idx_user_subscriptions_user_id" ON "user_subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_subscriptions_status" ON "user_subscriptions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email");