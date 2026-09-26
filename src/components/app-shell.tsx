"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/login/actions";
import { AppMobileNav } from "@/components/app-mobile-nav";
import { PaymentModal } from "@/components/payment-modal";
import { SettingsModal } from "@/components/settings-modal";
import { ThemeToggle } from "@/components/theme-toggle";
import type { SessionUser } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/labels";
import type { PaymentStatus } from "@/lib/labels";
import { isNavItemActive, navItemsForRole } from "@/lib/nav";

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
      <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-background/80 backdrop-blur-md dark:border-zinc-800/80">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="GARUX" className="h-26 w-auto" />
            </Link>
            <div className="flex items-center gap-2 sm:hidden">
              <ThemeToggle />
              {user.role !== "guest" ? (
                <SettingsModal username={user.username} name={user.name} />
              ) : null}
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="text-xs font-medium text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-200"
                >
                  Sair
                </button>
              </form>
            </div>
          </div>
          <nav className="hidden flex-wrap gap-1 sm:flex">
            {navItemsForRole(user.role).map((item) => {
              const active = isNavItemActive(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-3 py-1.5 text-sm transition-all duration-200 ease-out ${active
                    ? "bg-zinc-900 text-zinc-50 shadow-sm dark:bg-zinc-100 dark:text-zinc-950"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 hover:shadow-sm dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
                    }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="hidden items-center gap-3 text-sm sm:flex">
            <span className="text-zinc-800 dark:text-zinc-300">
              {user.username}
              <span className="ml-2 rounded-full border border-zinc-300 px-2 py-0.5 text-xs uppercase tracking-wide text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
                {ROLE_LABELS[user.role]}
              </span>
            </span>
            <ThemeToggle />
            {user.role !== "guest" ? (
              <SettingsModal username={user.username} name={user.name} />
            ) : null}
            <form action={logoutAction}>
              <button
                type="submit"
                className="text-xs font-medium text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-200"
              >
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-8 pb-24 sm:pb-8">
        {children}
      </div>
      <AppMobileNav user={user} />
      <footer className="border-t border-zinc-200/80 bg-background/60 backdrop-blur-sm dark:border-zinc-800/80">
        <div className="mx-auto flex w-full max-w-5xl gap-4 px-6 py-4 text-xs text-zinc-500 dark:text-zinc-600">
          <Link href="/roadmap" className="text-zinc-500 transition-colors duration-200 hover:text-zinc-800 dark:text-zinc-600 dark:hover:text-zinc-400">
            Roadmap
          </Link>
          <Link href="/dev" className="text-zinc-500 transition-colors duration-200 hover:text-zinc-800 dark:text-zinc-600 dark:hover:text-zinc-400">
            Console
          </Link>
        </div>
      </footer>
    </div>
  );
}
