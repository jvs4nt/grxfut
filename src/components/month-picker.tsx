"use client";

import { useState } from "react";
import { iconButtonClass } from "@/lib/ui";

const MONTHS = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

/**
 * Seletor de mês/ano (`YYYY-MM`). Feito à mão porque `<input type="month">`
 * vira um campo de texto puro no Safari e no Firefox desktop.
 */
export function MonthPicker({
  value,
  onChange,
  labelledBy,
}: {
  value: string;
  onChange: (value: string) => void;
  labelledBy?: string;
}) {
  const [selectedYear, selectedMonth] = value.split("-").map(Number);
  const [year, setYear] = useState(
    Number.isFinite(selectedYear) ? selectedYear : new Date().getFullYear(),
  );

  return (
    <div
      role="group"
      aria-labelledby={labelledBy}
      className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800"
    >
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setYear((y) => y - 1)}
          className={`${iconButtonClass} rounded-lg px-2.5 py-1 text-lg leading-none`}
          aria-label="Ano anterior"
        >
          ‹
        </button>
        <span
          className="text-sm font-semibold text-zinc-900 dark:text-zinc-100"
          aria-live="polite"
        >
          {year}
        </span>
        <button
          type="button"
          onClick={() => setYear((y) => y + 1)}
          className={`${iconButtonClass} rounded-lg px-2.5 py-1 text-lg leading-none`}
          aria-label="Próximo ano"
        >
          ›
        </button>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2">
        {MONTHS.map((label, index) => {
          const month = index + 1;
          const active = year === selectedYear && month === selectedMonth;

          return (
            <button
              key={label}
              type="button"
              onClick={() =>
                onChange(`${year}-${String(month).padStart(2, "0")}`)
              }
              aria-pressed={active}
              className={
                active
                  ? "rounded-lg bg-emerald-500 px-2 py-2 text-sm font-semibold text-white"
                  : "rounded-lg px-2 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
