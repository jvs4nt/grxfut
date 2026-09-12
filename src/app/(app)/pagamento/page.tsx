import { PaymentAdminControls } from "@/components/payment-admin-controls";
import { PaymentBadge } from "@/components/payment-badge";
import { requireSession, isAdmin } from "@/lib/auth";
import { formatDayMonthYear } from "@/lib/dates";
import { getNextScheduledMatch } from "@/lib/matches";
import { listPayments, paymentProgress } from "@/lib/payments";
import { cardClass } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function PaymentPage() {
  const user = await requireSession();
  const admin = isAdmin(user);
  const match = await getNextScheduledMatch();
  const rows = match ? await listPayments(match.id) : [];
  const progress = paymentProgress(rows);

  return (
    <main className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-medium tracking-wide text-emerald-400">
          Pagamento
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          {match
            ? `Fut de ${formatDayMonthYear(match.date)}`
            : "Sem próximo jogo"}
        </h1>
        <p className="text-sm text-zinc-400">
          {admin
            ? "Só o Admin marca PAGO, AGENDADO ou CALOTE."
            : "Você só visualiza. O Admin marca as flags."}
        </p>
      </header>

      {match ? (
        <section className={cardClass}>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Progresso
          </p>
          <p className="mt-2 text-4xl font-semibold tracking-tight">{progress}%</p>
          <p className="mt-1 text-sm text-zinc-400">
            Percentual de jogadores com flag PAGO.
          </p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-emerald-400"
              style={{ width: `${progress}%` }}
            />
          </div>
        </section>
      ) : (
        <p className="text-sm text-zinc-500">
          Quando houver um jogo scheduled, as flags aparecem aqui. Todo mundo
          começa em CALOTE.
        </p>
      )}

      {match ? (
        <ul className="flex flex-col gap-2">
          {rows.map((row) => (
            <li
              key={row.userId}
              className="flex flex-col gap-3 rounded-2xl border border-zinc-800 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="font-medium">{row.name}</span>
                <PaymentBadge status={row.status} scheduledOn={row.scheduledOn} />
              </div>
              {admin ? (
                <PaymentAdminControls
                  userId={row.userId}
                  status={row.status}
                  scheduledOn={row.scheduledOn}
                />
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </main>
  );
}
