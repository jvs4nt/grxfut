import { HealthConsole } from "@/components/health-console";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DevPage() {
  const user = await getSession();

  return <HealthConsole user={user} />;
}
