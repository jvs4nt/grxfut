import { setPaymentAction } from "@/app/(app)/pagamento/actions";
import { PendingForm } from "@/components/busy-overlay";
import { PAYMENT_LABELS } from "@/lib/labels";
import { inputClass, secondaryButtonClass } from "@/lib/ui";

export function PaymentAdminControls({
  userId,
  status,
  scheduledOn,
}: {
  userId: string;
  status: "calote" | "agendado" | "pago";
  scheduledOn: string | null;
}) {
  return (
    <div className="flex flex-col gap-2 sm:items-end">
      <div className="flex flex-wrap gap-2">
        <PendingForm action={setPaymentAction}>
          <input type="hidden" name="userId" value={userId} />
          <input type="hidden" name="status" value="pago" />
          <button
            type="submit"
            className={`${secondaryButtonClass} ${status === "pago" ? "border-emerald-500/50 text-emerald-200" : ""}`}
          >
            {PAYMENT_LABELS.pago}
          </button>
        </PendingForm>
        <PendingForm action={setPaymentAction}>
          <input type="hidden" name="userId" value={userId} />
          <input type="hidden" name="status" value="calote" />
          <button
            type="submit"
            className={`${secondaryButtonClass} ${status === "calote" ? "border-red-500/50 text-red-200" : ""}`}
          >
            {PAYMENT_LABELS.calote}
          </button>
        </PendingForm>
      </div>
      <PendingForm action={setPaymentAction} className="flex flex-wrap items-center gap-2">
        <input type="hidden" name="userId" value={userId} />
        <input type="hidden" name="status" value="agendado" />
        <input
          name="scheduledOn"
          type="date"
          required
          defaultValue={scheduledOn ?? ""}
          className={`${inputClass} py-1.5 text-sm`}
          aria-label="Data combinada para pagamento"
        />
        <button
          type="submit"
          className={`${secondaryButtonClass} ${status === "agendado" ? "border-amber-500/50 text-amber-200" : ""}`}
        >
          {PAYMENT_LABELS.agendado}
        </button>
      </PendingForm>
    </div>
  );
}
