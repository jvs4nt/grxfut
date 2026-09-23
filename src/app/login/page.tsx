import { redirect } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { getSession } from "@/lib/auth";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await getSession();

  if (session) {
    redirect("/");
  }

  return (
    <main className="relative mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-8 px-6 py-16">
      <div className="fixed right-6 top-6 sm:right-8 sm:top-8">
        <ThemeToggle />
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="GARUX" className="h-10 w-auto" />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">Entrar</h1>
        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Acesso só com usuário e senha. Contas novas são criadas pelo
          administrador.
        </p>
      </div>
      <LoginForm />
    </main>
  );
}
