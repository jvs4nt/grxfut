import { sql } from "drizzle-orm";
import { getDb } from "@/db";
import { listPhases } from "@/lib/roadmap";

export type CheckStatus = "ok" | "degraded" | "down";

export type HealthCheck = {
  ok: boolean;
  detail: string;
  latencyMs?: number;
};

export type HealthReport = {
  status: CheckStatus;
  checkedAt: string;
  app: HealthCheck & { env: string; uptimeSec: number };
  env: HealthCheck & { databaseUrl: boolean; databaseHost: string | null };
  database: HealthCheck;
  roadmap: HealthCheck & { phases: number };
  schema: HealthCheck & { state: "pending" };
};

function databaseHost(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

async function checkDatabase(): Promise<HealthCheck> {
  const started = performance.now();

  try {
    const db = getDb();
    await db.execute(sql`SELECT 1`);
    return {
      ok: true,
      detail: "SELECT 1",
      latencyMs: Math.round(performance.now() - started),
    };
  } catch (error) {
    return {
      ok: false,
      detail:
        error instanceof Error ? error.message : "Database unavailable",
      latencyMs: Math.round(performance.now() - started),
    };
  }
}

async function checkRoadmap(): Promise<HealthCheck & { phases: number }> {
  try {
    const phases = await listPhases();
    return {
      ok: phases.length > 0,
      detail:
        phases.length > 0
          ? `${phases.length} fases no filesystem`
          : "Nenhuma fase encontrada em roadmap/",
      phases: phases.length,
    };
  } catch (error) {
    return {
      ok: false,
      detail:
        error instanceof Error ? error.message : "Falha ao ler roadmap/",
      phases: 0,
    };
  }
}

export async function getHealthReport(): Promise<HealthReport> {
  const databaseUrl = process.env.DATABASE_URL ?? "";
  const hasDatabaseUrl = databaseUrl.length > 0;
  const [database, roadmap] = await Promise.all([
    checkDatabase(),
    checkRoadmap(),
  ]);

  const app = {
    ok: true,
    detail: "processo no ar",
    env: process.env.NODE_ENV ?? "development",
    uptimeSec: Math.round(process.uptime()),
  };

  const env = {
    ok: hasDatabaseUrl,
    detail: hasDatabaseUrl
      ? "DATABASE_URL definida"
      : "DATABASE_URL ausente. Coloque em .env ou .env.local.",
    databaseUrl: hasDatabaseUrl,
    databaseHost: hasDatabaseUrl ? databaseHost(databaseUrl) : null,
  };

  const schema = {
    ok: true,
    detail: "ainda não migrado — entra na fase 2",
    state: "pending" as const,
  };

  let status: CheckStatus = "ok";
  if (!database.ok) {
    status = "down";
  } else if (!env.ok || !roadmap.ok) {
    status = "degraded";
  }

  return {
    status,
    checkedAt: new Date().toISOString(),
    app,
    env,
    database,
    roadmap,
    schema,
  };
}
