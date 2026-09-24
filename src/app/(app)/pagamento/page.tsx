import { AwaitingPixBadge, PaymentBadge } from "@/components/payment-badge";
import { PaymentRowToggle } from "@/components/payment-row-toggle";
import { Reveal } from "@/components/reveal";
import { revealDelay } from "@/lib/reveal";
import { requireSession, isAdmin } from "@/lib/auth";
import { formatDayMonthYear } from "@/lib/dates";
import { getNextScheduledMatch } from "@/lib/matches";
import {
  isPaymentPageRowPaid,
  listPaymentPageRows,
  paymentProgressFromPageRows,
} from "@/lib/payments";
import { cardClass, listRowClassLoose } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function PaymentPage() {
  const user = await requireSession();
  const admin = isAdmin(user);
  const match = await getNextScheduledMatch();
  const rows = match ? await listPaymentPageRows(match.id) : [];
  const progress = paymentProgressFromPageRows(rows);

  return (
    <main className="flex flex-col gap-8">
      <Reveal delayMs={revealDelay(0)}>
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
            ? "Cada linha mostra o status atual. Use Alterar status e confirme no modal para atualizar o pagamento."
            : "Você entra como pago ao confirmar o PIX na home. O administrador confere o extrato."}
        </p>
      </header>
      </Reveal>

      {match ? (
        <Reveal as="section" className={cardClass} delayMs={revealDelay(1)}>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-500">
            Progresso
          </p>
          <p className="mt-2 text-4xl font-semibold tracking-tight">{progress}%</p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Entre confirmados e quem está aguardando o PIX, quantos já pagaram.
          </p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
            <div
              className="h-full rounded-full bg-emerald-400"
              style={{ width: `${progress}%` }}
            />
          </div>
        </Reveal>
      ) : (
        <Reveal delayMs={revealDelay(1)}>
        <p className="text-sm text-zinc-600 dark:text-zinc-500">
          Quando houver um próximo jogo marcado, a lista de pagamentos aparece
          aqui. Quem ainda não pagou começa como devendo.
        </p>
        </Reveal>
      )}

      {match && rows.length === 0 ? (
        <Reveal delayMs={revealDelay(2)}>
        <p className="text-sm text-zinc-600 dark:text-zinc-500">
          Ninguém confirmou presença nem iniciou o pagamento do PIX ainda.
        </p>
        </Reveal>
      ) : null}

      {match && rows.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {rows.map((row, index) => {
            const paid = isPaymentPageRowPaid(row);
            return (
            <Reveal
              as="li"
              key={row.userId}
              className={listRowClassLoose}
              delayMs={revealDelay(2 + index)}
            >
              <div className="flex items-center gap-3">
                <span className="font-medium">{row.name}</span>
                {paid ? (
                  <PaymentBadge status="pago" />
                ) : (
                  <AwaitingPixBadge />
                )}
              </div>
              {admin ? (
                <PaymentRowToggle
                  userId={row.userId}
                  memberName={row.name}
                  paid={paid}
                />
              ) : null}
            </Reveal>
            );
          })}
        </ul>
      ) : null}
    </main>
  );
}
