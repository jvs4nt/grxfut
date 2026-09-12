"use client";

import { useCallback, useId, useState } from "react";
import { deleteMemberAction } from "@/app/(app)/membros/actions";
import { TrashIcon } from "@/components/icons";
import {
  dangerButtonClass,
  iconDangerButtonClass,
  secondaryButtonClass,
} from "@/lib/ui";

export function DeleteMemberButton({
  userId,
  name,
}: {
  userId: string;
  name: string;
}) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={iconDangerButtonClass}
        aria-label={`Excluir ${name}`}
        title="Excluir"
      >
        <TrashIcon />
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
          <div className="flex w-full max-w-md flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <div>
              <h2 id={titleId} className="text-lg font-semibold">
                Excluir {name}?
              </h2>
              <p className="mt-1 text-sm text-zinc-400">
                Isso remove a conta e presença, pagamento e sorteio ligados.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <form action={deleteMemberAction}>
                <input type="hidden" name="userId" value={userId} />
                <button type="submit" className={dangerButtonClass}>
                  Excluir
                </button>
              </form>
              <button
                type="button"
                onClick={close}
                className={secondaryButtonClass}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
