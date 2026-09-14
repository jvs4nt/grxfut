"use server";

import { revalidatePath } from "next/cache";
import { emptyToNull } from "@/lib/dates";
import { getAdminSession } from "@/lib/guards";
import {
  cancelMatchWeek,
  createMatch,
  getMatchById,
  updateMatch,
} from "@/lib/matches";
import { ensurePaymentsForMatch } from "@/lib/payments";

export type FormState = {
  error: string | null;
  ok?: boolean;
};

function refreshApp() {
  revalidatePath("/", "layout");
}

export async function createMatchAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const admin = await getAdminSession();

  if (!admin.ok) {
    return { error: admin.error };
  }

  const date = String(formData.get("date") ?? "").trim();
  const time = emptyToNull(String(formData.get("time") ?? ""));
  const location = emptyToNull(String(formData.get("location") ?? ""));

  if (!date) {
    return { error: "Informe a data do jogo." };
  }

  const match = await createMatch({ date, time, location });
  await ensurePaymentsForMatch(match.id);
  refreshApp();
  return { error: null, ok: true };
}

export async function updateMatchAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const admin = await getAdminSession();

  if (!admin.ok) {
    return { error: admin.error };
  }

  const matchId = String(formData.get("matchId") ?? "");
  const date = String(formData.get("date") ?? "").trim();
  const time = emptyToNull(String(formData.get("time") ?? ""));
  const location = emptyToNull(String(formData.get("location") ?? ""));

  if (!matchId || !date) {
    return { error: "Informe a data do jogo." };
  }

  const existing = await getMatchById(matchId);

  if (!existing || existing.status !== "scheduled") {
    return { error: "Jogo não encontrado." };
  }

  await updateMatch(matchId, { date, time, location });
  refreshApp();
  return { error: null, ok: true };
}

export async function cancelWeekAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const admin = await getAdminSession();

  if (!admin.ok) {
    return { error: admin.error };
  }

  const matchId = String(formData.get("matchId") ?? "");

  if (!matchId) {
    return { error: "Jogo não encontrado." };
  }

  const cancelled = await cancelMatchWeek(matchId);

  if (!cancelled) {
    return { error: "Só dá para cancelar um jogo marcado." };
  }

  refreshApp();
  return { error: null, ok: true };
}
