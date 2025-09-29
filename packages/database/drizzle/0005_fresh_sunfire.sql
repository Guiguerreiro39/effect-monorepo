ALTER TABLE "chore" RENAME TO "task_completion";--> statement-breakpoint
ALTER TABLE "chore-template" RENAME TO "task";--> statement-breakpoint
ALTER TABLE "task_completion" RENAME COLUMN "template_id" TO "task_id";--> statement-breakpoint
ALTER TABLE "task_completion" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "task" ADD COLUMN "next_execution_date" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "task_completion" DROP COLUMN "status";--> statement-breakpoint
ALTER TABLE "task_completion" DROP COLUMN "completed_at";--> statement-breakpoint
ALTER TABLE "task_completion" DROP COLUMN "end_at";--> statement-breakpoint
DROP TYPE "public"."status";