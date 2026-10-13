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
  applyStatEvent,
  clearPlayerStats,
  displayedClockSeconds,
  formatStatClock,
  sumStatPoints,
  undoStatEvent,
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

type LocalLive = {
  sessionId: string;
  clock: MatchClock;
  players: StatPlayerLine[];
};

function liveFromProp(live: LocalLive): LocalLive {
  return {
    sessionId: live.sessionId,
    clock: live.clock,
    players: live.players,
  };
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
  const [localLive, setLocalLive] = useState<LocalLive | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [frozenSeconds, setFrozenSeconds] = useState<number | null>(null);
  const [clearTarget, setClearTarget] = useState<StatPlayerLine | null>(null);
  const confirmTitleId = useId();
  const clearTitleId = useId();
  const titleId = useId();

  const liveSessionId = live?.sessionId ?? null;

  useEffect(() => {
    if (!liveSessionId || !live) {
      setLocalLive(null);
      return;
    }

    setLocalLive((prev) =>
      prev?.sessionId === liveSessionId ? prev : liveFromProp(live),
    );
  }, [liveSessionId, live]);

  function refresh() {
    router.refresh();
  }

  function mergeLocalLive(patch: Partial<LocalLive>) {
    setLocalLive((prev) => {
      const base = prev ?? (live ? liveFromProp(live) : null);
      if (!base) {
        return null;
      }

      return { ...base, ...patch };
    });
  }

  async function start() {
    setError(null);
    const result = await run(() => startMatchStatSessionAction(matchId));

    if (!result.ok) {
      setError(result.error);
      return;
    }

    refresh();
  }

  function record(player: StatPlayerLine, type: StatEventType) {
    const session = localLive ?? live;
    if (!session) {
      return;
    }

    setError(null);
    mergeLocalLive({
      players: applyStatEvent(session.players, player.userId, type),
    });

    void recordMatchStatAction(
      matchId,
      session.sessionId,
      player.userId,
      type,
    ).then((result) => {
      if (result.ok) {
        return;
      }

      setError(result.error);
      setLocalLive((prev) => {
        if (!prev) {
          return prev;
        }

        return {
          ...prev,
          players: undoStatEvent(prev.players, player.userId, type),
        };
      });
    });
  }

  function clearPlayer() {
    const session = localLive ?? live;
    if (!session || !clearTarget) {
      return;
    }

    const target = clearTarget;
    const snapshot = session.players.find((line) => line.userId === target.userId);
    if (!snapshot) {
      return;
    }

    setError(null);
    mergeLocalLive({
      players: clearPlayerStats(session.players, target.userId),
    });
    setClearTarget(null);

    void clearPlayerStatsAction(
      matchId,
      session.sessionId,
      target.userId,
    ).then((result) => {
      if (result.ok) {
        return;
      }

      setError(result.error);
      setLocalLive((prev) => {
        if (!prev) {
          return prev;
        }

        return {
          ...prev,
          players: prev.players.map((line) =>
            line.userId === target.userId ? snapshot : line,
          ),
        };
      });
    });
  }

  async function pause() {
    const session = localLive ?? live;
    if (!session) {
      return;
    }

    setError(null);
    const result = await pauseMatchTimerAction(matchId, session.sessionId);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    const elapsed = result.durationSeconds ?? session.clock.elapsedSeconds;
    mergeLocalLive({
      clock: {
        elapsedSeconds: elapsed,
        running: false,
        anchorAt: null,
      },
    });
  }

  async function resume() {
    const session = localLive ?? live;
    if (!session) {
      return;
    }

    setError(null);
    const result = await resumeMatchTimerAction(matchId, session.sessionId);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    mergeLocalLive({
      clock: {
        elapsedSeconds: session.clock.elapsedSeconds,
        running: true,
        anchorAt: new Date().toISOString(),
      },
    });
  }

  async function reset() {
    const session = localLive ?? live;
    if (!session) {
      return;
    }

    setError(null);
    const result = await resetMatchTimerAction(matchId, session.sessionId);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    const running = session.clock.running;
    mergeLocalLive({
      clock: {
        elapsedSeconds: 0,
        running,
        anchorAt: running ? new Date().toISOString() : null,
      },
    });
  }

  async function openSummary() {
    const session = localLive ?? live;
    if (!session) {
      return;
    }

    setError(null);
    const result = await pauseMatchTimerAction(matchId, session.sessionId);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    const elapsed = result.durationSeconds ?? session.clock.elapsedSeconds;
    setFrozenSeconds(elapsed);
    mergeLocalLive({
      clock: {
        elapsedSeconds: elapsed,
        running: false,
        anchorAt: null,
      },
    });
    setSummaryOpen(true);
  }

  async function confirmFinish() {
    const session = localLive ?? live;
    if (!session) {
      return;
    }

    setError(null);
    const result = await run(() =>
      finishMatchStatSessionAction(matchId, session.sessionId),
    );

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setSummaryOpen(false);
    setFrozenSeconds(null);
    refresh();
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

  const displayLive = localLive ?? live;
  const totalPoints = sumStatPoints(displayLive.players);
  const summarySeconds = frozenSeconds ?? displayLive.clock.elapsedSeconds;

  return (
    <div className="flex flex-col gap-6">
      <section className={`${cardClass} flex flex-col gap-4`}>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-500">
              Cronômetro
            </p>
            <MatchClockReadout
              clock={displayLive.clock}
              frozenSeconds={summaryOpen ? summarySeconds : null}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {displayLive.clock.running && !summaryOpen ? (
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
        {displayLive.players.map((player) => (
          <li key={player.userId} className={`${listRowClass} items-start sm:items-center`}>
            <div className="flex min-w-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setClearTarget(player)}
                disabled={player.points === 0 || summaryOpen}
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

                return (
                  <button
                    key={event.type}
                    type="button"
                    onClick={() => record(player, event.type)}
                    disabled={summaryOpen}
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
          if (event.target === event.currentTarget) {
            setClearTarget(null);
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
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
              onClick={() => clearPlayer()}
              className={dangerButtonClass}
            >
              Zerar
            </button>
            <button
              type="button"
              onClick={() => setClearTarget(null)}
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
          <PlayerSummary players={playersWithStats(displayLive.players)} />
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
