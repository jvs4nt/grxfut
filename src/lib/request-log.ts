import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

export type RequestLogEntry = {
  id: number;
  at: string;
  method: string;
  path: string;
};

const MAX_ENTRIES = 80;
const LOG_DIR = path.join(process.cwd(), ".next");
const LOG_FILE = path.join(LOG_DIR, "dev-request-log.json");

const SKIP_PREFIXES = ["/_next", "/favicon.ico"];
const SKIP_EXACT = new Set(["/api/health", "/api/dev/requests"]);

type Store = {
  nextId: number;
  entries: RequestLogEntry[];
};

function emptyStore(): Store {
  return { nextId: 1, entries: [] };
}

function readStore(): Store {
  try {
    const raw = readFileSync(LOG_FILE, "utf8");
    const parsed = JSON.parse(raw) as Store;
    if (!Array.isArray(parsed.entries) || typeof parsed.nextId !== "number") {
      return emptyStore();
    }
    return parsed;
  } catch {
    return emptyStore();
  }
}

function writeStore(store: Store) {
  mkdirSync(LOG_DIR, { recursive: true });
  writeFileSync(LOG_FILE, JSON.stringify(store), "utf8");
}

export function shouldLogRequest(pathname: string) {
  if (SKIP_EXACT.has(pathname)) {
    return false;
  }

  if (SKIP_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return false;
  }

  return !/\.(?:svg|png|jpg|jpeg|gif|ico|woff2?|css|map)$/i.test(pathname);
}

export function recordRequest(method: string, pathName: string) {
  const store = readStore();
  store.entries.unshift({
    id: store.nextId,
    at: new Date().toISOString(),
    method: method.toUpperCase(),
    path: pathName,
  });
  store.nextId += 1;
  if (store.entries.length > MAX_ENTRIES) {
    store.entries.length = MAX_ENTRIES;
  }
  writeStore(store);
}

export function listRequests() {
  return readStore().entries;
}

export function clearRequests() {
  writeStore(emptyStore());
}
