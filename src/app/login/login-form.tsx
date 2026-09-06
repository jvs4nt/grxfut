"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = { error: null };

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initialState);

  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-zinc-300">Usuário</span>
        <input
          name="username"
          type="text"
          autoComplete="username"
          required
          className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-zinc-100 outline-none ring-emerald-400/40 focus:ring-2"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-zinc-300">Senha</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-zinc-100 outline-none ring-emerald-400/40 focus:ring-2"
        />
      </label>
      {state.error ? (
        <p className="text-sm text-red-300" role="alert">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-full bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300 disabled:opacity-60"
      >
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
