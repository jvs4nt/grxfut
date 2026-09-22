"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/login/actions";
import { PaymentModal } from "@/components/payment-modal";
import type { SessionUser } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/labels";
import type { PaymentStatus } from "@/lib/labels";

const NAV = [
  { href: "/", label: "Início" },
  { href: "/membros", label: "Membros" },
  { href: "/pagamento", label: "Pagamento" },
  { href: "/sorteio", label: "Sorteio" },
];

export type PaymentModalState = {
  matchId: string;
  sessionId: string;
  status: PaymentStatus;
  scheduledOn: string | null;
} | null;

export function AppShell({
  user,
  paymentModal,
  children,
}: {
  user: SessionUser;
  paymentModal: PaymentModalState;
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      {user.role === "member" && paymentModal ? (
        <PaymentModal
          matchId={paymentModal.matchId}
          sessionId={paymentModal.sessionId}
          status={paymentModal.status}
          scheduledOn={paymentModal.scheduledOn}
        />
      ) : null}
      <header className="border-b border-zinc-800">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="GARUX" className="h-26 w-auto" />
            </Link>
            <form action={logoutAction} className="sm:hidden">
              <button
                type="submit"
                className="text-xs font-medium text-zinc-500 transition hover:text-zinc-200"
              >
                Sair
              </button>
            </form>
          </div>
          <nav className="flex flex-wrap gap-1">
            {NAV.filter((item) =>
              user.role !== "guest" || (item.href !== "/membros" && item.href !== "/sorteio")
            ).map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-3 py-1.5 text-sm transition ${active
                    ? "bg-zinc-100 text-zinc-950"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
                    }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="hidden items-center gap-3 text-sm sm:flex">
            <span className="text-zinc-300">
              {user.username}
              <span className="ml-2 rounded-full border border-zinc-700 px-2 py-0.5 text-xs uppercase tracking-wide text-zinc-400">
                {ROLE_LABELS[user.role]}
              </span>
            </span>
            <form action={logoutAction}>
              <button
                type="submit"
                className="text-xs font-medium text-zinc-500 transition hover:text-zinc-200"
              >
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-8">
        {children}
      </div>
      <footer className="border-t border-zinc-800">
        <div className="mx-auto flex w-full max-w-5xl gap-4 px-6 py-4 text-xs text-zinc-600">
          <Link href="/roadmap" className="hover:text-zinc-400">
            Roadmap
          </Link>
          <Link href="/dev" className="hover:text-zinc-400">
            Console
          </Link>
        </div>
      </footer>
    </div>
  );
}
