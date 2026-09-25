"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import type { IconType } from "react-icons";
import { GiBaseballGlove, GiBootKick, GiSoccerBall } from "react-icons/gi";
import {
  finishMatchStatSessionAction,
  pauseMatchTimerAction,
  recordMatchStatAction,
  resetMatchTimerAction,
  resumeMatchTimerAction,
  startMatchStatSessionAction,
  clearPlayerStatsAction,
} from "@/app/(app)/jogo/actions";
import { useBusy } from "@/components/busy-overlay";
import { BackArrowIcon } from "@/components/icons";
import { ModalBackdrop, ModalPanel } from "@/components/modal-backdrop";
import { TIER_LABELS } from "@/lib/labels";
import {
  displayedClockSeconds,
  formatStatClock,
  sumStatPoints,
  type MatchClock,
  type StatEventType,
  type StatPlayerLine,
} from "@/lib/match-stat-shared";
import {
  buttonClass,
  cardClass,
  dangerButtonClass,
  iconButtonClass,
  listRowClass,
  secondaryButtonClass,
} from "@/lib/ui";

const EVENT_BUTTONS: {
  type: StatEventType;
  label: string;
  icon: IconType;
}[] = [
  { type: "goal", label: "Gol", icon: GiSoccerBall },
  { type: "assist", label: "Assistência", icon: GiBootKick },
  { type: "defense", label: "Defesa", icon: GiBaseballGlove },
];

function countFor(player: StatPlayerLine, type: StatEventType) {
  if (type === "goal") {
    return player.goals;
  }

  if (type === "assist") {
    return player.assists;
  }

  return player.defenses;
}

function useClockSeconds(clock: MatchClock | null) {
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    if (!clock?.running) {
      return;
    }

    const id = window.setInterval(() => setNowMs(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [clock?.running, clock?.anchorAt, clock?.elapsedSeconds]);

  if (!clock) {
    return 0;
  }

  return displayedClockSeconds(clock, nowMs);
}

export function MatchStatsPanel({
  matchId,
  live,
  finished,
}: {
  matchId: string;
  live: {
    sessionId: string;
    clock: MatchClock;
    players: StatPlayerLine[];
  } | null;
  finished: {
    durationSeconds: number;
    players: StatPlayerLine[];
  } | null;
}) {
  const router = useRouter();
  const { busy, run } = useBusy();
  const [error, setError] = useState<string | null>(null);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [frozenSeconds, setFrozenSeconds] = useState<number | null>(null);
  const [clearTarget, setClearTarget] = useState<StatPlayerLine | null>(null);
  const confirmTitleId = useId();
  const clearTitleId = useId();
  const titleId = useId();

  async function refresh() {
    router.refresh();
  }

  async function start() {
    setError(null);
    const result = await run(() => startMatchStatSessionAction(matchId));

    if (!result.ok) {
      setError(result.error);
      return;
    }

    await refresh();
  }

  async function record(player: StatPlayerLine, type: StatEventType) {
    if (!live) {
      return;
    }

    const key = `${player.userId}:${type}`;
    setPendingKey(key);
    setError(null);
    const result = await recordMatchStatAction(
      matchId,
      live.sessionId,
      player.userId,
      type,
    );
    setPendingKey(null);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    await refresh();
  }

  async function clearPlayer() {
    if (!live || !clearTarget) {
      return;
    }

    const target = clearTarget;
    setPendingKey(`clear:${target.userId}`);
    setError(null);
    const result = await clearPlayerStatsAction(
      matchId,
      live.sessionId,
      target.userId,
    );
    setPendingKey(null);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setClearTarget(null);
    await refresh();
  }

  async function pause() {
    if (!live) {
      return;
    }

    setError(null);
    const result = await pauseMatchTimerAction(matchId, live.sessionId);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    await refresh();
  }

  async function resume() {
    if (!live) {
      return;
    }

    setError(null);
    const result = await resumeMatchTimerAction(matchId, live.sessionId);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    await refresh();
  }

  async function reset() {
    if (!live) {
      return;
    }

    setError(null);
    const result = await resetMatchTimerAction(matchId, live.sessionId);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    await refresh();
  }

  async function openSummary() {
    if (!live) {
      return;
    }

    setError(null);
    const result = await pauseMatchTimerAction(matchId, live.sessionId);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setFrozenSeconds(result.durationSeconds ?? 0);
    setSummaryOpen(true);
    await refresh();
  }

  async function confirmFinish() {
    if (!live) {
      return;
    }

    setError(null);
    const result = await run(() =>
      finishMatchStatSessionAction(matchId, live.sessionId),
    );

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setSummaryOpen(false);
    setFrozenSeconds(null);
    await refresh();
  }

  if (!live) {
    return (
      <div className="flex flex-col gap-4">
        <button type="button" onClick={start} disabled={busy} className={buttonClass}>
          INICIAR JOGO
        </button>
        {finished && finished.players.length > 0 ? (
          <section className={cardClass}>
            <h2 className="text-lg font-semibold">Última partida</h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Duração {formatStatClock(finished.durationSeconds)} ·{" "}
              {sumStatPoints(finished.players)} pts
            </p>
            <PlayerSummary players={playersWithStats(finished.players)} />
          </section>
        ) : null}
        {error ? (
          <p role="alert" className="text-sm text-red-600 dark:text-red-300">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  const totalPoints = sumStatPoints(live.players);
  const summarySeconds = frozenSeconds ?? live.clock.elapsedSeconds;

  return (
    <div className="flex flex-col gap-6">
      <section className={`${cardClass} flex flex-col gap-4`}>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-500">
              Cronômetro
            </p>
            <MatchClockReadout
              clock={live.clock}
              frozenSeconds={summaryOpen ? summarySeconds : null}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {live.clock.running && !summaryOpen ? (
              <button type="button" onClick={pause} className={secondaryButtonClass}>
                Pausar
              </button>
            ) : (
              <button
                type="button"
                onClick={resume}
                disabled={summaryOpen}
                className={secondaryButtonClass}
              >
                Continuar
              </button>
            )}
            <button
              type="button"
              onClick={reset}
              disabled={summaryOpen}
              className={secondaryButtonClass}
            >
              Zerar
            </button>
          </div>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {totalPoints} pts nesta sessão
        </p>
      </section>

      <button
        type="button"
        onClick={() => {
          setError(null);
          setConfirmOpen(true);
        }}
        disabled={busy || summaryOpen}
        className={dangerButtonClass}
      >
        ENCERRAR JOGO
      </button>

      <ul className="flex flex-col gap-2">
        {live.players.map((player) => (
          <li key={player.userId} className={`${listRowClass} items-start sm:items-center`}>
            <div className="flex min-w-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setClearTarget(player)}
                disabled={player.points === 0 || summaryOpen || pendingKey === `clear:${player.userId}`}
                className={iconButtonClass}
                aria-label={`Zerar estatísticas de ${player.name}`}
                title="Zerar estatísticas"
              >
                <BackArrowIcon />
              </button>
              <div className="min-w-0">
                <p className="font-medium">{player.name}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {TIER_LABELS[player.tier]} · {player.points} pts
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {EVENT_BUTTONS.map((event) => {
                const Icon = event.icon;
                const key = `${player.userId}:${event.type}`;

                return (
                  <button
                    key={event.type}
                    type="button"
                    onClick={() => record(player, event.type)}
                    disabled={pendingKey === key || summaryOpen}
                    className={secondaryButtonClass}
                    aria-label={`${event.label} de ${player.name}`}
                    title={event.label}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <Icon className="h-5 w-5" />
                      <span className="sr-only">{event.label}</span>
                      <span>{countFor(player, event.type)}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </li>
        ))}
      </ul>

      {error ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-300">
          {error}
        </p>
      ) : null}

      <ModalBackdrop
        open={clearTarget !== null}
        role="dialog"
        aria-modal="true"
        aria-labelledby={clearTitleId}
        onClick={(event) => {
          if (event.target === event.currentTarget && pendingKey === null) {
            setClearTarget(null);
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape" && pendingKey === null) {
            setClearTarget(null);
          }
        }}
      >
        <ModalPanel>
          <h2 id={clearTitleId} className="text-lg font-semibold">
            Deseja zerar as estatísticas de {clearTarget?.name}?
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Gols, assistências e defesas desta partida voltam a zero.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void clearPlayer()}
              disabled={pendingKey !== null}
              className={dangerButtonClass}
            >
              Zerar
            </button>
            <button
              type="button"
              onClick={() => setClearTarget(null)}
              disabled={pendingKey !== null}
              className={secondaryButtonClass}
            >
              Cancelar
            </button>
          </div>
        </ModalPanel>
      </ModalBackdrop>

      <ModalBackdrop
        open={confirmOpen}
        role="dialog"
        aria-modal="true"
        aria-labelledby={confirmTitleId}
        onClick={(event) => {
          if (event.target === event.currentTarget && !busy) {
            setConfirmOpen(false);
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape" && !busy) {
            setConfirmOpen(false);
          }
        }}
      >
        <ModalPanel>
          <h2 id={confirmTitleId} className="text-lg font-semibold">
            Encerrar o jogo?
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            O cronômetro para. Em seguida você confere só o que foi marcado
            antes de gravar.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setConfirmOpen(false);
                void openSummary();
              }}
              disabled={busy}
              className={dangerButtonClass}
            >
              Encerrar
            </button>
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              disabled={busy}
              className={secondaryButtonClass}
            >
              Cancelar
            </button>
          </div>
        </ModalPanel>
      </ModalBackdrop>

      <ModalBackdrop
        open={summaryOpen}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={(event) => {
          if (event.key === "Escape" && !busy) {
            setSummaryOpen(false);
          }
        }}
      >
        <ModalPanel className="max-h-[85vh] overflow-y-auto">
          <h2 id={titleId} className="text-lg font-semibold">
            Confirmar estatísticas
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Duração {formatStatClock(summarySeconds)} · {totalPoints} pts
          </p>
          <PlayerSummary players={playersWithStats(live.players)} />
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={confirmFinish}
              disabled={busy}
              className={buttonClass}
            >
              Gravar e encerrar
            </button>
            <button
              type="button"
              onClick={() => setSummaryOpen(false)}
              disabled={busy}
              className={secondaryButtonClass}
            >
              Voltar ao jogo
            </button>
          </div>
        </ModalPanel>
      </ModalBackdrop>
    </div>
  );
}

function MatchClockReadout({
  clock,
  frozenSeconds,
}: {
  clock: MatchClock;
  frozenSeconds: number | null;
}) {
  const seconds = useClockSeconds(clock);
  const shown = frozenSeconds ?? seconds;

  return (
    <p className="mt-1 font-mono text-4xl font-semibold tracking-tight">
      {formatStatClock(shown)}
    </p>
  );
}

function playersWithStats(players: StatPlayerLine[]) {
  return players.filter((player) => player.points > 0);
}

function changedStatLabel(player: StatPlayerLine) {
  const parts: string[] = [];

  if (player.goals > 0) {
    parts.push(`${player.goals} ${player.goals === 1 ? "gol" : "gols"}`);
  }

  if (player.assists > 0) {
    parts.push(
      `${player.assists} ${player.assists === 1 ? "assistência" : "assistências"}`,
    );
  }

  if (player.defenses > 0) {
    parts.push(`${player.defenses} ${player.defenses === 1 ? "defesa" : "defesas"}`);
  }

  parts.push(`${player.points} pts`);
  return parts.join(" · ");
}

function PlayerSummary({ players }: { players: StatPlayerLine[] }) {
  if (players.length === 0) {
    return (
      <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
        Nenhum evento nesta partida.
      </p>
    );
  }

  return (
    <ul className="mt-4 flex flex-col gap-2">
      {players.map((player) => (
        <li key={player.userId} className={listRowClass}>
          <span className="font-medium">{player.name}</span>
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            {changedStatLabel(player)}
          </span>
        </li>
      ))}
    </ul>
  );
}
