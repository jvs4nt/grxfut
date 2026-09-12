import { getSession, type SessionUser } from "@/lib/auth";

export async function getAdminSession(): Promise<
  { ok: true; user: SessionUser } | { ok: false; error: string }
> {
  const user = await getSession();

  if (!user || user.role !== "admin") {
    return { ok: false, error: "Sem permissão." };
  }

  return { ok: true, user };
}
