import type { SessionUser } from "@/lib/auth";

export const APP_NAV = [
  { href: "/", label: "Início" },
  { href: "/membros", label: "Membros" },
  { href: "/pagamento", label: "Pagamento" },
  { href: "/sorteio", label: "Sorteio" },
  { href: "/jogo", label: "Jogo" },
  { href: "/estatisticas", label: "Estatísticas" },
  { href: "/caixa", label: "Caixa" },
] as const;

const GUEST_HIDDEN_HREFS = new Set([
  "/membros",
  "/sorteio",
  "/jogo",
  "/estatisticas",
  "/caixa",
]);

export function navItemsForRole(role: SessionUser["role"]) {
  if (role === "guest") {
    return APP_NAV.filter((item) => !GUEST_HIDDEN_HREFS.has(item.href));
  }

  return [...APP_NAV];
}

export function isNavItemActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}
