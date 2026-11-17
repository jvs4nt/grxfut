import { getSession, isAdmin } from "@/lib/auth";
import { clearRequests, listRequests, recordRequest } from "@/lib/request-log";

export const dynamic = "force-dynamic";

async function devAdminGate(): Promise<Response | null> {
  if (process.env.NODE_ENV !== "development") {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const user = await getSession();
  if (!user || !isAdmin(user)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}

export async function GET() {
  const denied = await devAdminGate();
  if (denied) {
    return denied;
  }

  return Response.json({ requests: listRequests() });
}

export async function POST(request: Request) {
  const denied = await devAdminGate();
  if (denied) {
    return denied;
  }

  const body = (await request.json()) as { method?: string; path?: string };

  if (!body.method || !body.path) {
    return Response.json({ error: "method and path required" }, { status: 400 });
  }

  recordRequest(body.method, body.path);
  return Response.json({ ok: true });
}

export async function DELETE() {
  const denied = await devAdminGate();
  if (denied) {
    return denied;
  }

  clearRequests();
  return Response.json({ requests: [] });
}
