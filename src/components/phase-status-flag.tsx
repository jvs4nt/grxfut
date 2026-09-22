import type { PhaseStatus } from "@/lib/roadmap";

export function PhaseStatusFlag({ status }: { status: PhaseStatus }) {
  if (status === "pronto") {
    return (
      <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-300">
        Pronto
      </span>
    );
  }

  return (
    <span className="rounded-full border border-zinc-300 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800/80 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
      Pendente
    </span>
  );
}
