"use client";

import { motion } from "framer-motion";
import type { ComponentType } from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

const LABEL_WIDTH = 56;

export type BottomNavIcon = ComponentType<{
  size?: number;
  strokeWidth?: number;
  className?: string;
  "aria-hidden"?: boolean;
}>;

export type BottomNavItem = {
  label: string;
  href: string;
  icon: BottomNavIcon;
  active?: boolean;
};

type BottomNavBarProps = {
  items: BottomNavItem[];
  className?: string;
  stickyBottom?: boolean;
};

export function BottomNavBar({
  items,
  className,
  stickyBottom = false,
}: BottomNavBarProps) {
  return (
    <motion.nav
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
      role="navigation"
      aria-label="Navegação"
      className={cn(
        "flex h-[52px] max-w-[95vw] items-center space-x-1 rounded-full border border-zinc-200 bg-background p-2 shadow-xl dark:border-zinc-800",
        stickyBottom && "fixed inset-x-0 bottom-4 z-20 mx-auto w-fit",
        className,
      )}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = Boolean(item.active);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "relative flex h-10 max-h-[44px] min-h-[40px] min-w-[40px] items-center gap-0 rounded-full px-2.5 py-2 transition-colors duration-200",
              isActive
                ? "gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-transparent text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40",
            )}
          >
            <Icon
              size={20}
              strokeWidth={2}
              aria-hidden
              className="shrink-0 transition-colors duration-200"
            />

            <motion.div
              initial={false}
              animate={{
                width: isActive ? `${LABEL_WIDTH}px` : "0px",
                opacity: isActive ? 1 : 0,
                marginLeft: isActive ? "6px" : "0px",
              }}
              transition={{
                width: { type: "spring", stiffness: 350, damping: 32 },
                opacity: { duration: 0.19 },
                marginLeft: { duration: 0.19 },
              }}
              className="flex max-w-[56px] items-center overflow-hidden"
            >
              <span
                className={cn(
                  "select-none overflow-hidden text-ellipsis whitespace-nowrap text-xs font-medium leading-none",
                  isActive ? "text-emerald-600 dark:text-emerald-400" : "opacity-0",
                )}
                title={item.label}
              >
                {item.label}
              </span>
            </motion.div>
          </Link>
        );
      })}
    </motion.nav>
  );
}
