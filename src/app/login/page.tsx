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
    <main 
      className="relative flex flex-1 flex-col justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/fundodologin.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/50 z-0"></div>
      
      <div className="fixed right-6 top-6 sm:right-8 sm:top-8 z-10">
        <ThemeToggle />
      </div>
      
      <div className="relative z-10 mx-auto flex w-full max-w-md flex-col justify-center gap-8 px-6 py-16">
        <div className="flex justify-center mb-4">
          <img src="/logo.png" alt="GARUX" className="h-48 w-auto drop-shadow-lg" />
        </div>
        <div className="flex flex-col gap-6 p-8 rounded-3xl bg-white/90 shadow-2xl backdrop-blur-md dark:bg-zinc-900/80">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Entrar</h1>
          <p className="text-sm leading-6 text-zinc-700 dark:text-zinc-300">
            Acesso só com usuário e senha. Contas novas são criadas pelo
            administrador.
          </p>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
