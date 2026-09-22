"use client";

import { ActionForm, useBusyAction } from "@/components/busy-overlay";
import { PasswordInput } from "@/components/password-input";
import { buttonClass, inputClass, labelClass } from "@/lib/ui";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = { error: null };

export function LoginForm() {
  const [state, action, pending] = useBusyAction(loginAction, initialState);

  return (
    <ActionForm action={action} className="flex flex-col gap-4">
      <label className={labelClass}>
        Usuário
        <input
          name="username"
          type="text"
          autoComplete="username"
          required
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Senha
        <PasswordInput
          name="password"
          autoComplete="current-password"
          required
          className={`w-full ${inputClass}`}
        />
      </label>
      {state.error ? (
        <p className="text-sm text-red-600 dark:text-red-300" role="alert">
          {state.error}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className={`mt-2 ${buttonClass}`}>
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </ActionForm>
  );
}
