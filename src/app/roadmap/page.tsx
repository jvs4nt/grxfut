import Link from "next/link";
import { Markdown } from "@/components/markdown";
import { ThemeToggle } from "@/components/theme-toggle";
import { PhaseStatusFlag } from "@/components/phase-status-flag";
import { extractSection, getRoadmapIndex, listPhases } from "@/lib/roadmap";

export const dynamic = "force-dynamic";

export default async function RoadmapPage() {
  const [index, phases] = await Promise.all([getRoadmapIndex(), listPhases()]);
  const mvp = extractSection(index, "MVP");
  const outOfScope = extractSection(index, "Fora do MVP");
  const readyCount = phases.filter((phase) => phase.status === "pronto").length;

  return (
    <main className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-12">
      <div className="absolute right-6 top-6">
        <ThemeToggle />
      </div>
      <header className="flex flex-col gap-3">
        <Link href="/" className="text-sm text-zinc-600 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
          GARUX
        </Link>
        <p className="w-fit rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-800 dark:text-amber-200">
          Rota provisória — some quando o produto existir
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">Roadmap do MVP</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Fonte: pastas em{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-sm text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
            roadmap/
          </code>
          . Clique numa fase para ver o que implementar e testar.{" "}
          {readyCount}/{phases.length} prontas.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-500">
          MVP
        </h2>
        <Markdown content={mvp} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-500">
          Ordem de implementação
        </h2>
        <ol className="flex flex-col gap-3">
          {phases.map((phase) => (
            <li key={phase.slug}>
              <Link
                href={`/roadmap/${phase.slug}`}
                className={`block rounded-2xl border p-5 transition hover:bg-zinc-100 dark:hover:bg-zinc-900 ${
                  phase.status === "pronto"
                    ? "border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50"
                    : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/60 hover:border-emerald-500/40"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                    {phase.title}
                  </h3>
                  <div className="flex shrink-0 items-center gap-2">
                    <PhaseStatusFlag status={phase.status} />
                    <span className="font-mono text-xs text-zinc-600 dark:text-zinc-500">
                      {String(phase.order).padStart(2, "0")}
                    </span>
                  </div>
                </div>
                {phase.objective ? (
                  <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    {phase.objective}
                  </p>
                ) : null}
                {phase.dependsOn ? (
                  <p className="mt-3 text-xs text-zinc-600 dark:text-zinc-500">
                    Depende de: {phase.dependsOn}
                  </p>
                ) : null}
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-500">
          Fora do MVP
        </h2>
        <Markdown content={outOfScope} />
      </section>
    </main>
  );
}
