import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const ROADMAP_DIR = path.join(process.cwd(), "roadmap");

export type PhaseStatus = "pronto" | "pendente";

export type RoadmapPhase = {
  slug: string;
  order: number;
  title: string;
  objective: string;
  dependsOn: string;
  status: PhaseStatus;
  content: string;
};

function parseStatus(value: string): PhaseStatus {
  return /^pronto\b/i.test(value) ? "pronto" : "pendente";
}

function firstMatch(content: string, pattern: RegExp) {
  return content.match(pattern)?.[1]?.trim() ?? "";
}

function stripMarkdown(value: string) {
  return value
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .trim();
}

export function extractSection(markdown: string, heading: string) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = markdown.match(
    new RegExp(`(?:^|\\n)## ${escaped}\\n([\\s\\S]*?)(?=\\n## |$)`),
  );
  return match?.[1]?.trim() ?? "";
}

export async function getRoadmapIndex() {
  return readFile(path.join(ROADMAP_DIR, "ROADMAP.md"), "utf8");
}

export async function listPhases(): Promise<RoadmapPhase[]> {
  const entries = await readdir(ROADMAP_DIR, { withFileTypes: true });
  const dirs = entries
    .filter((entry) => entry.isDirectory() && /^\d{2}-/.test(entry.name))
    .sort((a, b) => a.name.localeCompare(b.name));

  return Promise.all(
    dirs.map(async (dir) => {
      const content = await readFile(
        path.join(ROADMAP_DIR, dir.name, "README.md"),
        "utf8",
      );

      return {
        slug: dir.name,
        order: Number(dir.name.slice(0, 2)),
        title: firstMatch(content, /^#\s+(.+)$/m) || dir.name,
        objective: stripMarkdown(firstMatch(content, /\*\*Objetivo:\*\*\s*(.+)/)),
        dependsOn: stripMarkdown(firstMatch(content, /\*\*Depende de:\*\*\s*(.+)/)),
        status: parseStatus(firstMatch(content, /\*\*Status:\*\*\s*(.+)/)),
        content,
      };
    }),
  );
}

export async function getPhase(slug: string) {
  const phases = await listPhases();
  return phases.find((phase) => phase.slug === slug) ?? null;
}
