"use client";

import {
  CreditCard,
  Dices,
  DollarSign,
  Home,
  Trophy,
  Users,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { GiSoccerBall } from "react-icons/gi";
import { BottomNavBar, type BottomNavIcon } from "@/components/ui/bottom-nav-bar";
import type { SessionUser } from "@/lib/auth";
import { isNavItemActive, navItemsForRole } from "@/lib/nav";

const NAV_ICONS: Record<string, BottomNavIcon> = {
  "/": Home,
  "/membros": Users,
  "/pagamento": CreditCard,
  "/sorteio": Dices,
  "/jogo": GiSoccerBall,
  "/estatisticas": Trophy,
  "/caixa": DollarSign,
};

export function AppMobileNav({ user }: { user: SessionUser }) {
  const pathname = usePathname();
  const items = navItemsForRole(user.role).map((item) => ({
    label: item.label,
    href: item.href,
    icon: NAV_ICONS[item.href] ?? Home,
    active: isNavItemActive(pathname, item.href),
  }));

  return (
    <BottomNavBar className="sm:hidden" items={items} stickyBottom />
  );
}
