"use client";

import { useCallback, useId, useState } from "react";
import {
  markPaymentAwaitingAction,
  markPaymentPaidAction,
} from "@/app/(app)/pagamento/actions";
import {
  GaruxBusyDialog,
  PendingForm,
} from "@/components/busy-overlay";
import { buttonClass, secondaryButtonClass } from "@/lib/ui";

export function PaymentRowToggle({
  userId,
  memberName,
  paid,
}: {
  userId: string;
  memberName: string;
  paid: boolean;
}) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const close = useCallback(() => setOpen(false), []);

  const markAction = paid ? markPaymentAwaitingAction : markPaymentPaidAction;
  const submit = useCallback(
    async (formData: FormData) => {
      close();
      await markAction(formData);
    },
    [close, markAction],
  );
  const title = paid
    ? `Voltar ${memberName} para aguardando?`
    : `Marcar ${memberName} como pago?`;
  const description = paid
    ? "O badge volta para aguardando pagamento e o progresso do fut é recalculado."
    : "O membro passa a contar como pago no progresso deste fut.";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={secondaryButtonClass}
      >
        Alterar status
      </button>
      <GaruxBusyDialog
        open={open}
        titleId={titleId}
        title={title}
        description={description}
        onClose={close}
      >
        <PendingForm action={submit} className="contents">
          <input type="hidden" name="userId" value={userId} />
          <button type="submit" className={buttonClass}>
            Confirmar
          </button>
        </PendingForm>
        <button type="button" onClick={close} className={secondaryButtonClass}>
          Cancelar
        </button>
      </GaruxBusyDialog>
    </>
  );
}
