"use server";

import { revalidatePath } from "next/cache";
import { deleteDraw, getDrawForMatch, runDraw, swapDrawPlayers } from "@/lib/draw";
import { getAdminSession } from "@/lib/guards";
import { getNextScheduledMatch } from "@/lib/matches";

export type FormState = {
  error: string | null;
  ok?: boolean;
};

function refreshApp() {
  revalidatePath("/", "layout");
}

export async function runDrawAction() {
  const admin = await getAdminSession();

  if (!admin.ok) {
    return;
  }

  const match = await getNextScheduledMatch();

  if (!match) {
    return;
  }

  await runDraw(match.id);
  refreshApp();
}

export async function deleteDrawAction(
  _prev: FormState,
  _formData: FormData,
): Promise<FormState> {
  const admin = await getAdminSession();

  if (!admin.ok) {
    return { error: admin.error };
  }

  const match = await getNextScheduledMatch();

  if (!match) {
    return { error: "Sem próximo jogo." };
  }

  await deleteDraw(match.id);
  refreshApp();
  return { error: null, ok: true };
}

export async function swapDrawPlayersAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const admin = await getAdminSession();

  if (!admin.ok) {
    return { error: admin.error };
  }

  const match = await getNextScheduledMatch();
  const drawId = String(formData.get("drawId") ?? "");
  const userId = String(formData.get("userId") ?? "");
  const otherUserId = String(formData.get("otherUserId") ?? "");

  if (!match || !drawId || !userId || !otherUserId) {
    return { error: "Escolha o jogador do outro time." };
  }

  const draw = await getDrawForMatch(match.id);

  if (!draw || draw.id !== drawId) {
    return { error: "Sorteio não encontrado." };
  }

  const result = await swapDrawPlayers(drawId, userId, otherUserId);

  if (!result.ok) {
    return { error: "Escolha outro jogador." };
  }

  refreshApp();
  return { error: null, ok: true };
}
