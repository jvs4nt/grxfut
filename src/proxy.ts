import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { shouldLogRequest } from "@/lib/request-log";

export function proxy(request: NextRequest) {
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

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|ico|woff2)$).*)",
  ],
};
