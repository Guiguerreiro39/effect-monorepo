CREATE TYPE "public"."activity_type" AS ENUM('task', 'levelUp', 'reward');--> statement-breakpoint
ALTER TYPE "public"."task_completion_status" RENAME TO "task_activity_status";--> statement-breakpoint
ALTER TABLE "task_completion" RENAME TO "activity";--> statement-breakpoint
ALTER TABLE "activity" ALTER COLUMN "task_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "activity" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "activity" ALTER COLUMN "status" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "activity" ALTER COLUMN "experience" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "activity" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "task" ALTER COLUMN "prev_execution_date" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "activity" ADD COLUMN "hash_identifier" varchar;--> statement-breakpoint
ALTER TABLE "activity" ADD COLUMN "level" smallint;--> statement-breakpoint
ALTER TABLE "activity" ADD COLUMN "type" "activity_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "task" ADD COLUMN "is_completed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "task" ADD COLUMN "hash_identifier" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "public"."activity" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."task_activity_status";--> statement-breakpoint
CREATE TYPE "public"."task_activity_status" AS ENUM('failed', 'completed');--> statement-breakpoint
ALTER TABLE "public"."activity" ALTER COLUMN "status" SET DATA TYPE "public"."task_activity_status" USING "status"::"public"."task_activity_status";