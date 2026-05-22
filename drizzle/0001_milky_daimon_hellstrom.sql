CREATE TYPE "public"."delivery_channel" AS ENUM('zalo_mini_app', 'zalo_bot', 'email', 'messenger');--> statement-breakpoint
CREATE TYPE "public"."delivery_status" AS ENUM('pending', 'sent', 'delivered', 'opened', 'failed');--> statement-breakpoint
CREATE TYPE "public"."invite_jobs_status" AS ENUM('queued', 'processing', 'completed', 'cancelled', 'failed');--> statement-breakpoint
CREATE TABLE "invite_deliveries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invite_id" uuid NOT NULL,
	"guest_id" uuid,
	"channel" "delivery_channel" NOT NULL,
	"status" "delivery_status" DEFAULT 'pending' NOT NULL,
	"provider_message_id" text,
	"provider_ref_id" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"idempotency_key" varchar(255),
	"error" text,
	"retry_count" integer DEFAULT 0,
	"sent_at" timestamp,
	"delivered_at" timestamp,
	"opened_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invite_deliveries_idempotency_key_unique" UNIQUE("idempotency_key")
);
--> statement-breakpoint
CREATE TABLE "invite_send_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"channel" varchar(20) NOT NULL,
	"status" "invite_jobs_status" DEFAULT 'queued' NOT NULL,
	"total_count" integer DEFAULT 0,
	"success_count" integer DEFAULT 0,
	"failed_count" integer DEFAULT 0,
	"error" text,
	"scheduled_at" timestamp,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "guests" ADD COLUMN "zalo_id" varchar(100);--> statement-breakpoint
ALTER TABLE "guests" ADD COLUMN "zalo_follower_id" varchar(100);--> statement-breakpoint
ALTER TABLE "guests" ADD COLUMN "zalo_name" varchar(255);--> statement-breakpoint
ALTER TABLE "invite_deliveries" ADD CONSTRAINT "invite_deliveries_invite_id_invites_id_fk" FOREIGN KEY ("invite_id") REFERENCES "public"."invites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invite_deliveries" ADD CONSTRAINT "invite_deliveries_guest_id_guests_id_fk" FOREIGN KEY ("guest_id") REFERENCES "public"."guests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invite_send_jobs" ADD CONSTRAINT "invite_send_jobs_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invite_send_jobs" ADD CONSTRAINT "invite_send_jobs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_invite_deliveries_invite_id" ON "invite_deliveries" USING btree ("invite_id");--> statement-breakpoint
CREATE INDEX "idx_invite_deliveries_status" ON "invite_deliveries" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_invite_deliveries_idempotency" ON "invite_deliveries" USING btree ("idempotency_key");--> statement-breakpoint
CREATE INDEX "idx_invite_send_jobs_event_id" ON "invite_send_jobs" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "idx_invite_send_jobs_user_id" ON "invite_send_jobs" USING btree ("user_id");