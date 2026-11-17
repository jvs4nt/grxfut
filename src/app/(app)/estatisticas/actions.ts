"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/guards";
import { setPlayerStatTotals, type StatRankingPeriod } from "@/lib/match-stats";

export type StatEditResult = { ok: true } | { ok: false; error: string };

export async function setPlayerStatsAction(input: {
  userId: string;
  scope: StatRankingPeriod;
  goals: number;
  assists: number;
  defenses: number;
}): Promise<StatEditResult> {
  const admin = await getAdminSession();

  if (!admin.ok) {
    return { ok: false, error: admin.error };
  }

  if (input.scope !== "month" && input.scope !== "all") {
    return { ok: false, error: "Aba inválida." };
  }

  const result = await setPlayerStatTotals({
    userId: input.userId,
    scope: input.scope,
    goals: input.goals,
    assists: input.assists,
    defenses: input.defenses,
    adminId: admin.user.id,
  });

  if (!result.ok) {
    return result;
  }

  revalidatePath("/estatisticas");
  return { ok: true };
}
