import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { getSessionClaims, requireSession } from "@/lib/auth";
import { getNextScheduledMatch } from "@/lib/matches";
import { getPaymentForUser } from "@/lib/payments";

export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [user, nextMatch, claims] = await Promise.all([
    requireSession(),
    getNextScheduledMatch(),
    getSessionClaims(),
  ]);
  const payment =
    nextMatch && user.role === "member"
      ? await getPaymentForUser(nextMatch.id, user.id)
      : null;

  return (
    <AppShell
      user={user}
      paymentModal={
        payment && payment.status !== "pago" && nextMatch && claims
          ? {
              matchId: nextMatch.id,
              sessionId: claims.sessionId,
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
