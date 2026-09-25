"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { isStatEventType } from "@/lib/match-stat-shared";
import {
  finishStatSession,
  pauseStatTimer,
  clearPlayerSessionStats,
  recordStatEvent,
  resetStatTimer,
  resumeStatTimer,
  startStatSession,
} from "@/lib/match-stats";
import { getNextScheduledMatch } from "@/lib/matches";

export type StatActionResult =
  | { ok: true; durationSeconds?: number }
  | { ok: false; error: string };

function refreshStats() {
  revalidatePath("/jogo");
  revalidatePath("/jogo/auditoria");
}

async function requirePlayer() {
  const user = await getSession();

  if (!user) {
    return { ok: false as const, error: "Sessão expirada. Entre de novo." };
  }

  if (user.role === "guest") {
    return { ok: false as const, error: "Sem permissão." };
  }

  return { ok: true as const, user };
}

async function currentMatchOr(matchId: string) {
  const match = await getNextScheduledMatch();
  return !match || match.id !== matchId ? null : match;
}

export async function startMatchStatSessionAction(
  matchId: string,
): Promise<StatActionResult> {
  const auth = await requirePlayer();

  if (!auth.ok) {
    return auth;
  }

  const match = await currentMatchOr(matchId);

  if (!match) {
    return { ok: false, error: "O jogo mudou. Atualize a página." };
  }

  const result = await startStatSession(match.id, auth.user.id);

  if (!result.ok) {
    return result;
  }

  refreshStats();
  return { ok: true };
}

export async function recordMatchStatAction(
  matchId: string,
  sessionId: string,
  targetUserId: string,
  type: string,
): Promise<StatActionResult> {
  const auth = await requirePlayer();

  if (!auth.ok) {
    return auth;
  }

  if (!isStatEventType(type) || !targetUserId || !sessionId) {
    return { ok: false, error: "Evento inválido." };
  }

  const match = await currentMatchOr(matchId);

  if (!match) {
    return { ok: false, error: "O jogo mudou. Atualize a página." };
  }

  const result = await recordStatEvent({
    matchId: match.id,
    sessionId,
    targetUserId,
    type,
    recordedBy: auth.user.id,
    recordedName: auth.user.name,
  });

  if (!result.ok) {
    return result;
  }

  refreshStats();
  return { ok: true };
}

export async function clearPlayerStatsAction(
  matchId: string,
  sessionId: string,
  targetUserId: string,
): Promise<StatActionResult> {
  const auth = await requirePlayer();

  if (!auth.ok) {
    return auth;
  }

  if (!targetUserId || !sessionId) {
    return { ok: false, error: "Jogador inválido." };
  }

  const match = await currentMatchOr(matchId);

  if (!match) {
    return { ok: false, error: "O jogo mudou. Atualize a página." };
  }

  const result = await clearPlayerSessionStats({
    matchId: match.id,
    sessionId,
    targetUserId,
  });

  if (!result.ok) {
    return result;
  }

  refreshStats();
  return { ok: true };
}

export async function pauseMatchTimerAction(
  matchId: string,
  sessionId: string,
): Promise<StatActionResult> {
  const auth = await requirePlayer();

  if (!auth.ok) {
    return auth;
  }

  const match = await currentMatchOr(matchId);

  if (!match) {
    return { ok: false, error: "O jogo mudou. Atualize a página." };
  }

  const result = await pauseStatTimer(match.id, sessionId);

  if (!result.ok) {
    return result;
  }

  refreshStats();
  return { ok: true, durationSeconds: result.durationSeconds };
}

export async function resumeMatchTimerAction(
  matchId: string,
  sessionId: string,
): Promise<StatActionResult> {
  const auth = await requirePlayer();

  if (!auth.ok) {
    return auth;
  }

  const match = await currentMatchOr(matchId);

  if (!match) {
    return { ok: false, error: "O jogo mudou. Atualize a página." };
  }

  const result = await resumeStatTimer(match.id, sessionId);

  if (!result.ok) {
    return result;
  }

  refreshStats();
  return { ok: true };
}

export async function resetMatchTimerAction(
  matchId: string,
  sessionId: string,
): Promise<StatActionResult> {
  const auth = await requirePlayer();

  if (!auth.ok) {
    return auth;
  }

  const match = await currentMatchOr(matchId);

  if (!match) {
    return { ok: false, error: "O jogo mudou. Atualize a página." };
  }

  const result = await resetStatTimer(match.id, sessionId);

  if (!result.ok) {
    return result;
  }

  refreshStats();
  return { ok: true };
}

export async function finishMatchStatSessionAction(
  matchId: string,
  sessionId: string,
): Promise<StatActionResult> {
  const auth = await requirePlayer();

  if (!auth.ok) {
    return auth;
  }

  const match = await currentMatchOr(matchId);

  if (!match) {
    return { ok: false, error: "O jogo mudou. Atualize a página." };
  }

  const result = await finishStatSession({
    matchId: match.id,
    sessionId,
    endedBy: auth.user.id,
  });

  if (!result.ok) {
    return result;
  }

  refreshStats();
  return { ok: true, durationSeconds: result.durationSeconds };
}
