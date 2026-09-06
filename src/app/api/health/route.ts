import { getHealthReport } from "@/lib/health";

export const dynamic = "force-dynamic";

export async function GET() {
  const report = await getHealthReport();
  const status = report.status === "down" ? 503 : 200;
  return Response.json(report, { status });
}
