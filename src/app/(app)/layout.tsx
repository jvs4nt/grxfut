import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { getSessionClaims, requireSession } from "@/lib/auth";
import { getAttendanceForUser } from "@/lib/attendance";
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
  // Um mesmo request já paga o custo dos dois: `getPaymentForUser` roda em todo
  // GET de membro, então a presença vem junto no mesmo round-trip.
  const [payment, attendance] =
    nextMatch && user.role === "member"
      ? await Promise.all([
          getPaymentForUser(nextMatch.id, user.id),
          getAttendanceForUser(nextMatch.id, user.id),
        ])
      : [null, null];

  return (
    <AppShell
      user={user}
      paymentModal={
        // Quem está no meio do fluxo do PIX não leva cobrança na cara.
        payment &&
        payment.status !== "pago" &&
        attendance?.status !== "pending_payment" &&
        nextMatch &&
        claims
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
