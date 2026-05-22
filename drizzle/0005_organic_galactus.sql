CREATE TYPE "public"."language_code" AS ENUM('vi', 'en', 'zh', 'ja', 'ko');--> statement-breakpoint
CREATE TABLE "event_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"language" "language_code" NOT NULL,
	"title" varchar(255),
	"groom_name" varchar(100),
	"bride_name" varchar(100),
	"venue_name" varchar(255),
	"venue_address" text,
	"description" text,
	"thank_you_note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "section_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"section_id" uuid NOT NULL,
	"language" "language_code" NOT NULL,
	"content" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "template_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_id" uuid NOT NULL,
	"language" "language_code" NOT NULL,
	"name" varchar(255),
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "event_translations" ADD CONSTRAINT "event_translations_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "section_translations" ADD CONSTRAINT "section_translations_section_id_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_translations" ADD CONSTRAINT "template_translations_template_id_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_event_translations_event_lang" ON "event_translations" USING btree ("event_id","language");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_section_translations_section_lang" ON "section_translations" USING btree ("section_id","language");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_template_translations_template_lang" ON "template_translations" USING btree ("template_id","language");