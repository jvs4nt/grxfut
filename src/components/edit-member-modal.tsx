"use client";

import { useCallback, useEffect, useId, useState } from "react";
import {
  updateMemberAction,
  type FormState,
} from "@/app/(app)/membros/actions";
import { ActionForm, useBusyAction } from "@/components/busy-overlay";
import { PencilIcon } from "@/components/icons";
import { ModalBackdrop, ModalPanel } from "@/components/modal-backdrop";
import { PasswordInput } from "@/components/password-input";
import {
  buttonClass,
  iconButtonClass,
  inputClass,
  labelClass,
  secondaryButtonClass,
} from "@/lib/ui";

const initial: FormState = { error: null };

export function EditMemberModal({
  userId,
  username,
  name,
}: {
  userId: string;
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
        aria-label={`Editar ${name}`}
        title="Editar"
      >
        <PencilIcon />
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
            <h2 id={titleId} className="text-lg font-semibold">
              Editar usuário
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
            <EditMemberForm
              key={`${username}-${name}`}
              userId={userId}
              username={username}
              name={name}
              onSuccess={close}
            />
          </div>
        </ModalPanel>
      </ModalBackdrop>
    </>
  );
}

function EditMemberForm({
  userId,
  username,
  name,
  onSuccess,
}: {
  userId: string;
  username: string;
  name: string;
  onSuccess: () => void;
}) {
  const [state, action, pending] = useBusyAction(updateMemberAction, initial);

  useEffect(() => {
    if (state.ok) {
      onSuccess();
    }
  }, [state.ok, onSuccess]);

  return (
    <ActionForm action={action} className="flex flex-col gap-4">
      <input type="hidden" name="userId" value={userId} />
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
          autoComplete="off"
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
