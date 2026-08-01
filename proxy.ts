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

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const session = await decrypt(token);

  if (isProtected && !session?.userId) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isLogin && session?.userId) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
