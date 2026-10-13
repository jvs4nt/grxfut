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

function patchPlayerLine(
  players: StatPlayerLine[],
  userId: string,
  patch: (line: StatPlayerLine) => StatPlayerLine,
): StatPlayerLine[] {
  return players.map((line) => (line.userId === userId ? patch(line) : line));
}

export function applyStatEvent(
  players: StatPlayerLine[],
  userId: string,
  type: StatEventType,
): StatPlayerLine[] {
  return patchPlayerLine(players, userId, (line) => {
    const next = { ...line, points: line.points + STAT_POINTS[type] };

    if (type === "goal") {
      next.goals += 1;
    } else if (type === "assist") {
      next.assists += 1;
    } else {
      next.defenses += 1;
    }

    return next;
  });
}

export function undoStatEvent(
  players: StatPlayerLine[],
  userId: string,
  type: StatEventType,
): StatPlayerLine[] {
  return patchPlayerLine(players, userId, (line) => {
    if (type === "goal" && line.goals < 1) {
      return line;
    }

    if (type === "assist" && line.assists < 1) {
      return line;
    }

    if (type === "defense" && line.defenses < 1) {
      return line;
    }

    const next = { ...line, points: line.points - STAT_POINTS[type] };

    if (type === "goal") {
      next.goals -= 1;
    } else if (type === "assist") {
      next.assists -= 1;
    } else {
      next.defenses -= 1;
    }

    return next;
  });
}

export function clearPlayerStats(
  players: StatPlayerLine[],
  userId: string,
): StatPlayerLine[] {
  return patchPlayerLine(players, userId, (line) => ({
    ...line,
    goals: 0,
    assists: 0,
    defenses: 0,
    points: 0,
  }));
}
