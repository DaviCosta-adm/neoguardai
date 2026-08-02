import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import {
  findUserById,
  getInstituicaoById,
  toPublicUser,
} from "@/app/lib/auth/users";
import { deleteSession, getSession } from "@/app/lib/auth/session";
import type { Instituicao, Usuario } from "@/app/lib/types";

export type AuthContext = {
  user: Usuario;
  instituicao: Instituicao;
  session: NonNullable<Awaited<ReturnType<typeof getSession>>>;
};

export const verifySession = cache(async () => {
  const session = await getSession();

  if (!session?.userId) {
    return null;
  }

  return session;
});

export const getAuthContext = cache(async (): Promise<AuthContext | null> => {
  const session = await verifySession();
  if (!session) return null;

  try {
    const dbUser = await findUserById(session.userId);
    if (!dbUser) {
      await deleteSession();
      return null;
    }

    const instituicao =
      (await getInstituicaoById(dbUser.instituicaoId)) ??
      ({
        id: dbUser.instituicaoId,
        nome: "NeoGuardAI",
      } satisfies Instituicao);

    return {
      user: toPublicUser(dbUser),
      instituicao,
      session,
    };
  } catch (error) {
    console.error("Erro ao carregar sessão:", error);
    return null;
  }
});

export async function requireAuth(): Promise<AuthContext> {
  const auth = await getAuthContext();

  if (!auth) {
    redirect("/login");
  }

  return auth;
}

/** Para Route Handlers — não usa redirect. */
export async function requireAuthApi(): Promise<AuthContext | null> {
  return getAuthContext();
}

/** Super admin da plataforma — para Route Handlers. */
export async function requireAdminNeoGuardApi(): Promise<AuthContext | null> {
  const auth = await getAuthContext();
  if (!auth || auth.user.role !== "admin_neoguard") {
    return null;
  }
  return auth;
}
