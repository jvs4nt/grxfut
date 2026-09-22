import { compare, hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import {
  SESSION_COOKIE,
  createSessionToken,
  readSessionClaims,
  sessionCookieOptions,
} from "@/lib/session-token";

export { SESSION_COOKIE };

const BCRYPT_ROUNDS = 12;

export type SessionUser = {
  id: string;
  username: string;
  name: string;
  role: "admin" | "member" | "guest";
  tier: "capitao" | "tenente" | "soldado";
  active: boolean;
};

export function hashPassword(password: string) {
  return hash(password, BCRYPT_ROUNDS);
}

export function verifyPassword(password: string, passwordHash: string) {
  return compare(password, passwordHash);
}

export async function createSession(userId: string) {
  const token = await createSessionToken(userId);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, sessionCookieOptions());
}

export async function destroySession() {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, "", {
    ...sessionCookieOptions(),
    maxAge: 0,
  });
}

export const getSessionClaims = cache(async () => {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  return readSessionClaims(token);
});

export const getSession = cache(async (): Promise<SessionUser | null> => {
  const claims = await getSessionClaims();

  if (!claims) {
    return null;
  }

  const db = getDb();
  const [user] = await db
    .select({
      id: users.id,
      username: users.username,
      name: users.name,
      role: users.role,
      tier: users.tier,
      active: users.active,
    })
    .from(users)
    .where(eq(users.id, claims.userId))
    .limit(1);

  return user ?? null;
});

export async function requireSession(): Promise<SessionUser> {
  const user = await getSession();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export function isAdmin(user: SessionUser) {
  return user.role === "admin";
}
