"use client";

import { useCallback, useId, useState } from "react";
import { runDrawAction } from "@/app/(app)/sorteio/actions";
import { PendingForm } from "@/components/busy-overlay";
import { ModalBackdrop, ModalPanel } from "@/components/modal-backdrop";
import type { DrawTeamSize } from "@/lib/draw";
import {
  buttonClass,
  secondaryButtonClass,
} from "@/lib/ui";

type RunDrawTriggerProps = {
  label: string;
  className?: string;
  disabled?: boolean;
  variant?: "primary" | "secondary";
};

export function RunDrawTrigger({
  label,
  className = "",
  disabled = false,
  variant = "primary",
}: RunDrawTriggerProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<DrawTeamSize>(6);
  const titleId = useId();
  const close = useCallback(() => setOpen(false), []);

  const triggerClass =
    variant === "secondary" ? secondaryButtonClass : buttonClass;

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        className={`${triggerClass} ${className}`.trim()}
        onClick={() => {
          setSelected(6);
          setOpen(true);
        }}
      >
        {label}
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
          <h2 id={titleId} className="text-lg font-semibold">
            Quantos jogadores por time?
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            O balanceamento por nível e as regras de capitão continuam iguais.
          </p>

          <div className="mt-5 flex gap-3">
            {([5, 6] as const).map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelected(size)}
                className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                  selected === size
                    ? "border-emerald-500/60 bg-emerald-500/15 text-emerald-200"
                    : "border-zinc-300 bg-zinc-50 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-300"
                }`}
                aria-pressed={selected === size}
              >
                {size} jogadores
              </button>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button type="button" onClick={close} className={secondaryButtonClass}>
              Cancelar
            </button>
            <PendingForm
              action={async (formData) => {
                await runDrawAction(formData);
                close();
              }}
            >
              <input type="hidden" name="teamSize" value={selected} />
              <button type="submit" className={buttonClass}>
                Sortear
              </button>
            </PendingForm>
          </div>
        </ModalPanel>
      </ModalBackdrop>
    </>
  );
}
