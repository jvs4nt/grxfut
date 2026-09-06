"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { createSession, destroySession, verifyPassword } from "@/lib/auth";

export type LoginState = {
  error: string | null;
};

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { error: "Usuário ou senha inválidos." };
  }

  const db = getDb();
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  const valid = user
    ? await verifyPassword(password, user.passwordHash)
    : false;

  if (!user || !valid) {
    return { error: "Usuário ou senha inválidos." };
  }

  await createSession(user.id);
  redirect("/");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
