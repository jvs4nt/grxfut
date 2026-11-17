"use client";

import { useState, useTransition } from "react";
import { PencilIcon } from "@/components/icons";
import { ModalBackdrop, ModalPanel } from "@/components/modal-backdrop";
import { STAT_POINTS, type StatPlayerLine } from "@/lib/match-stat-shared";
import type { StatRankingPeriod } from "@/lib/match-stats";
import {
  buttonClass,
  iconButtonClass,
  inputClass,
  secondaryButtonClass,
} from "@/lib/ui";
import { setPlayerStatsAction } from "./actions";

export type StatCandidate = { userId: string; name: string };

type Draft = {
  userId: string;
  name: string;
  goals: number;
  assists: number;
  defenses: number;
};

const FIELDS = [
  { key: "goals", label: "Gols" },
  { key: "assists", label: "Assistências" },
  { key: "defenses", label: "Defesas" },
] as const;

/** ✎ no fim da linha do ranking (só admin). */
export function StatEditButton({
  player,
  scope,
  scopeLabel,
}: {
  player: StatPlayerLine;
  scope: StatRankingPeriod;
  scopeLabel: string;
}) {
  const [open, setOpen] = useState(false);
  // Nova key a cada abertura: o rascunho recomeça do valor atual, e o modal
  // continua montado ao fechar para a animação de saída rodar.
  const [session, setSession] = useState(0);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setSession((n) => n + 1);
          setOpen(true);
        }}
        className={`${iconButtonClass} shrink-0 rounded-lg p-1.5`}
        title={`Editar estatísticas de ${player.name}`}
        aria-label={`Editar estatísticas de ${player.name}`}
      >
        <PencilIcon className="h-4 w-4" />
      </button>
      <StatEditModal
        key={session}
        open={open}
        initial={{
          userId: player.userId,
          name: player.name,
          goals: player.goals,
          assists: player.assists,
          defenses: player.defenses,
        }}
        scope={scope}
        scopeLabel={scopeLabel}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

/** "+ Adicionar jogador": escolhe alguém que ainda não está no ranking. */
export function AddPlayerStatButton({
  candidates,
  scope,
  scopeLabel,
}: {
  candidates: StatCandidate[];
  scope: StatRankingPeriod;
  scopeLabel: string;
}) {
  const [picking, setPicking] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [editing, setEditing] = useState<StatCandidate | null>(null);
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState(0);

  if (candidates.length === 0) {
    return null;
  }

  return (
    <>
      {picking ? (
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedId}
            onChange={(event) => setSelectedId(event.target.value)}
            className={`${inputClass} min-w-0 flex-1 py-2 text-sm`}
            aria-label="Jogador"
          >
            <option value="">Escolha o jogador…</option>
            {candidates.map((candidate) => (
              <option key={candidate.userId} value={candidate.userId}>
                {candidate.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={!selectedId}
            onClick={() => {
              const candidate = candidates.find((c) => c.userId === selectedId);
              if (candidate) {
                setEditing(candidate);
                setSession((n) => n + 1);
                setOpen(true);
                setPicking(false);
                setSelectedId("");
              }
            }}
            className={buttonClass}
          >
            Continuar
          </button>
          <button
            type="button"
            onClick={() => setPicking(false)}
            className={secondaryButtonClass}
          >
            Cancelar
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setPicking(true)}
          className={secondaryButtonClass}
        >
          + Adicionar jogador
        </button>
      )}

      {editing ? (
        <StatEditModal
          key={session}
          open={open}
          initial={{
            userId: editing.userId,
            name: editing.name,
            goals: 0,
            assists: 0,
            defenses: 0,
          }}
          scope={scope}
          scopeLabel={scopeLabel}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}

function StatEditModal({
  open,
  initial,
  scope,
  scopeLabel,
  onClose,
}: {
  open: boolean;
  initial: Draft;
  scope: StatRankingPeriod;
  scopeLabel: string;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();

  const points =
    draft.goals * STAT_POINTS.goal +
    draft.assists * STAT_POINTS.assist +
    draft.defenses * STAT_POINTS.defense;

  function step(key: (typeof FIELDS)[number]["key"], delta: number) {
    setDraft((prev) => ({ ...prev, [key]: Math.max(0, prev[key] + delta) }));
  }

  function save() {
    setError(null);
    startSaving(async () => {
      const result = await setPlayerStatsAction({
        userId: draft.userId,
        scope,
        goals: draft.goals,
        assists: draft.assists,
        defenses: draft.defenses,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      onClose();
    });
  }

  return (
    <ModalBackdrop
      open={open}
      onClick={(event) => {
        if (event.target === event.currentTarget && !saving) {
          onClose();
        }
      }}
    >
      <ModalPanel>
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
          Editar: {draft.name}
        </h3>
        <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
          {scopeLabel}
          {scope === "all"
            ? " · o ajuste não muda o ranking do mês"
            : " · o ajuste também conta no all-time"}
        </p>

        <div className="mt-5 flex flex-col gap-3">
          {FIELDS.map((field) => (
            <div
              key={field.key}
              className="flex items-center justify-between gap-3"
            >
              <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                {field.label}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => step(field.key, -1)}
                  disabled={saving || draft[field.key] === 0}
                  className={`${secondaryButtonClass} h-9 w-9 px-0`}
                  aria-label={`Diminuir ${field.label}`}
                >
                  −
                </button>
                <span
                  className="w-8 text-center text-lg font-semibold tabular-nums"
                  aria-live="polite"
                >
                  {draft[field.key]}
                </span>
                <button
                  type="button"
                  onClick={() => step(field.key, 1)}
                  disabled={saving}
                  className={`${secondaryButtonClass} h-9 w-9 px-0`}
                  aria-label={`Aumentar ${field.label}`}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-4 text-right text-sm text-zinc-600 dark:text-zinc-400">
          Pontos:{" "}
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
            {points}
          </span>
        </p>

        {error ? (
          <p role="alert" className="mt-3 text-xs text-red-600 dark:text-red-400">
            {error}
          </p>
        ) : null}

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className={secondaryButtonClass}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className={buttonClass}
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </ModalPanel>
    </ModalBackdrop>
  );
}
