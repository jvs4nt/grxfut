ALTER TYPE "public"."user_role" ADD VALUE 'guest';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "active" boolean DEFAULT true NOT NULL;