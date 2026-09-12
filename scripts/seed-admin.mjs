import { hash } from "bcryptjs";
import { neon } from "@neondatabase/serverless";

const username = process.env.ADMIN_USERNAME?.trim();
const password = process.env.ADMIN_PASSWORD;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set.");
}

if (!username || !password) {
  throw new Error(
    "ADMIN_USERNAME and ADMIN_PASSWORD must be set in .env to seed the first admin.",
  );
}

const sql = neon(process.env.DATABASE_URL);
const existing = await sql`
  select id from users where username = ${username} limit 1
`;

if (existing.length > 0) {
  console.log("Admin already exists; seed skipped.");
  process.exit(0);
}

const passwordHash = await hash(password, 12);
await sql`
  insert into users (username, name, password_hash, role, tier)
    values (${username}, ${username}, ${passwordHash}, 'admin', 'capitao')
`;

console.log("Admin created.");
