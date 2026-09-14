import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await getSession();

  if (session) {
    redirect("/");
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-8 px-6 py-16">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="GARUX" className="h-10 w-auto" />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">Entrar</h1>
        <p className="text-sm leading-6 text-zinc-400">
          Acesso só com usuário e senha. Contas novas vêm do Admin.
        </p>
      </div>
      <LoginForm />
    </main>
  );
}
