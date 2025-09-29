ALTER TABLE "chore_completions" DROP CONSTRAINT "chore_completions_chore_id_chores_id_fk";
--> statement-breakpoint
ALTER TABLE "chore_completions" DROP CONSTRAINT "chore_completions_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "chores" DROP CONSTRAINT "chores_created_by_user_id_fk";
--> statement-breakpoint
ALTER TABLE "chore_completions" ALTER COLUMN "chore_id" SET DATA TYPE uuid;