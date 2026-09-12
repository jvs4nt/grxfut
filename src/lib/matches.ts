import { and, asc, eq, gte } from "drizzle-orm";
import { cache } from "react";
import { getDb } from "@/db";
import { matches } from "@/db/schema";
import { todayInSaoPaulo } from "@/lib/dates";

export type Match = typeof matches.$inferSelect;

export type HomeHighlight =
  | { kind: "empty" }
  | { kind: "scheduled"; match: Match }
  | { kind: "rest"; rest: Match; nextScheduled: Match | null };

export async function getUpcomingMatches(): Promise<Match[]> {
  const db = getDb();
  return db
    .select()
    .from(matches)
    .where(gte(matches.date, todayInSaoPaulo()))
    .orderBy(asc(matches.date), asc(matches.createdAt));
}

export const getNextScheduledMatch = cache(async (): Promise<Match | null> => {
  const db = getDb();
  const [match] = await db
    .select()
    .from(matches)
    .where(
      and(eq(matches.status, "scheduled"), gte(matches.date, todayInSaoPaulo())),
    )
    .orderBy(asc(matches.date), asc(matches.createdAt))
    .limit(1);

  return match ?? null;
});

export async function getMatchById(id: string): Promise<Match | null> {
  const db = getDb();
  const [match] = await db
    .select()
    .from(matches)
    .where(eq(matches.id, id))
    .limit(1);

  return match ?? null;
}

export async function getHomeHighlight(): Promise<HomeHighlight> {
  const upcoming = await getUpcomingMatches();
  const soonest = upcoming[0];

  if (!soonest) {
    return { kind: "empty" };
  }

  if (soonest.status === "rest") {
    return {
      kind: "rest",
      rest: soonest,
      nextScheduled: upcoming.find((match) => match.status === "scheduled") ?? null,
    };
  }

  return { kind: "scheduled", match: soonest };
}

export async function createMatch(input: {
  date: string;
  time: string | null;
  location: string | null;
}) {
  const db = getDb();
  const [match] = await db
    .insert(matches)
    .values({
      date: input.date,
      time: input.time,
      location: input.location,
      status: "scheduled",
    })
    .returning();

  if (!match) {
    throw new Error("Falha ao criar o jogo.");
  }

  return match;
}

export async function updateMatch(
  id: string,
  input: {
    date: string;
    time: string | null;
    location: string | null;
  },
) {
  const db = getDb();
  const [match] = await db
    .update(matches)
    .set({
      date: input.date,
      time: input.time,
      location: input.location,
    })
    .where(eq(matches.id, id))
    .returning();

  return match ?? null;
}

export async function cancelMatchWeek(id: string) {
  const db = getDb();
  const [match] = await db
    .update(matches)
    .set({ status: "rest" })
    .where(and(eq(matches.id, id), eq(matches.status, "scheduled")))
    .returning();

  return match ?? null;
}
