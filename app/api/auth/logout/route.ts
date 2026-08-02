import { NextResponse } from "next/server";
import { COOKIE_NAME } from "@/app/lib/auth/session-token";

export async function POST() {
  const response = NextResponse.json({
    ok: true,
    redirectTo: "/login",
  });

  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0),
    sameSite: "lax",
    path: "/",
  });

  return response;
}
