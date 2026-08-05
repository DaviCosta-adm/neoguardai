import "server-only";

import { cookies } from "next/headers";
import type { UserRole } from "@/app/lib/types";
import {
  COOKIE_NAME,
  SESSION_EXPIRATION_MS,
  decrypt,
  encrypt,
  type SessionPayload,
} from "@/app/lib/auth/session-token";

export type { SessionPayload };
export { COOKIE_NAME, decrypt };

type SessionCookieOptions = {
  httpOnly: boolean;
  secure: boolean;
  expires: Date;
  sameSite: "lax";
  path: string;
};

export async function createSessionToken(input: {
  userId: string;
  role: UserRole;
  instituicaoId: string;
}) {
  const expiresAt = new Date(Date.now() + SESSION_EXPIRATION_MS);
  const value = await encrypt({
    userId: input.userId,
    role: input.role,
    instituicaoId: input.instituicaoId,
    expiresAt: expiresAt.toISOString(),
  });

  const options: SessionCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  };

  return { name: COOKIE_NAME, value, options, expiresAt };
}

export async function createSession(input: {
  userId: string;
  role: UserRole;
  instituicaoId: string;
}) {
  const cookie = await createSessionToken(input);
  const cookieStore = await cookies();
  cookieStore.set(cookie.name, cookie.value, cookie.options);
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME)?.value;
  return decrypt(cookie);
}
