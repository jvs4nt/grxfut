import { PitchBoard } from "@/components/pitch-board";
import { Reveal } from "@/components/reveal";
import { revealDelay } from "@/lib/reveal";
import { RunDrawForm } from "@/components/run-draw-form";
import { listAttendances, splitAttendances } from "@/lib/attendance";
import { redirect } from "next/navigation";
import { requireSession, isAdmin } from "@/lib/auth";
import { formatDayMonthYear } from "@/lib/dates";
import { getDrawForMatch } from "@/lib/draw";
import { getNextScheduledMatch } from "@/lib/matches";
import { cardClass } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function DrawPage() {
  const user = await requireSession();
  if (user.role === "guest") redirect("/");
  const admin = isAdmin(user);
  const match = await getNextScheduledMatch();
  const attendances = match ? await listAttendances(match.id) : [];
  const { confirmed, pendingPayment } = splitAttendances(attendances);
  const draw = match ? await getDrawForMatch(match.id) : null;

  const teamA = draw?.players.filter((player) => player.team === "team_a") ?? [];
  const teamB = draw?.players.filter((player) => player.team === "team_b") ?? [];
  const reserve =
    draw?.players.filter((player) => player.team === "draw_reserve") ?? [];

  return (
    <main className="flex flex-col gap-8">
      <Reveal delayMs={revealDelay(0)}>
        <header className="flex flex-col gap-2">
        <p className="text-sm font-medium tracking-wide text-emerald-400">
          Sorteio
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          {match
            ? `Times de ${formatDayMonthYear(match.date)}`
            : "Sem próximo jogo"}
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Só quem confirmou e pagou entra. Dois times de até 6, balanceados por
          nível, no máximo um Capitão por lado. O resto começa de próximo.
        </p>
      </header>
      </Reveal>

      {admin && match ? (
        <Reveal as="section" className={cardClass} delayMs={revealDelay(1)}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {confirmed.length === 0
                ? "Sem confirmados — o sorteio não gera times."
                : `${confirmed.length} confirmados. Um novo sorteio substitui o anterior.`}
              {pendingPayment.length > 0
                ? ` ${pendingPayment.length} ainda não pagaram e ficam de fora.`
                : ""}
            </p>
            {confirmed.length > 0 ? (
              <RunDrawForm hasResult={Boolean(draw)} />
            ) : null}
          </div>
        </Reveal>
      ) : null}

      {!match ? (
        <Reveal delayMs={revealDelay(1)}>
        <p className="text-sm text-zinc-600 dark:text-zinc-500">
          Marque um próximo jogo para sortear os times.
        </p>
        </Reveal>
      ) : !draw ? (
        <Reveal delayMs={revealDelay(1)}>
        <p className="text-sm text-zinc-600 dark:text-zinc-500">
          Ainda não há sorteio salvo para este jogo.
        </p>
        </Reveal>
      ) : (
        <Reveal delayMs={revealDelay(1)}>
        <PitchBoard
          teamA={teamA}
          teamB={teamB}
          reserve={reserve}
          drawId={draw.id}
          canSwap={admin}
        />
        </Reveal>
      )}
    </main>
  );
}
