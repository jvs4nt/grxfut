"use client";

import { useCallback, useId, useState } from "react";
import { logoutAction } from "@/app/login/actions";
import { GearIcon, MoonIcon, SunIcon } from "@/components/icons";
import { ModalBackdrop, ModalPanel } from "@/components/modal-backdrop";
import { SettingsModal } from "@/components/settings-modal";
import { useTheme } from "@/components/theme-provider";
import type { SessionUser } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/labels";
import { dangerButtonClass, iconButtonClass, secondaryButtonClass } from "@/lib/ui";

export function AccountMenu({ user }: { user: SessionUser }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const titleId = useId();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const canEditProfile = user.role !== "guest";

  return (
    <>
      <button
        type="button"
        onClick={() => setMenuOpen(true)}
        className={iconButtonClass}
        aria-label="Conta"
        aria-haspopup="dialog"
        aria-expanded={menuOpen}
      >
        <GearIcon />
      </button>
      <ModalBackdrop
        open={menuOpen}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            closeMenu();
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            closeMenu();
          }
        }}
      >
        <ModalPanel>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id={titleId} className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                {user.name}
              </h2>
              <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <span>{user.username}</span>
                <span className="rounded-full border border-zinc-300 px-2 py-0.5 text-xs uppercase tracking-wide text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
                  {ROLE_LABELS[user.role]}
                </span>
              </p>
            </div>
            <button type="button" onClick={closeMenu} className={secondaryButtonClass}>
              Fechar
            </button>
          </div>

          <div className="mt-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Aparência</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {isDark ? "Escuro" : "Claro"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <SunIcon className={isDark ? "text-zinc-400" : "text-amber-500"} />
              <button
                type="button"
                role="switch"
                aria-checked={isDark}
                aria-label="Modo escuro"
                onClick={toggleTheme}
                className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ${
                  isDark ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-700"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0 h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-200 motion-reduce:transition-none ${
                    isDark ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
              <MoonIcon className={isDark ? "text-zinc-100" : "text-zinc-400"} />
            </div>
          </div>

          {canEditProfile ? (
            <button
              type="button"
              className={`${secondaryButtonClass} mt-6 w-full`}
              onClick={() => {
                setMenuOpen(false);
                setSettingsOpen(true);
              }}
            >
              Alterar dados
            </button>
          ) : null}

          <form action={logoutAction} className="mt-6 border-t border-zinc-200 pt-4 dark:border-zinc-800">
            <button type="submit" className={`${dangerButtonClass} w-full`}>
              Sair
            </button>
          </form>
        </ModalPanel>
      </ModalBackdrop>
      {canEditProfile ? (
        <SettingsModal
          username={user.username}
          name={user.name}
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
        />
      ) : null}
    </>
  );
}
