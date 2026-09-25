import Link from "next/link";
import { FutRulesModal } from "@/components/fut-rules-modal";
import { MatchAdminModals } from "@/components/match-admin-modals";
import { Reveal } from "@/components/reveal";
import { revealDelay } from "@/lib/reveal";
import { RsvpForm } from "@/components/rsvp-form";
import type { RsvpState } from "@/components/rsvp-controls";
import { HomeTeamsControls } from "@/components/teams-modal";
import {
  listAttendances,
  splitAttendances,
  type AttendanceRow,
} from "@/lib/attendance";
import { isAdmin, requireSession } from "@/lib/auth";
import {
  formatDayMonth,
  formatDayMonthYear,
  formatTime,
  formatWeekday,
} from "@/lib/dates";
import { getDrawForMatch } from "@/lib/draw";
import { TIER_LABELS } from "@/lib/labels";
import { getHomeHighlight, getNextScheduledMatch } from "@/lib/matches";
import { buttonClass, cardClass, listRowClass } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await requireSession();
  const [highlight, nextScheduled] = await Promise.all([
    getHomeHighlight(),
    getNextScheduledMatch(),
  ]);
  const attendances = nextScheduled
    ? await listAttendances(nextScheduled.id)
    : [];
  const draw = nextScheduled ? await getDrawForMatch(nextScheduled.id) : null;
  const { confirmed, reserves, pendingPayment } =
    splitAttendances(attendances);
  const own = attendances.find((row) => row.userId === user.id);
  const rsvpState: RsvpState =
    own?.status === "confirmed"
      ? "confirmed"
      : own?.status === "reserve"
        ? "reserve"
        : own?.status === "pending_payment"
          ? "pending"
          : "out";
  const admin = isAdmin(user);
  const homeDraw = draw
    ? {
        id: draw.id,
        teamA: draw.players
          .filter((player) => player.team === "team_a")
          .map(({ userId, name, tier }) => ({ userId, name, tier })),
        teamB: draw.players
          .filter((player) => player.team === "team_b")
          .map(({ userId, name, tier }) => ({ userId, name, tier })),
        reserve: draw.players
          .filter((player) => player.team === "draw_reserve")
          .map(({ userId, name, tier }) => ({ userId, name, tier })),
      }
    : null;

  return (
    <main className="flex flex-col gap-8">
      <Reveal as="section" className={cardClass} delayMs={revealDelay(0)}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <FutRulesModal />
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-500">
              Próximo fut
            </p>
            <Highlight highlight={highlight} />
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
              {confirmed.length} confirmados
              {pendingPayment.length > 0
                ? ` · ${pendingPayment.length} aguardando pagamento`
                : ""}
            </p>
          </div>
          {nextScheduled ? (
            <div className="flex flex-col items-stretch gap-3 sm:items-end">
              <RsvpForm matchId={nextScheduled.id} state={rsvpState} />
              {user.role !== "guest" ? (
                <Link href="/jogo" className={`${buttonClass} text-center`}>
                  Jogo
                </Link>
              ) : null}
              <HomeTeamsControls
                admin={admin}
                canDraw={confirmed.length > 0}
                draw={homeDraw}
              />
            </div>
          ) : null}
        </div>
      </Reveal>

      {admin ? (
        <Reveal delayMs={revealDelay(1)}>
          <MatchAdminModals
          scheduled={
            highlight.kind === "scheduled"
              ? {
                  id: highlight.match.id,
                  date: highlight.match.date,
                  time: highlight.match.time,
                  location: highlight.match.location,
                }
              : null
          }
        />
        </Reveal>
      ) : null}

      <section
        className={`grid gap-6 ${
          pendingPayment.length > 0 ? "lg:grid-cols-3" : "lg:grid-cols-2"
        }`}
      >
        <AttendanceList
          title="Confirmados"
          empty="Sem confirmados até o momento."
          rows={confirmed}
          delayMs={revealDelay(2)}
        />
        {pendingPayment.length > 0 ? (
          <AttendanceList
            title="Aguardando pagamento"
            empty="Ninguém aguardando."
            rows={pendingPayment}
            tone="pending"
            delayMs={revealDelay(3)}
          />
        ) : null}
        <AttendanceList
          title="Reservas"
          empty="Fila de espera vazia."
          rows={reserves}
          delayMs={revealDelay(pendingPayment.length > 0 ? 4 : 3)}
        />
      </section>
    </main>
  );
}

function Highlight({
  highlight,
}: {
  highlight: Awaited<ReturnType<typeof getHomeHighlight>>;
}) {
  if (highlight.kind === "empty") {
    return (
      <>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Sem jogo marcado
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Quando o administrador definir a data, ela aparece aqui.
        </p>
      </>
    );
  }

  if (highlight.kind === "rest") {
    const next = highlight.nextScheduled
      ? formatDayMonth(highlight.nextScheduled.date)
      : "a definir";

    return (
      <>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Semana de descanso; Próximo fut: {next}
        </h1>
        <p className="mt-2 text-sm capitalize text-zinc-600 dark:text-zinc-400">
          {formatWeekday(highlight.rest.date)} ·{" "}
          {formatDayMonthYear(highlight.rest.date)}
        </p>
      </>
    );
  }

  return (
    <>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        {formatDayMonthYear(highlight.match.date)}
      </h1>
      <p className="mt-2 text-sm capitalize text-zinc-600 dark:text-zinc-400">
        {formatWeekday(highlight.match.date)}
        {highlight.match.time ? ` · ${formatTime(highlight.match.time)}` : ""}
        {highlight.match.location ? ` · ${highlight.match.location}` : ""}
      </p>
    </>
  );
}

function AttendanceList({
  title,
  empty,
  rows,
  tone,
  delayMs = 0,
}: {
  title: string;
  empty: string;
  rows: AttendanceRow[];
  tone?: "pending";
  delayMs?: number;
}) {
  return (
    <Reveal
      className={
        tone === "pending"
          ? `${cardClass} border-amber-500/30`
          : cardClass
      }
      delayMs={delayMs}
    >
      <h2 className="text-lg font-semibold">
        {title}{" "}
        <span className="text-sm font-normal text-zinc-600 dark:text-zinc-500">({rows.length})</span>
      </h2>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-500">{empty}</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {rows.map((row) => (
            <li
              key={row.id}
              className={listRowClass}
            >
              <span className="font-medium">{row.name}</span>
              <span className="text-sm text-zinc-600 dark:text-zinc-400">{TIER_LABELS[row.tier]}</span>
            </li>
          ))}
        </ul>
      )}
    </Reveal>
  );
}
