import type { SessionUser } from "@/lib/auth";

export const APP_NAV = [
  { href: "/", label: "Início" },
  { href: "/membros", label: "Membros" },
  { href: "/pagamento", label: "Pagamento" },
  { href: "/mensal", label: "Mensal" },
  { href: "/sorteio", label: "Sorteio" },
  { href: "/jogo", label: "Jogo" },
  { href: "/estatisticas", label: "Estatísticas" },
  { href: "/caixa", label: "Caixa" },
] as const;

const GUEST_HIDDEN_HREFS = new Set([
  "/membros",
  "/mensal",
  "/sorteio",
  "/jogo",
  "/estatisticas",
  "/caixa",
]);

/** Aba Mensal: só para mensalistas e para admins (que gerenciam a lista). */
export function canSeeMensal(user: Pick<SessionUser, "role" | "mensalista">) {
  return user.role === "admin" || user.mensalista;
}

export function navItemsForUser(
  user: Pick<SessionUser, "role" | "mensalista">,
) {
  const items =
    user.role === "guest"
      ? APP_NAV.filter((item) => !GUEST_HIDDEN_HREFS.has(item.href))
      : [...APP_NAV];

  return items.filter((item) => item.href !== "/mensal" || canSeeMensal(user));
}

export function isNavItemActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}
