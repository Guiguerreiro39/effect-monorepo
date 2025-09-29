CREATE TYPE "public"."task_completion_status" AS ENUM('pending', 'failed', 'completed');--> statement-breakpoint
ALTER TABLE "task_completion" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "task" ALTER COLUMN "next_execution_date" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "task" ALTER COLUMN "next_execution_date" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "task_completion" ADD COLUMN "status" "task_completion_status" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "task_completion" ADD COLUMN "experience" smallint NOT NULL;