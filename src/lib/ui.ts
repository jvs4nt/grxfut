const motionSafe =
  "motion-reduce:transition-none motion-reduce:transform-none motion-reduce:active:scale-100";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] dark:focus-visible:ring-offset-zinc-950";

export const inputClass =
  "rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-zinc-900 outline-none ring-emerald-500/40 focus:ring-2 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100";

export const buttonClass = [
  "rounded-full bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white",
  "transition-all duration-200 ease-out hover:bg-emerald-600 active:scale-[0.98]",
  "disabled:opacity-60 disabled:active:scale-100",
  "dark:bg-emerald-400 dark:text-zinc-950 dark:hover:bg-emerald-300",
  motionSafe,
  focusRing,
].join(" ");

export const secondaryButtonClass = [
  "rounded-full border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-800",
  "transition-all duration-200 ease-out hover:border-zinc-400 hover:bg-zinc-100 active:scale-[0.98]",
  "disabled:opacity-60 disabled:active:scale-100",
  "dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-zinc-500 dark:hover:bg-zinc-900",
  motionSafe,
  focusRing,
].join(" ");

export const dangerButtonClass = [
  "rounded-full border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-700",
  "transition-all duration-200 ease-out hover:bg-red-500/20 active:scale-[0.98]",
  "disabled:opacity-60 disabled:active:scale-100 dark:text-red-200",
  motionSafe,
  focusRing,
].join(" ");

export const iconButtonClass = [
  "rounded-xl border border-zinc-300 p-2 text-zinc-700",
  "transition-all duration-200 ease-out hover:border-zinc-400 hover:bg-zinc-100 active:scale-[0.98]",
  "dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-500 dark:hover:bg-zinc-900",
  motionSafe,
  focusRing,
].join(" ");

export const iconDangerButtonClass = [
  "rounded-xl border border-red-500/40 bg-red-500/10 p-2 text-red-700",
  "transition-all duration-200 ease-out hover:bg-red-500/20 active:scale-[0.98] dark:text-red-200",
  motionSafe,
  focusRing,
].join(" ");

const cardSurface = [
  "rounded-2xl border border-zinc-200/80 bg-white/80 p-5 backdrop-blur-md",
  "shadow-sm shadow-zinc-900/5 ring-1 ring-inset ring-white/40",
  "dark:border-zinc-800/80 dark:bg-zinc-900/40 dark:shadow-black/30 dark:ring-white/5",
].join(" ");

export const cardClass = cardSurface;

export const listRowSurfaceClass = [
  "rounded-xl border border-zinc-200/80 bg-white/50 transition-colors duration-200 ease-out",
  "hover:border-zinc-300 hover:bg-white/80",
  "dark:border-zinc-800/80 dark:bg-zinc-900/25 dark:hover:border-zinc-700 dark:hover:bg-zinc-900/50",
].join(" ");

export const listRowClass = [
  "flex flex-wrap items-center justify-between gap-3 px-3 py-2",
  listRowSurfaceClass,
].join(" ");

export const listRowClassLoose = [
  "flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
  listRowSurfaceClass.replace("rounded-xl", "rounded-2xl"),
].join(" ");

export const linkCardClass = [
  cardSurface,
  "ux-lift ux-lift-hover block",
  "hover:border-emerald-500/30 hover:shadow-md hover:shadow-zinc-900/10",
  "dark:hover:border-emerald-500/25 dark:hover:shadow-black/40",
].join(" ");

export const modalBackdropClass =
  "fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm";

export const modalPanelClass = [
  "w-full max-w-md rounded-2xl border border-zinc-200/80 bg-white/95 p-6 shadow-2xl backdrop-blur-xl",
  "ring-1 ring-inset ring-white/30 dark:border-zinc-800/80 dark:bg-zinc-950/95 dark:ring-white/5",
].join(" ");

export const glassPanelClass = [
  "flex flex-col gap-6 rounded-3xl border border-zinc-200/60 bg-white/90 p-8 shadow-2xl backdrop-blur-md",
  "ring-1 ring-inset ring-white/40 dark:border-zinc-700/50 dark:bg-zinc-900/80 dark:ring-white/5",
].join(" ");

export const labelClass =
  "flex flex-col gap-1.5 text-sm text-zinc-700 dark:text-zinc-300";
