import { redirect } from "next/navigation";
import { isAdmin, requireSession } from "@/lib/auth";
import {
  getMensalSettings,
  listMensalCandidates,
  listMensalistas,
} from "@/lib/mensal";
import { canSeeMensal } from "@/lib/nav";
import { MensalClient } from "./client";

export const dynamic = "force-dynamic";

export default async function MensalPage() {
  const user = await requireSession();

  if (!canSeeMensal(user)) {
    redirect("/");
  }

  const admin = isAdmin(user);
  const settings = await getMensalSettings();
  const [mensalistas, candidates] = await Promise.all([
    listMensalistas(settings.period),
    admin ? listMensalCandidates() : Promise.resolve([]),
  ]);

  return (
    <MensalClient
      settings={settings}
      mensalistas={mensalistas}
      candidates={candidates}
      isAdmin={admin}
    />
  );
}
