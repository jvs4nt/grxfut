"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { confirmPixPaymentAction } from "@/app/(app)/membros/actions";
import { useBusy } from "@/components/busy-overlay";
import { ModalBackdrop, ModalPanel } from "@/components/modal-backdrop";
import type { PixInfo } from "@/lib/pix";
import { buttonClass, secondaryButtonClass } from "@/lib/ui";

export function PixModal({
  matchId,
  pix,
  open,
  onClose,
}: {
  matchId: string;
  pix: PixInfo;
  open: boolean;
  onClose: () => void;
}) {
  const titleId = useId();
  const backdropRef = useRef<HTMLDivElement>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { busy, run } = useBusy();

  // Os diálogos do app prendem o Escape num div que nunca recebe foco; focar o
  // backdrop na montagem faz a tecla funcionar de verdade.
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

  const copyPayload = useCallback(async () => {
    // `navigator.clipboard` é undefined em http:// de origem não-local, que é
    // exatamente como se testa do celular na rede local.
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(pix.payload);
      } catch {
        fallbackCopy(pix.payload);
      }
    } else {
      fallbackCopy(pix.payload);
    }

    setCopied(true);

    if (copyTimer.current) {
      clearTimeout(copyTimer.current);
    }

    copyTimer.current = setTimeout(() => setCopied(false), 2000);
  }, [pix.payload]);

  async function confirm() {
    setError(null);
    const result = await run(() => confirmPixPaymentAction(matchId));

    if (result.ok) {
      onClose();
      return;
    }

    setError(result.error);
  }

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
          <div>
            <h2 id={titleId} className="text-lg font-semibold">
              Pague pra confirmar
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Pague o PIX e confirme aqui embaixo pra entrar na lista.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={secondaryButtonClass}
          >
            Fechar
          </button>
        </div>

        <div className="mt-5 flex flex-col items-center gap-1">
          <p className="text-4xl font-semibold tracking-tight text-emerald-400">
            {pix.amountLabel}
          </p>
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{pix.receiver}</p>
          <p className="text-xs text-zinc-600 dark:text-zinc-500">{pix.pixKey}</p>
        </div>

        <div className="mt-5 flex justify-center">
          <div
            className="rounded-xl bg-white p-3"
            aria-label="QR Code do PIX"
            role="img"
            dangerouslySetInnerHTML={{ __html: pix.qrSvg }}
          />
        </div>

        <details className="mt-4">
          <summary className="cursor-pointer text-xs text-zinc-600 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
            Ver o código PIX
          </summary>
          <code className="mt-2 block break-all rounded-lg bg-zinc-100 p-3 font-mono text-[10px] leading-relaxed text-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
            {pix.payload}
          </code>
        </details>

        <button
          type="button"
          onClick={copyPayload}
          className={`${secondaryButtonClass} mt-3 w-full`}
        >
          <span aria-live="polite">
            {copied ? "Código copiado!" : "Copiar código PIX"}
          </span>
        </button>

        <p className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-200">
          Só confirme depois de pagar de verdade. O administrador confere o
          extrato.
        </p>

        {error ? (
          <p role="alert" className="mt-3 text-sm text-red-300">
            {error}
          </p>
        ) : null}

        <button
          type="button"
          onClick={confirm}
          disabled={busy}
          className={`${buttonClass} mt-4 w-full`}
        >
          Confirmar pagamento
        </button>
      </ModalPanel>
    </ModalBackdrop>
  );
}

function fallbackCopy(text: string) {
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();

  try {
    document.execCommand("copy");
  } catch {
    // Sem clipboard: o usuário ainda consegue selecionar o código na tela.
  }

  document.body.removeChild(area);
}
