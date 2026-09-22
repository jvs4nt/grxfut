"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import {
  cancelAttendance,
  confirmPaymentAndAttendance,
  startAttendancePendingPayment,
  setAttendanceStatus,
  type AttendanceStatus,
} from "@/lib/attendance";
import { getAdminSession } from "@/lib/guards";
import { parseRole, parseTier } from "@/lib/labels";
import { getNextScheduledMatch } from "@/lib/matches";
import { ensurePaymentsForMatch } from "@/lib/payments";
import {
  createGuestUser,
  createUser,
  deleteMemberUser,
  toggleUserActive,
  updateMemberUser,
  updateUserTier,
} from "@/lib/users";

export type FormState = {
  error: string | null;
  ok?: boolean;
};

function refreshApp() {
  revalidatePath("/", "layout");
}

export async function createUserAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const admin = await getAdminSession();

  if (!admin.ok) {
    return { error: admin.error };
  }

  const username = String(formData.get("username") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim() || username;
  const password = String(formData.get("password") ?? "");
  const role = parseRole(String(formData.get("role") ?? ""));
  const tier = parseTier(String(formData.get("tier") ?? ""));

  if (!username || !password || !role || !tier) {
    return { error: "Preencha nome, usuário, senha, papel e nível." };
  }

  const result = await createUser({ username, name, password, role, tier });

  if (!result.ok) {
    return { error: "Esse usuário já existe." };
  }

  const nextMatch = await getNextScheduledMatch();

  if (nextMatch) {
    await ensurePaymentsForMatch(nextMatch.id);
  }

  refreshApp();
  return { error: null, ok: true };
}

export async function updateTierAction(formData: FormData) {
  const admin = await getAdminSession();

  if (!admin.ok) {
    return;
  }

  const userId = String(formData.get("userId") ?? "");
  const tier = parseTier(String(formData.get("tier") ?? ""));

  if (!userId || !tier) {
    return;
  }

  await updateUserTier(userId, tier);
  refreshApp();
}

export async function updateMemberAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const admin = await getAdminSession();

  if (!admin.ok) {
    return { error: admin.error };
  }

  const userId = String(formData.get("userId") ?? "");
  const username = String(formData.get("username") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim() || username;
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!userId || !username) {
    return { error: "Informe nome e usuário." };
  }

  if (password || confirmPassword) {
    if (password !== confirmPassword) {
      return { error: "As senhas não coincidem." };
    }

    if (password.length < 4) {
      return { error: "A senha precisa ter pelo menos 4 caracteres." };
    }
  }

  const result = await updateMemberUser({
    userId,
    username,
    name,
    password: password || undefined,
    actorId: admin.user.id,
  });

  if (!result.ok) {
    if (result.error === "duplicate") {
      return { error: "Esse usuário já existe." };
    }

    return { error: "Sem permissão." };
  }

  refreshApp();
  return { error: null, ok: true };
}

export type RsvpResult =
  | { ok: true; needsPayment: boolean }
  | { ok: false; error: string };

/**
 * O fluxo de RSVP tem três passos (confirmar → pagar → confirmar pagamento) e o
 * jogo pode mudar no meio, então cada action recebe o `matchId` que a página
 * renderizou e recusa se ele não for mais o próximo jogo.
 */
async function currentMatchOr(matchId: string) {
  const match = await getNextScheduledMatch();

  return !match || match.id !== matchId ? null : match;
}

export async function startAttendanceAction(
  matchId: string,
): Promise<RsvpResult> {
  const user = await getSession();

  if (!user) {
    return { ok: false, error: "Sessão expirada. Entre de novo." };
  }

  const match = await currentMatchOr(matchId);

  if (!match) {
    return { ok: false, error: "O jogo mudou. Atualize a página." };
  }

  const result = await startAttendancePendingPayment(match.id, user.id);
  refreshApp();

  return { ok: true, needsPayment: result.status === "pending_payment" };
}

export async function confirmPixPaymentAction(
  matchId: string,
): Promise<RsvpResult> {
  const user = await getSession();

  if (!user) {
    return { ok: false, error: "Sessão expirada. Entre de novo." };
  }

  const match = await currentMatchOr(matchId);

  if (!match) {
    return { ok: false, error: "O jogo mudou. Atualize a página." };
  }

  const result = await confirmPaymentAndAttendance(match.id, user.id);

  if (!result.ok) {
    return { ok: false, error: "Confirme a presença primeiro." };
  }

  refreshApp();
  return { ok: true, needsPayment: false };
}

export async function cancelAttendanceAction(
  matchId: string,
): Promise<RsvpResult> {
  const user = await getSession();

  if (!user) {
    return { ok: false, error: "Sessão expirada. Entre de novo." };
  }

  const match = await currentMatchOr(matchId);

  if (!match) {
    return { ok: false, error: "O jogo mudou. Atualize a página." };
  }

  // Não mexe em `payments`: quem pagou e desistiu continua `pago`, para o Admin
  // enxergar que o dinheiro entrou.
  await cancelAttendance(match.id, user.id);
  refreshApp();
  return { ok: true, needsPayment: false };
}

function parseAttendanceStatus(value: string): AttendanceStatus | "out" | null {
  if (
    value === "confirmed" ||
    value === "reserve" ||
    value === "pending_payment" ||
    value === "out"
  ) {
    return value;
  }

  return null;
}

export async function adminSetAttendanceAction(formData: FormData) {
  const admin = await getAdminSession();

  if (!admin.ok) {
    return;
  }

  const match = await getNextScheduledMatch();

  if (!match) {
    return;
  }

  const userId = String(formData.get("userId") ?? "");
  const status = parseAttendanceStatus(String(formData.get("status") ?? ""));

  if (!userId || !status) {
    return;
  }

  await setAttendanceStatus(match.id, userId, status);
  refreshApp();
}

export async function deleteMemberAction(formData: FormData) {
  const admin = await getAdminSession();

  if (!admin.ok) {
    return;
  }

  const userId = String(formData.get("userId") ?? "");

  if (!userId) {
    return;
  }

  const result = await deleteMemberUser(userId);

  if (!result.ok) {
    return;
  }

  refreshApp();
}

export async function createGuestAction(
  formData: FormData,
) {
  const admin = await getAdminSession();
  if (!admin.ok) return { error: admin.error };

  const name = String(formData.get("name") ?? "").trim();
  const tier = parseTier(String(formData.get("tier") ?? ""));

  if (!name || !tier) {
    return { error: "Preencha nome e nível." };
  }

  const result = await createGuestUser({ name, tier });
  if (!result.ok) {
    return { error: "Erro ao criar usuário." };
  }
  
  refreshApp();
  return { ok: true, credentials: result.credentials };
}

export async function toggleUserActiveAction(formData: FormData) {
  const admin = await getAdminSession();
  if (!admin.ok) return;

  const userId = String(formData.get("userId") ?? "");
  const active = formData.get("active") === "true";

  if (!userId) return;

  await toggleUserActive(userId, active);
  refreshApp();
}
