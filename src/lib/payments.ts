import { and, asc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { attendances, payments, users } from "@/db/schema";
import {
  confirmPaymentAndAttendance,
  getAttendanceForUser,
  listAttendances,
  setAttendanceStatus,
} from "@/lib/attendance";
import type { PaymentStatus, UserRole, UserTier } from "@/lib/labels";

export type PaymentRow = {
  id: string | null;
  userId: string;
  username: string;
  name: string;
  role: UserRole;
  tier: UserTier;
  status: PaymentStatus;
  scheduledOn: string | null;
};

/** Linha da tela de pagamento: confirmados + quem ainda está no fluxo do PIX. */
export type PaymentPageRow = PaymentRow & {
  awaitingPix: boolean;
};

export async function ensurePaymentsForMatch(matchId: string) {
  const db = getDb();
  const allUsers = await db.select({ id: users.id }).from(users);
  const existing = await db
    .select({ userId: payments.userId })
    .from(payments)
    .where(eq(payments.matchId, matchId));
  const existingIds = new Set(existing.map((row) => row.userId));
  const missing = allUsers.filter((user) => !existingIds.has(user.id));

  if (missing.length === 0) {
    return;
  }

  await db.insert(payments).values(
    missing.map((user) => ({
      matchId,
      userId: user.id,
      status: "calote" as const,
    })),
  );
}

export async function listPayments(matchId: string): Promise<PaymentRow[]> {
  await ensurePaymentsForMatch(matchId);

  const db = getDb();
  const rows = await db
    .select({
      id: payments.id,
      userId: users.id,
      username: users.username,
      name: users.name,
      role: users.role,
      tier: users.tier,
      status: payments.status,
      scheduledOn: payments.scheduledOn,
    })
    .from(attendances)
    .innerJoin(users, eq(users.id, attendances.userId))
    .leftJoin(
      payments,
      and(eq(payments.userId, users.id), eq(payments.matchId, matchId)),
    )
    .where(
      and(
        eq(attendances.matchId, matchId),
        inArray(attendances.status, ["confirmed", "pending_payment"]),
      ),
    )
    .orderBy(asc(users.tier), asc(users.name));

  return rows.map((row) => ({
    id: row.id,
    userId: row.userId,
    username: row.username,
    name: row.name,
    role: row.role,
    tier: row.tier,
    status: row.status ?? "calote",
    scheduledOn: row.scheduledOn,
  }));
}

export async function listPaymentPageRows(
  matchId: string,
): Promise<PaymentPageRow[]> {
  const [confirmedRows, attendances] = await Promise.all([
    listPayments(matchId),
    listAttendances(matchId),
  ]);

  const confirmedIds = new Set(confirmedRows.map((row) => row.userId));
  const awaitingPix = attendances
    .filter((row) => row.status === "pending_payment")
    .filter((row) => !confirmedIds.has(row.userId))
    .map(
      (row): PaymentPageRow => ({
        id: null,
        userId: row.userId,
        username: row.username,
        name: row.name,
        role: row.role,
        tier: row.tier,
        status: "calote",
        scheduledOn: null,
        awaitingPix: true,
      }),
    );

  return [
    ...confirmedRows.map((row) => ({ ...row, awaitingPix: false })),
    ...awaitingPix,
  ];
}

export async function getPaymentForUser(matchId: string, userId: string) {
  await ensurePaymentsForMatch(matchId);

  const db = getDb();
  const [row] = await db
    .select()
    .from(payments)
    .where(and(eq(payments.matchId, matchId), eq(payments.userId, userId)))
    .limit(1);

  return (
    row ?? {
      id: null,
      matchId,
      userId,
      status: "calote" as const,
      scheduledOn: null,
    }
  );
}

export async function setPaymentStatus(input: {
  matchId: string;
  userId: string;
  status: PaymentStatus;
  scheduledOn: string | null;
}) {
  await ensurePaymentsForMatch(input.matchId);

  const scheduledOn = input.status === "agendado" ? input.scheduledOn : null;

  if (input.status === "agendado" && !scheduledOn) {
    return { ok: false as const, error: "missing_date" };
  }

  const db = getDb();

  const attendanceStatus = input.status === "pago" ? "confirmed" : "pending_payment";

  const [row] = await db.batch([
    db
      .insert(payments)
      .values({
        matchId: input.matchId,
        userId: input.userId,
        status: input.status,
        scheduledOn,
      })
      .onConflictDoUpdate({
        target: [payments.matchId, payments.userId],
        set: {
          status: input.status,
          scheduledOn,
        },
      })
      .returning(),
    db
      .update(attendances)
      .set({ status: attendanceStatus })
      .where(
        and(eq(attendances.matchId, input.matchId), eq(attendances.userId, input.userId))
      ),
  ]);

  return { ok: true as const, payment: row[0] };
}

export function paymentProgress(rows: PaymentRow[], pendingCount: number = 0) {
  const total = rows.length + pendingCount;
  if (total === 0) {
    return 0;
  }

  const paid = rows.filter((row) => row.status === "pago").length;
  return Math.round((paid / total) * 100);
}

export function paymentProgressFromPageRows(rows: PaymentPageRow[]) {
  if (rows.length === 0) {
    return 0;
  }

  const paid = rows.filter(
    (row) => !row.awaitingPix && row.status === "pago",
  ).length;
  return Math.round((paid / rows.length) * 100);
}

export function isPaymentPageRowPaid(row: PaymentPageRow) {
  return !row.awaitingPix && row.status === "pago";
}

export async function adminMarkPaymentPagePaid(
  matchId: string,
  userId: string,
) {
  const attendance = await getAttendanceForUser(matchId, userId);

  if (!attendance) {
    return { ok: false as const, error: "Sem presença registrada." };
  }

  if (attendance.status === "pending_payment") {
    const result = await confirmPaymentAndAttendance(matchId, userId);
    if (!result.ok) {
      return { ok: false as const, error: "Não estava aguardando pagamento." };
    }
    return { ok: true as const };
  }

  await setPaymentStatus({
    matchId,
    userId,
    status: "pago",
    scheduledOn: null,
  });

  if (attendance.status !== "confirmed") {
    await setAttendanceStatus(matchId, userId, "confirmed");
  }

  return { ok: true as const };
}

export async function adminMarkPaymentPageAwaiting(
  matchId: string,
  userId: string,
) {
  await setAttendanceStatus(matchId, userId, "pending_payment");
  await setPaymentStatus({
    matchId,
    userId,
    status: "calote",
    scheduledOn: null,
  });
  return { ok: true as const };
}
