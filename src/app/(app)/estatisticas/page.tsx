import Link from "next/link";
import { redirect } from "next/navigation";
import { GiBaseballGlove, GiBootKick, GiSoccerBall } from "react-icons/gi";
import { requireSession } from "@/lib/auth";
import { currentMonthLabelInSaoPaulo } from "@/lib/dates";
import { listStatRanking, type StatRankingPeriod } from "@/lib/match-stats";
import type { StatPlayerLine } from "@/lib/match-stat-shared";
import { cardClass, listRowClass } from "@/lib/ui";

export const dynamic = "force-dynamic";

const TABS = [
  { id: "mes", label: "Mês atual", period: "month" },
  { id: "geral", label: "All-time", period: "all" },
] as const;

function parsePeriod(value: string | undefined): (typeof TABS)[number] {
  return TABS.find((tab) => tab.id === value) ?? TABS[0];
}

export default async function EstatisticasPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string }>;
}) {
  const user = await requireSession();

  if (user.role === "guest") {
    redirect("/");
  }

  const { periodo } = await searchParams;
  const tab = parsePeriod(periodo);
  const ranking = await listStatRanking(tab.period as StatRankingPeriod);
  const subtitle =
    tab.period === "month"
      ? currentMonthLabelInSaoPaulo()
      : "Todas as partidas encerradas";

  return (
    <main className="flex flex-col gap-6">
      <section className={cardClass}>
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-500">
          Ranking
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Estatísticas
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {subtitle}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {TABS.map((item) => {
            const active = item.id === tab.id;

            return (
              <Link
                key={item.id}
                href={item.id === "mes" ? "/estatisticas" : "/estatisticas?periodo=geral"}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                  active
                    ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-950"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </section>

      <section className={cardClass}>
        <div className="flex items-center justify-end gap-4 pr-1 text-zinc-500">
          <GiSoccerBall className="h-5 w-5" aria-label="Gols" />
          <GiBootKick className="h-5 w-5" aria-label="Assistências" />
          <GiBaseballGlove className="h-5 w-5" aria-label="Defesas" />
          <span className="w-12 text-right text-xs font-semibold uppercase tracking-wider">
            Pts
          </span>
        </div>
        {ranking.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            Nenhuma estatística gravada neste período.
          </p>
        ) : (
          <ol className="mt-4 flex flex-col gap-2">
            {ranking.map((player, index) => (
              <RankingRow key={player.userId} place={index + 1} player={player} />
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}

function RankingRow({
  place,
  player,
}: {
  place: number;
  player: StatPlayerLine;
}) {
  return (
    <li className={listRowClass}>
      <div className="flex min-w-0 items-center gap-3">
        <span className="w-6 text-sm font-semibold text-zinc-500">{place}</span>
        <span className="truncate font-medium">{player.name}</span>
      </div>
      <div className="flex items-center gap-4 text-sm tabular-nums text-zinc-700 dark:text-zinc-300">
        <span className="w-5 text-center" aria-label={`${player.goals} gols`}>
          {player.goals}
        </span>
        <span
          className="w-5 text-center"
          aria-label={`${player.assists} assistências`}
        >
          {player.assists}
        </span>
        <span
          className="w-5 text-center"
          aria-label={`${player.defenses} defesas`}
        >
          {player.defenses}
        </span>
        <span className="w-12 text-right font-semibold">{player.points}</span>
      </div>
    </li>
  );
}
