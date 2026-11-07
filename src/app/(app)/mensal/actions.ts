"use server";

import { revalidatePath } from "next/cache";
import { isAdmin, requireSession } from "@/lib/auth";
import {
  saveMensalistas,
  saveMensalMonthAndAmount,
  type MensalState,
} from "@/lib/mensal";

export async function updateMensalConfigAction(input: {
  monthName: string;
  amountStr: string;
}): Promise<MensalState> {
  const user = await requireSession();
  if (!isAdmin(user)) {
    throw new Error("Não autorizado");
  }

  const monthName = input.monthName.trim();
  if (!monthName) {
    throw new Error("Informe o nome do mês.");
  }

  const parsed = Number.parseFloat(input.amountStr.replace(",", "."));
  if (Number.isNaN(parsed) || parsed < 0) {
    throw new Error("Valor inválido.");
  }

  const amount = Math.round(parsed * 100);
  const updated = await saveMensalMonthAndAmount({ monthName, amount });
  revalidatePath("/mensal");
  return updated;
}

export async function updateMensalistasAction(
  members: string[],
): Promise<MensalState> {
  const user = await requireSession();
  if (!isAdmin(user)) {
    throw new Error("Não autorizado");
  }

  const updated = await saveMensalistas(members);
  revalidatePath("/mensal");
  return updated;
}

