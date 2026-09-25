import { sql } from "drizzle-orm";
import { getDb } from "./index";

async function main() {
  const db = getDb();

  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "match_stat_session_status" AS ENUM ('live', 'finished');
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `);
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "match_stat_event_type" AS ENUM ('goal', 'assist', 'defense');
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "match_stat_sessions" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "match_id" uuid NOT NULL REFERENCES "matches"("id") ON DELETE cascade,
      "status" "match_stat_session_status" DEFAULT 'live' NOT NULL,
      "started_at" timestamp with time zone DEFAULT now() NOT NULL,
      "ended_at" timestamp with time zone,
      "duration_seconds" integer,
      "elapsed_seconds" integer DEFAULT 0 NOT NULL,
      "timer_running" boolean DEFAULT true NOT NULL,
      "timer_anchor_at" timestamp with time zone,
      "started_by" uuid REFERENCES "users"("id") ON DELETE set null,
      "ended_by" uuid REFERENCES "users"("id") ON DELETE set null
    );
  `);
  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS "match_stat_sessions_one_live_idx"
      ON "match_stat_sessions" ("match_id")
      WHERE "status" = 'live';
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "match_stat_events" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "session_id" uuid NOT NULL REFERENCES "match_stat_sessions"("id") ON DELETE cascade,
      "target_user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
      "type" "match_stat_event_type" NOT NULL,
      "points" integer NOT NULL,
      "recorded_by" uuid REFERENCES "users"("id") ON DELETE set null,
      "recorded_name" text NOT NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL
    );
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "match_stat_events_session_idx"
      ON "match_stat_events" ("session_id");
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "player_stat_totals" (
      "user_id" uuid PRIMARY KEY REFERENCES "users"("id") ON DELETE cascade,
      "goals" integer DEFAULT 0 NOT NULL,
      "assists" integer DEFAULT 0 NOT NULL,
      "defenses" integer DEFAULT 0 NOT NULL,
      "points" integer DEFAULT 0 NOT NULL,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL
    );
  `);

  console.log("Tabelas de estatísticas prontas.");
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
