"use client";

import { useCallback, useId, useState } from "react";
import { CreateUserForm } from "@/components/create-user-form";
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
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id={titleId} className="text-lg font-semibold">
                  Criar usuário
                </h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Só o Admin cria contas. A senha é hasheada no servidor.
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
          </div>
        </div>
      ) : null}
    </>
  );
}
