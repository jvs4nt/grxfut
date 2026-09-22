"use client";

import { useEffect } from "react";
import {
  createUserAction,
  type FormState,
} from "@/app/(app)/membros/actions";
import { ActionForm, useBusyAction } from "@/components/busy-overlay";
import { PasswordInput } from "@/components/password-input";
import { buttonClass, inputClass, labelClass } from "@/lib/ui";

const initial: FormState = { error: null };

export function CreateUserForm({ onSuccess }: { onSuccess?: () => void }) {
  const [state, action, pending] = useBusyAction(createUserAction, initial);

  useEffect(() => {
    if (state.ok) {
      onSuccess?.();
    }
  }, [state.ok, onSuccess]);

  return (
    <ActionForm action={action} className="grid gap-4 sm:grid-cols-2">
      <label className={labelClass}>
        Nome
        <input
          name="name"
          type="text"
          autoComplete="name"
          required
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
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Senha
        <PasswordInput
          name="password"
          autoComplete="new-password"
          required
          minLength={4}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Papel
        <select name="role" defaultValue="member" className={inputClass}>
          <option value="member">Membro</option>
          <option value="admin">Admin</option>
        </select>
      </label>
      <label className={labelClass}>
        Tier
        <select name="tier" defaultValue="soldado" className={inputClass}>
          <option value="capitao">Capitão</option>
          <option value="tenente">Tenente</option>
          <option value="soldado">Soldado</option>
        </select>
      </label>
      {state.error ? (
        <p className="sm:col-span-2 text-sm text-red-300" role="alert">
          {state.error}
        </p>
      ) : null}
      <div className="sm:col-span-2">
        <button type="submit" disabled={pending} className={buttonClass}>
          {pending ? "Criando…" : "Criar usuário"}
        </button>
      </div>
    </ActionForm>
  );
}
