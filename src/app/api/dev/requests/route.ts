import { clearRequests, listRequests, recordRequest } from "@/lib/request-log";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ requests: listRequests() });
}

export async function POST(request: Request) {
  const body = (await request.json()) as { method?: string; path?: string };

  if (!body.method || !body.path) {
    return Response.json({ error: "method and path required" }, { status: 400 });
  }

  recordRequest(body.method, body.path);
  return Response.json({ ok: true });
}

export async function DELETE() {
  clearRequests();
  return Response.json({ requests: [] });
}
