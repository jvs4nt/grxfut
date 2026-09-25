import type { UserTier } from "@/lib/labels";

export const STAT_POINTS = {
  goal: 2,
  assist: 1,
  defense: 1,
} as const;

export type StatEventType = keyof typeof STAT_POINTS;

export const STAT_EVENT_LABELS: Record<StatEventType, string> = {
  goal: "Gol",
  assist: "Assistência",
  defense: "Defesa",
};

export type StatPlayerLine = {
  userId: string;
  name: string;
  tier: UserTier;
  goals: number;
  assists: number;
  defenses: number;
  points: number;
};

export type MatchClock = {
  elapsedSeconds: number;
  running: boolean;
  anchorAt: string | null;
};

export function isStatEventType(value: string): value is StatEventType {
  return value === "goal" || value === "assist" || value === "defense";
}

export function formatStatClock(totalSeconds: number) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  const pad = (value: number) => String(value).padStart(2, "0");

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }

  return `${pad(minutes)}:${pad(seconds)}`;
}

export function displayedClockSeconds(clock: MatchClock, nowMs: number) {
  if (!clock.running || !clock.anchorAt) {
    return clock.elapsedSeconds;
  }

  const extra = Math.floor((nowMs - new Date(clock.anchorAt).getTime()) / 1000);
  return clock.elapsedSeconds + Math.max(0, extra);
}

export function sumStatPoints(players: StatPlayerLine[]) {
  return players.reduce((total, player) => total + player.points, 0);
}
