"use client";

import { useEffect, useState } from "react";
import { ModalBackdrop, ModalPanel } from "@/components/modal-backdrop";
import { formatDayMonth } from "@/lib/dates";
import type { PaymentStatus } from "@/lib/labels";

function storageKey(matchId: string, sessionId: string) {
  return `garux_pay_modal_${matchId}_${sessionId}`;
}

export function PaymentModal({
  matchId,
  sessionId,
  status,
  scheduledOn,
}: {
  matchId: string;
  sessionId: string;
  status: PaymentStatus;
  scheduledOn: string | null;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (status === "pago") {
      setOpen(false);
      return;
    }

    try {
      setOpen(sessionStorage.getItem(storageKey(matchId, sessionId)) !== "1");
    } catch {
      setOpen(true);
    }
  }, [matchId, sessionId, status]);

  const isCalote = status === "calote";
  const tone = isCalote
    ? "border-red-500/50 bg-red-950 text-red-50 ring-white/10"
    : "border-amber-500/50 bg-amber-950 text-amber-50 ring-white/10";
  const title = isCalote
    ? "PAGA O FUTEBOL ARROMBADO"
    : `NÃO ESQUECE DE PAGAR ATÉ O DIA ${scheduledOn ? formatDayMonth(scheduledOn) : "—"}`;

  function dismiss() {
    try {
      sessionStorage.setItem(storageKey(matchId, sessionId), "1");
    } catch {
      // ignore
    }
    setOpen(false);
  }

  const visible = open && status !== "pago";

  return (
    <ModalBackdrop
      open={visible}
      role="dialog"
      aria-modal="true"
      aria-labelledby="garux-pay-modal-title"
    >
      <ModalPanel className={tone}>
        <p className="text-xs font-semibold uppercase tracking-wider opacity-70">
          {isCalote ? "Devendo" : "Pagamento combinado"}
        </p>
        <p
          id="garux-pay-modal-title"
          className="mt-3 text-2xl font-semibold leading-tight tracking-tight"
        >
          {title}
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="mt-6 rounded-full bg-zinc-50 px-4 py-2 text-sm font-semibold text-zinc-950"
        >
          Fechar
        </button>
      </ModalPanel>
    </ModalBackdrop>
  );
}
