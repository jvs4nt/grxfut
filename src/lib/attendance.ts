import { and, asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { attendances, payments, users } from "@/db/schema";
import { USER_TIERS, type UserRole, type UserTier } from "@/lib/labels";

export type AttendanceStatus = "confirmed" | "reserve" | "pending_payment";

export type AttendanceRow = {
  id: string;
  userId: string;
  username: string;
  name: string;
  role: UserRole;
  tier: UserTier;
  status: AttendanceStatus;
  createdAt: Date;
};

export async function listAttendances(matchId: string): Promise<AttendanceRow[]> {
  const db = getDb();
  return db
    .select({
      id: attendances.id,
      userId: attendances.userId,
      username: users.username,
      name: users.name,
      role: users.role,
      tier: users.tier,
      status: attendances.status,
      createdAt: attendances.createdAt,
    })
    .from(attendances)
    .innerJoin(users, eq(users.id, attendances.userId))
    .where(eq(attendances.matchId, matchId))
    .orderBy(asc(attendances.createdAt), asc(users.name));
}

export async function getAttendanceForUser(matchId: string, userId: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(attendances)
    .where(
      and(eq(attendances.matchId, matchId), eq(attendances.userId, userId)),
    )
    .limit(1);

  return row ?? null;
}

export async function confirmAttendance(matchId: string, userId: string) {
  const existing = await getAttendanceForUser(matchId, userId);

  if (existing) {
    return existing;
  }

  const db = getDb();
  const [row] = await db
    .insert(attendances)
    .values({ matchId, userId, status: "confirmed" })
    .onConflictDoNothing({
      target: [attendances.matchId, attendances.userId],
    })
    .returning();

  return row ?? (await getAttendanceForUser(matchId, userId));
}

/**
 * Passo 1 do gate de pagamento: registra a intenção de jogar sem entrar nos
 * confirmados. Se já existe linha em qualquer status, devolve a existente — nunca
 * rebaixa um `confirmed` ou `reserve` para pendente.
 */
export async function startAttendancePendingPayment(
  matchId: string,
  userId: string,
) {
  const existing = await getAttendanceForUser(matchId, userId);

  if (existing) {
    return { ok: true as const, status: existing.status };
  }

  const db = getDb();
  await db
    .insert(attendances)
    .values({ matchId, userId, status: "pending_payment" })
    .onConflictDoNothing({
      target: [attendances.matchId, attendances.userId],
    });

  return { ok: true as const, status: "pending_payment" as const };
}

/**
 * Passo 2 do gate: o jogador declara que pagou o PIX. Marca o pagamento como
 * `pago` e promove a presença para `confirmed`, que é o que o sorteio enxerga.
 *
 * As duas escritas vão num `db.batch` (o driver neon-http não tem transação
 * interativa). A ordem é pagamento primeiro de propósito: se algo falhar no meio,
 * o jogador fica pendente e repete — o inverso o deixaria confirmado marcado como
 * CALOTE, com o modal de cobrança gritando com quem acabou de pagar.
 */
export async function confirmPaymentAndAttendance(
  matchId: string,
  userId: string,
) {
  const existing = await getAttendanceForUser(matchId, userId);

  if (!existing) {
    return { ok: false as const, error: "not_found" as const };
  }

  if (existing.status === "confirmed") {
    return { ok: true as const };
  }

  if (existing.status !== "pending_payment") {
    return { ok: false as const, error: "not_pending" as const };
  }

  const db = getDb();
  await db.batch([
    db
      .insert(payments)
      .values({ matchId, userId, status: "pago", scheduledOn: null })
      .onConflictDoUpdate({
        target: [payments.matchId, payments.userId],
        set: { status: "pago", scheduledOn: null },
      }),
    db
      .update(attendances)
      .set({ status: "confirmed" })
      .where(
        and(eq(attendances.matchId, matchId), eq(attendances.userId, userId)),
      ),
  ]);

  return { ok: true as const };
}

export async function cancelAttendance(matchId: string, userId: string) {
  const db = getDb();
  await db
    .delete(attendances)
    .where(
      and(eq(attendances.matchId, matchId), eq(attendances.userId, userId)),
    );
}

export type AttendancePick = {
  userId: string;
  username: string;
  name: string;
};

export async function setAttendanceStatus(
  matchId: string,
  userId: string,
  status: AttendanceStatus | "out",
): Promise<{ ok: true }> {
  const existing = await getAttendanceForUser(matchId, userId);

  if (status === "out") {
    if (existing) {
      const db = getDb();
      await db
        .delete(attendances)
        .where(
          and(eq(attendances.matchId, matchId), eq(attendances.userId, userId)),
        );
    }
    return { ok: true };
  }

  await writeAttendance(matchId, userId, status);
  return { ok: true };
}

async function writeAttendance(
  matchId: string,
  userId: string,
  status: AttendanceStatus,
) {
  const db = getDb();
  await db
    .insert(attendances)
    .values({ matchId, userId, status })
    .onConflictDoUpdate({
      target: [attendances.matchId, attendances.userId],
      set: { status },
    });
}

function compareByTier(a: AttendanceRow, b: AttendanceRow) {
  const byTier = USER_TIERS.indexOf(a.tier) - USER_TIERS.indexOf(b.tier);
  if (byTier !== 0) {
    return byTier;
  }

  return a.name.localeCompare(b.name);
}

export function splitAttendances(rows: AttendanceRow[]) {
  return {
    confirmed: rows
      .filter((row) => row.status === "confirmed")
      .sort(compareByTier),
    reserves: rows.filter((row) => row.status === "reserve"),
    pendingPayment: rows
      .filter((row) => row.status === "pending_payment")
      .sort(compareByTier),
  };
}
