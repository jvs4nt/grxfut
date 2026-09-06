import { compare, hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import {
  SESSION_COOKIE,
  createSessionToken,
  readSessionUserId,
  sessionCookieOptions,
} from "@/lib/session-token";

export { SESSION_COOKIE };

const BCRYPT_ROUNDS = 12;

export type SessionUser = {
  id: string;
  username: string;
  role: "admin" | "member";
  tier: "capitao" | "tenente" | "soldado";
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

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const userId = await readSessionUserId(token);

  if (!userId) {
    return null;
  }

  const db = getDb();
  const [user] = await db
    .select({
      id: users.id,
      username: users.username,
      role: users.role,
      tier: users.tier,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user ?? null;
}
