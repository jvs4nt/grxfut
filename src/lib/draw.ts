import { and, asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { attendances, drawPlayers, draws, users } from "@/db/schema";
import type { UserTier } from "@/lib/labels";

export const TEAM_SIZE = 6;

export type DrawTeam = "team_a" | "team_b" | "draw_reserve";

export type DrawPlayer = {
  userId: string;
  username: string;
  name: string;
  tier: UserTier;
  team: DrawTeam;
};

export type DrawResult = {
  id: string;
  matchId: string;
  createdAt: Date;
  players: DrawPlayer[];
};

type PoolPlayer = {
  userId: string;
  username: string;
  name: string;
  tier: UserTier;
};

export async function getDrawForMatch(matchId: string): Promise<DrawResult | null> {
  const db = getDb();
  const [draw] = await db
    .select()
    .from(draws)
    .where(eq(draws.matchId, matchId))
    .limit(1);

  if (!draw) {
    return null;
  }

  const players = await db
    .select({
      userId: drawPlayers.userId,
      username: users.username,
      name: users.name,
      tier: users.tier,
      team: drawPlayers.team,
    })
    .from(drawPlayers)
    .innerJoin(users, eq(users.id, drawPlayers.userId))
    .where(eq(drawPlayers.drawId, draw.id))
    .orderBy(asc(users.name));

  return {
    id: draw.id,
    matchId: draw.matchId,
    createdAt: draw.createdAt,
    players,
  };
}

export async function runDraw(matchId: string) {
  const db = getDb();
  const confirmed = await db
    .select({
      userId: users.id,
      username: users.username,
      name: users.name,
      tier: users.tier,
    })
    .from(attendances)
    .innerJoin(users, eq(users.id, attendances.userId))
    .where(
      and(eq(attendances.matchId, matchId), eq(attendances.status, "confirmed")),
    );

  if (confirmed.length === 0) {
    return { ok: false as const, error: "empty" };
  }

  const assignments = assignTeams(confirmed);

  await db.delete(draws).where(eq(draws.matchId, matchId));

  const [draw] = await db
    .insert(draws)
    .values({ matchId })
    .returning();

  if (!draw) {
    throw new Error("Falha ao salvar o sorteio.");
  }

  await db.insert(drawPlayers).values(
    assignments.map((assignment) => ({
      drawId: draw.id,
      userId: assignment.userId,
      team: assignment.team,
    })),
  );

  const result = await getDrawForMatch(matchId);
  return { ok: true as const, draw: result };
}

export async function deleteDraw(matchId: string) {
  const db = getDb();
  await db.delete(draws).where(eq(draws.matchId, matchId));
}

export async function swapDrawPlayers(
  drawId: string,
  userId: string,
  otherUserId: string,
) {
  if (userId === otherUserId) {
    return { ok: false as const, error: "same" };
  }

  const db = getDb();
  const players = await db
    .select({
      userId: drawPlayers.userId,
      team: drawPlayers.team,
    })
    .from(drawPlayers)
    .where(eq(drawPlayers.drawId, drawId));

  const first = players.find((player) => player.userId === userId);
  const second = players.find((player) => player.userId === otherUserId);

  if (!first || !second) {
    return { ok: false as const, error: "missing" };
  }

  if (first.team === second.team) {
    return { ok: false as const, error: "teams" };
  }

  await db
    .update(drawPlayers)
    .set({ team: second.team })
    .where(
      and(eq(drawPlayers.drawId, drawId), eq(drawPlayers.userId, first.userId)),
    );
  await db
    .update(drawPlayers)
    .set({ team: first.team })
    .where(
      and(eq(drawPlayers.drawId, drawId), eq(drawPlayers.userId, second.userId)),
    );

  return { ok: true as const };
}

export function assignTeams(players: PoolPlayer[]) {
  const result: { userId: string; team: DrawTeam }[] = [];
  const captains = shuffle(players.filter((player) => player.tier === "capitao"));
  const rest = players.filter((player) => player.tier !== "capitao");

  for (const extra of captains.slice(2)) {
    result.push({ userId: extra.userId, team: "draw_reserve" });
  }

  const teamA: PoolPlayer[] = [];
  const teamB: PoolPlayer[] = [];
  const starters = captains.slice(0, 2);

  if (starters[0]) {
    teamA.push(starters[0]);
  }

  if (starters[1]) {
    teamB.push(starters[1]);
  }

  const ordered = [
    ...shuffle(rest.filter((player) => player.tier === "tenente")),
    ...shuffle(rest.filter((player) => player.tier === "soldado")),
  ];

  let toA = teamA.length <= teamB.length;

  for (const player of ordered) {
    const canA = teamA.length < TEAM_SIZE;
    const canB = teamB.length < TEAM_SIZE;

    if (!canA && !canB) {
      result.push({ userId: player.userId, team: "draw_reserve" });
      continue;
    }

    if (toA && canA) {
      teamA.push(player);
    } else if (!toA && canB) {
      teamB.push(player);
    } else if (canA) {
      teamA.push(player);
    } else {
      teamB.push(player);
    }

    toA = !toA;
  }

  for (const player of teamA) {
    result.push({ userId: player.userId, team: "team_a" });
  }

  for (const player of teamB) {
    result.push({ userId: player.userId, team: "team_b" });
  }

  return result;
}

function shuffle<T>(items: T[]) {
  const list = [...items];

  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const current = list[i];
    list[i] = list[j];
    list[j] = current;
  }

  return list;
}
