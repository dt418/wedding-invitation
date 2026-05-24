ALTER TABLE "events" ADD COLUMN "event_content" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "guests" ADD COLUMN "gender" varchar(20);