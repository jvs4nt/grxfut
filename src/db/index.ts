import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

function getDatabaseUrl() {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .env or .env.local (see .env.example).",
    );
  }

  return url;
}

export function getDb() {
  return drizzle(neon(getDatabaseUrl()), { schema });
}
