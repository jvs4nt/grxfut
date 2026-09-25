import { and, desc, eq, gte, lt, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { getDb } from "@/db";
import {
  matchStatEvents,
  matchStatSessions,
  matches,
  playerStatTotals,
  users,
} from "@/db/schema";
import { listAttendances, splitAttendances } from "@/lib/attendance";
import { currentMonthRangeInSaoPaulo } from "@/lib/dates";
import type { UserTier } from "@/lib/labels";
import {
  STAT_POINTS,
  type StatEventType,
  type StatPlayerLine,
} from "@/lib/match-stat-shared";

const recorder = alias(users, "stat_recorder");

export type LiveStatSession = typeof matchStatSessions.$inferSelect;

export type AuditEventRow = {
  id: string;
  sessionId: string;
  sessionStatus: "live" | "finished";
  matchId: string;
  matchDate: string;
  type: StatEventType;
  points: number;
  createdAt: Date;
  targetUserId: string;
  targetName: string;
  recordedBy: string | null;
  recordedName: string;
};

export type MatchWithStats = {
  id: string;
  date: string;
  time: string | null;
  location: string | null;
};

function currentElapsed(session: LiveStatSession, now = new Date()) {
  let elapsed = session.elapsedSeconds;

  if (session.timerRunning && session.timerAnchorAt) {
    elapsed += Math.max(
      0,
      Math.floor((now.getTime() - session.timerAnchorAt.getTime()) / 1000),
    );
  }

  return elapsed;
}

function isUniqueViolation(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}

export async function getLiveStatSession(matchId: string) {
  const db = getDb();
  const [session] = await db
    .select()
    .from(matchStatSessions)
    .where(
      and(
        eq(matchStatSessions.matchId, matchId),
        eq(matchStatSessions.status, "live"),
      ),
    )
    .limit(1);

  return session ?? null;
}

async function getSessionById(sessionId: string) {
  const db = getDb();
  const [session] = await db
    .select()
    .from(matchStatSessions)
    .where(eq(matchStatSessions.id, sessionId))
    .limit(1);

  return session ?? null;
}

export async function getLatestFinishedStatSession(matchId: string) {
  const db = getDb();
  const [session] = await db
    .select()
    .from(matchStatSessions)
    .where(
      and(
        eq(matchStatSessions.matchId, matchId),
        eq(matchStatSessions.status, "finished"),
      ),
    )
    .orderBy(desc(matchStatSessions.endedAt))
    .limit(1);

  return session ?? null;
}

async function listSessionEvents(sessionId: string) {
  const db = getDb();
  return db
    .select({
      targetUserId: matchStatEvents.targetUserId,
      targetName: users.name,
      targetTier: users.tier,
      type: matchStatEvents.type,
    })
    .from(matchStatEvents)
    .innerJoin(users, eq(users.id, matchStatEvents.targetUserId))
    .where(eq(matchStatEvents.sessionId, sessionId));
}

function buildRoster(
  confirmed: { userId: string; name: string; tier: UserTier }[],
  events: {
    targetUserId: string;
    targetName: string;
    targetTier: UserTier;
    type: StatEventType;
  }[],
): StatPlayerLine[] {
  const lines = new Map<string, StatPlayerLine>();

  for (const player of confirmed) {
    lines.set(player.userId, {
      userId: player.userId,
      name: player.name,
      tier: player.tier,
      goals: 0,
      assists: 0,
      defenses: 0,
      points: 0,
    });
  }

  for (const event of events) {
    const line = lines.get(event.targetUserId) ?? {
      userId: event.targetUserId,
      name: event.targetName,
      tier: event.targetTier,
      goals: 0,
      assists: 0,
      defenses: 0,
      points: 0,
    };

    if (event.type === "goal") {
      line.goals += 1;
    } else if (event.type === "assist") {
      line.assists += 1;
    } else {
      line.defenses += 1;
    }

    line.points += STAT_POINTS[event.type];
    lines.set(event.targetUserId, line);
  }

  return [...lines.values()].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

export async function getConfirmedStatRoster(matchId: string) {
  const attendances = await listAttendances(matchId);
  return splitAttendances(attendances).confirmed.map((row) => ({
    userId: row.userId,
    name: row.name,
    tier: row.tier,
  }));
}

export async function getMatchStatsSnapshot(matchId: string) {
  const confirmed = await getConfirmedStatRoster(matchId);
  const live = await getLiveStatSession(matchId);
  const liveEvents = live ? await listSessionEvents(live.id) : [];
  const finished = live ? null : await getLatestFinishedStatSession(matchId);
  const finishedEvents = finished ? await listSessionEvents(finished.id) : [];

  return {
    confirmedCount: confirmed.length,
    live: live
      ? {
          sessionId: live.id,
          players: buildRoster(confirmed, liveEvents),
          clock: {
            elapsedSeconds: live.elapsedSeconds,
            running: live.timerRunning,
            anchorAt: live.timerAnchorAt?.toISOString() ?? null,
          },
        }
      : null,
    finished: finished
      ? {
          sessionId: finished.id,
          durationSeconds: finished.durationSeconds ?? finished.elapsedSeconds,
          endedAt: finished.endedAt?.toISOString() ?? null,
          players: buildRoster([], finishedEvents).sort(
            (a, b) => b.points - a.points || a.name.localeCompare(b.name, "pt-BR"),
          ),
        }
      : null,
  };
}

export async function startStatSession(matchId: string, userId: string) {
  const confirmed = await getConfirmedStatRoster(matchId);

  if (confirmed.length === 0) {
    return { ok: false as const, error: "Sem confirmados para iniciar o jogo." };
  }

  const existing = await getLiveStatSession(matchId);

  if (existing) {
    return { ok: true as const, sessionId: existing.id, resumed: true };
  }

  const db = getDb();
  const now = new Date();

  try {
    const [session] = await db
      .insert(matchStatSessions)
      .values({
        matchId,
        status: "live",
        startedBy: userId,
        elapsedSeconds: 0,
        timerRunning: true,
        timerAnchorAt: now,
      })
      .returning();

    if (!session) {
      return { ok: false as const, error: "Não foi possível iniciar o jogo." };
    }

    return { ok: true as const, sessionId: session.id, resumed: false };
  } catch (error) {
    if (!isUniqueViolation(error)) {
      throw error;
    }

    const live = await getLiveStatSession(matchId);

    if (!live) {
      throw error;
    }

    return { ok: true as const, sessionId: live.id, resumed: true };
  }
}

async function requireLiveSession(matchId: string, sessionId: string) {
  const session = await getSessionById(sessionId);

  if (!session || session.matchId !== matchId) {
    return { ok: false as const, error: "Sessão não encontrada." };
  }

  if (session.status !== "live") {
    return { ok: false as const, error: "Essa partida já foi encerrada." };
  }

  return { ok: true as const, session };
}

export async function recordStatEvent(input: {
  matchId: string;
  sessionId: string;
  targetUserId: string;
  type: StatEventType;
  recordedBy: string;
  recordedName: string;
}) {
  const live = await requireLiveSession(input.matchId, input.sessionId);

  if (!live.ok) {
    return live;
  }

  const confirmed = await getConfirmedStatRoster(input.matchId);

  if (!confirmed.some((player) => player.userId === input.targetUserId)) {
    return { ok: false as const, error: "Jogador não está confirmado." };
  }

  const db = getDb();
  await db.insert(matchStatEvents).values({
    sessionId: input.sessionId,
    targetUserId: input.targetUserId,
    type: input.type,
    points: STAT_POINTS[input.type],
    recordedBy: input.recordedBy,
    recordedName: input.recordedName,
  });

  return { ok: true as const };
}

export async function clearPlayerSessionStats(input: {
  matchId: string;
  sessionId: string;
  targetUserId: string;
}) {
  const live = await requireLiveSession(input.matchId, input.sessionId);

  if (!live.ok) {
    return live;
  }

  const db = getDb();
  await db
    .delete(matchStatEvents)
    .where(
      and(
        eq(matchStatEvents.sessionId, input.sessionId),
        eq(matchStatEvents.targetUserId, input.targetUserId),
      ),
    );

  return { ok: true as const };
}

export async function pauseStatTimer(matchId: string, sessionId: string) {
  const live = await requireLiveSession(matchId, sessionId);

  if (!live.ok) {
    return live;
  }

  const elapsed = currentElapsed(live.session);
  const db = getDb();
  await db
    .update(matchStatSessions)
    .set({
      elapsedSeconds: elapsed,
      timerRunning: false,
      timerAnchorAt: null,
    })
    .where(
      and(
        eq(matchStatSessions.id, sessionId),
        eq(matchStatSessions.status, "live"),
      ),
    );

  return { ok: true as const, durationSeconds: elapsed };
}

export async function resumeStatTimer(matchId: string, sessionId: string) {
  const live = await requireLiveSession(matchId, sessionId);

  if (!live.ok) {
    return live;
  }

  if (live.session.timerRunning) {
    return { ok: true as const };
  }

  const db = getDb();
  await db
    .update(matchStatSessions)
    .set({
      timerRunning: true,
      timerAnchorAt: new Date(),
    })
    .where(
      and(
        eq(matchStatSessions.id, sessionId),
        eq(matchStatSessions.status, "live"),
      ),
    );

  return { ok: true as const };
}

export async function resetStatTimer(matchId: string, sessionId: string) {
  const live = await requireLiveSession(matchId, sessionId);

  if (!live.ok) {
    return live;
  }

  const db = getDb();
  await db
    .update(matchStatSessions)
    .set({
      elapsedSeconds: 0,
      timerAnchorAt: live.session.timerRunning ? new Date() : null,
    })
    .where(
      and(
        eq(matchStatSessions.id, sessionId),
        eq(matchStatSessions.status, "live"),
      ),
    );

  return { ok: true as const };
}

export async function finishStatSession(input: {
  matchId: string;
  sessionId: string;
  endedBy: string;
}) {
  const live = await requireLiveSession(input.matchId, input.sessionId);

  if (!live.ok) {
    return live;
  }

  const elapsed = currentElapsed(live.session);
  const now = new Date();
  const db = getDb();
  const [updated] = await db
    .update(matchStatSessions)
    .set({
      status: "finished",
      endedAt: now,
      endedBy: input.endedBy,
      durationSeconds: elapsed,
      elapsedSeconds: elapsed,
      timerRunning: false,
      timerAnchorAt: null,
    })
    .where(
      and(
        eq(matchStatSessions.id, input.sessionId),
        eq(matchStatSessions.status, "live"),
      ),
    )
    .returning();

  if (!updated) {
    return { ok: false as const, error: "Essa partida já foi encerrada." };
  }

  const events = await listSessionEvents(input.sessionId);
  const totals = new Map<
    string,
    { goals: number; assists: number; defenses: number; points: number }
  >();

  for (const event of events) {
    const row = totals.get(event.targetUserId) ?? {
      goals: 0,
      assists: 0,
      defenses: 0,
      points: 0,
    };

    if (event.type === "goal") {
      row.goals += 1;
    } else if (event.type === "assist") {
      row.assists += 1;
    } else {
      row.defenses += 1;
    }

    row.points += STAT_POINTS[event.type];
    totals.set(event.targetUserId, row);
  }

  for (const [userId, row] of totals) {
    if (row.points === 0) {
      continue;
    }

    await db
      .insert(playerStatTotals)
      .values({
        userId,
        goals: row.goals,
        assists: row.assists,
        defenses: row.defenses,
        points: row.points,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: playerStatTotals.userId,
        set: {
          goals: sql`${playerStatTotals.goals} + ${row.goals}`,
          assists: sql`${playerStatTotals.assists} + ${row.assists}`,
          defenses: sql`${playerStatTotals.defenses} + ${row.defenses}`,
          points: sql`${playerStatTotals.points} + ${row.points}`,
          updatedAt: now,
        },
      });
  }

  return { ok: true as const, durationSeconds: elapsed };
}

export async function listMatchesWithStats(): Promise<MatchWithStats[]> {
  const db = getDb();
  const rows = await db
    .select({
      id: matches.id,
      date: matches.date,
      time: matches.time,
      location: matches.location,
      startedAt: matchStatSessions.startedAt,
    })
    .from(matchStatSessions)
    .innerJoin(matches, eq(matches.id, matchStatSessions.matchId))
    .orderBy(desc(matchStatSessions.startedAt));

  const seen = new Set<string>();
  const result: MatchWithStats[] = [];

  for (const row of rows) {
    if (seen.has(row.id)) {
      continue;
    }

    seen.add(row.id);
    result.push({
      id: row.id,
      date: row.date,
      time: row.time,
      location: row.location,
    });
  }

  return result;
}

export async function listAuditEvents(matchId: string): Promise<AuditEventRow[]> {
  const db = getDb();
  const rows = await db
    .select({
      id: matchStatEvents.id,
      sessionId: matchStatEvents.sessionId,
      sessionStatus: matchStatSessions.status,
      matchId: matchStatSessions.matchId,
      matchDate: matches.date,
      type: matchStatEvents.type,
      points: matchStatEvents.points,
      createdAt: matchStatEvents.createdAt,
      targetUserId: matchStatEvents.targetUserId,
      targetName: users.name,
      recordedBy: matchStatEvents.recordedBy,
      recordedName: matchStatEvents.recordedName,
      recorderName: recorder.name,
    })
    .from(matchStatEvents)
    .innerJoin(
      matchStatSessions,
      eq(matchStatSessions.id, matchStatEvents.sessionId),
    )
    .innerJoin(matches, eq(matches.id, matchStatSessions.matchId))
    .innerJoin(users, eq(users.id, matchStatEvents.targetUserId))
    .leftJoin(recorder, eq(recorder.id, matchStatEvents.recordedBy))
    .where(eq(matchStatSessions.matchId, matchId))
    .orderBy(desc(matchStatEvents.createdAt));

  return rows.map((row) => ({
    id: row.id,
    sessionId: row.sessionId,
    sessionStatus: row.sessionStatus,
    matchId: row.matchId,
    matchDate: row.matchDate,
    type: row.type,
    points: row.points,
    createdAt: row.createdAt,
    targetUserId: row.targetUserId,
    targetName: row.targetName,
    recordedBy: row.recordedBy,
    recordedName: row.recorderName ?? row.recordedName,
  }));
}

export type StatRankingPeriod = "month" | "all";

export async function listStatRanking(period: StatRankingPeriod) {
  const db = getDb();
  const filters = [eq(matchStatSessions.status, "finished")];

  if (period === "month") {
    const { start, endExclusive } = currentMonthRangeInSaoPaulo();
    filters.push(gte(matches.date, start), lt(matches.date, endExclusive));
  }

  const rows = await db
    .select({
      userId: users.id,
      name: users.name,
      tier: users.tier,
      type: matchStatEvents.type,
    })
    .from(matchStatEvents)
    .innerJoin(
      matchStatSessions,
      eq(matchStatSessions.id, matchStatEvents.sessionId),
    )
    .innerJoin(matches, eq(matches.id, matchStatSessions.matchId))
    .innerJoin(users, eq(users.id, matchStatEvents.targetUserId))
    .where(and(...filters));

  const lines = new Map<string, StatPlayerLine>();

  for (const row of rows) {
    const line = lines.get(row.userId) ?? {
      userId: row.userId,
      name: row.name,
      tier: row.tier,
      goals: 0,
      assists: 0,
      defenses: 0,
      points: 0,
    };

    if (row.type === "goal") {
      line.goals += 1;
    } else if (row.type === "assist") {
      line.assists += 1;
    } else {
      line.defenses += 1;
    }

    line.points += STAT_POINTS[row.type];
    lines.set(row.userId, line);
  }

  return [...lines.values()]
    .filter((line) => line.points > 0)
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.goals - a.goals ||
        a.name.localeCompare(b.name, "pt-BR"),
    );
}
