CREATE TABLE "user-metadata" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"experience" integer DEFAULT 0 NOT NULL,
	"current_level_experience" integer DEFAULT 100 NOT NULL,
	"level" smallint DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
