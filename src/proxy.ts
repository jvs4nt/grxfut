import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { shouldLogRequest } from "@/lib/request-log";
import { SESSION_COOKIE, readSessionUserId } from "@/lib/session-token";

const PUBLIC_PATHS = new Set(["/login", "/api/health", "/api/dev/requests"]);

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.has(pathname);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (shouldLogRequest(pathname)) {
    const logUrl = new URL("/api/dev/requests", request.url);
    void fetch(logUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        method: request.method,
        path: pathname,
      }),
    });
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const userId = token ? await readSessionUserId(token) : null;

  if (!userId && !isPublicPath(pathname)) {
    const login = new URL("/login", request.url);
    return NextResponse.redirect(login);
  }

  if (userId && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|ico|woff2)$).*)",
  ],
};
