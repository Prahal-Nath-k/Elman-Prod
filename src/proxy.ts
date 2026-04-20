import { NextRequest, NextResponse } from "next/server";

const GATE_PATH = "/please-pay";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow the gate page itself (and its assets) through
  if (
    pathname === GATE_PATH ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  // If developer access is enabled, let every request through
  const developerAccess = process.env.DEVELOPER_ACCESS === "true";
  if (developerAccess) {
    return NextResponse.next();
  }

  // Otherwise redirect everything to the payment gate
  const url = request.nextUrl.clone();
  url.pathname = GATE_PATH;
  return NextResponse.redirect(url);
}

export const config = {
  // Run on all routes except Next.js internals and static files
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
