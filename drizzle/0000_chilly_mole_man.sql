CREATE TYPE "public"."attendance_status" AS ENUM('confirmed', 'reserve');--> statement-breakpoint
CREATE TYPE "public"."draw_team" AS ENUM('team_a', 'team_b', 'draw_reserve');--> statement-breakpoint
CREATE TYPE "public"."match_status" AS ENUM('scheduled', 'rest');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('calote', 'agendado', 'pago');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'member');--> statement-breakpoint
CREATE TYPE "public"."user_tier" AS ENUM('capitao', 'tenente', 'soldado');--> statement-breakpoint
CREATE TABLE "attendances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"match_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"status" "attendance_status" NOT NULL,
	CONSTRAINT "attendances_match_user_unique" UNIQUE("match_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "draw_players" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"draw_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"team" "draw_team" NOT NULL,
	CONSTRAINT "draw_players_draw_user_unique" UNIQUE("draw_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "draws" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"match_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "draws_match_id_unique" UNIQUE("match_id")
);
--> statement-breakpoint
CREATE TABLE "matches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date NOT NULL,
	"time" time,
	"location" text,
	"status" "match_status" DEFAULT 'scheduled' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"match_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"status" "payment_status" DEFAULT 'calote' NOT NULL,
	"scheduled_on" date,
	CONSTRAINT "payments_match_user_unique" UNIQUE("match_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" "user_role" NOT NULL,
	"tier" "user_tier" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "draw_players" ADD CONSTRAINT "draw_players_draw_id_draws_id_fk" FOREIGN KEY ("draw_id") REFERENCES "public"."draws"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "draw_players" ADD CONSTRAINT "draw_players_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "draws" ADD CONSTRAINT "draws_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;