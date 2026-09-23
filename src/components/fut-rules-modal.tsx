"use client";

import { useCallback, useId, useState } from "react";
import { RulesSheetIcon } from "@/components/icons";
import { ModalBackdrop, ModalPanel } from "@/components/modal-backdrop";
import { iconButtonClass, secondaryButtonClass } from "@/lib/ui";

const RULES = [
  "TODAS AS PARTIDAS TÊM DURAÇÃO DE 8 MINUTOS",
  "PRIMEIRA PARTIDA ACABA EM 3 GOLS E O RESTANTE EM 2 GOLS",
  "TODA FALTA É LATERAL",
  "LATERAL DEVE SER COBRADO COM AS MÃOS E JOGAR A BOLA ACIMA DA CABEÇA",
  "EM CASO DE EMPATE O TIME QUE GANHOU A PARTIDA ANTERIOR CONTINUA",
] as const;

export function FutRulesModal() {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`${iconButtonClass} mb-2 text-emerald-600 dark:text-emerald-300`}
        aria-label="REGRAS"
        title="REGRAS"
      >
        <RulesSheetIcon className="h-5 w-5" />
      </button>
      <ModalBackdrop
        open={open}
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
        <ModalPanel>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <RulesSheetIcon className="mt-0.5 h-6 w-6 shrink-0 text-emerald-500 dark:text-emerald-400" />
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
        </ModalPanel>
      </ModalBackdrop>
    </>
  );
}
