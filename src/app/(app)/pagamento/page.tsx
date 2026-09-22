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
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {admin
            ? "Quem confirma o PIX na home já aparece como pago. Marque como devendo se o valor não cair no extrato."
            : "Você entra como pago ao confirmar o PIX na home. O administrador confere o extrato."}
        </p>
      </header>

      {match ? (
        <section className={cardClass}>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-500">
            Progresso
          </p>
          <p className="mt-2 text-4xl font-semibold tracking-tight">{progress}%</p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Dos confirmados, quantos já pagaram.
          </p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
            <div
              className="h-full rounded-full bg-emerald-400"
              style={{ width: `${progress}%` }}
            />
          </div>
        </section>
      ) : (
        <p className="text-sm text-zinc-600 dark:text-zinc-500">
          Quando houver um próximo jogo marcado, a lista de pagamentos aparece
          aqui. Quem ainda não pagou começa como devendo.
        </p>
      )}

      {match && rows.length === 0 ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-500">
          A lista só mostra quem já confirmou. Quem está aguardando pagamento
          ainda não aparece aqui.
        </p>
      ) : null}

      {match && rows.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {rows.map((row) => (
            <li
              key={row.userId}
              className="flex flex-col gap-3 rounded-2xl border border-zinc-200 px-4 dark:border-zinc-800 py-3 sm:flex-row sm:items-center sm:justify-between"
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
