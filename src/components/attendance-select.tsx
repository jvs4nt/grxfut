"use client";

import { useState } from "react";
import { adminSetAttendanceAction } from "@/app/(app)/membros/actions";
import { PendingForm, useBusy } from "@/components/busy-overlay";
import type { AttendanceStatus } from "@/lib/attendance";
import { buttonClass, inputClass, secondaryButtonClass } from "@/lib/ui";

type Value = AttendanceStatus | "out";

export function AttendanceSelect({
  userId,
  name,
  status,
}: {
  userId: string;
  name: string;
  status: AttendanceStatus | null;
}) {
  const current: Value = status ?? "out";
  const { busy, run } = useBusy();

  return (
    <select
      aria-label={`Presença de ${name}`}
      value={current}
      disabled={busy}
      onChange={(event) => {
        const next = event.target.value as Value;
        if (next === current) {
          return;
        }

        void run(() => submitAttendance(userId, next));
      }}
      className={`${inputClass} min-w-36 py-1.5 text-sm`}
    >
      <option value="out">Fora</option>
      <option value="confirmed">Confirmados</option>
      <option value="reserve">Reservas</option>
    </select>
  );
}

export function AttendanceRemoveButton({
  userId,
  name,
}: {
  userId: string;
  name: string;
}) {
  return (
    <PendingForm action={adminSetAttendanceAction}>
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="status" value="out" />
      <button
        type="submit"
        className="rounded-full border border-zinc-700 px-2 py-0.5 text-sm font-semibold text-zinc-400 transition hover:border-red-500/50 hover:text-red-200"
        aria-label={`Tirar ${name} da lista`}
      >
        ×
      </button>
    </PendingForm>
  );
}

export function AttendanceMoveButton({
  userId,
  name,
}: {
  userId: string;
  name: string;
}) {
  const [open, setOpen] = useState(false);
  const { run } = useBusy();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`${secondaryButtonClass} px-3 py-1 text-xs`}
      >
        Mover
      </button>
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`move-${userId}`}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setOpen(false);
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setOpen(false);
            }
          }}
        >
          <div className="flex w-full max-w-md flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <div>
              <h2 id={`move-${userId}`} className="text-lg font-semibold">
                Mover {name}
              </h2>
              <p className="mt-1 text-sm text-zinc-400">
                Escolha Confirmados, Reservas ou tire da lista.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={buttonClass}
                onClick={() => {
                  setOpen(false);
                  void run(() => submitAttendance(userId, "confirmed"));
                }}
              >
                Confirmados
              </button>
              <button
                type="button"
                className={secondaryButtonClass}
                onClick={() => {
                  setOpen(false);
                  void run(() => submitAttendance(userId, "reserve"));
                }}
              >
                Reservas
              </button>
              <button
                type="button"
                className={secondaryButtonClass}
                onClick={() => {
                  setOpen(false);
                  void run(() => submitAttendance(userId, "out"));
                }}
              >
                Tirar
              </button>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="self-start text-sm text-zinc-500 hover:text-zinc-300"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

async function submitAttendance(userId: string, status: Value) {
  const data = new FormData();
  data.set("userId", userId);
  data.set("status", status);
  await adminSetAttendanceAction(data);
}
