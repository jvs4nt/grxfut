import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin, requireSession } from "@/lib/auth";
import { formatDayMonthYear, formatTime } from "@/lib/dates";
import { STAT_EVENT_LABELS } from "@/lib/match-stat-shared";
import { listAuditEvents, listMatchesWithStats } from "@/lib/match-stats";
import { getNextScheduledMatch } from "@/lib/matches";
import { cardClass, listRowClass, secondaryButtonClass } from "@/lib/ui";

export const dynamic = "force-dynamic";

const SAO_PAULO = "America/Sao_Paulo";

function formatEventTime(value: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: SAO_PAULO,
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export default async function JogoAuditoriaPage({
  searchParams,
}: {
  searchParams: Promise<{ match?: string }>;
}) {
  const user = await requireSession();

  if (!isAdmin(user)) {
    redirect("/jogo");
  }

  const { match: requestedMatchId } = await searchParams;
  const [nextMatch, matches] = await Promise.all([
    getNextScheduledMatch(),
    listMatchesWithStats(),
  ]);
  const selected =
    matches.find((match) => match.id === requestedMatchId) ??
    matches.find((match) => match.id === nextMatch?.id) ??
    matches[0] ??
    null;
  const events = selected ? await listAuditEvents(selected.id) : [];

  return (
    <main className="flex flex-col gap-6">
      <section className={cardClass}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-500">
              Admin
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Auditoria
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Quem registrou cada gol, assistência e defesa.
            </p>
          </div>
          <Link href="/jogo" className={secondaryButtonClass}>
            Voltar ao jogo
          </Link>
        </div>
        {matches.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {matches.map((match) => {
              const label = [
                formatDayMonthYear(match.date),
                formatTime(match.time),
              ]
                .filter(Boolean)
                .join(" · ");
              const active = selected?.id === match.id;

              return (
                <Link
                  key={match.id}
                  href={`/jogo/auditoria?match=${match.id}`}
                  className={
                    active ? secondaryButtonClass : `${secondaryButtonClass} opacity-70`
                  }
                  aria-current={active ? "page" : undefined}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            Nenhuma sessão registrada ainda.
          </p>
        )}
      </section>

      {selected ? (
        <section className={cardClass}>
          <h2 className="text-lg font-semibold">
            Eventos{" "}
            <span className="text-sm font-normal text-zinc-600 dark:text-zinc-500">
              ({events.length})
            </span>
          </h2>
          {events.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
              Nenhum evento nesta partida.
            </p>
          ) : (
            <ul className="mt-4 flex flex-col gap-2">
              {events.map((event) => (
                <li key={event.id} className={listRowClass}>
                  <div>
                    <p className="font-medium">
                      {STAT_EVENT_LABELS[event.type]} · {event.targetName}
                    </p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Registrado por {event.recordedName} ·{" "}
                      {formatEventTime(event.createdAt)} ·{" "}
                      {event.sessionStatus === "live" ? "ao vivo" : "encerrada"}
                    </p>
                  </div>
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    +{event.points}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </main>
  );
}
