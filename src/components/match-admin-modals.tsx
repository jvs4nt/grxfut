"use client";

import { useCallback, useId, useState, type ReactNode } from "react";
import {
  CancelWeekForm,
  CreateMatchForm,
  EditMatchForm,
} from "@/components/match-forms";
import { buttonClass, secondaryButtonClass } from "@/lib/ui";

type ScheduledMatch = {
  id: string;
  date: string;
  time: string | null;
  location: string | null;
};

export function MatchAdminModals({
  scheduled,
}: {
  scheduled: ScheduledMatch | null;
}) {
  const [open, setOpen] = useState<"edit" | "create" | null>(null);
  const close = useCallback(() => setOpen(null), []);

  return (
    <section
      className={
        scheduled ? "grid gap-3 sm:grid-cols-2" : "flex"
      }
    >
      {scheduled ? (
        <button
          type="button"
          onClick={() => setOpen("edit")}
          className={`${secondaryButtonClass} w-full`}
        >
          PERSONALIZAR
        </button>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen("create")}
        className={`${buttonClass} w-full`}
      >
        AGENDAR PRÓXIMO JOGO
      </button>

      {open === "edit" && scheduled ? (
        <MatchDialog
          title="Personalizar o próximo jogo"
          description="Data, horário e local. Cancelar marca a semana como descanso."
          onClose={close}
        >
          <EditMatchForm
            matchId={scheduled.id}
            date={scheduled.date}
            time={scheduled.time}
            location={scheduled.location}
            onSuccess={close}
          />
          <div className="mt-4">
            <CancelWeekForm matchId={scheduled.id} onSuccess={close} />
          </div>
        </MatchDialog>
      ) : null}

      {open === "create" ? (
        <MatchDialog
          title="Agendar próximo jogo"
          description="Marca uma data futura. Depois de um descanso, crie o próximo scheduled aqui."
          onClose={close}
        >
          <CreateMatchForm onSuccess={close} />
        </MatchDialog>
      ) : null}
    </section>
  );
}

function MatchDialog({
  title,
  description,
  onClose,
  children,
}: {
  title: string;
  description: string;
  onClose: () => void;
  children: ReactNode;
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
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-lg font-semibold">
              {title}
            </h2>
            <p className="mt-1 text-sm text-zinc-400">{description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={secondaryButtonClass}
          >
            Fechar
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}
