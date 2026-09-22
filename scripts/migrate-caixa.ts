import { getDb } from "../src/db/index";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Conectando ao banco via HTTP driver...");
  const db = getDb();
  
  try {
    console.log("Criando enum transaction_type...");
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE "transaction_type" AS ENUM ('add', 'remove', 'edit');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    console.log("Criando tabela fund_balance...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "fund_balance" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "balance" integer NOT NULL DEFAULT 0,
        "updated_at" timestamp with time zone NOT NULL DEFAULT now()
      );
    `);

    console.log("Criando tabela fund_transactions...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "fund_transactions" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "amount" integer NOT NULL,
        "type" "transaction_type" NOT NULL,
        "description" text NOT NULL,
        "created_by" uuid NOT NULL REFERENCES "users"("id"),
        "created_at" timestamp with time zone NOT NULL DEFAULT now()
      );
    `);

    console.log("Migração do Caixa concluída com sucesso!");
  } catch (e: any) {
    console.error("Erro ao rodar migração:", e);
  }

  process.exit(0);
}

main();
