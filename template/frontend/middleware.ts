import { NextRequest, NextResponse } from "next/server";

// routes only for guests — authenticated users get bounced out
const AUTH_PATHS = ["/login", "/signup"];

// routes open to everyone regardless of auth state
const PUBLIC_PATHS = ["/"];

function getValidToken(req: NextRequest): string | null {
  const raw = req.cookies.get("pb_auth")?.value;
  if (!raw) return null;

  try {
    const { token } = JSON.parse(decodeURIComponent(raw));
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (Date.now() / 1000 > payload.exp) return null;
    return token;
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = getValidToken(req);

  // authenticated users hitting login/signup → send them home
  if (AUTH_PATHS.includes(pathname)) {
    if (token) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // open to everyone
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // everything else requires auth
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
