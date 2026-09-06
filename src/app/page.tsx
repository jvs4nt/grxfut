import { HealthConsole } from "@/components/health-console";
import { getSession } from "@/lib/auth";

export default async function Home() {
  const user = await getSession();

  return <HealthConsole user={user} />;
}
