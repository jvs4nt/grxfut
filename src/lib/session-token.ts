import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "garux_session";
export const SESSION_DAYS = 7;

export function hasSessionSecret() {
  return Boolean(process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 32);
}

function sessionSecret() {
  if (!hasSessionSecret()) {
    throw new Error(
      "SESSION_SECRET is missing or too short. Use at least 32 characters in .env.",
    );
  }

  return new TextEncoder().encode(process.env.SESSION_SECRET);
}

export type SessionClaims = {
  userId: string;
  sessionId: string;
};

export async function createSessionToken(userId: string) {
  return new SignJWT()
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setJti(crypto.randomUUID())
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(sessionSecret());
}

export async function readSessionClaims(token: string): Promise<SessionClaims | null> {
  if (!hasSessionSecret()) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, sessionSecret());
    if (typeof payload.sub !== "string") {
      return null;
    }

    const sessionId =
      typeof payload.jti === "string" && payload.jti.length > 0
        ? payload.jti
        : typeof payload.iat === "number"
          ? String(payload.iat)
          : payload.sub;

    return { userId: payload.sub, sessionId };
  } catch {
    return null;
  }
}

export async function readSessionUserId(token: string) {
  const claims = await readSessionClaims(token);
  return claims?.userId ?? null;
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  };
}
