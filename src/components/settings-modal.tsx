"use client";

import { useCallback, useEffect, useId, useState } from "react";
import {
  updateOwnAccountAction,
  type FormState,
} from "@/app/(app)/account/actions";
import { ActionForm, useBusyAction } from "@/components/busy-overlay";
import { GearIcon } from "@/components/icons";
import { PasswordInput } from "@/components/password-input";
import {
  buttonClass,
  iconButtonClass,
  inputClass,
  labelClass,
  secondaryButtonClass,
} from "@/lib/ui";

const initial: FormState = { error: null };

export function SettingsModal({
  username,
  name,
}: {
  username: string;
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
        className={iconButtonClass}
        aria-label="Configurações"
        title="Configurações"
      >
        <GearIcon />
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
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-start justify-between gap-4">
              <h2 id={titleId} className="text-lg font-semibold">
                Configurações
              </h2>
              <button
                type="button"
                onClick={close}
                className={secondaryButtonClass}
              >
                Fechar
              </button>
            </div>
            <div className="mt-5">
              <SettingsForm
                key={`${username}-${name}`}
                username={username}
                name={name}
                onSuccess={close}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function SettingsForm({
  username,
  name,
  onSuccess,
}: {
  username: string;
  name: string;
  onSuccess: () => void;
}) {
  const [state, action, pending] = useBusyAction(updateOwnAccountAction, initial);

  useEffect(() => {
    if (state.ok) {
      onSuccess();
    }
  }, [state.ok, onSuccess]);

  return (
    <ActionForm action={action} className="flex flex-col gap-4">
      <label className={labelClass}>
        Nome
        <input
          name="name"
          type="text"
          autoComplete="name"
          required
          defaultValue={name}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Usuário
        <input
          name="username"
          type="text"
          autoComplete="username"
          required
          defaultValue={username}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Nova senha
        <PasswordInput
          name="password"
          autoComplete="new-password"
          minLength={4}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Confirmar senha
        <PasswordInput
          name="confirmPassword"
          autoComplete="new-password"
          minLength={4}
          className={inputClass}
        />
      </label>
      {state.error ? (
        <p className="text-sm text-red-300" role="alert">
          {state.error}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "Salvando…" : "Salvar"}
      </button>
    </ActionForm>
  );
}
