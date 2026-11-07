import { eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { mensalSettings } from "@/db/schema";

export const INITIAL_MENSALISTAS: string[] = [
  "Danwod",
  "Diego",
  "Felipe",
  "Fleek",
  "Gabriel",
  "Gordo",
  "Luan",
  "Matheus",
  "Murilol",
  "NFL Dan",
  "Oliveira",
  "Pablo",
  "Pedro França",
  "Roberto",
  "Santana",
  "Tuga",
  "Vinício",
];

export const DEFAULT_MENSAL_MONTH = "Dezembro";
export const DEFAULT_MENSAL_AMOUNT = 3717; // R$ 37,17 em centavos

const SETTINGS_ROW_ID = "default";

export type MensalState = {
  monthName: string;
  amount: number; // em centavos
  members: string[];
};

export async function ensureMensalSettingsTable() {
  const db = getDb();
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "mensal_settings" (
      "id" text PRIMARY KEY NOT NULL,
      "month_name" text DEFAULT 'Dezembro' NOT NULL,
      "amount" integer DEFAULT 3717 NOT NULL,
      "members" jsonb NOT NULL,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL
    );
  `);
}

export async function getMensalState(): Promise<MensalState> {
  try {
    const db = getDb();
    await ensureMensalSettingsTable();

    const [row] = await db
      .select()
      .from(mensalSettings)
      .where(eq(mensalSettings.id, SETTINGS_ROW_ID))
      .limit(1);

    if (!row) {
      await db
        .insert(mensalSettings)
        .values({
          id: SETTINGS_ROW_ID,
          monthName: DEFAULT_MENSAL_MONTH,
          amount: DEFAULT_MENSAL_AMOUNT,
          members: INITIAL_MENSALISTAS,
        })
        .onConflictDoNothing();

      return {
        monthName: DEFAULT_MENSAL_MONTH,
        amount: DEFAULT_MENSAL_AMOUNT,
        members: [...INITIAL_MENSALISTAS],
      };
    }

    return {
      monthName: row.monthName || DEFAULT_MENSAL_MONTH,
      amount: typeof row.amount === "number" ? row.amount : DEFAULT_MENSAL_AMOUNT,
      members: Array.isArray(row.members) ? row.members : [...INITIAL_MENSALISTAS],
    };
  } catch (error) {
    console.error("Erro ao carregar configurações do mensal:", error);
    return {
      monthName: DEFAULT_MENSAL_MONTH,
      amount: DEFAULT_MENSAL_AMOUNT,
      members: [...INITIAL_MENSALISTAS],
    };
  }
}

export async function saveMensalMonthAndAmount(input: {
  monthName: string;
  amount: number;
}): Promise<MensalState> {
  const current = await getMensalState();
  const monthName = input.monthName.trim() || DEFAULT_MENSAL_MONTH;
  const amount = Math.max(0, Math.round(input.amount));

  const db = getDb();
  await db
    .insert(mensalSettings)
    .values({
      id: SETTINGS_ROW_ID,
      monthName,
      amount,
      members: current.members,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: mensalSettings.id,
      set: {
        monthName,
        amount,
        updatedAt: new Date(),
      },
    });

  return {
    monthName,
    amount,
    members: current.members,
  };
}

export async function saveMensalistas(members: string[]): Promise<MensalState> {
  const current = await getMensalState();
  const cleaned = members
    .map((name) => name.trim())
    .filter((name) => name.length > 0);

  const db = getDb();
  await db
    .insert(mensalSettings)
    .values({
      id: SETTINGS_ROW_ID,
      monthName: current.monthName,
      amount: current.amount,
      members: cleaned,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: mensalSettings.id,
      set: {
        members: cleaned,
        updatedAt: new Date(),
      },
    });

  return {
    monthName: current.monthName,
    amount: current.amount,
    members: cleaned,
  };
}

