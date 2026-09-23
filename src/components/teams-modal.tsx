"use client";

import { useCallback, useId, useState } from "react";
import {
  runDrawAction,
} from "@/app/(app)/sorteio/actions";
import { PendingForm } from "@/components/busy-overlay";
import { DeleteDrawForm } from "@/components/delete-draw-form";
import { PitchBoard, type PitchPlayer } from "@/components/pitch-board";
import { ModalBackdrop, ModalPanel } from "@/components/modal-backdrop";
import {
  buttonClass,
  secondaryButtonClass,
} from "@/lib/ui";

export type TeamPlayer = PitchPlayer;

export type HomeDraw = {
  id: string;
  teamA: TeamPlayer[];
  teamB: TeamPlayer[];
  reserve: TeamPlayer[];
};

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
      <TeamsDialog open={open} admin={admin} draw={draw} onClose={close} />
    </>
  );
}

function TeamsDialog({
  open,
  admin,
  draw,
  onClose,
}: {
  open: boolean;
  admin: boolean;
  draw: HomeDraw;
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
      <ModalPanel className="max-h-[90vh] max-w-5xl overflow-y-auto">
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
      </ModalPanel>
    </ModalBackdrop>
  );
}
