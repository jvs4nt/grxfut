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

export async function createSessionToken(userId: string) {
  return new SignJWT()
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(sessionSecret());
}

export async function readSessionUserId(token: string) {
  if (!hasSessionSecret()) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, sessionSecret());
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
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
