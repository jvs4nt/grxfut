import Link from "next/link";
import { redirect } from "next/navigation";
import { GiBaseballGlove, GiBootKick, GiSoccerBall } from "react-icons/gi";
import { isAdmin, requireSession } from "@/lib/auth";
import { currentMonthLabelInSaoPaulo } from "@/lib/dates";
import { listStatRanking, type StatRankingPeriod } from "@/lib/match-stats";
import type { StatPlayerLine } from "@/lib/match-stat-shared";
import { cardClass, listRowClass } from "@/lib/ui";
import { listUsers } from "@/lib/users";
import {
  AddPlayerStatButton,
  StatEditButton,
  type StatCandidate,
} from "./stat-editor";

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
  const scope = tab.period as StatRankingPeriod;
  const admin = isAdmin(user);
  const [ranking, users] = await Promise.all([
    listStatRanking(scope),
    admin ? listUsers() : Promise.resolve([]),
  ]);
  const subtitle =
    tab.period === "month"
      ? currentMonthLabelInSaoPaulo()
      : "Todas as partidas encerradas";
  const scopeLabel =
    tab.period === "month" ? `Mês atual · ${subtitle}` : "All-time";
  const rankedIds = new Set(ranking.map((line) => line.userId));
  const candidates: StatCandidate[] = users
    .filter(
      (u) => u.active && u.role !== "guest" && !rankedIds.has(u.id),
    )
    .map((u) => ({ userId: u.id, name: u.name }))
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

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
        {admin ? (
          <div className="mb-4 flex flex-col gap-2">
            <AddPlayerStatButton
              candidates={candidates}
              scope={scope}
              scopeLabel={scopeLabel}
            />
          </div>
        ) : null}
        {ranking.length === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Nenhuma estatística gravada neste período.
          </p>
        ) : (
          <div
            className="max-h-[min(70dvh,32rem)] overflow-auto overscroll-y-contain [-webkit-overflow-scrolling:touch] sm:max-h-[min(75dvh,36rem)]"
          >
            <div
              className="sticky top-0 z-10 -mx-5 flex items-center justify-end gap-4 border-b border-zinc-200/80 bg-white/95 px-5 pb-3 pr-6 text-zinc-500 backdrop-blur-sm dark:border-zinc-800/80 dark:bg-zinc-900/95"
            >
              <GiSoccerBall className="h-5 w-5 shrink-0" aria-label="Gols" />
              <GiBootKick className="h-5 w-5 shrink-0" aria-label="Assistências" />
              <GiBaseballGlove className="h-5 w-5 shrink-0" aria-label="Defesas" />
              <span className="w-12 shrink-0 text-right text-xs font-semibold uppercase tracking-wider">
                Pts
              </span>
              {admin ? <span className="w-7 shrink-0" aria-hidden /> : null}
            </div>
            <ol className="mt-3 flex min-w-[17rem] flex-col gap-2">
              {ranking.map((player, index) => (
                <RankingRow
                  key={player.userId}
                  place={index + 1}
                  player={player}
                  edit={
                    admin ? (
                      <StatEditButton
                        player={player}
                        scope={scope}
                        scopeLabel={scopeLabel}
                      />
                    ) : null
                  }
                />
              ))}
            </ol>
          </div>
        )}
      </section>
    </main>
  );
}

function RankingRow({
  place,
  player,
  edit,
}: {
  place: number;
  player: StatPlayerLine;
  edit: React.ReactNode;
}) {
  return (
    <li className={`${listRowClass} flex-nowrap gap-2`}>
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="w-6 shrink-0 text-sm font-semibold text-zinc-500">
          {place}
        </span>
        <span className="truncate font-medium">{player.name}</span>
      </div>
      <div className="flex shrink-0 items-center gap-4 text-sm tabular-nums text-zinc-700 dark:text-zinc-300">
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
        {edit}
      </div>
    </li>
  );
}
