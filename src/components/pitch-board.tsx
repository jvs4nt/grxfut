"use client";

import { useActionState, useCallback, useEffect, useState } from "react";
import { swapDrawPlayersAction, type FormState } from "@/app/(app)/sorteio/actions";
import { JerseyIcon, SwapIcon } from "@/components/icons";
import { TEAM_SIZE } from "@/lib/draw";
import { USER_TIERS, type UserTier } from "@/lib/labels";
import { iconButtonClass, inputClass } from "@/lib/ui";

export type PitchPlayer = {
  userId: string;
  name: string;
  tier: UserTier;
};

type Side = "a" | "b" | "next";

type SwapGroup = {
  label: string;
  players: PitchPlayer[];
};

const initial: FormState = { error: null };

const sideClass: Record<Side, string> = {
  a: "text-emerald-300",
  b: "text-sky-300",
  next: "text-zinc-400",
};

export function PitchBoard({
  teamA,
  teamB,
  reserve,
  drawId,
  canSwap = false,
}: {
  teamA: PitchPlayer[];
  teamB: PitchPlayer[];
  reserve: PitchPlayer[];
  drawId?: string;
  canSwap?: boolean;
}) {
  const [swappingUserId, setSwappingUserId] = useState<string | null>(null);
  const closeSwap = useCallback(() => setSwappingUserId(null), []);

  useEffect(() => {
    closeSwap();
  }, [teamA, teamB, reserve, closeSwap]);

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="relative min-h-80 flex-1 overflow-hidden rounded-3xl border border-emerald-500/20 bg-emerald-950">
        <div className="pointer-events-none absolute inset-y-6 left-1/2 w-px bg-white/20" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15" />
        <p className="sr-only">Joga agora</p>
        <div className="grid min-h-80 grid-cols-2">
          <PitchHalf
            title="Time A"
            side="a"
            players={teamA}
            targets={[
              { label: "Time B", players: teamB },
              { label: "Próximo", players: reserve },
            ]}
            drawId={drawId}
            canSwap={canSwap}
            swappingUserId={swappingUserId}
            onToggleSwap={setSwappingUserId}
            onCloseSwap={closeSwap}
          />
          <PitchHalf
            title="Time B"
            side="b"
            players={teamB}
            targets={[
              { label: "Time A", players: teamA },
              { label: "Próximo", players: reserve },
            ]}
            drawId={drawId}
            canSwap={canSwap}
            swappingUserId={swappingUserId}
            onToggleSwap={setSwappingUserId}
            onCloseSwap={closeSwap}
          />
        </div>
      </div>
      <aside className="flex w-full flex-col gap-3 rounded-3xl border border-zinc-800 bg-zinc-900/40 p-4 lg:w-52">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Próximo{" "}
          <span className="font-normal text-zinc-500">({reserve.length})</span>
        </h3>
        {reserve.length === 0 ? (
          <p className="text-sm text-zinc-500">Ninguém na fila.</p>
        ) : (
          <ul className="grid grid-cols-3 gap-3 lg:grid-cols-1">
            {sortPlayers(reserve).map((player) => (
              <li key={player.userId}>
                <JerseySlot
                  player={player}
                  side="next"
                  swap={
                    canSwap && drawId
                      ? {
                          drawId,
                          targets: [
                            { label: "Time A", players: teamA },
                            { label: "Time B", players: teamB },
                          ],
                          open: swappingUserId === player.userId,
                          onToggle: () =>
                            setSwappingUserId(
                              swappingUserId === player.userId
                                ? null
                                : player.userId,
                            ),
                          onClose: closeSwap,
                        }
                      : undefined
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}

function PitchHalf({
  title,
  side,
  players,
  targets,
  drawId,
  canSwap,
  swappingUserId,
  onToggleSwap,
  onCloseSwap,
}: {
  title: string;
  side: "a" | "b";
  players: PitchPlayer[];
  targets: SwapGroup[];
  drawId?: string;
  canSwap: boolean;
  swappingUserId: string | null;
  onToggleSwap: (userId: string | null) => void;
  onCloseSwap: () => void;
}) {
  const slots = padSlots(sortPlayers(players));
  const hasTargets = targets.some((group) => group.players.length > 0);

  return (
    <div className="flex flex-col gap-3 p-4">
      <h3 className="text-center text-xs font-semibold uppercase tracking-wider text-white/70">
        {title}{" "}
        <span className="font-normal">({players.length})</span>
      </h3>
      <ul className="grid flex-1 grid-cols-2 grid-rows-3 gap-3">
        {slots.map((player, index) => (
          <li key={player?.userId ?? `empty-${side}-${index}`}>
            <JerseySlot
              player={player}
              side={side}
              swap={
                player && canSwap && drawId && hasTargets
                  ? {
                      drawId,
                      targets,
                      open: swappingUserId === player.userId,
                      onToggle: () =>
                        onToggleSwap(
                          swappingUserId === player.userId ? null : player.userId,
                        ),
                      onClose: onCloseSwap,
                    }
                  : undefined
              }
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

function JerseySlot({
  player,
  side,
  swap,
}: {
  player: PitchPlayer | null;
  side: Side;
  swap?: {
    drawId: string;
    targets: SwapGroup[];
    open: boolean;
    onToggle: () => void;
    onClose: () => void;
  };
}) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <JerseyIcon
        className={`h-9 w-9 sm:h-10 sm:w-10 ${sideClass[side]} ${player ? "" : "opacity-20"}`}
      />
      {player ? (
        <>
          <p className="max-w-20 truncate text-xs font-medium text-zinc-100" title={player.name}>
            {player.name}
          </p>
          {swap ? (
            <SwapControl
              drawId={swap.drawId}
              userId={player.userId}
              name={player.name}
              targets={swap.targets}
              open={swap.open}
              onToggle={swap.onToggle}
              onClose={swap.onClose}
            />
          ) : null}
        </>
      ) : (
        <p className="text-xs text-white/20">—</p>
      )}
    </div>
  );
}

function SwapControl({
  drawId,
  userId,
  name,
  targets,
  open,
  onToggle,
  onClose,
}: {
  drawId: string;
  userId: string;
  name: string;
  targets: SwapGroup[];
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const [state, action, pending] = useActionState(swapDrawPlayersAction, initial);

  useEffect(() => {
    if (state.ok) {
      onClose();
    }
  }, [state.ok, onClose]);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-1">
        {open ? (
          <form action={action}>
            <input type="hidden" name="drawId" value={drawId} />
            <input type="hidden" name="userId" value={userId} />
            <select
              name="otherUserId"
              required
              defaultValue=""
              autoFocus
              disabled={pending}
              className={`${inputClass} py-1 text-xs`}
              onChange={(event) => {
                if (event.target.value) {
                  event.currentTarget.form?.requestSubmit();
                }
              }}
            >
              <option value="" disabled>
                Trocar com…
              </option>
              {targets
                .filter((group) => group.players.length > 0)
                .map((group) => (
                  <optgroup key={group.label} label={group.label}>
                    {group.players.map((player) => (
                      <option key={player.userId} value={player.userId}>
                        {player.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
            </select>
          </form>
        ) : null}
        <button
          type="button"
          onClick={onToggle}
          disabled={pending}
          className={`${iconButtonClass} p-1`}
          aria-label={`Trocar ${name}`}
          title="Trocar"
        >
          <SwapIcon className="h-3.5 w-3.5" />
        </button>
      </div>
      {state.error ? (
        <p className="text-[11px] text-red-300" role="alert">
          {state.error}
        </p>
      ) : null}
    </div>
  );
}

function sortPlayers(players: PitchPlayer[]) {
  return [...players].sort((a, b) => {
    const byTier = USER_TIERS.indexOf(a.tier) - USER_TIERS.indexOf(b.tier);
    if (byTier !== 0) {
      return byTier;
    }

    return a.name.localeCompare(b.name);
  });
}

function padSlots(players: PitchPlayer[]) {
  return Array.from({ length: TEAM_SIZE }, (_, index) => players[index] ?? null);
}
