"use client";

import { useTransition } from "react";
import { toggleUserActiveAction } from "@/app/(app)/membros/actions";

export function ToggleActiveButton({
  userId,
  active,
}: {
  userId: string;
  active: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      const fd = new FormData();
      fd.append("userId", userId);
      fd.append("active", active ? "false" : "true");
      await toggleUserActiveAction(fd);
    });
  }

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      className={`rounded border px-2 py-1 text-xs font-medium transition ${
        active
          ? "border-zinc-200 bg-zinc-100 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 hover:text-red-400"
          : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:text-emerald-300"
      }`}
    >
      {active ? "Desativar" : "Ativar"}
    </button>
  );
}
