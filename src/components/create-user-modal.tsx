"use client";

import { useCallback, useId, useState } from "react";
import { CreateUserForm } from "@/components/create-user-form";
import { ModalBackdrop, ModalPanel } from "@/components/modal-backdrop";
import { buttonClass, secondaryButtonClass } from "@/lib/ui";

export function CreateUserModal() {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={buttonClass}>
        Criar usuário
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
            <div>
              <h2 id={titleId} className="text-lg font-semibold">
                Criar usuário
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Só administradores criam contas. A senha é guardada com
                segurança no servidor.
              </p>
            </div>
            <button
              type="button"
              onClick={close}
              className={secondaryButtonClass}
            >
              Fechar
            </button>
          </div>
          <div className="mt-5">
            <CreateUserForm onSuccess={close} />
          </div>
        </ModalPanel>
      </ModalBackdrop>
    </>
  );
}
