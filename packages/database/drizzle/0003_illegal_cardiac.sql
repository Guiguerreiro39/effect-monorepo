CREATE TYPE "public"."status" AS ENUM('pending', 'completed', 'skipped');--> statement-breakpoint
ALTER TABLE "todos" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "todos" CASCADE;--> statement-breakpoint
ALTER TABLE "chore_completions" RENAME TO "chore";--> statement-breakpoint
ALTER TABLE "chore" RENAME COLUMN "chore_id" TO "template_id";--> statement-breakpoint
ALTER TABLE "chore" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "chore" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "chore" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "chore" ALTER COLUMN "completed_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "chore" ALTER COLUMN "completed_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "chore" ADD COLUMN "status" "status" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "chore" ADD COLUMN "end_at" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "chore" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "chores" ADD COLUMN "experience" smallint NOT NULL;