"use client";

import { useCallback, useId, useState } from "react";
import { iconButtonClass, secondaryButtonClass } from "@/lib/ui";

const RULES = [
  "TODAS AS PARTIDAS TÊM DURAÇÃO DE 8 MINUTOS",
  "PRIMEIRA PARTIDA ACABA EM 3 GOLS E O RESTANTE EM 2 GOLS",
  "TODA FALTA É LATERAL",
  "LATERAL DEVE SER COBRADO COM AS MÃOS E JOGAR A BOLA ACIMA DA CABEÇA",
  "EM CASO DE EMPATE O TIME QUE GANHOU A PARTIDA ANTERIOR CONTINUA",
] as const;

function WhistleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M8 10a4 4 0 0 1 8 0v2.5c0 .8.3 1.6.8 2.2L18 17H6l1.2-2.3c.5-.6.8-1.4.8-2.2V10z" />
      <path d="M10 17v2.5c0 .8.7 1.5 1.5 1.5h1c.8 0 1.5-.7 1.5-1.5V17" />
      <circle cx="16" cy="8" r="1.25" fill="currentColor" stroke="none" />
      <path d="M16 6.5V4.5M18.5 8h2M13.5 8h-2" />
    </svg>
  );
}

export function FutRulesModal() {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`${iconButtonClass} mb-2 text-emerald-300`}
        aria-label="Ver regras do fut"
      >
        <WhistleIcon className="h-5 w-5" />
      </button>
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              close();
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              close();
            }
          }}
        >
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <WhistleIcon className="mt-0.5 h-6 w-6 shrink-0 text-emerald-400" />
                <h2 id={titleId} className="text-lg font-semibold tracking-wide">
                  REGRAS FUT GARUX
                </h2>
              </div>
              <button
                type="button"
                onClick={close}
                className={secondaryButtonClass}
              >
                Fechar
              </button>
            </div>
            <ul className="mt-5 flex flex-col gap-3 text-xs font-semibold uppercase leading-5 tracking-wide text-zinc-700 dark:text-zinc-300">
              {RULES.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  );
}
