"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/guards";
import { parsePaymentStatus } from "@/lib/labels";
import { getNextScheduledMatch } from "@/lib/matches";
import { setPaymentStatus } from "@/lib/payments";

export async function setPaymentAction(formData: FormData) {
  const admin = await getAdminSession();

  if (!admin.ok) {
    return;
  }

  const match = await getNextScheduledMatch();

  if (!match) {
    return;
  }

  const userId = String(formData.get("userId") ?? "");
  const status = parsePaymentStatus(String(formData.get("status") ?? ""));
  const scheduledOn = String(formData.get("scheduledOn") ?? "").trim() || null;

  if (!userId || !status) {
    return;
  }

  await setPaymentStatus({
    matchId: match.id,
    userId,
    status,
    scheduledOn,
  });

  revalidatePath("/", "layout");
}
