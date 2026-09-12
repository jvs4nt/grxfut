import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { requireSession } from "@/lib/auth";
import { getNextScheduledMatch } from "@/lib/matches";
import { getPaymentForUser } from "@/lib/payments";

export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [user, nextMatch] = await Promise.all([
    requireSession(),
    getNextScheduledMatch(),
  ]);
  const payment =
    nextMatch && user.role === "member"
      ? await getPaymentForUser(nextMatch.id, user.id)
      : null;

  return (
    <AppShell
      user={user}
      paymentModal={
        payment && payment.status !== "pago" && nextMatch
          ? {
              matchId: nextMatch.id,
              status: payment.status,
              scheduledOn: payment.scheduledOn,
            }
          : null
      }
    >
      {children}
    </AppShell>
  );
}
