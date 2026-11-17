"use client";

import { useOptimistic, useState, useTransition } from "react";
import { PencilIcon } from "@/components/icons";
import { ModalBackdrop, ModalPanel } from "@/components/modal-backdrop";
import { MonthPicker } from "@/components/month-picker";
import { Reveal } from "@/components/reveal";
import { formatCents, formatPeriod } from "@/lib/dates";
import type {
  MensalCandidate,
  MensalistaRow,
  MensalSettings,
} from "@/lib/mensal";
import { revealDelay } from "@/lib/reveal";
import {
  buttonClass,
  cardClass,
  iconButtonClass,
  inputClass,
  listRowClass,
  secondaryButtonClass,
} from "@/lib/ui";
import {
  toggleMensalPaidAction,
  updateMensalConfigAction,
  updateMensalistasAction,
} from "./actions";

const PAID_BADGE =
  "inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-800 dark:text-emerald-200";
const PENDING_BADGE =
  "inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-200";

export function MensalClient({
  settings,
  mensalistas,
  candidates,
  isAdmin,
}: {
  settings: MensalSettings;
  mensalistas: MensalistaRow[];
  candidates: MensalCandidate[];
  isAdmin: boolean;
}) {
  const [modal, setModal] = useState<"config" | "members" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toggleError, setToggleError] = useState<string | null>(null);
  const [isSaving, startSaving] = useTransition();
  const [, startToggle] = useTransition();

  // Checklist otimista: o check muda na hora; o revalidate traz o estado real.
  const [rows, applyPaid] = useOptimistic(
    mensalistas,
    (current, change: { userId: string; paid: boolean }) =>
      current.map((row) =>
        row.userId === change.userId ? { ...row, paid: change.paid } : row,
      ),
  );

  const [periodInput, setPeriodInput] = useState(settings.period);
  const [amountInput, setAmountInput] = useState(
    (settings.amount / 100).toFixed(2),
  );
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const periodLabel = formatPeriod(settings.period);
  const amountLabel = formatCents(settings.amount);
  const paidCount = rows.filter((row) => row.paid).length;

  function openConfig() {
    setPeriodInput(settings.period);
    setAmountInput((settings.amount / 100).toFixed(2));
    setError(null);
    setModal("config");
  }

  function openMembers() {
    setSelected(
      new Set(candidates.filter((c) => c.mensalista).map((c) => c.userId)),
    );
    setError(null);
    setModal("members");
  }

  function toggleSelected(userId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  }

  function togglePaid(userId: string, paid: boolean) {
    setToggleError(null);
    startToggle(async () => {
      applyPaid({ userId, paid });
      const result = await toggleMensalPaidAction(userId, paid);
      if (!result.ok) {
        setToggleError(result.error);
      }
    });
  }

  function saveConfig(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    startSaving(async () => {
      const result = await updateMensalConfigAction({
        period: periodInput,
        amountStr: amountInput,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setModal(null);
    });
  }

  function saveMembers(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    startSaving(async () => {
      const result = await updateMensalistasAction([...selected]);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setModal(null);
    });
  }

  return (
    <main className="flex flex-col gap-8">
      <Reveal
        className={`${cardClass} flex flex-col items-center justify-center p-8`}
        delayMs={revealDelay(0)}
      >
        <span className="text-sm font-semibold uppercase tracking-widest text-emerald-500 dark:text-emerald-400">
          Mensal · {periodLabel}
        </span>

        <div className="mt-2 flex items-center gap-3">
          <span className="text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            {amountLabel}
          </span>
          {isAdmin ? (
            <button
              type="button"
              onClick={openConfig}
              className="rounded-full p-2 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              title="Editar mês e valor do mensal"
              aria-label="Editar mês e valor do mensal"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
          ) : null}
        </div>
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          Valor por mensalista referente a {periodLabel}
        </p>
      </Reveal>

      <Reveal as="section" className={cardClass} delayMs={revealDelay(1)}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Mensalistas{" "}
              <span className="text-sm font-normal text-zinc-600 dark:text-zinc-500">
                ({paidCount} de {rows.length} pagos)
              </span>
            </h2>
            {isAdmin ? (
              <button
                type="button"
                onClick={openMembers}
                className={iconButtonClass}
                title="Escolher mensalistas"
                aria-label="Escolher mensalistas"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>

        {toggleError ? (
          <p role="alert" className="mt-3 text-xs text-red-600 dark:text-red-400">
            {toggleError}
          </p>
        ) : null}

        {rows.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-500">
            Nenhum mensalista cadastrado.
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-2">
            {rows.map((row) => (
              <li key={row.userId} className={listRowClass}>
                {isAdmin ? (
                  <label className="flex flex-1 cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={row.paid}
                      onChange={(event) =>
                        togglePaid(row.userId, event.target.checked)
                      }
                      className="h-5 w-5 shrink-0 accent-emerald-500"
                      aria-label={`${row.name} pagou ${periodLabel}`}
                    />
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {row.name}
                    </span>
                  </label>
                ) : (
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {row.name}
                  </span>
                )}
                <span className={row.paid ? PAID_BADGE : PENDING_BADGE}>
                  {row.paid ? "Pago" : "Pendente"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Reveal>

      <ModalBackdrop open={modal === "config"}>
        <ModalPanel>
          <h3 className="mb-4 text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Editar mês e valor do mensal
          </h3>
          <form onSubmit={saveConfig} className="flex flex-col gap-4">
            <div>
              <p
                id="mensal-period-label"
                className="mb-1 text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Mês de referência ·{" "}
                <span className="text-emerald-600 dark:text-emerald-400">
                  {formatPeriod(periodInput)}
                </span>
              </p>
              <MonthPicker
                key={modal === "config" ? settings.period : "closed"}
                value={periodInput}
                onChange={setPeriodInput}
                labelledBy="mensal-period-label"
              />
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Trocar o mês começa um checklist novo. O dos meses anteriores
                fica guardado.
              </p>
            </div>
            <div>
              <label
                htmlFor="mensal-amount"
                className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Valor do mensal (R$)
              </label>
              <input
                id="mensal-amount"
                type="number"
                step="0.01"
                min="0"
                required
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                className={`${inputClass} w-full`}
                placeholder="37.17"
              />
            </div>

            {error ? (
              <p className="text-xs font-medium text-red-600 dark:text-red-400">
                {error}
              </p>
            ) : null}

            <div className="mt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModal(null)}
                disabled={isSaving}
                className={secondaryButtonClass}
              >
                Cancelar
              </button>
              <button type="submit" disabled={isSaving} className={buttonClass}>
                {isSaving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </form>
        </ModalPanel>
      </ModalBackdrop>

      <ModalBackdrop open={modal === "members"}>
        <ModalPanel className="max-w-lg">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Escolher mensalistas ({selected.size})
          </h3>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
            Marque os usuários cadastrados que pagam por mês.
          </p>

          <form onSubmit={saveMembers} className="mt-4 flex flex-col gap-4">
            <div className="max-h-80 overflow-y-auto pr-1">
              {candidates.length === 0 ? (
                <p className="py-4 text-center text-sm text-zinc-500">
                  Nenhum usuário cadastrado.
                </p>
              ) : (
                <ul className="flex flex-col gap-1">
                  {candidates.map((candidate) => (
                    <li key={candidate.userId}>
                      <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800/60">
                        <input
                          type="checkbox"
                          checked={selected.has(candidate.userId)}
                          onChange={() => toggleSelected(candidate.userId)}
                          className="h-4 w-4 shrink-0 accent-emerald-500"
                        />
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {candidate.name}
                        </span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          @{candidate.username}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {error ? (
              <p className="text-xs font-medium text-red-600 dark:text-red-400">
                {error}
              </p>
            ) : null}

            <div className="mt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModal(null)}
                disabled={isSaving}
                className={secondaryButtonClass}
              >
                Cancelar
              </button>
              <button type="submit" disabled={isSaving} className={buttonClass}>
                {isSaving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </form>
        </ModalPanel>
      </ModalBackdrop>
    </main>
  );
}
