"use client";

import { useEffect, useId } from "react";
import {
  updateOwnAccountAction,
  type FormState,
} from "@/app/(app)/account/actions";
import { ActionForm, useBusyAction } from "@/components/busy-overlay";
import { ModalBackdrop, ModalPanel } from "@/components/modal-backdrop";
import { PasswordInput } from "@/components/password-input";
import {
  buttonClass,
  inputClass,
  labelClass,
  secondaryButtonClass,
} from "@/lib/ui";

const initial: FormState = { error: null };

export function SettingsModal({
  username,
  name,
  open,
  onClose,
}: {
  username: string;
  name: string;
  open: boolean;
  onClose: () => void;
}) {
  const titleId = useId();

  return (
    <ModalBackdrop
      open={open}
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
      <ModalPanel>
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="text-lg font-semibold">
            Configurações
          </h2>
          <button type="button" onClick={onClose} className={secondaryButtonClass}>
            Fechar
          </button>
        </div>
        <div className="mt-5">
          <SettingsForm
            key={`${username}-${name}`}
            username={username}
            name={name}
            onSuccess={onClose}
          />
        </div>
      </ModalPanel>
    </ModalBackdrop>
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
