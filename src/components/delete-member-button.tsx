"use client";

import { useCallback, useId, useState } from "react";
import { deleteMemberAction } from "@/app/(app)/membros/actions";
import { PendingForm } from "@/components/busy-overlay";
import { TrashIcon } from "@/components/icons";
import { ModalBackdrop, ModalPanel } from "@/components/modal-backdrop";
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
        <ModalPanel className="flex flex-col gap-4">
          <div>
            <h2 id={titleId} className="text-lg font-semibold">
              Excluir {name}?
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Isso remove a conta e presença, pagamento e sorteio ligados.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <PendingForm action={deleteMemberAction}>
              <input type="hidden" name="userId" value={userId} />
              <button type="submit" className={dangerButtonClass}>
                Excluir
              </button>
            </PendingForm>
            <button
              type="button"
              onClick={close}
              className={secondaryButtonClass}
            >
              Cancelar
            </button>
          </div>
        </ModalPanel>
      </ModalBackdrop>
    </>
  );
}
