"use client";

import { useEffect, useState } from "react";
import { formatDayMonth } from "@/lib/dates";
import type { PaymentStatus } from "@/lib/labels";

function storageKey(matchId: string) {
  return `garux_pay_modal_${matchId}`;
}

export function PaymentModal({
  matchId,
  status,
  scheduledOn,
}: {
  matchId: string;
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
      setOpen(sessionStorage.getItem(storageKey(matchId)) !== "1");
    } catch {
      setOpen(true);
    }
  }, [matchId, status]);

  if (!open || status === "pago") {
    return null;
  }

  const isCalote = status === "calote";
  const tone = isCalote
    ? "border-red-500/50 bg-red-950 text-red-50"
    : "border-amber-500/50 bg-amber-950 text-amber-50";
  const title = isCalote
    ? "PAGA O FUTEBOL ARROMBADO"
    : `NÃO ESQUECE DE PAGAR ATÉ O DIA ${scheduledOn ? formatDayMonth(scheduledOn) : "—"}`;

  function dismiss() {
    try {
      sessionStorage.setItem(storageKey(matchId), "1");
    } catch {
      // ignore
    }
    setOpen(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="garux-pay-modal-title"
    >
      <div className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl ${tone}`}>
        <p className="text-xs font-semibold uppercase tracking-wider opacity-70">
          {isCalote ? "Calote" : "Agendado"}
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
      </div>
    </div>
  );
}
