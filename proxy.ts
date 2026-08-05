import { NextRequest, NextResponse } from "next/server";
import {
  COOKIE_NAME,
  decrypt,
} from "@/app/lib/auth/session-token";

const protectedPrefixes = ["/dashboard"];

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  const isLogin = pathname === "/login";

  // Não interferir em Server Actions / POST do formulário de login
  const isServerAction = request.headers.has("next-action");
  const isMutation = request.method !== "GET" && request.method !== "HEAD";

  if (isServerAction || (isLogin && isMutation)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const session = await decrypt(token);

  if (isProtected && !session?.userId) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isLogin && session?.userId) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
