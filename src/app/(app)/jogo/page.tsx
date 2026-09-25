import Link from "next/link";
import { redirect } from "next/navigation";
import { PaperIcon } from "@/components/icons";
import { MatchStatsPanel } from "@/components/match-stats-panel";
import { Reveal } from "@/components/reveal";
import { isAdmin, requireSession } from "@/lib/auth";
import {
  formatDayMonthYear,
  formatTime,
  formatWeekday,
} from "@/lib/dates";
import { getMatchStatsSnapshot } from "@/lib/match-stats";
import { getNextScheduledMatch } from "@/lib/matches";
import { cardClass, iconButtonClass } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function JogoPage() {
  const user = await requireSession();

  if (user.role === "guest") {
    redirect("/");
  }

  const match = await getNextScheduledMatch();

  if (!match) {
    return (
      <main className="flex flex-col gap-6">
        <section className={cardClass}>
          <h1 className="text-3xl font-semibold tracking-tight">Jogo</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Sem jogo marcado. Quando o administrador definir a data, as
            estatísticas aparecem aqui.
          </p>
        </section>
      </main>
    );
  }

  const snapshot = await getMatchStatsSnapshot(match.id);
  const admin = isAdmin(user);
  const when = [
    formatWeekday(match.date),
    formatDayMonthYear(match.date),
    formatTime(match.time),
    match.location,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <main className="flex flex-col gap-6">
      <Reveal as="section" className={`${cardClass} relative`}>
        {admin ? (
          <Link
            href="/jogo/auditoria"
            className={`${iconButtonClass} absolute right-4 top-4`}
            aria-label="Auditoria"
            title="Auditoria"
          >
            <PaperIcon className="h-5 w-5" />
          </Link>
        ) : null}
        <div className={admin ? "pr-12" : undefined}>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-500">
            Estatísticas
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Jogo</h1>
          <p className="mt-2 text-sm capitalize text-zinc-600 dark:text-zinc-400">
            {when}
          </p>
        </div>
      </Reveal>

      {!snapshot.live && snapshot.confirmedCount === 0 ? (
        <section className={cardClass}>
          <h2 className="text-lg font-semibold">Sem confirmados</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Ninguém confirmou presença neste fut. O jogo só começa com a lista
            de confirmados.
          </p>
        </section>
      ) : (
        <MatchStatsPanel
          matchId={match.id}
          live={snapshot.live}
          finished={
            snapshot.finished
              ? {
                  durationSeconds: snapshot.finished.durationSeconds,
                  players: snapshot.finished.players,
                }
              : null
          }
        />
      )}
    </main>
  );
}
