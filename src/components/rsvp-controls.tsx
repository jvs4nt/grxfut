"use client";

import { useState } from "react";
import {
  cancelAttendanceAction,
  startAttendanceAction,
} from "@/app/(app)/membros/actions";
import { useBusy } from "@/components/busy-overlay";
import { PixModal } from "@/components/pix-modal";
import type { PixInfo } from "@/lib/pix";
import { buttonClass, secondaryButtonClass } from "@/lib/ui";

export type RsvpState = "out" | "pending" | "confirmed" | "reserve";

export function RsvpControls({
  matchId,
  state,
  pix,
  mensalista = false,
}: {
  matchId: string;
  state: RsvpState;
  pix: PixInfo;
  /** Mensalista paga pelo botão do mensal; o PIX avulso não aparece. */
  mensalista?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { busy, run } = useBusy();

  async function start() {
    setError(null);
    const result = await run(() => startAttendanceAction(matchId));

    if (!result.ok) {
      setError(result.error);
      return;
    }

    if (result.needsPayment && !mensalista) {
      setOpen(true);
    }
  }

  async function cancel() {
    setError(null);
    const result = await run(() => cancelAttendanceAction(matchId));

    if (!result.ok) {
      setError(result.error);
    }
  }

  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-end">
      {state === "out" ? (
        <button
          type="button"
          onClick={start}
          disabled={busy}
          className={buttonClass}
        >
          Confirmar presença
        </button>
      ) : null}

      {state === "pending" && mensalista ? (
        <>
          <p className="text-xs text-amber-700 dark:text-amber-300">
            Presença aguardando o mensal. Assim que o admin marcar seu
            pagamento, você entra nos confirmados.
          </p>
          <button
            type="button"
            onClick={cancel}
            disabled={busy}
            className={secondaryButtonClass}
          >
            Desistir
          </button>
        </>
      ) : null}

      {state === "pending" && !mensalista ? (
        <>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className={buttonClass}
          >
            PAGAR {pix.amountLabel}
          </button>
          <p className="text-xs text-amber-300">
            Realize o pagamento para confirmar sua presença.
          </p>
          <button
            type="button"
            onClick={cancel}
            disabled={busy}
            className={secondaryButtonClass}
          >
            Desistir
          </button>
        </>
      ) : null}

      {state === "confirmed" || state === "reserve" ? (
        <button
          type="button"
          onClick={cancel}
          disabled={busy}
          className={secondaryButtonClass}
        >
          Desistir
        </button>
      ) : null}

      {error ? (
        <p role="alert" className="text-xs text-red-300">
          {error}
        </p>
      ) : null}

      {/*
        O modal fica fora do switch de estado de propósito: quando a action
        dispara o revalidate, `state` vai de "out" para "pending" e um modal
        montado dentro daquele ramo fecharia sozinho no meio do fluxo.
      */}
      {mensalista ? null : (
        <PixModal
          matchId={matchId}
          pix={pix}
          open={open}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
