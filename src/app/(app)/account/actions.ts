"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { updateOwnAccount } from "@/lib/users";

export type FormState = {
  error: string | null;
  ok?: boolean;
};

export async function updateOwnAccountAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await getSession();

  if (!user || user.role === "guest") {
    return { error: "Sem permissão." };
  }

  const username = String(formData.get("username") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim() || username;
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!username) {
    return { error: "Informe nome e usuário." };
  }

  if (password || confirmPassword) {
    if (password !== confirmPassword) {
      return { error: "As senhas não coincidem." };
    }

    if (password.length < 4) {
      return { error: "A senha precisa ter pelo menos 4 caracteres." };
    }
  }

  const result = await updateOwnAccount({
    userId: user.id,
    username,
    name,
    password: password || undefined,
  });

  if (!result.ok) {
    if (result.error === "duplicate") {
      return { error: "Esse usuário já existe." };
    }

    return { error: "Sem permissão." };
  }

  revalidatePath("/", "layout");
  return { error: null, ok: true };
}
