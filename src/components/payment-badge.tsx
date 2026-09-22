import { formatDayMonth } from "@/lib/dates";
import { PAYMENT_LABELS, type PaymentStatus } from "@/lib/labels";

const TONE: Record<PaymentStatus, string> = {
  pago: "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200",
  agendado: "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200",
  calote: "border-red-500/30 bg-red-500/10 text-red-800 dark:text-red-200",
};

export function PaymentBadge({
  status,
  scheduledOn,
}: {
  status: PaymentStatus;
  scheduledOn?: string | null;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${TONE[status]}`}
    >
      {PAYMENT_LABELS[status]}
      {status === "agendado" && scheduledOn ? (
        <span className="font-medium normal-case tracking-normal">
          {formatDayMonth(scheduledOn)}
        </span>
      ) : null}
    </span>
  );
}
