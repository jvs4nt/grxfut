import { redirect } from "next/navigation";
import { isAdmin, requireSession } from "@/lib/auth";
import { getMensalState } from "@/lib/mensal";
import { MensalClient } from "./client";

export const dynamic = "force-dynamic";

export default async function MensalPage() {
  const user = await requireSession();

  if (user.role === "guest") {
    redirect("/");
  }

  const state = await getMensalState();

  return <MensalClient initialState={state} isAdmin={isAdmin(user)} />;
}

