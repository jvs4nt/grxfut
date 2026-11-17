"use server";

import { revalidatePath } from "next/cache";
import { isValidPeriod } from "@/lib/dates";
import { getAdminSession } from "@/lib/guards";
import {
  getMensalSettings,
  saveMensalSettings,
  setMensalistas,
  setMensalPaid,
  type MensalSettings,
} from "@/lib/mensal";

type Result<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function refreshApp() {
  revalidatePath("/", "layout");
}

export async function updateMensalConfigAction(input: {
  period: string;
  amountStr: string;
}): Promise<Result<MensalSettings>> {
  const admin = await getAdminSession();
  if (!admin.ok) {
    return { ok: false, error: admin.error };
  }

  const period = input.period.trim();
  if (!isValidPeriod(period)) {
    return { ok: false, error: "Escolha o mês e o ano." };
  }

  const parsed = Number.parseFloat(input.amountStr.replace(",", "."));
  if (Number.isNaN(parsed) || parsed < 0) {
    return { ok: false, error: "Valor inválido." };
  }

  const updated = await saveMensalSettings({
    period,
    amount: Math.round(parsed * 100),
  });
  refreshApp();
  return { ok: true, data: updated };
}

export async function updateMensalistasAction(
  userIds: string[],
): Promise<Result> {
  const admin = await getAdminSession();
  if (!admin.ok) {
    return { ok: false, error: admin.error };
  }

  await setMensalistas(userIds);
  refreshApp();
  return { ok: true, data: undefined };
}

export async function toggleMensalPaidAction(
  userId: string,
  paid: boolean,
): Promise<Result> {
  const admin = await getAdminSession();
  if (!admin.ok) {
    return { ok: false, error: admin.error };
  }

  const { period } = await getMensalSettings();
  await setMensalPaid({ userId, period, paid, adminId: admin.user.id });
  refreshApp();
  return { ok: true, data: undefined };
}
