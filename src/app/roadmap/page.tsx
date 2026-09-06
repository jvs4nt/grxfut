import Link from "next/link";
import { Markdown } from "@/components/markdown";
import { extractSection, getRoadmapIndex, listPhases } from "@/lib/roadmap";

export const dynamic = "force-dynamic";

export default async function RoadmapPage() {
  const [index, phases] = await Promise.all([getRoadmapIndex(), listPhases()]);
  const mvp = extractSection(index, "MVP");
  const outOfScope = extractSection(index, "Fora do MVP");

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-12">
      <header className="flex flex-col gap-3">
        <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-300">
          GARUX
        </Link>
        <p className="w-fit rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-200">
          Rota provisória — some quando o produto existir
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">Roadmap do MVP</h1>
        <p className="text-zinc-400">
          Fonte: pastas em{" "}
          <code className="rounded bg-zinc-900 px-1.5 py-0.5 font-mono text-sm text-zinc-200">
            roadmap/
          </code>
          . Clique numa fase para ver o que implementar e testar.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
          MVP
        </h2>
        <Markdown content={mvp} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Ordem de implementação
        </h2>
        <ol className="flex flex-col gap-3">
          {phases.map((phase) => (
            <li key={phase.slug}>
              <Link
                href={`/roadmap/${phase.slug}`}
                className="block rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 transition hover:border-emerald-500/40 hover:bg-zinc-900"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="text-lg font-semibold text-zinc-50">
                    {phase.title}
                  </h3>
                  <span className="shrink-0 font-mono text-xs text-zinc-500">
                    {String(phase.order).padStart(2, "0")}
                  </span>
                </div>
                {phase.objective ? (
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    {phase.objective}
                  </p>
                ) : null}
                {phase.dependsOn ? (
                  <p className="mt-3 text-xs text-zinc-500">
                    Depende de: {phase.dependsOn}
                  </p>
                ) : null}
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Fora do MVP
        </h2>
        <Markdown content={outOfScope} />
      </section>
    </main>
  );
}
