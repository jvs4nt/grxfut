"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { logoutAction } from "@/app/login/actions";
import type { SessionUser } from "@/lib/auth";
import type { CheckStatus, HealthReport } from "@/lib/health";
import type { RequestLogEntry } from "@/lib/request-log";

type FlagTone = "ok" | "warn" | "down";

const POLL_MS = 5000;

const statusCopy: Record<CheckStatus, string> = {
  ok: "Sistema ok",
  degraded: "Sistema degradado",
  down: "Sistema down",
};

function formatUptime(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${rest}s`;
  }
  return `${rest}s`;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function FlagCard({
  label,
  tone,
  value,
  detail,
}: {
  label: string;
  tone: FlagTone;
  value: string;
  detail: string;
}) {
  const toneClass =
    tone === "ok"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
      : tone === "warn"
        ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
        : "border-red-500/30 bg-red-500/10 text-red-200";

  const pip =
    tone === "ok"
      ? "bg-emerald-400"
      : tone === "warn"
        ? "bg-amber-400"
        : "bg-red-400";

  return (
    <article className={`rounded-2xl border p-4 ${toneClass}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider opacity-80">
          {label}
        </p>
        <span className={`h-2 w-2 rounded-full ${pip}`} />
      </div>
      <p className="mt-3 text-lg font-semibold text-zinc-50">{value}</p>
      <p className="mt-1 text-sm leading-5 text-zinc-400">{detail}</p>
    </article>
  );
}

export function HealthConsole({ user }: { user: SessionUser | null }) {
  const [health, setHealth] = useState<HealthReport | null>(null);
  const [requests, setRequests] = useState<RequestLogEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [healthRes, requestsRes] = await Promise.all([
        fetch("/api/health", { cache: "no-store" }),
        fetch("/api/dev/requests", { cache: "no-store" }),
      ]);

      const healthJson = (await healthRes.json()) as HealthReport;
      const requestsJson = (await requestsRes.json()) as {
        requests: RequestLogEntry[];
      };

      setHealth(healthJson);
      setRequests(requestsJson.requests ?? []);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Falha ao consultar health");
    }
  }, []);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => {
      void refresh();
    }, POLL_MS);
    return () => window.clearInterval(timer);
  }, [refresh]);

  async function clearLog() {
    await fetch("/api/dev/requests", { method: "DELETE" });
    setRequests([]);
  }

  const banner =
    health?.status === "ok"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
      : health?.status === "degraded"
        ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
        : "border-red-500/30 bg-red-500/10 text-red-200";

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium tracking-wide text-emerald-400">
            GARUX
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Console de health
          </h1>
          <p className="max-w-xl text-sm leading-6 text-zinc-400">
            Painel interno para a implementação. Atualiza a cada 5s. A home do
            produto entra depois; este console muda para /dev nessa hora.
          </p>
        </div>
        <div className="flex flex-col items-start gap-3 sm:items-end">
          {user ? (
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="text-zinc-300">
                {user.username}
                <span className="ml-2 rounded-full border border-zinc-700 px-2 py-0.5 text-xs uppercase tracking-wide text-zinc-400">
                  {user.role}
                </span>
              </span>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="text-xs font-medium text-zinc-500 transition hover:text-zinc-200"
                >
                  Sair
                </button>
              </form>
            </div>
          ) : null}
          <Link
            href="/roadmap"
            className="inline-flex w-fit items-center rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300"
          >
            Roadmap
          </Link>
        </div>
      </header>

      <section className={`rounded-2xl border px-5 py-4 ${banner}`}>
        <p className="text-sm font-semibold">
          {health ? statusCopy[health.status] : "Consultando…"}
        </p>
        <p className="mt-1 text-sm text-zinc-400">
          {error
            ? error
            : health
              ? `Último check ${formatTime(health.checkedAt)} · poll 5s`
              : "Aguardando o primeiro ping"}
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <FlagCard
          label="App"
          tone={health?.app.ok ? "ok" : "down"}
          value={health ? health.app.env : "—"}
          detail={
            health
              ? `uptime ${formatUptime(health.app.uptimeSec)}`
              : "processo"
          }
        />
        <FlagCard
          label="Env"
          tone={health?.env.ok ? "ok" : "down"}
          value={
            health?.env.databaseUrl
              ? health.env.databaseHost ?? "set"
              : "missing"
          }
          detail={health?.env.detail ?? "DATABASE_URL"}
        />
        <FlagCard
          label="Neon"
          tone={health?.database.ok ? "ok" : "down"}
          value={
            health?.database.ok
              ? `${health.database.latencyMs ?? "—"} ms`
              : "offline"
          }
          detail={health?.database.detail ?? "SELECT 1"}
        />
        <FlagCard
          label="Roadmap"
          tone={health?.roadmap.ok ? "ok" : "warn"}
          value={health ? String(health.roadmap.phases) : "—"}
          detail={health?.roadmap.detail ?? "fases"}
        />
        <FlagCard
          label="Schema"
          tone={health?.schema.ok ? "ok" : "warn"}
          value={health?.schema.state ?? "pending"}
          detail={health?.schema.detail ?? "fase 2"}
        />
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Requests
          </h2>
          <button
            type="button"
            onClick={() => {
              void clearLog();
            }}
            className="text-xs font-medium text-zinc-500 transition hover:text-zinc-200"
          >
            Limpar
          </button>
        </div>
        <div className="overflow-hidden rounded-2xl border border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-900 text-xs uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="px-4 py-3 font-medium">Hora</th>
                <th className="px-4 py-3 font-medium">Método</th>
                <th className="px-4 py-3 font-medium">Path</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-8 text-center text-zinc-500"
                  >
                    Nenhuma request ainda. Navegue o app — /_next e o poll do
                    console não entram aqui.
                  </td>
                </tr>
              ) : (
                requests.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-t border-zinc-800/80 text-zinc-300"
                  >
                    <td className="px-4 py-2.5 font-mono text-xs text-zinc-500">
                      {formatTime(entry.at)}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs">
                      {entry.method}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs">
                      {entry.path}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
