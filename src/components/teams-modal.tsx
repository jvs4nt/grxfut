"use client";

import { useCallback, useEffect, useId, useState } from "react";
import {
  deleteDrawAction,
  runDrawAction,
  type FormState,
} from "@/app/(app)/sorteio/actions";
import { ActionForm, PendingForm, useBusyAction } from "@/components/busy-overlay";
import { PitchBoard, type PitchPlayer } from "@/components/pitch-board";
import {
  buttonClass,
  dangerButtonClass,
  secondaryButtonClass,
} from "@/lib/ui";

export type TeamPlayer = PitchPlayer;

export type HomeDraw = {
  id: string;
  teamA: TeamPlayer[];
  teamB: TeamPlayer[];
  reserve: TeamPlayer[];
};

const initial: FormState = { error: null };

export function HomeTeamsControls({
  admin,
  canDraw,
  draw,
}: {
  admin: boolean;
  canDraw: boolean;
  draw: HomeDraw | null;
}) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  if (!draw) {
    if (admin) {
      return (
        <PendingForm action={runDrawAction}>
          <button
            type="submit"
            disabled={!canDraw}
            className={`${buttonClass} w-full`}
          >
            SORTEAR TIMES
          </button>
        </PendingForm>
      );
    }

    return (
      <button type="button" disabled className={`${secondaryButtonClass} w-full`}>
        TIMES NÃO SORTEADOS
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`${secondaryButtonClass} w-full`}
      >
        TIMES
      </button>
      {open ? (
        <TeamsDialog admin={admin} draw={draw} onClose={close} />
      ) : null}
    </>
  );
}

function TeamsDialog({
  admin,
  draw,
  onClose,
}: {
  admin: boolean;
  draw: HomeDraw;
  onClose: () => void;
}) {
  const titleId = useId();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
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
      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="text-lg font-semibold">
            Times
          </h2>
          <button type="button" onClick={onClose} className={secondaryButtonClass}>
            Fechar
          </button>
        </div>

        {admin ? (
          <div className="mt-5 flex flex-wrap gap-3">
            <PendingForm action={runDrawAction}>
              <button type="submit" className={buttonClass}>
                Sortear de novo
              </button>
            </PendingForm>
            <DeleteDrawForm onSuccess={onClose} />
          </div>
        ) : null}

        <div className="mt-5">
          <PitchBoard
            teamA={draw.teamA}
            teamB={draw.teamB}
            reserve={draw.reserve}
            drawId={draw.id}
            canSwap={admin}
          />
        </div>
      </div>
    </div>
  );
}

function DeleteDrawForm({ onSuccess }: { onSuccess: () => void }) {
  const [state, action, pending] = useBusyAction(deleteDrawAction, initial);

  useEffect(() => {
    if (state.ok) {
      onSuccess();
    }
  }, [state.ok, onSuccess]);

  return (
    <ActionForm action={action}>
      <button type="submit" disabled={pending} className={dangerButtonClass}>
        {pending ? "Excluindo…" : "Excluir sorteio"}
      </button>
      {state.error ? (
        <p className="mt-2 text-sm text-red-300" role="alert">
          {state.error}
        </p>
      ) : null}
    </ActionForm>
  );
}
