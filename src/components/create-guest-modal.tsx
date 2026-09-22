"use client";

import { useCallback, useId, useState } from "react";
import { createGuestAction } from "@/app/(app)/membros/actions";
import { buttonClass, secondaryButtonClass } from "@/lib/ui";
import { USER_TIERS, TIER_LABELS } from "@/lib/labels";

export function CreateGuestModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<{ username: string; password: string } | null>(null);
  const titleId = useId();

  const close = useCallback(() => {
    setOpen(false);
    setCredentials(null);
    setError(null);
  }, []);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await createGuestAction(formData);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else if (result.credentials) {
      setCredentials(result.credentials);
    }
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={secondaryButtonClass}>
        Criar convidado
      </button>
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onClick={(event) => {
            if (event.target === event.currentTarget && !credentials) {
              close();
            }
          }}
        >
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id={titleId} className="text-lg font-semibold">
                  Criar Convidado
                </h2>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  Acesso limitado. Expira na 2ª feira.
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
            
            {credentials ? (
              <div className="mt-6 flex flex-col gap-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
                <p className="text-sm font-medium text-emerald-400">Convidado criado com sucesso!</p>
                <div className="flex flex-col gap-2 rounded-lg bg-zinc-100 p-3 text-left dark:bg-zinc-900">
                  <p className="text-sm">
                    <span className="text-zinc-600 dark:text-zinc-500">Usuário:</span>{" "}
                    <span className="font-mono text-zinc-900 dark:text-zinc-200">{credentials.username}</span>
                  </p>
                  <p className="text-sm">
                    <span className="text-zinc-600 dark:text-zinc-500">Senha:</span>{" "}
                    <span className="font-mono text-zinc-900 dark:text-zinc-200">{credentials.password}</span>
                  </p>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">Copie as credenciais. A senha não poderá ser vista novamente.</p>
              </div>
            ) : (
              <form action={handleSubmit} className="mt-5 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="name" className="text-sm font-medium">Nome</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="rounded-lg border border-zinc-300 bg-white dark:border-zinc-800 dark:bg-zinc-900 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="tier" className="text-sm font-medium">
                    Nível
                  </label>
                  <select
                    id="tier"
                    name="tier"
                    required
                    className="rounded-lg border border-zinc-300 bg-white dark:border-zinc-800 dark:bg-zinc-900 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
                  >
                    <option value="">Selecione...</option>
                    {USER_TIERS.map((tier) => (
                      <option key={tier} value={tier}>
                        {TIER_LABELS[tier]}
                      </option>
                    ))}
                  </select>
                </div>
                
                {error && <p className="text-sm text-red-400">{error}</p>}
                
                <button
                  type="submit"
                  disabled={loading}
                  className={buttonClass + " mt-2"}
                >
                  {loading ? "Criando..." : "Criar Convidado"}
                </button>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
