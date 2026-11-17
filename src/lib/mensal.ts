import { and, asc, eq, inArray, ne } from "drizzle-orm";
import { getDb } from "@/db";
import { mensalPayments, mensalSettings, users } from "@/db/schema";
import { getAttendanceForUser, setAttendanceStatus } from "@/lib/attendance";
import { currentPeriodInSaoPaulo, isValidPeriod } from "@/lib/dates";
import type { UserRole, UserTier } from "@/lib/labels";
import { getNextScheduledMatch } from "@/lib/matches";

export const DEFAULT_MENSAL_AMOUNT = 3717; // R$ 37,17 em centavos

const SETTINGS_ROW_ID = "default";

export type MensalSettings = {
  /** `YYYY-MM` */
  period: string;
  /** centavos */
  amount: number;
};

export type MensalistaRow = {
  userId: string;
  name: string;
  username: string;
  tier: UserTier;
  paid: boolean;
};

export type MensalCandidate = {
  userId: string;
  name: string;
  username: string;
  role: UserRole;
  mensalista: boolean;
};

export async function getMensalSettings(): Promise<MensalSettings> {
  const db = getDb();
  const [row] = await db
    .select({ period: mensalSettings.period, amount: mensalSettings.amount })
    .from(mensalSettings)
    .where(eq(mensalSettings.id, SETTINGS_ROW_ID))
    .limit(1);

  return {
    period:
      row?.period && isValidPeriod(row.period)
        ? row.period
        : currentPeriodInSaoPaulo(),
    amount: typeof row?.amount === "number" ? row.amount : DEFAULT_MENSAL_AMOUNT,
  };
}

export async function saveMensalSettings(
  input: MensalSettings,
): Promise<MensalSettings> {
  const period = input.period;
  const amount = Math.max(0, Math.round(input.amount));

  const db = getDb();
  await db
    .insert(mensalSettings)
    .values({ id: SETTINGS_ROW_ID, period, amount, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: mensalSettings.id,
      set: { period, amount, updatedAt: new Date() },
    });

  return { period, amount };
}

/** Mensalistas ativos com o status de pagamento do mês informado. */
export async function listMensalistas(period: string): Promise<MensalistaRow[]> {
  const db = getDb();
  const rows = await db
    .select({
      userId: users.id,
      name: users.name,
      username: users.username,
      tier: users.tier,
      paymentId: mensalPayments.id,
    })
    .from(users)
    .leftJoin(
      mensalPayments,
      and(
        eq(mensalPayments.userId, users.id),
        eq(mensalPayments.period, period),
      ),
    )
    .where(and(eq(users.mensalista, true), eq(users.active, true)))
    .orderBy(asc(users.name));

  return rows.map(({ paymentId, ...row }) => ({
    ...row,
    paid: paymentId !== null,
  }));
}

/** Usuários que podem ser marcados como mensalistas (todos menos convidados). */
export async function listMensalCandidates(): Promise<MensalCandidate[]> {
  const db = getDb();
  return db
    .select({
      userId: users.id,
      name: users.name,
      username: users.username,
      role: users.role,
      mensalista: users.mensalista,
    })
    .from(users)
    .where(and(ne(users.role, "guest"), eq(users.active, true)))
    .orderBy(asc(users.name));
}

/** Define exatamente quem é mensalista: marca os ids informados e desmarca o resto. */
export async function setMensalistas(userIds: string[]) {
  const db = getDb();
  const ids = [...new Set(userIds)];

  await db
    .update(users)
    .set({ mensalista: false })
    .where(eq(users.mensalista, true));

  if (ids.length > 0) {
    await db
      .update(users)
      .set({ mensalista: true })
      .where(and(inArray(users.id, ids), ne(users.role, "guest")));
  }
}

export async function isMensalPaid(userId: string, period: string) {
  const db = getDb();
  const [row] = await db
    .select({ id: mensalPayments.id })
    .from(mensalPayments)
    .where(
      and(eq(mensalPayments.userId, userId), eq(mensalPayments.period, period)),
    )
    .limit(1);

  return Boolean(row);
}

/**
 * Checklist do admin. Marcar como pago também promove a presença do mensalista
 * no próximo jogo de "aguardando pagamento" para "confirmado".
 */
export async function setMensalPaid(input: {
  userId: string;
  period: string;
  paid: boolean;
  adminId: string;
}) {
  const db = getDb();

  if (!input.paid) {
    await db
      .delete(mensalPayments)
      .where(
        and(
          eq(mensalPayments.userId, input.userId),
          eq(mensalPayments.period, input.period),
        ),
      );
    return;
  }

  await db
    .insert(mensalPayments)
    .values({
      userId: input.userId,
      period: input.period,
      markedBy: input.adminId,
    })
    .onConflictDoNothing({
      target: [mensalPayments.userId, mensalPayments.period],
    });

  const match = await getNextScheduledMatch();

  if (!match) {
    return;
  }

  const attendance = await getAttendanceForUser(match.id, input.userId);

  if (attendance?.status === "pending_payment") {
    await setAttendanceStatus(match.id, input.userId, "confirmed");
  }
}

/** Ids dos mensalistas ativos, para tirar da lista de pagamento por jogo. */
export async function listMensalistaIds(): Promise<Set<string>> {
  const db = getDb();
  const rows = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.mensalista, true));

  return new Set(rows.map((row) => row.id));
}
