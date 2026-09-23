"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/guards";
import { parsePaymentStatus } from "@/lib/labels";
import { getNextScheduledMatch } from "@/lib/matches";
import {
  adminMarkPaymentPageAwaiting,
  adminMarkPaymentPagePaid,
  setPaymentStatus,
} from "@/lib/payments";

function refreshApp() {
  revalidatePath("/", "layout");
}

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

  refreshApp();
}

export async function markPaymentPaidAction(formData: FormData) {
  const admin = await getAdminSession();
  if (!admin.ok) {
    return;
  }

  const match = await getNextScheduledMatch();
  if (!match) {
    return;
  }

  const userId = String(formData.get("userId") ?? "");
  if (!userId) {
    return;
  }

  await adminMarkPaymentPagePaid(match.id, userId);
  refreshApp();
}

export async function markPaymentAwaitingAction(formData: FormData) {
  const admin = await getAdminSession();
  if (!admin.ok) {
    return;
  }

  const match = await getNextScheduledMatch();
  if (!match) {
    return;
  }

  const userId = String(formData.get("userId") ?? "");
  if (!userId) {
    return;
  }

  await adminMarkPaymentPageAwaiting(match.id, userId);
  refreshApp();
}
