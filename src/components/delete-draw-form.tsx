"use client";

import { useEffect } from "react";
import {
  deleteDrawAction,
  type FormState,
} from "@/app/(app)/sorteio/actions";
import { ActionForm, useBusyAction } from "@/components/busy-overlay";
import { dangerButtonClass } from "@/lib/ui";

const initial: FormState = { error: null };

export function DeleteDrawForm({ onSuccess }: { onSuccess?: () => void }) {
  const [state, action, pending] = useBusyAction(deleteDrawAction, initial);

  useEffect(() => {
    if (state.ok) {
      onSuccess?.();
    }
  }, [state.ok, onSuccess]);

  return (
    <ActionForm action={action} className="flex flex-col items-start">
      <button type="submit" disabled={pending} className={dangerButtonClass}>
        {pending ? "Excluindo…" : "Excluir sorteio"}
      </button>
      {state.error ? (
        <p className="mt-2 text-sm text-red-600 dark:text-red-300" role="alert">
          {state.error}
        </p>
      ) : null}
    </ActionForm>
  );
}
