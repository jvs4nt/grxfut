import Link from "next/link";
import { notFound } from "next/navigation";
import { Markdown } from "@/components/markdown";
import { PhaseStatusFlag } from "@/components/phase-status-flag";
import { getPhase, listPhases } from "@/lib/roadmap";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const phases = await listPhases();
  return phases.map((phase) => ({ slug: phase.slug }));
}

export default async function RoadmapPhasePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [phase, phases] = await Promise.all([getPhase(slug), listPhases()]);

  if (!phase) {
    notFound();
  }

  const index = phases.findIndex((item) => item.slug === phase.slug);
  const previous = index > 0 ? phases[index - 1] : null;
  const next = index < phases.length - 1 ? phases[index + 1] : null;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-3">
        <Link
          href="/roadmap"
          className="text-sm text-zinc-500 hover:text-zinc-300"
        >
          ← Roadmap
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <p className="w-fit rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-200">
            Rota provisória
          </p>
          <PhaseStatusFlag status={phase.status} />
        </div>
      </header>

      <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8">
        <Markdown content={phase.content} />
      </article>

      <nav className="flex flex-wrap justify-between gap-4 text-sm">
        {previous ? (
          <Link
            href={`/roadmap/${previous.slug}`}
            className="text-emerald-400 hover:underline"
          >
            ← {previous.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/roadmap/${next.slug}`}
            className="ml-auto text-emerald-400 hover:underline"
          >
            {next.title} →
          </Link>
        ) : null}
      </nav>
    </main>
  );
}
