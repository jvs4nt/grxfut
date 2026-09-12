"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import {
  cancelAttendance,
  confirmAttendance,
  setAttendanceStatus,
  type AttendanceStatus,
} from "@/lib/attendance";
import { getAdminSession } from "@/lib/guards";
import { parseRole, parseTier } from "@/lib/labels";
import { getNextScheduledMatch } from "@/lib/matches";
import { ensurePaymentsForMatch } from "@/lib/payments";
import {
  createUser,
  deleteMemberUser,
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
  const password = String(formData.get("password") ?? "");
  const role = parseRole(String(formData.get("role") ?? ""));
  const tier = parseTier(String(formData.get("tier") ?? ""));

  if (!username || !password || !role || !tier) {
    return { error: "Preencha usuário, senha, papel e tier." };
  }

  const result = await createUser({ username, password, role, tier });

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
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!userId || !username) {
    return { error: "Informe o usuário." };
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

export async function confirmAttendanceAction() {
  const user = await getSession();

  if (!user) {
    return;
  }

  const match = await getNextScheduledMatch();

  if (!match) {
    return;
  }

  await confirmAttendance(match.id, user.id);
  refreshApp();
}

export async function cancelAttendanceAction() {
  const user = await getSession();

  if (!user) {
    return;
  }

  const match = await getNextScheduledMatch();

  if (!match) {
    return;
  }

  await cancelAttendance(match.id, user.id);
  refreshApp();
}

function parseAttendanceStatus(value: string): AttendanceStatus | "out" | null {
  if (value === "confirmed" || value === "reserve" || value === "out") {
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
