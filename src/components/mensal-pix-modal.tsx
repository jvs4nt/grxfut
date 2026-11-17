"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ModalBackdrop, ModalPanel } from "@/components/modal-backdrop";
import { fallbackCopy } from "@/components/pix-modal";
import { buttonClass, iconButtonClass, secondaryButtonClass } from "@/lib/ui";

export type MensalPayInfo = {
  periodLabel: string;
  amountLabel: string;
  paid: boolean;
  pixKey: string;
  receiver: string;
};

/**
 * Botão PAGAR/PAGO do mensal na home. Não tem "Confirmar pagamento": quem
 * marca o mês como pago é o admin, no checklist da aba Mensal.
 */
export function MensalPayControl({ mensal }: { mensal: MensalPayInfo }) {
  const [open, setOpen] = useState(false);

  if (mensal.paid) {
    return (
      <button
        type="button"
        disabled
        className={`${buttonClass} cursor-not-allowed opacity-60`}
        title={`Mensal de ${mensal.periodLabel} pago`}
      >
        PAGO · {mensal.periodLabel}
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={buttonClass}
      >
        PAGAR MENSAL {mensal.amountLabel}
      </button>
      <MensalPixModal
        mensal={mensal}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

function MensalPixModal({
  mensal,
  open,
  onClose,
}: {
  mensal: MensalPayInfo;
  open: boolean;
  onClose: () => void;
}) {
  const titleId = useId();
  const backdropRef = useRef<HTMLDivElement>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [copied, setCopied] = useState(false);

  // Mesmo padrão do PixModal: focar o backdrop faz o Escape funcionar.
  useEffect(() => {
    if (!open) {
      return;
    }
    backdropRef.current?.focus();

    return () => {
      if (copyTimer.current) {
        clearTimeout(copyTimer.current);
      }
    };
  }, [open]);

  const copyKey = useCallback(async () => {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(mensal.pixKey);
      } catch {
        fallbackCopy(mensal.pixKey);
      }
    } else {
      fallbackCopy(mensal.pixKey);
    }

    setCopied(true);

    if (copyTimer.current) {
      clearTimeout(copyTimer.current);
    }

    copyTimer.current = setTimeout(() => setCopied(false), 2000);
  }, [mensal.pixKey]);

  return (
    <ModalBackdrop
      open={open}
      ref={backdropRef}
      tabIndex={-1}
      className="overflow-y-auto outline-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          onClose();
        }
      }}
    >
      <ModalPanel className="my-auto">
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="text-lg font-semibold">
            Mensal · {mensal.periodLabel}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className={`${iconButtonClass} shrink-0 rounded-lg p-1.5 text-base leading-none text-zinc-500 dark:text-zinc-400`}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        <div className="mt-5 flex flex-col items-center gap-1">
          <p className="text-4xl font-semibold tracking-tight text-emerald-400">
            {mensal.amountLabel}
          </p>
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {mensal.receiver}
          </p>
        </div>

        <div className="mt-5 rounded-xl border border-zinc-200 p-3 text-center dark:border-zinc-800">
          <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Chave PIX
          </p>
          <p className="mt-1 break-all font-mono text-sm text-zinc-900 dark:text-zinc-100">
            {mensal.pixKey}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={copyKey}
            className={`${buttonClass} w-full px-3 text-center`}
          >
            <span aria-live="polite">
              {copied ? "Chave copiada!" : "Copiar chave PIX"}
            </span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className={`${secondaryButtonClass} w-full px-3 text-center`}
          >
            Fechar
          </button>
        </div>

        <p className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-800 dark:text-amber-200">
          Pague o valor de {mensal.periodLabel} pela chave acima. O admin
          confere o extrato e marca seu pagamento na aba Mensal.
        </p>
      </ModalPanel>
    </ModalBackdrop>
  );
}
