import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/session-token";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await destroySession();
  } catch {
    // No render o cookie é só de leitura. O Set-Cookie vai nesta resposta.
  }

  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.set(SESSION_COOKIE, "", {
    ...sessionCookieOptions(),
    maxAge: 0,
  });
  return response;
}
