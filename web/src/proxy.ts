import { NextResponse, type NextRequest } from "next/server";

const PROTECTED = ["/lobby", "/room", "/profile", "/moments"];
const SESSION_COOKIE = "ovl_session";

export const isLocalHost = (host: string) => host === "localhost" || host === "127.0.0.1" || host === "[::1]" || host.endsWith(".localhost");

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Force HTTPS in production. Hosting platforms set x-forwarded-proto on the public request.
  // Local hosts are skipped so a production build can still be run and tested on a laptop.
  if (
    process.env.NODE_ENV === "production" &&
    request.headers.get("x-forwarded-proto") === "http" &&
    !isLocalHost(request.nextUrl.hostname)
  ) {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    return NextResponse.redirect(url, 308);
  }

  // Optimistic check only: the API still verifies the session on every request.
  if (PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`)) && !request.cookies.has(SESSION_COOKIE)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|icon.svg|apple-icon|opengraph-image|robots.txt|sitemap.xml|manifest.webmanifest).*)"],
};
