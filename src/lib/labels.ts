import type { SessionUser } from "@/lib/auth";

export const TIER_LABELS = {
  capitao: "Capitão",
  tenente: "Tenente",
  soldado: "Soldado",
} as const;

export const ROLE_LABELS = {
  admin: "Administrador",
  member: "Membro",
  guest: "Convidado",
} as const;

export const PAYMENT_LABELS = {
  pago: "Pago",
  agendado: "Combinado",
  calote: "Devendo",
} as const;

export type UserRole = SessionUser["role"];
export type UserTier = SessionUser["tier"];
export type PaymentStatus = keyof typeof PAYMENT_LABELS;

export const USER_ROLES = ["admin", "member", "guest"] as const;
export const USER_TIERS = ["capitao", "tenente", "soldado"] as const;
export const PAYMENT_STATUSES = ["calote", "agendado", "pago"] as const;

export function parseRole(value: string): UserRole | null {
  return USER_ROLES.includes(value as UserRole) ? (value as UserRole) : null;
}

export function parseTier(value: string): UserTier | null {
  return USER_TIERS.includes(value as UserTier) ? (value as UserTier) : null;
}

export function parsePaymentStatus(value: string): PaymentStatus | null {
  return PAYMENT_STATUSES.includes(value as PaymentStatus)
    ? (value as PaymentStatus)
    : null;
}
