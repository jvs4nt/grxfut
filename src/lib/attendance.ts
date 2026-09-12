import { and, asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { attendances, users } from "@/db/schema";
import { USER_TIERS, type UserTier } from "@/lib/labels";

export type AttendanceStatus = "confirmed" | "reserve";

export type AttendanceRow = {
  id: string;
  userId: string;
  username: string;
  role: "admin" | "member";
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
      role: users.role,
      tier: users.tier,
      status: attendances.status,
      createdAt: attendances.createdAt,
    })
    .from(attendances)
    .innerJoin(users, eq(users.id, attendances.userId))
    .where(eq(attendances.matchId, matchId))
    .orderBy(asc(attendances.createdAt), asc(users.username));
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

  return a.username.localeCompare(b.username);
}

export function splitAttendances(rows: AttendanceRow[]) {
  return {
    confirmed: rows
      .filter((row) => row.status === "confirmed")
      .sort(compareByTier),
    reserves: rows.filter((row) => row.status === "reserve"),
  };
}
