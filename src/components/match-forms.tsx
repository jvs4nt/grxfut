"use client";

import { useEffect } from "react";
import {
  cancelWeekAction,
  createMatchAction,
  updateMatchAction,
  type FormState,
} from "@/app/(app)/actions";
import { ActionForm, useBusyAction } from "@/components/busy-overlay";
import {
  buttonClass,
  dangerButtonClass,
  inputClass,
  labelClass,
} from "@/lib/ui";

const initial: FormState = { error: null };

function useCloseOnSuccess(ok: boolean | undefined, onSuccess?: () => void) {
  useEffect(() => {
    if (ok) {
      onSuccess?.();
    }
  }, [ok, onSuccess]);
}

function MatchFields({
  date,
  time,
  location,
}: {
  date?: string;
  time?: string | null;
  location?: string | null;
}) {
  return (
    <>
      <label className={labelClass}>
        Data
        <input
          name="date"
          type="date"
          required
          defaultValue={date}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Horário
        <input
          name="time"
          type="time"
          defaultValue={time?.slice(0, 5) ?? ""}
          className={inputClass}
        />
      </label>
      <label className={`${labelClass} sm:col-span-2`}>
        Local
        <input
          name="location"
          type="text"
          defaultValue={location ?? ""}
          className={inputClass}
        />
      </label>
    </>
  );
}

export function CreateMatchForm({ onSuccess }: { onSuccess?: () => void }) {
  const [state, action, pending] = useBusyAction(createMatchAction, initial);
  useCloseOnSuccess(state.ok, onSuccess);

  return (
    <ActionForm action={action} className="grid gap-4 sm:grid-cols-2">
      <MatchFields />
      {state.error ? (
        <p className="sm:col-span-2 text-sm text-red-300" role="alert">
          {state.error}
        </p>
      ) : null}
      <div className="sm:col-span-2">
        <button type="submit" disabled={pending} className={buttonClass}>
          {pending ? "Salvando…" : "Criar jogo"}
        </button>
      </div>
    </ActionForm>
  );
}

export function EditMatchForm({
  matchId,
  date,
  time,
  location,
  onSuccess,
}: {
  matchId: string;
  date: string;
  time: string | null;
  location: string | null;
  onSuccess?: () => void;
}) {
  const [state, action, pending] = useBusyAction(updateMatchAction, initial);
  useCloseOnSuccess(state.ok, onSuccess);

  return (
    <ActionForm action={action} className="grid gap-4 sm:grid-cols-2">
      <input type="hidden" name="matchId" value={matchId} />
      <MatchFields date={date} time={time} location={location} />
      {state.error ? (
        <p className="sm:col-span-2 text-sm text-red-300" role="alert">
          {state.error}
        </p>
      ) : null}
      <div className="sm:col-span-2">
        <button type="submit" disabled={pending} className={buttonClass}>
          {pending ? "Salvando…" : "Salvar horário e local"}
        </button>
      </div>
    </ActionForm>
  );
}

export function CancelWeekForm({
  matchId,
  onSuccess,
}: {
  matchId: string;
  onSuccess?: () => void;
}) {
  const [state, action, pending] = useBusyAction(cancelWeekAction, initial);
  useCloseOnSuccess(state.ok, onSuccess);

  return (
    <ActionForm action={action} className="flex flex-col gap-3">
      <input type="hidden" name="matchId" value={matchId} />
      {state.error ? (
        <p className="text-sm text-red-300" role="alert">
          {state.error}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className={dangerButtonClass}>
        {pending ? "Cancelando…" : "Cancelar a semana"}
      </button>
    </ActionForm>
  );
}
