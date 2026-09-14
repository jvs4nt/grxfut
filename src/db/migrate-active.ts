import { getDb } from "./index";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Conectando ao banco...");
  const db = getDb();
  
  try {
    console.log("Tentando adicionar role 'guest'...");
    await db.execute(sql`ALTER TYPE "public"."user_role" ADD VALUE IF NOT EXISTS 'guest'`);
    console.log("Role 'guest' verificada/adicionada com sucesso!");
  } catch (e: any) {
    console.log("Aviso ao adicionar role (pode já existir):", e.message);
  }

  try {
    console.log("Tentando adicionar coluna 'active'...");
    await db.execute(sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "active" boolean DEFAULT true NOT NULL`);
    console.log("Coluna 'active' adicionada com sucesso!");
  } catch (e: any) {
    console.log("Aviso ao adicionar coluna (pode já existir):", e.message);
  }

  console.log("Fim da migração forçada.");
  process.exit(0);
}

main();
