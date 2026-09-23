import {
  markPaymentAwaitingAction,
  markPaymentPaidAction,
} from "@/app/(app)/pagamento/actions";
import { PendingForm } from "@/components/busy-overlay";
import { buttonClass, secondaryButtonClass } from "@/lib/ui";

export function PaymentRowToggle({
  userId,
  paid,
}: {
  userId: string;
  paid: boolean;
}) {
  if (paid) {
    return (
      <PendingForm action={markPaymentAwaitingAction}>
        <input type="hidden" name="userId" value={userId} />
        <button type="submit" className={secondaryButtonClass}>
          Aguardando
        </button>
      </PendingForm>
    );
  }

  return (
    <PendingForm action={markPaymentPaidAction}>
      <input type="hidden" name="userId" value={userId} />
      <button type="submit" className={buttonClass}>
        Pago
      </button>
    </PendingForm>
  );
}
